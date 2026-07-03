import PERSIAN_HEADERS from "../assets/table_header.json";
import { isNumber, persianToEnglishDigits } from "./tools";
import part1 from "../questions/P1.json";
import part2 from "../questions/P2.json";
import part3 from "../questions/P3.json";
import part4 from "../questions/P4.json";
import part5 from "../questions/P5.json";
import part6 from "../questions/P6.json";
import part7 from "../questions/P7.json";

export const PART_NAMES_BAHAR = [
    "اطلاعات شخصی",
    "سوالات سلامت فردی",
    "سوالات مصرف دارو",
    "سوالات سرطان فردی",
    "سوالات سرطان خانواده",
    "سوالات سرطان ریه",
    "سوالات اطلاعات کامل فردی",
];

export const PART_NAMES_NAVID = [
    "اطلاعات شخصی",
    "سوالات سرطان فردی",
    "سوالات سرطان خانواده",
    "سوالات سرطان ریه",
    "سوالات اطلاعات کامل فردی",
];

export const YEARS_DURATION_FIELDS = new Set(["intendedHrtUse", "hrtUseLength", "ageOfFirstBirth", "ghaedeAge"]);
export const MONTH_DURATION_FIELDS = new Set(["mediumActivityMonthInYear", "hardActivityMonthInYear"]);
/** Stored as true/false in API (not enum/answers mapper). */
export const BOOLEAN_FIELDS = new Set(["isAtba"]);

const NUMERIC_STRING_EXCLUDED_FIELDS = new Set([
    "socialSecurityNumber",
    "postalCode",
    "phone2",
    "phone3",
]);
export const IMAGE_FIELDS = new Set([
    "testGenPictures",
    "fatherTestGenPictures",
    "grandFatherCancerPictures",
    "grandMotherCancerPictures",
    "mamoGraphyPictures",
]);
export const READONLY_META_FIELDS = new Set([
    "id",
    "userID",
    "__typename",
    "status",
    "createdAt",
    "updatedAt",
    "cancers",
    "familyCancers",
]);

const headerMapping = {};
const genderMap = {};
const mapperMap = {};

PERSIAN_HEADERS.forEach((item) => {
    headerMapping[item.key] = item.label;
    if (item.gender !== undefined) {
        genderMap[item.key] = item.gender;
    }
    if (item.mapper) {
        mapperMap[item.key] = item.mapper;
    }
});

function registerField(registry, fieldName, config) {
    if (!fieldName || READONLY_META_FIELDS.has(fieldName)) {
        return;
    }
    if (!registry[fieldName]) {
        registry[fieldName] = config;
        return;
    }
    if (!registry[fieldName].options && config.options) {
        registry[fieldName] = { ...registry[fieldName], ...config };
    }
}

function parseQuestionPart(partData, registry) {
    if (Array.isArray(partData)) {
        partData.forEach((item) => {
            if (item.input_type === "radio_input" && item.Rname) {
                registerField(registry, item.Rname, {
                    inputType: "select",
                    options: item.options || [],
                });
            }
            if (item.input_type === "selection_input" && item.Rname) {
                registerField(registry, item.Rname, {
                    inputType: "select",
                    options: item.options || [],
                });
            }
        });
        return;
    }

    Object.values(partData).forEach((value) => {
        if (!value || typeof value !== "object") {
            return;
        }

        if (value.Rname && value.options) {
            registerField(registry, value.Rname, {
                inputType: "select",
                options: value.options,
            });
        }

        if (value.Oname && value.options) {
            registerField(registry, value.Oname, {
                inputType: "select",
                options: value.options,
            });
        }

        if (value.engName) {
            registerField(registry, value.engName, {
                inputType: value.type === "number" ? "number" : "text",
            });
        }

        if (value.name && value.inputType === "file") {
            registerField(registry, value.name, { inputType: "images" });
        }

        if (!value.Rname && !value.Oname && !value.engName && !value.name) {
            parseQuestionPart(value, registry);
        }
    });
}

const FIELD_REGISTRY = {};
[part1, part2, part3, part4, part5, part6, part7].forEach((part) => {
    parseQuestionPart(part, FIELD_REGISTRY);
});

export const PLACEHOLDER_OPTIONS = new Set(["", "انتخاب کنید", "انتخاب نمایید"]);

export function getOptionLabel(opt) {
    if (opt && typeof opt === "object" && !Array.isArray(opt)) {
        return opt.title ?? String(opt.value ?? "");
    }
    return String(opt ?? "");
}

export function normalizeSelectOptions(options) {
    if (!options?.length) {
        return [];
    }
    const seen = new Set();
    return options.filter((opt) => {
        const label = getOptionLabel(opt);
        if (!label || PLACEHOLDER_OPTIONS.has(label.trim()) || seen.has(label)) {
            return false;
        }
        seen.add(label);
        return true;
    });
}

export function getQuestionnaireOptions(key) {
    const config = FIELD_REGISTRY[key];
    if (config?.options?.length) {
        return normalizeSelectOptions(config.options);
    }
    return null;
}

function getRawOptions(key) {
    return FIELD_REGISTRY[key]?.options ?? null;
}

/** Legacy read path: some API records may still store combine_option answers as array indices. */
function usesOptionIndexMapping(key) {
    if (YEARS_DURATION_FIELDS.has(key) || MONTH_DURATION_FIELDS.has(key)) {
        return false;
    }
    if (mapperMap[key]) {
        return false;
    }
    if (["birthYear", "birthMonth", "birthDay", "smokingAge"].includes(key)) {
        return false;
    }
    const raw = getRawOptions(key);
    if (!raw?.length) {
        return false;
    }
    return PLACEHOLDER_OPTIONS.has(getOptionLabel(raw[0]).trim());
}

function findOptionLabelByLiteralValue(key, value) {
    const raw = getRawOptions(key);
    if (!raw) {
        return null;
    }
    const strVal = String(value);
    for (const opt of raw) {
        const label = getOptionLabel(opt);
        if (label === strVal) {
            return label;
        }
        if (typeof opt === "object" && opt.value != null && String(opt.value) === strVal) {
            return label;
        }
    }
    return null;
}

/** For options like breastDensity: API stores opt.value ("a"), UI shows opt.title. */
function getObjectOptionStoredValue(key, label) {
    const raw = getRawOptions(key);
    if (!raw) {
        return undefined;
    }
    for (const opt of raw) {
        if (getOptionLabel(opt) === label && typeof opt === "object" && opt.value !== undefined) {
            return opt.value;
        }
    }
    return undefined;
}

function shouldParseNumericString(key, label) {
    return isNumber(label) && !NUMERIC_STRING_EXCLUDED_FIELDS.has(key);
}

/** API stored value → questionnaire label (same rules as questionare preset hydration). */
function apiValueToLabel(key, value, radioMap) {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    if (key === "isAtba" || (typeof value === "boolean" && !mapperMap[key])) {
        return value ? "بله" : "خیر";
    }

    if (YEARS_DURATION_FIELDS.has(key)) {
        const n = typeof value === "number" ? value : Number(String(value).trim());
        if (!Number.isNaN(n) && n >= 0) {
            return `${n} سال`;
        }
    }

    if (MONTH_DURATION_FIELDS.has(key)) {
        const n = typeof value === "number" ? value : Number(String(value).trim());
        if (!Number.isNaN(n) && n >= 0) {
            return `${n} ماه`;
        }
    }

    if (key === "smokingAge" && (value === 0 || value === "0")) {
        return "هیچوقت به طور منظم سیگار یا قلیان نکشیده ام";
    }

    const numericValue = typeof value === "number" ? value : Number(value);
    const hasNumeric = typeof value === "number" || (typeof value === "string" && value !== "" && !Number.isNaN(numericValue));

    if (hasNumeric) {
        if (usesOptionIndexMapping(key)) {
            const raw = getRawOptions(key);
            if (numericValue === 0) {
                return "";
            }
            if (raw && numericValue >= 0 && numericValue < raw.length) {
                const label = getOptionLabel(raw[numericValue]);
                return PLACEHOLDER_OPTIONS.has(label.trim()) ? "" : label;
            }
        }

        const literal = findOptionLabelByLiteralValue(key, numericValue);
        if (literal) {
            return literal;
        }
    }

    const mapper = mapperMap[key];
    if (mapper && radioMap?.[mapper]) {
        const label = Object.keys(radioMap[mapper]).find((k) => radioMap[mapper][k] == value);
        if (label) {
            return label;
        }
    }

    if (typeof value === "string") {
        return value;
    }
    return String(value);
}

function parseDurationOption(value, suffix) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    if (typeof value === "number") {
        return value;
    }
    const str = String(value).trim();
    if (str.endsWith(suffix)) {
        const n = parseInt(str.replace(/[^\d]/g, ""), 10);
        return Number.isNaN(n) ? value : n;
    }
    const direct = Number(str);
    return Number.isNaN(direct) ? value : direct;
}

/**
 * Questionnaire label → API stored value.
 * Mirrors patientTableVreserved saveFieldToServer + questionare handleSubmit encoding:
 * - mapper fields (table_header.json) → enum id via radioMap
 * - duration selects → extracted number
 * - smokingAge "never" → 0; age options → number
 * - object options (e.g. breastDensity) → opt.value
 * - plain numeric strings → parseInt
 * - other combine_option labels → full Persian string (not option index)
 */
function labelToApiValue(key, label, radioMap) {
    if (label === "" || label === null || label === undefined || PLACEHOLDER_OPTIONS.has(String(label).trim())) {
        return null;
    }

    const mapper = mapperMap[key];
    if (mapper && radioMap?.[mapper] && radioMap[mapper][label] !== undefined) {
        return radioMap[mapper][label];
    }

    if (BOOLEAN_FIELDS.has(key)) {
        if (label === "بله" || label === true || label === "true") {
            return true;
        }
        if (label === "خیر" || label === false || label === "false") {
            return false;
        }
        return label;
    }

    if (YEARS_DURATION_FIELDS.has(key)) {
        return parseDurationOption(label, "سال");
    }

    if (MONTH_DURATION_FIELDS.has(key)) {
        return parseDurationOption(label, "ماه");
    }

    if (key === "smokingAge" && label === "هیچوقت به طور منظم سیگار یا قلیان نکشیده ام") {
        return 0;
    }

    const objectOptionValue = getObjectOptionStoredValue(key, label);
    if (objectOptionValue !== undefined) {
        return objectOptionValue;
    }

    if (shouldParseNumericString(key, label)) {
        return parseInt(persianToEnglishDigits(String(label)), 10);
    }

    return label;
}

export function getFieldLabel(key, gender) {
    if (genderMap[key] !== undefined && genderMap[key] !== gender) {
        return null;
    }
    return headerMapping[key] || key;
}

export function isFieldVisibleForGender(key, gender) {
    if (genderMap[key] === undefined) {
        return true;
    }
    return genderMap[key] === gender;
}

export function getFieldMapper(key) {
    return mapperMap[key] || null;
}

export function getFieldConfig(key) {
    return FIELD_REGISTRY[key] || null;
}

export function resolveFieldInputType(key, value) {
    if (IMAGE_FIELDS.has(key)) {
        return "images";
    }
    if (BOOLEAN_FIELDS.has(key)) {
        return "boolean";
    }
    const config = FIELD_REGISTRY[key];
    if (config?.inputType === "select" && config.options?.length) {
        return "select";
    }
    if (mapperMap[key]) {
        return "enum";
    }
    if (config?.inputType === "number") {
        return "number";
    }
    if (typeof value === "boolean") {
        return "boolean";
    }
    if (typeof value === "number" && !Number.isNaN(value)) {
        return "number";
    }
    return "text";
}

export function formatValueForDisplay(key, value, radioMap) {
    if (IMAGE_FIELDS.has(key) && Array.isArray(value)) {
        return value;
    }
    return apiValueToLabel(key, value, radioMap);
}

export function formatValueForEdit(key, value, radioMap) {
    return formatValueForDisplay(key, value, radioMap);
}

export function processValueForApi(key, value, radioMap) {
    return labelToApiValue(key, value, radioMap);
}

export function buildSectionPayload(sectionData, radioMap, gender) {
    const payload = {};
    Object.entries(sectionData).forEach(([key, value]) => {
        if (READONLY_META_FIELDS.has(key) || !isFieldVisibleForGender(key, gender)) {
            return;
        }
        if (IMAGE_FIELDS.has(key)) {
            return;
        }
        payload[key] = processValueForApi(key, value, radioMap);
    });
    return payload;
}

export function getSelectOptions(key, radioMap) {
    const questionnaireOptions = getQuestionnaireOptions(key);
    if (questionnaireOptions?.length) {
        return questionnaireOptions;
    }

    const mapper = mapperMap[key];
    if (mapper && radioMap?.[mapper]) {
        return normalizeSelectOptions(Object.keys(radioMap[mapper]));
    }

    if (BOOLEAN_FIELDS.has(key)) {
        return ["بله", "خیر"];
    }

    return null;
}
