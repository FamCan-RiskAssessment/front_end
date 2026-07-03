import { useState, useRef, useEffect, useCallback } from "react";
import InputBox from "./input_box";
import Radio from "./radio";
import CheckBox from "./checkbox";
import Options from "./option";
import CancerField from "./cancer_universal";
import FileUploader from "./file_uploader";
import PersonalInfo from "./personal_info";
import RadioV2 from "./RadioV2";
import OptionsV2 from "./optionV2";
import InputBoxV2 from "./input_boxV2";
import Loader from "./utils/loader";
import RangeBox from "./rangeInp";
import prevSign from './V2Form/arrow_right.svg'
import homeSign from './V2Form/home.svg'
import part1 from './questions/P1.json'
import part2 from './questions/P2.json'
import part3 from './questions/P3.json'
import part4 from './questions/P4.json'
import part5 from './questions/P5.json'
import part6 from './questions/P6.json'
import part7 from './questions/P7.json'
import CQs from './questions/catchQs.json'
import { useLocation, useNavigate } from "react-router-dom";
import { APIURL, cancerRefs } from "./utils/config";
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
import {
    fetchDataGET, isNumber, formatAndValidateJalali,
    CancerAdder, fetchDataPOSTImg, persianMonths, fetchDataGETImg, fetchDataPUT, dict_transformer, getKeyVal, cancerDictRefiner,
    nullTracker, isMenopauseYes
} from "./utils/tools";
import "./form_elements.css"
import "./responsive_questionare.css"
// import { set } from "animejs";

/** Yes/No answer enum ids for RadioV2; fall back when enum/answers has not loaded yet. */
function resolveYesNoIdsFromRadioMap(radioMap) {
    const yes = radioMap?.["بله"];
    const no = radioMap?.["خیر"];
    if (yes !== undefined && no !== undefined) {
        return { yesId: yes, noId: no };
    }
    return { yesId: 1, noId: 2 };
}

/** Fields that keep legacy boolean (not 1/2 enum ids). */
const YES_NO_FIELD_EXCEPTIONS = new Set(["pastSmoking", "isAtba"]);

function toYesNoEnumId(value, radioMap) {
    const { yesId, noId } = resolveYesNoIdsFromRadioMap(radioMap);
    if (value === true || value === "true" || value === yesId || value === 1 || value === "1") {
        return yesId;
    }
    if (value === false || value === "false" || value === noId || value === 2 || value === "2") {
        return noId;
    }
    return value;
}

/** Map stored answer (id, boolean, or Persian label) to بله/خیر for visibility relators. */
function presetAnswerToLabel(value, radioMap) {
    const { yesId, noId } = resolveYesNoIdsFromRadioMap(radioMap);
    if (value === true || value === yesId || value === 1 || value === "1") return "بله";
    if (value === false || value === noId || value === 2 || value === "2") return "خیر";
    const label = radioMap && Object.keys(radioMap).length ? getKeyVal(radioMap, value) : undefined;
    return label ?? value;
}

function radioInputMatchesPreset(input, storedValue, radioMap) {
    if (storedValue === undefined || storedValue === null) return false;
    if (String(input.value) === String(storedValue)) return true;
    if (String(input.getAttribute("FaVal") ?? "") === String(storedValue)) return true;
    const label = getKeyVal(radioMap, storedValue);
    if (label != null) {
        if (String(input.getAttribute("FaVal") ?? "") === String(label)) return true;
        if (radioMap[label] !== undefined && String(input.value) === String(radioMap[label])) return true;
    }
    if (storedValue === true) {
        return (
            input.getAttribute("FaVal") === "بله" ||
            input.value === "true" ||
            String(input.value) === String(radioMap?.["بله"] ?? 1)
        );
    }
    if (storedValue === false) {
        return (
            input.getAttribute("FaVal") === "خیر" ||
            input.value === "false" ||
            String(input.value) === String(radioMap?.["خیر"] ?? 2)
        );
    }
    return false;
}

/** Merge a step's submitted fields into localStorage so going back shows saved values, not stale cache. */
function mergeSubmittedDataIntoFormCache(submittedData) {
    if (!submittedData || typeof submittedData !== "object") return false;
    if (Object.keys(submittedData).length === 0) return false;
    try {
        const prevRaw = localStorage.getItem("form_data");
        const prev =
            prevRaw && prevRaw !== "null" ? JSON.parse(prevRaw) : {};
        const merged = { ...prev, ...submittedData };
        localStorage.setItem("form_data", JSON.stringify(merged));
        return true;
    } catch (e) {
        console.warn("Failed to merge submitted data into form cache:", e);
        return false;
    }
}

function isValidStoredFormId(id) {
    return id != null && id !== "" && id !== "null";
}

/** Editing uses localStorage form_id; new forms use the id returned from step 1 POST. */
function resolveFormIdForSubmit(presetform, id_form, createdFormId) {
    if (presetform != null && isValidStoredFormId(id_form)) {
        return id_form;
    }
    return createdFormId;
}

function applyPresetToFormElements(formRefsMap, preset, radioMap, relMap, familyPayload) {
    if (!preset || typeof preset !== "object") return;

    let masked_cancers = {};
    try {
        masked_cancers = cancerDictRefiner(relMap || {}, familyPayload || { data: { familyCancers: [] } });
    } catch {
        masked_cancers = {};
    }

    const formElems = [];
    Object.keys(formRefsMap).forEach((fk) => {
        const formNode = formRefsMap[fk]?.current;
        if (!formNode) return;
        formNode.querySelectorAll("input, select").forEach((el) => formElems.push(el));
    });

    formElems.forEach((fE) => {
        Object.keys(preset).forEach((pfk) => {
            if (preset[pfk] === undefined) return;

            if (fE.type === "text" || fE.type === "number" || fE.nodeName === "SELECT") {
                if (pfk === "birthDate" && (fE.name === "birthYear" || fE.name === "birthMonth" || fE.name === "birthDay")) {
                    const [year, month, day] = preset[pfk].split("T")[0].split("-");
                    const y = parseInt(year, 10);
                    const m = parseInt(month, 10);
                    const d = parseInt(day, 10);
                    const Mkey = Object.keys(persianMonths).find((k) => persianMonths[k] === m);
                    if (fE.name === "birthYear") fE.value = y;
                    if (fE.name === "birthMonth") fE.value = Mkey;
                    if (fE.name === "birthDay") fE.value = d;
                } else if (fE.name === pfk) {
                    if (fE.nodeName === "SELECT" && (preset[pfk] == null || preset[pfk] === "")) {
                        fE.value = "انتخاب کنید";
                    } else {
                        fE.value = preset[pfk];
                    }
                    if (pfk === "mediumActivityMonthInYear" || pfk === "hardActivityMonthInYear") {
                        fE.value = `${preset[pfk]} ماه`;
                    }
                    if (pfk === "intendedHrtUse" || pfk === "hrtUseLength") {
                        fE.value = `${preset[pfk]} سال`;
                    }
                    if (pfk === "ageOfFirstBirth") {
                        fE.value = `${preset[pfk]} سال`;
                    }
                    if (pfk === "ghaedeAge") {
                        fE.value = `${preset[pfk]} سال`;
                    }
                    if (fE.nodeName === "SELECT" && pfk === "smokingAge" && preset[pfk] === 0) {
                        fE.value = "هیچوقت به طور منظم سیگار یا قلیان نکشیده ام";
                    }
                }
            } else if (fE.name === pfk && fE.type === "radio") {
                fE.checked = radioInputMatchesPreset(fE, preset[pfk], radioMap);
                if (fE.getAttribute("data-enum")) {
                    const enumName = fE.getAttribute("data-enum");
                    const token = localStorage.getItem("token");
                    fetchDataGET(`enum/${enumName}`, token).then((res) => {
                        res.data.forEach((en) => {
                            if (en.id == preset[pfk] && fE.getAttribute("FaVal") == en.name) {
                                fE.checked = true;
                            }
                        });
                    }).catch(() => {});
                }
                if (
                    fE.name === "cancer" &&
                    preset[pfk] === true &&
                    fE.getAttribute("FaVal") === "بله" &&
                    JSON.parse(localStorage.getItem("selfcanFilled") || "false")
                ) {
                    fE.checked = true;
                }
                if (
                    fE.name === "cancer" &&
                    preset[pfk] === false &&
                    fE.getAttribute("FaVal") === "خیر" &&
                    JSON.parse(localStorage.getItem("selfcanFilled") || "false")
                ) {
                    fE.checked = true;
                }
            } else if (fE.name in cancerRefs && JSON.parse(localStorage.getItem("famcanFilled") || "false")) {
                const foundTrue = Object.keys(masked_cancers).some((mc) =>
                    cancerRefs[fE.name].some((cf) => cf === mc && masked_cancers[mc] === "بله")
                );
                if (foundTrue && fE.getAttribute("FaVal") === "بله") fE.checked = true;
                if (!foundTrue && fE.getAttribute("FaVal") === "خیر") fE.checked = true;
            } else if (fE.name === pfk && fE.type === "file") {
                if (preset[pfk]) {
                    fE.setAttribute("data-file-url", JSON.stringify(preset[pfk]));
                }
            } else if (fE.name === pfk && fE.type === "checkbox") {
                fE.checked = preset[pfk] === 1 || preset[pfk] === true;
            } else if (!(fE.name in preset) && fE.type === "checkbox" && fE.name !== "isAtba") {
                fE.checked = false;
            } else if (fE.type === "range" && fE.name === pfk) {
                fE.value = preset[pfk];
            }
        });
    });
}

function Questions() {
    const [step, setStep] = useState(1)
    const [submissionSuccess, setSubmissionSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [after, setAfter] = useState(false)
    const [checkEmp, setCheckEmp] = useState(false)
    const [requiredMap, setRequiredMap] = useState({});
    const [createdFormId, setCreatedFormId] = useState(0)
    /** Bumped after merging server slices (e.g. generalhealth) into localStorage so preset hydration re-runs. */
    const [formDataRevision, setFormDataRevision] = useState(0)
    const [typeErr, setTypeErr] = useState(false)
    const [typeErr2, setTypeErr2] = useState(false)
    const [typeErr3, setTypeErr3] = useState(false)
    const [openModalConf, setOpenModalConf] = useState(false)

    const [RadioMap, setRadioMap] = useState({})
    const [MenoMap, setMenoMap] = useState({})
    const [RelMap, setRelMap] = useState({})
    const [catchQuestions, setCatchQuestions] = useState({});
    const [catchAnswers, setCatchAnswers] = useState({});
    const [step3AttentionCorrect, setStep3AttentionCorrect] = useState(0);
    const formDataRef = useRef(new FormData()); // Keep formData in a ref so FileUploaders can access it
    const fileArraysRef = useRef({}); // Keep track of file arrays by field name

    // Enum properties:
    useEffect(() => {
        let token = localStorage.getItem("token")
        const getAns = async () => {
            const ansMap = await fetchDataGET("enum/answers", token)
            let trueData = dict_transformer(ansMap.data)
            setRadioMap(trueData)
        }
        getAns()
        const getRels = async () => {
            const res = await fetchDataGET(`enum/relatives`, token);
            let trueData = dict_transformer(res.data)
            setRelMap(trueData)
        }
        getRels()
        const getMeno = async () => {
            const res = await fetchDataGET("enum/menopausal-statuses", token);
            const byId = {};
            (res.data || []).forEach((item) => {
                byId[item.id] = item.name;
            });
            setMenoMap(byId);
        };
        getMeno();
        // let temp_dict = {
        //     "بله": 1,
        //     "خیر": 2,
        //     "نمیدانم": 3,
        // }
    }, [])


    // Function to allow FileUploader components to add files to the shared formData
    const fillingFormData = (fieldName, file) => {
        formDataRef.current.append(fieldName, file);

        // Also track in our separate file arrays structure
        if (!fileArraysRef.current[fieldName]) {
            fileArraysRef.current[fieldName] = [];
        }
        fileArraysRef.current[fieldName].push(file);


        for (let pair of formDataRef.current.entries()) {
            // Removed logging
        }
    };

    // Function to allow FileUploader components to remove the last file from the shared formData
    const removeLastFileFromFormData = (fieldName) => {
        // Get the file array for this field
        const fieldFiles = fileArraysRef.current[fieldName] || [];

        if (fieldFiles.length > 0) {
            // Remove the last file from our tracking array
            fieldFiles.pop();

            // Rebuild the formData by getting all values for each field
            const newFormData = new FormData();
            const fieldsMap = new Map(); // To collect values by field name

            // Collect all values by field name
            for (let [key, value] of formDataRef.current.entries()) {
                if (!fieldsMap.has(key)) {
                    fieldsMap.set(key, []);
                }
                fieldsMap.get(key).push(value);
            }

            // Rebuild the formData, removing the last value for the specified field
            for (let [fieldNameKey, valuesArray] of fieldsMap) {
                if (fieldNameKey === fieldName && valuesArray.length > 0) {
                    // For the target field, add all values except the last one
                    for (let i = 0; i < valuesArray.length - 1; i++) {
                        newFormData.append(fieldNameKey, valuesArray[i]);
                    }
                } else {
                    // For other fields, add all values
                    for (let value of valuesArray) {
                        newFormData.append(fieldNameKey, value);
                    }
                }
            }

            // Update the ref
            formDataRef.current = newFormData;
        }
    };

    // const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToast } = useToast()

    // step 1
    const [atba, setatba] = useState(false)
    const [gender, setGender] = useState(0)
    // step 2
    const [isAlchol, setIsAlchol] = useState('')
    const [isSabzi, setIsSabzi] = useState('')
    const [isActivity, setIsActivity] = useState('')
    const [isHardActivity, setIsHardActivity] = useState('')
    const [isSmoke, setIsSmoke] = useState('')
    const [isSmokeAge, setIsSmokeAge] = useState('')
    const [isSmokingNow, setIsSmokingNow] = useState("null")
    const [cigNow, setCigNow] = useState(false)
    const [ghelNow, setGhelNow] = useState(false)
    // step 3 
    const [isChild, setIsChild] = useState('')
    const [isAdat, setIsAdat] = useState('')
    const [isHRT, setIsHRT] = useState('')
    const [isHRT5, setIsHRT5] = useState('')
    const [isOral, setIsOral] = useState('')
    const [isColon, setIsColon] = useState('')
    const [isMamoTest, setIsMamoTest] = useState('')
    // step 4
    const [isCancer, setIsCancer] = useState('')
    const [selfCancersPreData, setSelfCancersPreData] = useState(null)
    //step 5
    const [isChildCancer, setIsChildCncer] = useState('')
    const [isMotherCancer, setIsMotherCncer] = useState('')
    const [isFatherCancer, setIsFatherCncer] = useState('')
    const [isSibsCancer, setIsSibsCncer] = useState('')
    const [isUncAuntCancer, setIsUncAuntCncer] = useState('')
    const [isUncAunt2Cancer, setIsUncAunt2Cncer] = useState('')
    const [isOtherCancer, setIsOtherCncer] = useState('')
    const [familyCancersPreData, setFamilyCancersPreData] = useState(null)

    //step 6
    const [smokeType, setSmokeType] = useState('')
    const [smokeTypePast, setSmokeTypePast] = useState('')
    const [anySmokePast, setAnySmokePast] = useState(false)
    const [anySmoke, setAnySmoke] = useState(false)
    const [firstDeg, setFirstDeg] = useState(false)
    // const [isChronic, setIsChronic] = useState(false)
    //step 7

    const [isGeneTest, setIsGeneTest] = useState('')
    const [isFamGeneTest, setIsFamGeneTest] = useState('')


    const ArrofVals = [isAlchol, isSabzi, isActivity, isHardActivity, isSmoke, isSmokeAge, isSmokingNow, isChild, isAdat, isHRT, isHRT5, isOral, isColon, isCancer
        , isChildCancer, isMotherCancer, isFatherCancer, isSibsCancer, isUncAuntCancer, isUncAunt2Cancer, isGeneTest, isFamGeneTest
    ]
    // form refrences
    const formRefs = {
        1: useRef(null),
        2: useRef(null),
        3: useRef(null),
        4: useRef(null),
        5: useRef(null),
        6: useRef(null),
        7: useRef(null)
    };

    const cancerTable = useRef(null)
    const cancerMotherTable = useRef(null)
    const cancerFatherTable = useRef(null)
    const questionContainerRef = useRef(null);
    // const cancerTable = useRef(null)
    // const cancerMotherTable = useRef(null)
    // const cancerMotherTable = useRef(null)


    const raw = localStorage.getItem("form_data");
    const id_form = localStorage.getItem("form_id")
    const presetform = raw ? JSON.parse(raw) : null;
    // const id_form = id_form_raw ? JSON.parse(id_form_raw) : null;

    useEffect(() => {
        let token = localStorage.getItem("token")
        const innerFunc = async () => {
            const res = await fetchDataGET(`enum/relatives`, token);
        }
        innerFunc()
    }, [])

    // Function to inject catch questions into specified forms
    const injectCatchQuestions = () => {
        // Only inject catch questions for steps 2, 3, and 6
        if (![2, 3, 6].includes(step)) return;

        // Select a random catch question
        const randomIndex = Math.floor(Math.random() * CQs.length);
        const selectedCatchQuestion = { ...CQs[randomIndex] };

        // Handle special case for catchSum question type
        if (selectedCatchQuestion.useName === "catchSum") {
            const num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1-10
            const num2 = Math.floor(Math.random() * 10) + 1; // Random number between 1-10
            const sum = num1 + num2;

            // Update the question with the random numbers
            selectedCatchQuestion.inpName = `${num1} + ${num2} = ?`;
            selectedCatchQuestion.correctAnswer = sum; // Store the correct answer

            // Update state to track this specific catch question's answer
            setCatchAnswers(prev => ({
                ...prev,
                [`catchSum_${step}`]: sum
            }));
        } else if (selectedCatchQuestion.ans !== undefined) {
            // For other questions, store the correct answer
            setCatchAnswers(prev => ({
                ...prev,
                [selectedCatchQuestion.useName]: selectedCatchQuestion.ans
            }));
        }

        // Store the catch question for the current step
        setCatchQuestions(prev => ({
            ...prev,
            [step]: selectedCatchQuestion
        }));
    };

    // useEffect to inject catch questions when step changes
    useEffect(() => {
        injectCatchQuestions();
    }, [step]);

    useEffect(() => {
        if (presetform != null && isValidStoredFormId(id_form)) {
            setCreatedFormId(id_form);
        }
    }, [id_form]);


    const EMPTY_SELF_CANCER = { data: { cancers: [] } };
    const EMPTY_FAMILY_CANCER = { data: { familyCancers: [] } };

    const selfFunc = async () => {
        const fid = localStorage.getItem("form_id");
        const tok = localStorage.getItem("token");
        if (!fid || fid === "" || fid === "null") {
            setSelfCancersPreData(null);
            return;
        }
        try {
            const res = await fetchDataGETImg(`form/${fid}/cancer`, tok);
            setSelfCancersPreData(res);
        } catch (e) {
            console.warn("Self cancer preload failed:", e);
            setSelfCancersPreData(EMPTY_SELF_CANCER);
        }
    };
    const familyFunc = async () => {
        const fid = localStorage.getItem("form_id");
        const tok = localStorage.getItem("token");
        if (!fid || fid === "" || fid === "null") {
            setFamilyCancersPreData(null);
            return;
        }
        try {
            const res = await fetchDataGETImg(`form/${fid}/familycancer`, tok);
            setFamilyCancersPreData(res);
        } catch (e) {
            console.warn("Family cancer preload failed:", e);
            setFamilyCancersPreData(EMPTY_FAMILY_CANCER);
        }
    };

    const syncStep5FamilyCancerRadios = useCallback(() => {
        const formEl = formRefs[5]?.current;
        if (!formEl) return;
        const { yesId, noId } = resolveYesNoIdsFromRadioMap(RadioMap);
        const familyPayload =
            familyCancersPreData?.data?.familyCancers != null &&
            Array.isArray(familyCancersPreData.data.familyCancers)
                ? familyCancersPreData
                : EMPTY_FAMILY_CANCER;
        let masked_cancers;
        try {
            masked_cancers = cancerDictRefiner(RelMap || {}, familyPayload);
        } catch {
            masked_cancers = {};
        }
        const step5FamilySetterByField = {
            childCancer: setIsChildCncer,
            motherCancer: setIsMotherCncer,
            fatherCancer: setIsFatherCncer,
            siblingCancer: setIsSibsCncer,
            ameAmoCancer: setIsUncAuntCncer,
            khaleDaeiCancer: setIsUncAunt2Cncer,
        };
        Object.keys(cancerRefs).forEach((groupName) => {
            const foundTrue = Object.keys(masked_cancers).some((mc) =>
                cancerRefs[groupName].some(
                    (cf) => cf === mc && masked_cancers[mc] === "بله"
                )
            );
            const targetId = foundTrue ? yesId : noId;
            const radios = formEl.querySelectorAll(
                `input[type="radio"][name="${groupName}"]`
            );
            radios.forEach((r) => {
                const match =
                    String(r.value) === String(targetId) ||
                    String(r.getAttribute("FaVal")) === String(targetId);
                r.checked = match;
            });
            step5FamilySetterByField[groupName]?.(targetId);
        });
    }, [
        RadioMap,
        RelMap,
        familyCancersPreData,
        setIsChildCncer,
        setIsMotherCncer,
        setIsFatherCncer,
        setIsSibsCncer,
        setIsUncAuntCncer,
        setIsUncAunt2Cncer,
    ]);

    /** Step 4: API `GET form/.../cancer` returns { cancer, cancers }. If user answered خیر: cancer false + empty list — select خیر and sync localStorage. */
    const syncStep4SelfCancerFromApi = useCallback(() => {
        const d = selfCancersPreData?.data;
        if (d == null || typeof d !== "object") return;

        const cancersList = Array.isArray(d.cancers) ? d.cancers : [];
        const wantsYes = d.cancer === true || cancersList.length > 0;
        const wantsNo = d.cancer === false && cancersList.length === 0;
        if (!wantsYes && !wantsNo) return;

        const { yesId, noId } = resolveYesNoIdsFromRadioMap(RadioMap);
        const targetId = wantsYes ? yesId : noId;

        const formEl = formRefs[4]?.current;
        if (formEl) {
            const radios = formEl.querySelectorAll(`input[type="radio"][name="cancer"]`);
            radios.forEach((r) => {
                const match =
                    String(r.value) === String(targetId) ||
                    String(r.getAttribute("FaVal")) === String(targetId);
                r.checked = match;
            });
        }
        setIsCancer(targetId);

        try {
            const raw = localStorage.getItem("form_data");
            if (raw && raw !== "null") {
                const prev = JSON.parse(raw);
                prev.cancer = wantsYes;
                localStorage.setItem("form_data", JSON.stringify(prev));
                setFormDataRevision((n) => n + 1);
            }
        } catch (_) {
            /* ignore */
        }
    }, [selfCancersPreData, RadioMap, setIsCancer]);

    // cancer preData — only when a real form id exists; failures still set empty shapes so edit preset hydration can run
    useEffect(() => {
        if (!id_form || id_form === "" || id_form === "null") {
            setSelfCancersPreData(null);
            setFamilyCancersPreData(null);
            return;
        }
        let cancelled = false;
        (async () => {
            let self = EMPTY_SELF_CANCER;
            let family = EMPTY_FAMILY_CANCER;
            const tok = localStorage.getItem("token");
            try {
                self = await fetchDataGETImg(`form/${id_form}/cancer`, tok);
            } catch (e) {
                console.warn("Self cancer preload failed:", e);
            }
            try {
                family = await fetchDataGETImg(`form/${id_form}/familycancer`, tok);
            } catch (e) {
                console.warn("Family cancer preload failed:", e);
            }
            if (!cancelled) {
                setSelfCancersPreData(self);
                setFamilyCancersPreData(family);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id_form]);

    // When editing, entering step 2 must load latest general health from the API (not only merged cache from form list).
    useEffect(() => {
        if (step !== 2) return;
        const fid = localStorage.getItem("form_id");
        if (!fid || fid === "" || fid === "null") return;

        let cancelled = false;
        (async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetchDataGET(`form/${fid}/generalhealth`, token);
                const gh = res?.data;
                if (cancelled || gh == null || typeof gh !== "object") return;

                const prevRaw = localStorage.getItem("form_data");
                if (!prevRaw || prevRaw === "null") return;
                const prev = JSON.parse(prevRaw);
                const merged = { ...prev, ...gh };
                localStorage.setItem("form_data", JSON.stringify(merged));
                setFormDataRevision((n) => n + 1);
            } catch (e) {
                console.warn("Step 2 generalhealth fetch failed:", e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [step]);

    // When editing, refresh mamography when opening step 3 (same pattern as generalhealth on step 2).
    useEffect(() => {
        if (step !== 3) return;
        const fid = localStorage.getItem("form_id");
        if (!fid || fid === "" || fid === "null") return;

        let cancelled = false;
        (async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetchDataGET(`form/${fid}/mamography`, token);
                const mg = res?.data;
                if (cancelled || mg == null || typeof mg !== "object") return;

                const prevRaw = localStorage.getItem("form_data");
                if (!prevRaw || prevRaw === "null") return;
                const prev = JSON.parse(prevRaw);
                const merged = { ...prev, ...mg };
                localStorage.setItem("form_data", JSON.stringify(merged));
                setFormDataRevision((n) => n + 1);
            } catch (e) {
                console.warn("Step 3 mamography fetch failed:", e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [step]);

    // When editing, refresh contact (step 7) from the API when opening that step.
    useEffect(() => {
        if (step !== 7) return;
        const fid = localStorage.getItem("form_id");
        if (!fid || fid === "" || fid === "null") return;

        let cancelled = false;
        (async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetchDataGET(`form/${fid}/contact`, token);
                const contact = res?.data;
                if (cancelled || contact == null || typeof contact !== "object") return;

                const prevRaw = localStorage.getItem("form_data");
                if (!prevRaw || prevRaw === "null") return;
                const prev = JSON.parse(prevRaw);
                const merged = { ...prev, ...contact };
                localStorage.setItem("form_data", JSON.stringify(merged));
                setFormDataRevision((n) => n + 1);
            } catch (e) {
                console.warn("Step 7 contact fetch failed:", e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [step]);

    useEffect(() => {
        const raw = localStorage.getItem("form_data");
        const fid = localStorage.getItem("form_id");
        if (!raw || raw === "null" || !fid || fid === "" || fid === "null") return;

        let preset;
        try {
            preset = JSON.parse(raw);
        } catch {
            return;
        }
        if (!preset || typeof preset !== "object") return;

        setLoading(true);
        const familyPayload =
            familyCancersPreData?.data?.familyCancers != null &&
            Array.isArray(familyCancersPreData.data.familyCancers)
                ? familyCancersPreData
                : EMPTY_FAMILY_CANCER;

        const raf = requestAnimationFrame(() => {
            applyPresetToFormElements(formRefs, preset, RadioMap, RelMap, familyPayload);
            syncStep5FamilyCancerRadios();
            setLoading(false);
        });
        return () => cancelAnimationFrame(raf);
    }, [RadioMap, RelMap, familyCancersPreData, formDataRevision, step, syncStep5FamilyCancerRadios])

    // Step 5: re-apply defaults when opening this step while editing (DOM + enum timing can miss the main preset pass).
    useEffect(() => {
        if (step !== 5) return;
        const fid = localStorage.getItem("form_id");
        const raw = localStorage.getItem("form_data");
        if (!fid || fid === "" || fid === "null" || !raw || raw === "null") return;
        const raf = requestAnimationFrame(() => {
            const raw = localStorage.getItem("form_data");
            if (raw && raw !== "null") {
                try {
                    const preset = JSON.parse(raw);
                    const familyPayload =
                        familyCancersPreData?.data?.familyCancers != null &&
                        Array.isArray(familyCancersPreData.data.familyCancers)
                            ? familyCancersPreData
                            : EMPTY_FAMILY_CANCER;
                    applyPresetToFormElements(formRefs, preset, RadioMap, RelMap, familyPayload);
                } catch (_) { /* ignore */ }
            }
            syncStep5FamilyCancerRadios();
        });
        return () => cancelAnimationFrame(raf);
    }, [step, RadioMap, RelMap, familyCancersPreData, formDataRevision, syncStep5FamilyCancerRadios])

    useEffect(() => {
        syncStep4SelfCancerFromApi();
    }, [selfCancersPreData, RadioMap, syncStep4SelfCancerFromApi])

    // Step 4: re-apply cancer yes/no from self-cancer API when opening this step while editing.
    useEffect(() => {
        if (step !== 4) return;
        const fid = localStorage.getItem("form_id");
        const raw = localStorage.getItem("form_data");
        if (!fid || fid === "" || fid === "null" || !raw || raw === "null") return;
        const raf = requestAnimationFrame(() => {
            syncStep4SelfCancerFromApi();
        });
        return () => cancelAnimationFrame(raf);
    }, [step, selfCancersPreData, RadioMap, syncStep4SelfCancerFromApi])


    useEffect(() => {
        const raw = localStorage.getItem("form_data");
        let cachedPreset = null;
        try {
            cachedPreset = raw && raw !== "null" ? JSON.parse(raw) : null;
        } catch {
            return;
        }
        if (cachedPreset == null) return;

        if ('gender' in cachedPreset) setGender(cachedPreset["gender"])
        if ('drinksAlcohol' in cachedPreset) setIsAlchol(relator_R(presetAnswerToLabel(cachedPreset["drinksAlcohol"], RadioMap)))
        if ('lastMonthSabzijatMeal' in cachedPreset) setIsSabzi(cachedPreset["lastMonthSabzijatMeal"])
        if ('mediumActivityMonthInYear' in cachedPreset) setIsActivity(cachedPreset["mediumActivityMonthInYear"])
        if ('hardActivityMonthInYear' in cachedPreset) setIsHardActivity(cachedPreset["hardActivityMonthInYear"])
        if ('smokeAtLeast100' in cachedPreset) setIsSmoke(relator_R(presetAnswerToLabel(cachedPreset["smokeAtLeast100"], RadioMap)))
        if ('smokingAge' in cachedPreset) {
            if (cachedPreset["smokingAge"] === 0) {
                setIsSmokeAge("هیچوقت به طور منظم سیگار یا قلیان نکشیده ام")
            } else {
                setIsSmokeAge(cachedPreset["smokingAge"])
            }
        }
        if ('smokingNow' in cachedPreset) setIsSmokingNow(relator_R(presetAnswerToLabel(cachedPreset["smokingNow"], RadioMap)))
        if ('hasChildren' in cachedPreset) {
            setIsChild(relator_R(presetAnswerToLabel(cachedPreset["hasChildren"], RadioMap)))
        }
        if ('menopausalStatus' in cachedPreset) setIsAdat(cachedPreset["menopausalStatus"])
        if ('hrt' in cachedPreset) setIsHRT(relator_R(presetAnswerToLabel(cachedPreset["hrt"], RadioMap)))
        if ('lastFiveYearsHrtUse' in cachedPreset) setIsHRT5(relator_R(presetAnswerToLabel(cachedPreset["lastFiveYearsHrtUse"], RadioMap)))
        if ('oral' in cachedPreset) setIsOral(relator_R(presetAnswerToLabel(cachedPreset["oral"], RadioMap)))
        if ('laDeColon' in cachedPreset) setIsColon(relator_R(presetAnswerToLabel(cachedPreset["laDeColon"], RadioMap)))
        if ('mamoGraphy' in cachedPreset) setIsMamoTest(relator_R(presetAnswerToLabel(cachedPreset["mamoGraphy"], RadioMap)))
        if ('cancer' in cachedPreset) setIsCancer(cachedPreset["cancer"])
        if ('childCancer' in cachedPreset) setIsChildCncer(relator_R(presetAnswerToLabel(cachedPreset["childCancer"], RadioMap)))
        if ('motherCancer' in cachedPreset) setIsMotherCncer(relator_R(presetAnswerToLabel(cachedPreset["motherCancer"], RadioMap)))
        if ('fatherCancer' in cachedPreset) setIsFatherCncer(relator_R(presetAnswerToLabel(cachedPreset["fatherCancer"], RadioMap)))
        if ('siblingCancer' in cachedPreset) setIsSibsCncer(relator_R(presetAnswerToLabel(cachedPreset["siblingCancer"], RadioMap)))
        if ('ameAmoCancer' in cachedPreset) setIsUncAuntCncer(relator_R(presetAnswerToLabel(cachedPreset["ameAmoCancer"], RadioMap)))
        if ('khaleDaeiCancer' in cachedPreset) setIsUncAunt2Cncer(relator_R(presetAnswerToLabel(cachedPreset["khaleDaeiCancer"], RadioMap)))
        if ('otherRelative' in cachedPreset) setIsOtherCncer(relator_R(presetAnswerToLabel(cachedPreset["otherRelative"], RadioMap)))
        if ('testGen' in cachedPreset) setIsGeneTest(relator_R(presetAnswerToLabel(cachedPreset["testGen"], RadioMap)))
        if ('fmTestGen' in cachedPreset) setIsFamGeneTest(relator_R(presetAnswerToLabel(cachedPreset["fmTestGen"], RadioMap)))
        if ('smokingTypesCurrent' in cachedPreset) setSmokeType(relator_R(presetAnswerToLabel(cachedPreset["smokingTypesCurrent"], RadioMap)))
        if ('smokingTypesPast' in cachedPreset) setSmokeTypePast(relator_R(presetAnswerToLabel(cachedPreset["smokingTypesPast"], RadioMap)))
        if ('lungCancerFamily' in cachedPreset) setFirstDeg(relator_R(presetAnswerToLabel(cachedPreset["lungCancerFamily"], RadioMap)))
        if ('pastSmoking' in cachedPreset) {
            setAnySmokePast(relator_R(presetAnswerToLabel(cachedPreset["pastSmoking"], RadioMap)))
        }

        setAfter(true)

    }, [RadioMap, formDataRevision, step])

    useEffect(() => {
        setLoading(false)
        // setIsAlchol(true)
    }, [after])

    // New useEffect to handle family relatives cancer status
    // useEffect(() => {
    //     const loadFamilyCancerData = async () => {
    //         if (id_form && presetform) {
    //             const token = localStorage.getItem("token");

    //             try {
    //                 // Fetch family cancer data
    //                 const familyCancerRes = await fetchDataGETImg(`form/${id_form}/familycancer`, token);
    //                 const familyCancerData = familyCancerRes.data?.familyCancers || [];
    //                 // Fetch relatives enum to map relative IDs to names
    //                 const relativesEnumRes = await fetchDataGET(`enum/relatives`, token);
    //                 const relativesEnum = relativesEnumRes.data || [];

    //                 // Create a map from relative ID to relative name
    //                 const relativeIdToName = {};
    //                 relativesEnum.forEach(rel => {
    //                     relativeIdToName[rel.id] = rel.name;
    //                 });

    //                 // Create a map of field names to relative IDs based on the state variables
    //                 // isChildCancer, isMotherCancer, isFatherCancer, isSibsCancer, isUncAuntCancer, isUncAunt2Cancer, isOtherCancer
    //                 const relativeFieldMap = {
    //                     1: "fatherCancer",
    //                     2: "motherCancer",
    //                     3: "siblingCancer",
    //                     4: "siblingCancer",
    //                     5: "otherRelative",
    //                     6: "otherRelative",
    //                     7: "otherRelative",
    //                     8: "otherRelative",
    //                     9: "ameAmoCancer",
    //                     10: "ameAmoCancer",
    //                     11: "khaleDaeiCancer",
    //                     12: "khaleDaeiCancer",
    //                     13: "otherRelative",

    //                 };

    //                 // Map field names to form input names based on the useState variables
    //                 // const fieldToInputName = {
    //                 //     "childCancer": "isChildCancer",
    //                 //     "motherCancer": "isMotherCancer",
    //                 //     "fatherCancer": "isFatherCancer",
    //                 //     "siblingCancer": "isSibsCancer",
    //                 //     "ameAmoCancer": "isUncAuntCancer",
    //                 //     "khaleDaeiCancer": "isUncAunt2Cancer",
    //                 //     "otherRelative": "isOtherCancer"
    //                 // };

    //                 // Create a map of relatives that have cancer
    //                 const relativesWithCancer = {};
    //                 familyCancerData.forEach(familyMember => {
    //                     const relativeId = familyMember.relative;
    //                     // Find the corresponding field name from the enum
    //                     const relativeName = relativeIdToName[relativeId];
    //                     if (relativeName) {
    //                         // Map the relative name to the field name
    //                         const fieldName = relativeFieldMap[relativeId];
    //                         if (fieldName) {
    //                             // Map the field name to input name used in the form
    //                             // const inputName = fieldToInputName[fieldName];
    //                             // if (inputName) {
    //                             // Check if this relative has any cancers
    //                             if (familyMember.cancers && familyMember.cancers.length > 0) {
    //                                 relativesWithCancer[fieldName] = true;
    //                             }
    //                             // }
    //                         }
    //                     }
    //                 });
    //                 // Now update the radio buttons in step 5 based on cancer data
    //                 if (formRefs[5]?.current) {
    //                     const formElements = formRefs[5].current.querySelectorAll("input[type='radio']");

    //                     formElements.forEach(radio => {
    //                         // Find the field name that this radio button belongs to
    //                         const fieldName = radio.name;
    //                         // Check if this field corresponds to a relative with cancer
    //                         if (relativesWithCancer[fieldName]) {
    //                             // If the relative has cancer, check the "بله" radio button
    //                             if (radio.id === "بله") {
    //                                 radio.checked = true;
    //                             } else if (radio.id === "خیر") {
    //                                 radio.checked = false;
    //                             }
    //                         } else {
    //                             // If the relative doesn't have cancer, check the "خیر" radio button
    //                             if (radio.id === "خیر") {
    //                                 radio.checked = true;
    //                             } else if (radio.id === "بله") {
    //                                 radio.checked = false;
    //                             }
    //                         }
    //                     });
    //                 }

    //             } catch (error) {
    //                 console.error("Error fetching family cancer data:", error);
    //             }
    //         }
    //     };

    //     loadFamilyCancerData();
    // }, [id_form, presetform]);

    // Scroll to top of questions container when step changes
    useEffect(() => {
        if (questionContainerRef.current) {
            questionContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [step]);
    const relator_S = (state) => {
        if (state != '' && state != "انتخاب کنید") {
            if (state == "هیچوقت به طور منظم سیگار یا قلیان نکشیده ام") {
                return false
            }
            return true
        }
        return false
    }
    const relatorMenopause = (state) => isMenopauseYes(state, MenoMap);
    const relator_R = (state) => {
        if (state == "null") {
            return "null";
        }
        if (state == "سابقاً مصرف می کرده ام اما کمتر از ۱۵ سال است که ترک کرده ام" || state == "سابقاً مصرف می کردم اما بیش از ۱۵ سال است که ترک کرده ام") {
            return true
        }
        if (isNumber(state) && state != false && ((state == 2 && state != 1) || state == 3)) {
            return true
        } else if (state == 1 && typeof state !== "boolean") {
            return false
        }

        if (state == "بله" || state == "true" || state == true && (state != "false" || state != "خیر")) {
            return true
        }
        return false
    }
    /** Step 5 yes/no: valueSetter may be the Persian label ("بله"/"خیر") or enum id from preset/sync. */
    const relatorAnswerYes = (state) => {
        if (state === "" || state === undefined || state === null) return false;
        if (state === "خیر" || state === false || state === "false") return false;
        if (state === "بله" || state === true || state === "true") return true;
        const yesId = RadioMap["بله"];
        if (yesId !== undefined) {
            return String(state) === String(yesId);
        }
        return state === 1;
    };

    const relator_gen = (state) => {
        if (state == 2) {
            return true
        } else {
            return false
        }
    }


    // I do not know but you should 
    function getValue(obj, st, name) {
        return obj[st]?.[name];
    }

    const clearServerValidationHighlights = (FP) => {
        if (!FP?.current) return;
        const formInputs = FP.current.querySelectorAll("input, select, textarea");
        formInputs.forEach((fi) => {
            if (fi.type === "radio" || fi.type === "checkbox") {
                if (fi.parentElement?.parentElement) {
                    fi.parentElement.parentElement.style.border = "";
                }
            } else {
                fi.style.border = "";
            }
        });
    };

    const highlightServerValidationErrors = (FP, messages = {}) => {
        if (!FP?.current || !messages || typeof messages !== "object") return false;

        let hasFieldError = false;
        Object.keys(messages).forEach((fieldName) => {
            const targets = FP.current.querySelectorAll(`[name="${fieldName}"]`);
            if (!targets.length) return;

            hasFieldError = true;
            targets.forEach((el) => {
                if (el.type === "radio" || el.type === "checkbox") {
                    if (el.parentElement?.parentElement) {
                        el.parentElement.parentElement.style.border = "2px solid red";
                    }
                } else {
                    el.style.border = "2px solid red";
                }
            });
        });

        return hasFieldError;
    };

    //   const isNumber = (str) => str.trim() !== "" && !isNaN(str);

    const checkReq = (FP, st) => {
        clearServerValidationHighlights(FP);
        let form_inps = FP.current.querySelectorAll("input, select");
        let rads = {};
        let chks = {};
        let go1 = []
        let go2 = []
        let go3 = []
        let reqErr = false
        form_inps.forEach(fi => {
            const Name = fi.name;
            const isRequired = getValue(requiredMap, st, Name);

            if (fi.type === "radio") {
                // collect radios into rads[Name]
                if (!rads[Name]) rads[Name] = [];
                rads[Name].push(fi);
            } else if (fi.type === "checkbox") {
                // collect checkboxes into chks[Name]
                if (!chks[Name]) chks[Name] = [];
                chks[Name].push(fi);
            } else {
                // Non-radio, non-checkbox: validate directly
                if (isRequired) {
                    if (fi.value.trim() === "" || fi.value.trim() === "انتخاب کنید") {
                        fi.style.border = "2px solid red";
                        reqErr = true
                        go1.push(false)
                    } else {
                        fi.style.border = "";
                        go1.push(true)
                    }
                }
            }
        });

        // ✅ Validate radios separately
        Object.keys(rads).forEach(groupName => {
            const isRequired = getValue(requiredMap, st, groupName);
            if (isRequired) {
                const checked = rads[groupName].some(r => r.checked);
                if (!checked) {
                    // Mark all radios in this group
                    rads[groupName].forEach(r => {
                        r.parentElement.parentElement.style.border = "2px solid red";
                    });
                    go2.push(false)
                    reqErr = true
                } else {
                    rads[groupName].forEach(r => {
                        r.parentElement.parentElement.style.border = "";
                    });
                    go2.push(true)
                }
            }
        });

        // ✅ Validate checkboxes separately
        Object.keys(chks).forEach(groupName => {
            const isRequired = getValue(requiredMap, st, groupName);
            if (isRequired) {
                const checked = chks[groupName].some(chk => chk.checked);
                if (!checked) {
                    // Mark all checkboxes in this group
                    chks[groupName].forEach(chk => {
                        chk.parentElement.parentElement.style.border = "2px solid red";
                    });
                    go3.push(false)
                    reqErr = true
                } else {
                    chks[groupName].forEach(chk => {
                        chk.parentElement.parentElement.style.border = "";
                    });
                    go3.push(true)
                }
            }
        });
        if (reqErr) {
            addToast({
                title: "لطفا تمامی سوال ها را پر کنید",
                type: 'error',
                duration: 4000
            })
        }
        let pass1 = go1.some((el) => el == false)  // true if there are invalid non-radio inputs
        let pass2 = go2.some((el) => el == false)  // true if there are invalid radio groups
        let pass3 = go3.some((el) => el == false)  // true if there are invalid checkbox groups
        // if there is just one object pass that
        if (!pass1 && !pass2 && !pass3) {  // all validations passed
            // if (step == 7) {
            //     return true
            // } else {
            //     nexter()
            // }
            return true
        } else {  // there are validation errors
            addToast({
                title: "لطفا تمامی سوال ها را پر کنید",
                type: 'error',
                duration: 4000
            })
            return false
        }
    };

    useEffect(() => {
        let bigger_dict = {}
        Object.keys(formRefs).forEach(key => {
            const fields = formRefs[key].current.querySelectorAll("input, select, textarea");
            const dict = {};
            fields.forEach((el) => {
                const name = el.name;
                const type = el.type;
                const isReq = el.getAttribute("data_req") === "true"; // ← use your prop here
                dict[name] = isReq;
            });
            bigger_dict[key] = dict
        });
        // Build dictionary of required fields from props or DOM
        setRequiredMap(bigger_dict);
    }, [
        gender, isAlchol, isSabzi, isActivity, isHardActivity, isSmoke, isSmokeAge,
        isSmokingNow, isChild, isAdat, isHRT, isHRT5, isOral, isColon, isCancer, isMamoTest,
        isChildCancer, isMotherCancer, isFatherCancer, isSibsCancer,
        isUncAuntCancer, isUncAunt2Cancer, isOtherCancer, isGeneTest, isFamGeneTest
    ]);
    // const smokes
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setLoading(true); // Set loading to true when starting submission

        const APIARR = ["basic", "generalhealth", "mamography", "cancerVisit", "familycancerVisit", "lungcancer", "contact"];

        const form = formRefs[`${step}`].current;
        if (!form) {
            setIsSubmitting(false);
            setLoading(false);
            return;
        }

        const token_auth = localStorage.getItem("token");
        let allData = {};
        const currentFormData = formDataRef.current; // Use the shared formData
        let sendData;
        for (const elem of form.elements) {
            const { name, type, tagName } = elem;
            if (!name || elem.disabled) continue;
            if (['BUTTON', 'FIELDSET'].includes(tagName)) continue;

            let shouldProcess = false;
            let value = '';

            if (type === 'radio') {
                if (elem.checked) {
                    shouldProcess = true;
                    value = elem.value;
                }
            } else if (type === 'checkbox') {
                if (elem.name === 'isAtba') {
                    if (elem.checked) {
                        shouldProcess = true;
                        value = elem.checked;
                    }
                } else {
                    shouldProcess = true;
                    value = elem.checked;
                }
            } else if (tagName === 'SELECT') {
                if ((name == "mediumActivityMonthInYear" || name == "hardActivityMonthInYear" || name == "intendedHrtUse" || name == "hrtUseLength" || name == "ageOfFirstBirth" || name == "ghaedeAge") && (elem.value != "انتخاب کنید" && elem.value != "انتخاب نمایید")) {
                    const match = elem.value.match(/\d+/);
                    const numberEx = match ? Number(match[0]) : null;
                    value = numberEx
                } else if (name == "smokingAge" && elem.value == "هیچوقت به طور منظم سیگار یا قلیان نکشیده ام") {
                    value = 0
                } else {
                    value = elem.value;
                }
                if (elem.value === false || elem.value === "انتخاب کنید" || elem.value === "انتخاب نمایید") continue;
                shouldProcess = true;
            } else if (type === 'file') {
                // Check if the file input has files either via the native files property or the custom data_toSend attribute
                const hasNativeFiles = elem.files && elem.files.length > 0;
                const hasCustomFiles = elem.getAttribute("data_toSend");
                if (hasNativeFiles || hasCustomFiles) {
                    shouldProcess = true;
                }
            } else if (type === 'text' || type === 'number' || type === 'email' || type === 'password' || type === 'tel' || type === 'url' || type === 'search' || type === 'date' || type === 'time' || type === 'datetime-local' || type === 'month' || type === 'week' || type === 'color') {
                // Handle various text-based input types
                value = elem.value;
                if (value.trim() !== '') { // Only process if not empty
                    shouldProcess = true;
                }
            } else {
                // For other input types that don't fit the above categories
                value = elem.value;
                if (value.trim() !== '') { // Only process if not empty
                    shouldProcess = true;
                }
            }

            if (!shouldProcess) continue;

            // ✅ Handle enum mapping first
            let finalValue = value;
            const enumName = elem.getAttribute('data-enum');
            if (enumName && value && type !== "file") {
                try {
                    const res = await fetchDataGET(`enum/${enumName}`, token_auth);
                    const match = res.data.find(r => r.name === value);
                    if (match) {
                        finalValue = match.id;
                    }
                } catch (err) {
                    console.warn(`Enum resolve failed: ${enumName}`, err);
                }
            }

            // ✅ Handle file separately - can handle multiple files
            if (type === "file") {
                // // For native file inputs, get files directly from the element
                // if (elem.files && elem.files.length > 0) {
                //     // Append each file with the same field name (standard for multiple files)
                //     for (let i = 0; i < elem.files.length; i++) {
                //         const file = elem.files[i];
                //         if (file && file.name) {
                //             currentFormData.append(name, file);
                //         }
                //     }
                // }

                continue; // Skip adding this field to allData since it's handled via FormData
            }

            // ✅ Apply transformations for normal fields
            if (type === 'checkbox' && !YES_NO_FIELD_EXCEPTIONS.has(name)) {
                const { yesId, noId } = resolveYesNoIdsFromRadioMap(RadioMap);
                allData[name] = finalValue === true || finalValue === "true" ? yesId : noId;
            } else if ((finalValue === "true" || finalValue === true) && !YES_NO_FIELD_EXCEPTIONS.has(name)) {
                allData[name] = toYesNoEnumId(true, RadioMap);
            } else if ((finalValue === "false" || finalValue === false) && !YES_NO_FIELD_EXCEPTIONS.has(name)) {
                allData[name] = toYesNoEnumId(false, RadioMap);
            } else if (finalValue === "null" && name !== "pastSmoking") {
                allData[name] = null;
                // pass the fucking data
            } else if (isNumber(finalValue) && name !== "socialSecurityNumber" && name !== "phone2" && name !== "phone3" && name !== "postalCode") {
                allData[name] = parseInt(finalValue, 10);
            } else {
                allData[name] = finalValue;
            }
        }

        // convert date to number & check userId
        if (step == 1) {
            let theDate = formatAndValidateJalali(allData["birthYear"], allData["birthMonth"], allData["birthDay"])
            delete allData["birthYear"]
            delete allData["birthMonth"]
            delete allData["birthDay"]
            allData["birthDate"] = theDate
            if (localStorage.getItem("operatorUserId") != null) {
                allData["userID"] = parseInt(localStorage.getItem("operatorUserId"))
            }
        }

        // Add attentionCorrect field for step 3 if a catch question was answered correctly
        if (step == 3) {
            allData["attentionCorrect"] = step3AttentionCorrect;
        }
        // if (isCancer && step == 4) {
        //     let dels = ["cancerType", "cancerAge"]
        //     let assign = "cancers"
        //     allData = CancerAdder(allData, selfCancers, dels, assign)

        // }


        // ✅ Append text fields to currentFormData
        if (step == 3 || step == 7) {
            Object.entries(allData).forEach(([key, value]) => {
                if (value !== null){
                    currentFormData.append(key, value);
                }
            });
            sendData = currentFormData
        } else {
            sendData = JSON.stringify(allData)
        }


        // ✅ Set URL and method logic
        const urlBase = `${APIURL}/form`;
        let url, method, headers;
        if (step === 1) {
            if (presetform != null && isValidStoredFormId(id_form)) {
                url = `${urlBase}/${id_form}/${APIARR[step - 1]}`;
                method = 'PUT';
                headers = {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token_auth}`
                }
            } else {
                if (localStorage.getItem("userNeededAdress").length != 0 && localStorage.getItem("userNeededAdress") != "null") {
                    url = `${APIURL}/${localStorage.getItem("userNeededAdress")}`
                } else {
                    url = `${urlBase}/${APIARR[step - 1]}`;
                }
                method = 'POST';
                headers = {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token_auth}`
                }
            }
        } else if (step == 4 || step == 5) {
            const editFormId = resolveFormIdForSubmit(presetform, id_form, createdFormId);
            url = `${urlBase}/${editFormId}/${APIARR[step - 1]}`;
            method = 'POST';
            headers = {
                // "Content-Type": "application/json",
                'Authorization': `Bearer ${token_auth}`
            }
            sendData = null  // ✅ No body for steps 4/5
        } else {
            const formIdForPut = resolveFormIdForSubmit(presetform, id_form, createdFormId);
            url = `${urlBase}/${formIdForPut}/${APIARR[step - 1]}`;
            method = 'PUT';
            headers = {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token_auth}`
            }
            if (step == 3 || step == 7) {
                headers = {
                    'Authorization': `Bearer ${token_auth}`, // ⚠️ No Content-Type
                }
            }
        }

        try {
            const res = await fetch(url, {
                method,
                headers,
                // headers: {
                //     'Authorization': `Bearer ${token_auth}`, // ⚠️ No Content-Type
                // },
                ...(sendData !== null && { body: sendData }), // ✅ Only include body if not null
            });
            // Reset formData for this submission
            formDataRef.current = new FormData();
            const json = await res.json();
            setLoading(false)
            if (json.status == 200 || json.status == 201) {
                if (mergeSubmittedDataIntoFormCache(allData)) {
                    setFormDataRevision((n) => n + 1);
                }
                if (step === 7) {
                    try {
                        const token = localStorage.getItem("token");
                        const formId =
                            createdFormId ||
                            (id_form != null &&
                                id_form !== "" &&
                                id_form !== "null"
                                ? id_form
                                : null);
                        if (token && formId != null && formId !== "" && formId !== 0) {
                            await fetchDataPUT(`form/${formId}/status`, token, {});
                        }
                    } catch (statusErr) {
                        console.error("Form status update failed:", statusErr);
                        addToast({
                            title:
                                "فرم ذخیره شد اما به‌روزرسانی وضعیت با خطا مواجه شد. از لیست فرم‌ها پیگیری کنید.",
                            type: "warning",
                            duration: 5000,
                        });
                    }
                    addToast({
                        title: "فرم شما با موفقیت ارسال شد.",
                        type: "success",
                        duration: 4000,
                    });
                    setSubmissionSuccess(true);
                } else {
                    nexter();
                }
            } else if (step == 1 && json.status == 403) {
                addToast({
                    title: 'کد ملی وارد شده اشتباه می باشد.',
                    type: 'error',
                    duration: 4000
                })
            } else if (step == 1 && json.status == 500) {
                addToast({
                    title: 'کد ملی وارد شده با شماره تلفن مطابقت ندارد.',
                    type: 'error',
                    duration: 4000
                })
            } else if (step == 7 && JSON.parse(localStorage.getItem("postalVerified"))) {
                addToast({
                    title: 'کد پستی درست را استعلام گرفته و دوباره تلاش کنید.',
                    type: 'error',
                    duration: 4000
                })
            } else if (json.status == 422 && json.messages) {
                const hasPaintedFields = highlightServerValidationErrors(formRefs[`${step}`], json.messages);
                addToast({
                    title: hasPaintedFields ? 'لطفا فیلدهای مشخص شده را تکمیل کنید.' : 'لطفا تمامی سوال ها را پر کنید',
                    type: 'error',
                    duration: 4000
                })
            } else {
                addToast({
                    title: 'خطا در اتصال به سرور لطفا دوباره تلاش کنید.',
                    type: 'error',
                    duration: 4000
                })
            }
            if (step === 1 && json.data?.form?.id) {
                const newFormId = json.data.form.id;
                setCreatedFormId(newFormId);
                localStorage.setItem("form_id", String(newFormId));
            }
        } catch (e) {
            if (step == 4 || step == 5) {
                nexter()
            }
            console.error("Submission error:", e);
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };


    const selfCancerSender = async (nameOrRel, age, rawCancer, isALive, img) => {

        let token = localStorage.getItem("token");
        let cancerVal = 0;

        try {
            const res = await fetchDataGET(`enum/cancer-types`, token);
            const match = res.data.find(r => r.name === rawCancer);
            if (match) {
                cancerVal = match.id;
            }
        } catch (err) {
            console.warn(`Enum resolve failed: cancer-types`, err);
        }

        // Prepare payload
        const payload = {
            cancerType: cancerVal,
            cancerAge: age,
        };

        // Handle multiple images by adding them directly to the payload
        if (Array.isArray(img)) {
            // Add all image files to the payload under the same field name
            const validFiles = img.filter(file => file instanceof File);
            if (validFiles.length > 0) {
                payload.pictures = validFiles; // This will be handled by the updated fetchDataPOSTImg
            }
        } else if (img instanceof File) {
            // Single file case
            payload.pictures = img;
        } else if (img) {
            // Handle case where img is not a File object (e.g., URL)
            payload.pictures = img;
        }

        try {
            let new_item_id;
            const isCancerAdded = await fetchDataPOSTImg(
                `form/${createdFormId}/cancer`,
                token,
                payload
            );

            if (isCancerAdded.status === 200 || isCancerAdded.status === 201) {
                addToast({
                    title: Array.isArray(img) && img.length > 1
                        ? `${img.length} تصویر سرطان با موفقیت ذخیره شد.`
                        : 'سرطان شما با موفقیت ذخیره شد.',
                    type: 'success',
                    duration: 4000,
                });

                // Refresh the preData after successful submission
                const res = await fetchDataGETImg(`form/${id_form}/cancer`, token);
                setSelfCancersPreData(res);
            }
        } catch (error) {
            console.error("Image upload failed:", error);
        }
        return null;
    };

    const familycancerSender = async (nameOrRel, age, rawCancer, isALive, img, relativePersonalName = "") => {


        let token = localStorage.getItem("token");
        let cancerVal = 0;
        let firstVal;

        try {
            const res = await fetchDataGET(`enum/cancer-types`, token);
            const match = res.data.find(r => r.name === rawCancer);
            if (match) {
                cancerVal = match.id;
            }
        } catch (err) {
            console.warn(`Enum resolve failed: cancer-types`, err);
        }

        try {
            const res = await fetchDataGET(`enum/relatives`, token);
            const match = res.data.find(r => r.name === nameOrRel);
            if (match) {
                firstVal = match.id;
            } else {
                firstVal = 1
            }
        } catch (err) {
            console.warn(`Enum resolve failed: cancer-types`, err);
        }

        // Prepare payload
        const payload = {
            cancerType: cancerVal,
            cancerAge: age,
            relative: firstVal,
            lifeStatus: isALive,
        };

        const trimmedName =
            relativePersonalName != null
                ? String(relativePersonalName).trim()
                : "";
        if (trimmedName !== "") {
            payload.name = trimmedName;
        }

        // Handle multiple images by adding them directly to the payload
        if (Array.isArray(img)) {
            // Add all image files to the payload under the same field name
            const validFiles = img.filter(file => file instanceof File);
            if (validFiles.length > 0) {
                payload.pictures = validFiles; // This will be handled by the updated fetchDataPOSTImg
            }
        } else if (img instanceof File) {
            // Single file case
            payload.pictures = img;
        } else if (img) {
            // Handle case where img is not a File object (e.g., URL)
            payload.pictures = img;
        }

        try {
            const isCancerAdded = await fetchDataPOSTImg(
                `form/${createdFormId}/familycancer`,
                token,
                payload
            );

            if (isCancerAdded.status === 200 || isCancerAdded.status === 201) {
                addToast({
                    title: Array.isArray(img) && img.length > 1
                        ? `${img.length} تصویر سرطان خانوادگی با موفقیت ذخیره شد.`
                        : 'سرطان شما با موفقیت ذخیره شد.',
                    type: 'success',
                    duration: 4000,
                });

                // Refresh the preData after successful submission
                const res = await fetchDataGETImg(`form/${id_form}/familycancer`, token);
                setFamilyCancersPreData(res);
            }
        } catch (error) {
            console.error("Image upload failed:", error);
        }
        return null;
    }


    // const atba_checker = (val) => {
    //     setatba(val)
    // }
    // Function to validate catch question answers
    const validateCatchQuestion = (stepNum) => {
        if (!catchQuestions[stepNum]) return true; // No catch question for this step

        const catchQ = catchQuestions[stepNum];
        const userAnswer = catchAnswers[`catch_${catchQ.useName}`];

        if (catchQ.useName === "catchSum") {
            // Special handling for catchSum - compare with calculated sum
            const correctAnswer = catchAnswers[`catchSum_${stepNum}`];
            return userAnswer !== undefined && parseInt(userAnswer) === correctAnswer;
        } else {
            // For other questions, compare with the stored answer
            const correctAnswer = catchQ.ans;
            return userAnswer !== undefined && userAnswer === correctAnswer;
        }
    };

    const nexter = () => {
        // Update attentionCorrect for step 3 based on catch question answer
        if (step === 3 && catchQuestions[3]) {
            const isCorrect = validateCatchQuestion(3);
            setStep3AttentionCorrect(isCorrect ? 1 : 0);
        }

        if (step != 7) {
            setStep(s => s + 1)
        }
    }
    const prever = () => {
        if (step != 1) {
            setStep(s => s - 1)
        }
    }
    const smokeTypeQuestion = (ST) => {
        let the_chooseVal
        if (ST == "سیگار") {
            the_chooseVal = part7.text_cigarettesPerDay_current
        } else if (ST == "سیگار برگ") {
            the_chooseVal = part7.text_cigarPerDay_current
        } else if (ST == "پیپ") {
            the_chooseVal = part7.text_pipePerDay_current
        } else if (ST == "قلیان") {
            the_chooseVal = part7.text_hookahPerWeek_current
        } else if (ST == "چپق") {
            the_chooseVal = part7.text_chapoghPerDay_current
        } else if (ST == "سیگار الکترونیک و محصولات مشابه") {
            the_chooseVal = part7.text_eCigPerDay_current
        } else if (ST == "تریاک") {
            the_chooseVal = part7.text_smokedOpiumPerDay_current
        } else {
            the_chooseVal = null
        }
        return the_chooseVal
    }

    const smokeTypePastQuestion = (ST) => {
        let the_chooseVal
        if (ST == "سیگار") {
            the_chooseVal = part7.text_cigarettesPerDay_past
        } else if (ST == "سیگار برگ") {
            the_chooseVal = part7.text_cigarPerDay_past
        } else if (ST == "پیپ") {
            the_chooseVal = part7.text_pipePerDay_past
        } else if (ST == "قلیان") {
            the_chooseVal = part7.text_hookahPerWeek_past
        } else if (ST == "چپق") {
            the_chooseVal = part7.text_chapoghPerDay_past
        } else if (ST == "سیگار الکترونیک و محصولات مشابه") {
            the_chooseVal = part7.text_eCigPerDay_past
        } else if (ST == "تریاک") {
            the_chooseVal = part7.text_smokedOpiumPerDay_past
        } else {
            the_chooseVal = null
        }
        return the_chooseVal
    }
    const smokesNow = smokeTypeQuestion(smokeType)
    const smokesPast = smokeTypePastQuestion(smokeTypePast)

    // if (loading) {
    //     return <Loader></Loader>;
    // }

    // if (loading) {
    //     return <Loader></Loader>
    // }

    if (submissionSuccess) {
        return (
            <>
                <div className="question_container form-submission-success">
                    <div className="submission-success-panel">
                        <h2 className="form_success_title">ثبت با موفقیت انجام شد</h2>
                        <p className="form_success_message">
                            اطلاعات شما با موفقیت ثبت شد. می‌توانید به لیست فرم‌ها برگردید.
                        </p>
                        <button
                            type="button"
                            className="btn_question"
                            onClick={() => navigate("/forms")}
                        >
                            لیست فرم های شما
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="question_container">
                {/* <div className="desktop_helper">
                    <h2 className="question_title">سامانه ریسک سنجی آنلاین</h2>
                    <div className="progress_text">بخش {step}/7</div>
                    <div className="progress_bar_container">
                        <div
                            className="progress_bar_fill"
                            style={{ width: `${(step / 7) * 100}%` }}
                        ></div>
                    </div>
                </div> */}

                {/* Help bar with three parts - visible on mobile */}
                <div
                    className="help_bar_container"
                    style={{ "--progress": `${(step / 7) * 100}%` }}
                >
                    <div className="help_bar_parts_container">
                        <div className="help_bar_part1" onClick={() => !isSubmitting && prever()}>
                            <img src={prevSign} alt="arrow_img" />
                            <span>قبلی</span>
                        </div>
                        <div className="help_bar_part2">فرم ریسک سنجی</div>
                        <div className="help_bar_part3" onClick={() => !isSubmitting && setOpenModalConf(true)}>
                            <img src={homeSign} alt="home" />
                        </div>
                    </div>
                </div>

                <div className="question_form_container" ref={questionContainerRef} aria-busy={isSubmitting}>
                    {isSubmitting && (
                        <div className="form_submit_overlay" role="status" aria-live="polite">
                            <div className="form_submit_spinner" aria-hidden="true"></div>
                            <div className="form_submit_text">در حال ارسال...</div>
                        </div>
                    )}
                    {/* form part 1*/}

                    <form ref={formRefs[1]} style={step == 1 ? null : { display: "none " }} className="question_form P1">
                        <div className="form_title">
                            <span>اطلاعات شخصی</span>
                            <span> - </span>
                            <span>بخش {`${step}/7`}</span>
                        </div>
                        <RadioV2 data_req={"true"} data={part1[0]} Enum={"genders"} valueSetter={setGender}></RadioV2>
                        <OptionsV2 data_req={"true"} data={part1[1]} relation={true}></OptionsV2>
                        <OptionsV2 data_req={"true"} data={part1[2]} relation={true}></OptionsV2>
                        <OptionsV2 data_req={"true"} data={part1[3]} relation={true}></OptionsV2>
                        <CheckBox data={part1[4]} atba={atba} checker={setatba}></CheckBox>
                        {atba && <InputBoxV2 data_req={"true"} data={part1[5]} limit={10}></InputBoxV2>}
                        {!atba && <InputBoxV2 data_req={"true"} data={part1[6]} limit={10}></InputBoxV2>}
                        <InputBoxV2 data_req={"true"} data={part1[7]}></InputBoxV2>
                        <InputBoxV2 data_req={"true"} data={part1[8]}></InputBoxV2>
                    </form>
                    {/* form part 2 */}
                    <form ref={formRefs[2]} style={step == 2 ? null : { display: "none " }} className="question_form P2">
                        <div className="form_title">
                            <span>{part2.title}</span>
                            <span> - </span>
                            <span>بخش {`${step}/7`}</span>
                        </div>
                        <RadioV2 data_req={"true"} data={part2.radio_opts_alcohol} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsAlchol}></RadioV2>
                        <OptionsV2 data={part2.combine_option_amountAlcohol} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isAlchol)}></OptionsV2>

                        {/* Inject catch question randomly in step 2 if applicable */}
                        {/* {step === 2 && catchQuestions[2] && (
                            catchQuestions[2].input_type === "radio_input" ?
                                <RadioV2 data_req={"true"} data={catchQuestions[2]} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2> :
                                <InputBox data_req={"true"} data={catchQuestions[2]} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={(val) => {
                                    setCatchAnswers(prev => ({
                                        ...prev,
                                        [`catch_${catchQuestions[2].useName}`]: val
                                    }));
                                }}></InputBox>
                        )} */}

                        <OptionsV2 data_req={"true"} data={part2.combine_option_lastMonthSabzijatMeal} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsSabzi} preSet={presetform} ></OptionsV2>
                        <OptionsV2 data={part2.combine_option_lastMonthSabzijatWeight} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={null} relation={relator_S(isSabzi)}></OptionsV2>

                        <OptionsV2 data_req={"true"} data={part2.combine_option_mediumActivityMonthInYear} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsActivity}></OptionsV2>
                        {/* Backend requires mediumActivityHourInWeek even when months = 0; hiding this select left it at "انتخاب کنید" and it was omitted from the payload. */}
                        <OptionsV2 data_req={"true"} data={part2.combine_option_mediumActivityHourInWeek} class_change1={"P2"} class_change2={"P2_inner"} relation={true}></OptionsV2>

                        <OptionsV2 data_req={"true"} data={part2.combine_option_hardActivityMonthInYear} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsHardActivity}></OptionsV2>
                        <OptionsV2 data_req={"true"} data={part2.combine_option_hardActivityHourInWeek} class_change1={"P2"} class_change2={"P2_inner"} relation={true}></OptionsV2>

                        <RadioV2 data_req={"true"} data={part2.radio_opts_smoking100} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsSmoke}></RadioV2>
                        {/* {isSmoke == 'بله' && ( */}
                        <>
                            <OptionsV2 data_req={"true"} data={part2.combine_option_smokingAge} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsSmokeAge} relation={relator_R(isSmoke)}></OptionsV2>
                            {/* {isSmokeAge != "انتخاب کنید" && isSmokeAge != "" && isSmokeAge != "هیچوقت به طور منظم سیگار یا قلیان نکشیده ام" && ( */}
                            <>
                                <RadioV2 data_req={"true"} data={part2.radio_opts_smokingNow} class_change1={"P2"} mapper={RadioMap} class_change2={"P2_inner"} valueSetter={setIsSmokingNow} relation={relator_R(isSmoke)}></RadioV2>
                                {/* {isSmokingNow == 'بله' && ( */}
                                <>
                                    {/* <InputBox data_req={"false"} data={part2.text_yearSmoke} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow)}></InputBox> */}
                                    <RangeBox data_req={"false"} data={part2.range_yearSmoke} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow) == true} preData={presetform && presetform[part2.range_yearSmoke.engName] ? presetform[part2.range_yearSmoke.engName] : null}></RangeBox>
                                    <OptionsV2 data_req={"true"} data={part2.combine_option_countSmokingDaily} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow) == true && relator_S(isSmokeAge)}></OptionsV2>
                                    <OptionsV2 data_req={"true"} data={part2.combine_option_t_gh_daily} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow) == true && relator_S(isSmokeAge)}></OptionsV2>
                                </>
                                {/* )} */}
                                {/* {isSmokingNow == 'خیر' && ( */}
                                <>
                                    <OptionsV2 data_req={"true"} data={part2.combine_option_leaveSmokingAge} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow) == false && relator_R(isSmoke)}></OptionsV2>
                                    <OptionsV2 data_req={"true"} data={part2.combine_option_countSmokingDaily_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow) == false && relator_R(isSmoke) && relator_S(isSmokeAge)}></OptionsV2>
                                    <OptionsV2 data_req={"true"} data={part2.combine_option_t_gh_daily_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow) == false && relator_R(isSmoke) && relator_S(isSmokeAge)}></OptionsV2>
                                </>
                                {/* )} */}
                            </>
                            {/* )} */}
                        </>
                        {/* )} */}

                    </form>
                    {/* form part 3 */}

                    <form ref={formRefs[3]} style={step == 3 ? null : { display: "none " }} className="question_form P2">
                        <div className="form_title">
                            <span>{part3.title}</span>
                            <span> - </span>
                            <span>بخش {`${step}/7`}</span>
                        </div>

                        <OptionsV2 data_req={"true"} data={part3.combine_option_ghaedeAge} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_gen(gender)}></OptionsV2>

                        <RadioV2 data_req={"true"} data={part3.radio_opts_children} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsChild}></RadioV2>
                        <OptionsV2 data={part3.combine_option_firstChildBirthAge} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_gen(gender) && relator_R(isChild)}></OptionsV2>
                        {/* <InputBox data_req={"false"} data={part3.text_sonCount} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isChild)}></InputBox> */}
                        {/* <InputBox data_req={"false"} data={part3.text_doughterCount} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isChild)}></InputBox> */}
                        <RangeBox data_req={"false"} data={part3.range_sonCount} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isChild)} preData={presetform && presetform[part3.range_sonCount.engName] ? presetform[part3.range_sonCount.engName] : null}></RangeBox>
                        <RangeBox data_req={"false"} data={part3.range_doughterCount} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isChild)} preData={presetform && presetform[part3.range_doughterCount.engName] ? presetform[part3.range_doughterCount.engName] : null}></RangeBox>
                        <>
                            <RadioV2 data_req={"true"} data={part3.radio_opts_menopausal_status} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsAdat} Enum={"menopausal-statuses"} relation={relator_gen(gender)}></RadioV2>
                            {/* <RadioV2 data_req={"true"} data={part3.radio_opts_menopausal_status} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsAdat} relation={relator_gen(gender)}></RadioV2> */}
                            <OptionsV2 data={part3.combine_option_menopause} class_change1={"P2"} class_change2={"P2_inner"} relation={relatorMenopause(isAdat) && relator_gen(gender)}></OptionsV2>
                        </>

                        {/* Inject catch question randomly in step 3 if applicable */}
                        {/* {step === 3 && catchQuestions[3] && (
                            catchQuestions[3].input_type === "radio_input" ?
                                <RadioV2 data_req={"true"} data={catchQuestions[3]} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={(val) => {
                                    // In step 3, if the catch question is answered correctly, set attentionCorrect = 1
                                    const isCorrect = catchAnswers[catchQuestions[3].useName] === val;
                                    if (isCorrect) {
                                        setStep3AttentionCorrect(1);
                                    } else {
                                        setStep3AttentionCorrect(0);
                                    }
                                }}></RadioV2> :
                                <InputBox data_req={"true"} data={catchQuestions[3]} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={(val) => {
                                    // Check if it's catchSum question type
                                    if (catchQuestions[3].useName === "catchSum") {
                                        const correctAnswer = catchAnswers[`catchSum_${step}`];
                                        if (parseInt(val) === correctAnswer) {
                                            setStep3AttentionCorrect(1);
                                        } else {
                                            setStep3AttentionCorrect(0);
                                        }
                                    } else {
                                        // For other input types
                                        const isCorrect = catchAnswers[catchQuestions[3].useName] === val;
                                        if (isCorrect) {
                                            setStep3AttentionCorrect(1);
                                        } else {
                                            setStep3AttentionCorrect(0);
                                        }
                                    }
                                    setCatchAnswers(prev => ({
                                        ...prev,
                                        [`catch_${catchQuestions[3].useName}`]: val
                                    }));
                                }}></InputBox>
                        )} */}

                        <>
                            <RadioV2 data_req={"true"} data={part3.radio_opts_hrt} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsHRT} relation={relatorMenopause(isAdat) && relator_gen(gender)}></RadioV2>
                            <OptionsV2 data={part3.combine_option_hrt_use_length} class_change1={"P2"} class_change2={"P2_inner"} relation={relatorMenopause(isAdat) && relator_R(isHRT) && relator_gen(gender)}></OptionsV2>

                            <RadioV2 data_req={"true"} data={part3.radio_opts_lastFiveYears_HRT_use} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsHRT5} relation={relatorMenopause(isAdat) && relator_gen(gender) && relator_R(isHRT)}></RadioV2>

                            <RadioV2 data_req={"true"} data={part3.radio_opts_HRT_current_use} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isHRT5) && relator_gen(gender)}></RadioV2>
                            <OptionsV2 data_req={"true"} data={part3.combine_option_intended_HRT_use} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isHRT5) && relator_gen(gender)}></OptionsV2>
                            <RadioV2 data_req={"true"} data={part3.radio_opts_hrt_Type} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isHRT5) && relator_gen(gender)}></RadioV2>

                            <RadioV2 data_req={"true"} data={part3.radio_opts_oral} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsOral} relation={relator_gen(gender)}></RadioV2>
                            <RadioV2 data_req={"true"} data={part3.radio_opts_oral2LastYears} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isOral) && relator_gen(gender)}></RadioV2>
                            <OptionsV2 data={part3.combine_option_oralDuration} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isOral) && relator_gen(gender)}></OptionsV2>


                            <RadioV2 data_req={"true"} data={part3.radio_opts_mamoGraphy} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsMamoTest} relation={relator_gen(gender)}></RadioV2>
                            <FileUploader data={part3.attach_mamoGraphy} presetUrls={presetform?.[part3.attach_mamoGraphy.name]} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isMamoTest) && relator_gen(gender)} fillingFormData={fillingFormData} removeLastFileFromFormData={removeLastFileFromFormData}></FileUploader>

                            <RadioV2 data_req={"true"} data={part3.radio_opts_falop} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_gen(gender)}></RadioV2>
                            <RadioV2 data_req={"true"} data={part3.radio_opts_andometrioz} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_gen(gender)}></RadioV2>
                            {/* <Radio data_req={"true"} data={part3.radio_opts_leavePestan} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_gen(gender)}></Radio>
                            <Radio data_req={"true"} data={part3.radio_opts_leaveTokhmdan} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_gen(gender)}></Radio> */}
                            <CheckBox data={part3.check_opts_operations} class_change1={"P2"} class_change2={"P2_inner"} multicheck={true} relation={relator_gen(gender)}></CheckBox>


                        </>
                        <RadioV2 data_req={"true"} data={part3.radio_opts_laDe_colon} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsColon}></RadioV2>
                        <RadioV2 data={part3.radio_opts_laDe_pol} class_change1={"P2"} mapper={RadioMap} class_change2={"P2_inner"} relation={relator_R(isColon)}></RadioV2>

                        <RadioV2 data_req={"true"} data={part3.radio_opts_asp_la_mo} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2>
                        <RadioV2 data_req={"true"} data={part3.radio_opts_nsaiD_la_mo} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2>
                        <RadioV2 data_req={"true"} data={part3.radio_opts_lastFiveYearBloodTestInStool} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2>
                    </form>
                    {/* form part 4 */}

                    <form ref={formRefs[4]} style={step == 4 ? null : { display: "none " }} className="question_form P2">
                        <div className="form_title">
                            <span>{part4.title}</span>
                            <span> - </span>
                            <span>بخش {`${step}/7`}</span>
                        </div>

                        <RadioV2 data_req={"true"} class_change1={"P2"} mapper={RadioMap} class_change2={"P2_inner"} data={part4.radio_opts_cancer} valueSetter={setIsCancer}></RadioV2>
                        <CancerField data_req={selfCancersPreData != null ? "false" : "true"} file_up={"not_the_target"} data_Inp1={null} data_Options={part4.cancerCard.cancerType} data_Radio={null} data_Inp2={part4.cancerCard.cancerAge} data_file={part4.cancerCard.attachment} relation={relatorAnswerYes(isCancer)} Enum={"cancer-types"} canArrFunc={null} canArr={null} refreshFunc={selfFunc} senderFunc={selfCancerSender} preData={selfCancersPreData}></CancerField>
                    </form>
                    {/* form part 5 */}

                    <form ref={formRefs[5]} style={step == 5 ? null : { display: "none " }} className="question_form P2">
                        <div className="form_title">
                            <span>{part5.title}</span>
                            <span> - </span>
                            <span>بخش {`${step}/7`}</span>
                        </div>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_childCancer} mapper={RadioMap} class_change1={"P2 color_change"} class_change2={"P2_inner"} valueSetter={setIsChildCncer} relation={relator_R(isChild)}></RadioV2>
                        <CancerField data_req={"true"} file_up={"target"} data_Inp1={part5.childCard.childType} data_InpName={part5.childCard.childName} data_Inp2={part5.childCard.childCancerAge} data_Options={part5.childCard.childCancerType} data_Radio={part5.childCard.childLifeStatus} data_file={part5.childCard.attachment} relation={relatorAnswerYes(isChildCancer)} Enum={"cancer-types"} senderFunc={familycancerSender} refreshFunc={familyFunc} preData={familyCancersPreData} famrel={["فرزند پسر", "فرزند دختر"]}></CancerField>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_motherCancer} mapper={RadioMap} class_change1={"P2 color_change"} class_change2={"P2_inner"} valueSetter={setIsMotherCncer}></RadioV2>
                        <CancerField data_req={"true"} data_Inp1={part5.motherCard.motherName} data_Inp2={part5.motherCard.motherCancerAge} data_Options={part5.motherCard.motherCancerType} data_Radio={part5.motherCard.motherLifeStatus} data_file={part5.motherCard.attachment} relation={relatorAnswerYes(isMotherCancer)} Enum={"cancer-types"} senderFunc={familycancerSender} refreshFunc={familyFunc} preData={familyCancersPreData} famrel={"مادر"}></CancerField>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_fatherCancer} mapper={RadioMap} class_change1={"P2 color_change"} class_change2={"P2_inner"} valueSetter={setIsFatherCncer}></RadioV2>
                        <CancerField data_req={"true"} data_Inp1={part5.fatherCard.fatherName} data_Inp2={part5.fatherCard.fatherCancerAge} data_Options={part5.fatherCard.fatherCancerType} data_Radio={part5.fatherCard.fatherLifeStatus} data_file={part5.fatherCard.attachment} relation={relatorAnswerYes(isFatherCancer)} Enum={"cancer-types"} senderFunc={familycancerSender} refreshFunc={familyFunc} preData={familyCancersPreData} famrel={"پدر"}></CancerField>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_bsCancer} mapper={RadioMap} class_change1={"P2 color_change"} class_change2={"P2_inner"} valueSetter={setIsSibsCncer}></RadioV2>
                        <CancerField data_req={"true"} data_Inp1={part5.siblingCard.siblingType} data_InpName={part5.siblingCard.siblingName} data_Inp2={part5.siblingCard.siblingCancerAge} data_Options={part5.siblingCard.siblingCancerType} data_Radio={part5.siblingCard.siblingLifeStatus} data_file={part5.siblingCard.attachment} relation={relatorAnswerYes(isSibsCancer)} Enum={"cancer-types"} senderFunc={familycancerSender} refreshFunc={familyFunc} preData={familyCancersPreData} famrel={["خواهر ناتنی", "برادر ناتنی", "برادر", "خواهر"]}></CancerField>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_ameAmoCancer} mapper={RadioMap} class_change1={"P2 color_change"} class_change2={"P2_inner"} valueSetter={setIsUncAuntCncer}></RadioV2>
                        <CancerField data_req={"true"} data_Inp1={part5.uncleAuntCard.uncleAuntType} data_InpName={part5.uncleAuntCard.uncleAuntName} data_Inp2={part5.uncleAuntCard.uncleAuntCancerAge} data_Options={part5.uncleAuntCard.uncleAuntCancerType} data_Radio={part5.uncleAuntCard.uncleAuntLifeStatus} data_file={part5.uncleAuntCard.attachment} relation={relatorAnswerYes(isUncAuntCancer)} Enum={"cancer-types"} senderFunc={familycancerSender} refreshFunc={familyFunc} preData={familyCancersPreData} famrel={["عمه", "عمو"]}></CancerField>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_khaleDaeiCancer} mapper={RadioMap} class_change1={"P2 color_change"} class_change2={"P2_inner"} valueSetter={setIsUncAunt2Cncer}></RadioV2>
                        <CancerField data_req={"true"} data_Inp1={part5.khaleDaeiCard.khaleDaeiType} data_InpName={part5.khaleDaeiCard.khaleDaeiName} data_Inp2={part5.khaleDaeiCard.khaleDaeiCancerAge} data_Options={part5.khaleDaeiCard.khaleDaeiCancerType} data_Radio={part5.khaleDaeiCard.khaleDaeiLifeStatus} data_file={part5.khaleDaeiCard.attachment} relation={relatorAnswerYes(isUncAunt2Cancer)} Enum={"cancer-types"} senderFunc={familycancerSender} refreshFunc={familyFunc} preData={familyCancersPreData} famrel={["خاله", "دایی"]}></CancerField>
                    </form>
                    {/* form part 6 */}
                    <form ref={formRefs[6]} id="form6" style={step == 6 ? null : { display: "none" }} className="question_form P2">
                        <div className="form_title">
                            <span>{part6.title}</span>
                            <span> - </span>
                            <span>بخش {`${step}/7`}</span>
                        </div>
                        <OptionsV2 data_req={"true"} data={part7.combine_option_insurance} class_change1={"P2"} class_change2={"P2_inner"}></OptionsV2>
                        <RadioV2 data_req={"true"} data={part7.radio_takmili_bime} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2>
                        {/* <RadioV2 data_req={"true"} data={part7.radio_chronicLungDisease} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsChronic}></RadioV2> */}
                        <OptionsV2 data_req={"true"} data={part7.combine_option_chronicLungDisease} class_change1={"P2"} class_change2={"P2_inner"}></OptionsV2>

                        {/* Inject catch question randomly in step 6 if applicable */}
                        {/* {step === 6 && catchQuestions[6] && (
                            catchQuestions[6].input_type === "radio_input" ?
                            <RadioV2 data_req={"true"} data={catchQuestions[6]} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2> :
                            <InputBox data_req={"true"} data={catchQuestions[6]} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={(val) => {
                                setCatchAnswers(prev => ({
                                    ...prev,
                                    [`catch_${catchQuestions[6].useName}`]: val
                                }));
                            }}></InputBox>
                        )} */}

                        {/* <RadioV2 data_req={"true"} data={part7.radio_lungCancerHistory} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2> */}
                        <RadioV2 data_req={"true"} data={part7.radio_lungCancerFamily} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setFirstDeg}></RadioV2>
                        <OptionsV2 data_req={"true"} data={part7.combine_option_lungCancerFamilyRelation} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(firstDeg)}></OptionsV2>

                        {/* <InputBoxV2 data_req={"false"} data={part7.Fam_lung_desc} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(firstDeg)}></InputBoxV2> */}

                        <RadioV2 data_req={"true"} data={part7.radio_bronshit} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2>
                        <RadioV2 data_req={"true"} data={part7.radio_fibroz} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} ></RadioV2>
                        <RadioV2 data_req={"true"} data={part7.radio_lungill} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} ></RadioV2>

                        <OptionsV2 data_req={"true"} data={part7.combine_option_occupationalExposure} class_change1={"P2"} class_change2={"P2_inner"}></OptionsV2>
                        {/* <Radio data={part7.radio_currentSmoking} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setAnySmoke}></Radio> */}
                        {/* <OptionsV2 data_req={"true"} data={part7.combine_option_smokingTypes_current} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setSmokeType} relation={relator_R(anySmoke)}></OptionsV2> */}
                        {/* {smokeType != null && smokeType != "انتخاب کنید" && ( */}
                        {/* <InputBox data={part7.text_using_now} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(anySmoke)}></InputBox> */}
                        {/* )} */}
                        {/* {smokeType != null && smokeType == "تریاک" && ( */}
                        {/* <InputBox data={part7.text_chewedOpiumPerDay_past} class_change1={"P2"} class_change2={"P2_inner"}></InputBox> */}
                        {/* )} */}
                        <RadioV2 data_req={"true"} data={part7.radio_pastSmoking} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setAnySmokePast}></RadioV2>
                        {/* <InputBox data_req={"false"} data={part7.text_smokingStartAge_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(anySmokePast)}></InputBox> */}
                        <RangeBox data_req={"false"} data={part7.text_leaveSmoke} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(anySmokePast)} preData={presetform && presetform[part7.text_leaveSmoke.engName] ? presetform[part7.text_leaveSmoke.engName] : null}></RangeBox>
                        <OptionsV2 data={part7.combine_option_smokingTypes_past} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setSmokeTypePast} relation={relator_R(anySmokePast)}></OptionsV2>
                        {/* <CheckBox data={part7.check_smokeTypeCurrent} class_change1={"P2"} class_change2={"P2_inner"} multicheck={true} checkArray={multiSmokeTypeCurrent} relation={relator_R(anySmoke)}></CheckBox> */}


                        {/* {smokeTypePast != null && smokeTypePast != "انتخاب کنید" && ( */}
                        <RangeBox data_req={"false"} data={part7.text_using_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(anySmokePast)} preData={presetform && presetform[part7.text_using_past.engName] ? presetform[part7.text_using_past.engName] : null}></RangeBox>

                        {/* )} */}
                        {/* {smokeType != null && smokeTypePast == "تریاک" && ( */}
                        {/* <InputBox data_req={"true"} data={part7.text_chewedOpiumPerDay_past} class_change1={"P2"} class_change2={"P2_inner"}></InputBox> */}
                        {/* )} */}
                    </form>
                    {/* form part 7 */}
                    <form ref={formRefs[7]} id="form7" style={step == 7 ? null : { display: "none" }} action="" className="question_form P2">
                        <div className="form_title">
                            <span>{part7.title}</span>
                            <span> - </span>
                            <span>بخش {`${step}/7`}</span>
                        </div>
                        {[
                            part6.range_bro_count,
                            part6.range_sis_count,
                            part6.range_ame_count,
                            part6.range_amo_count,
                            part6.range_khale_count,
                            part6.range_dai_count,
                        ].map((rangeData) => (
                            <RangeBox
                                key={rangeData.engName}
                                data_req={"true"}
                                data={rangeData}
                                class_change1={"P2"}
                                class_change2={"P2_inner"}
                                preData={presetform?.[rangeData.engName]}
                            />
                        ))}

                        <RadioV2 data_req={"true"} mapper={RadioMap} data={part6.radio_opts_testGen} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsGeneTest}></RadioV2>
                        <FileUploader data={part6.attachment_testGen} presetUrls={presetform?.[part6.attachment_testGen.name]} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isGeneTest)} fillingFormData={fillingFormData} removeLastFileFromFormData={removeLastFileFromFormData}></FileUploader>

                        <RadioV2 data_req={"true"} mapper={RadioMap} data={part6.radio_opts_fmTestGen} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsFamGeneTest}></RadioV2>
                        <FileUploader data={part6.attachment_fmTestGen} presetUrls={presetform?.[part6.attachment_fmTestGen.name]} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isFamGeneTest)} fillingFormData={fillingFormData} removeLastFileFromFormData={removeLastFileFromFormData}></FileUploader>

                        <OptionsV2 data_req={"true"} data={part6.options_education} class_change1={"P2"} class_change2={"P2_inner"}></OptionsV2>

                        <PersonalInfo data_req={"true"} data_inp1={part6.personalInfo.fullName} data_inp2={part6.personalInfo.mobileNumber1} data_inp3={part6.personalInfo.mobileNumber2} data_inp4={part6.personalInfo.province}
                            data_inp5={part6.personalInfo.city} data_inp6={part6.personalInfo.postalCode} data_opt={part6.personalInfo.birthCountry} data_inp7={part6.personalInfo.address}
                            data_check={part6.personalInfo.confidentialityAgreement} typeErr={setTypeErr} typeErr2={setTypeErr2} typeErr3={setTypeErr3}
                            addressPreset={presetform ? {
                                province: presetform.province,
                                city: presetform.city,
                                address: presetform.address,
                                postalCode: presetform.postalCode,
                            } : undefined}
                        ></PersonalInfo>

                    </form>

                </div>
                {/* <div className="btn_holder_next_prev">
                    <button className="btn_question" onClick={prever}>قبلی</button>

                    {step == 7 ? (
                        <button className="btn_question" onClick={(e) => {

                            let passOno = checkReq(formRefs[step], step)
                            if (!typeErr && !typeErr2 && !typeErr3 && passOno) {
                                handleSubmit(e)
                                addToast({
                                    title: 'پاسخ های شما با موفقیت ذخیره شد',
                                    type: 'success',
                                    duration: 4000
                                })
                                navigate("/forms")
                            } else {
                                addToast({
                                    title: 'لطفا فیلد ها را به درستی پر کنید',
                                    type: 'error',
                                    duration: 4000
                                })
                            }


                        }}>ارسال</button>
                    ) : (
                        <button className="btn_question" onClick={(e) => {
                            // Update attentionCorrect for step 3 before submission if there's a catch question
                            if (step === 3 && catchQuestions[3]) {
                                const isCorrect = validateCatchQuestion(3);
                                setStep3AttentionCorrect(isCorrect ? 1 : 0);
                            }
                            let reqpass = checkReq(formRefs[step], step)
                            if (reqpass) {
                                handleSubmit(e)
                            }
                        }}>بعدی</button>
                    )}
                </div> */}
                {/* Bottom helper bar with 2 parts - visible on mobile */}
                <div className="bottom_helper_container">
                    <div className="bottom_helper_parts_container">
                        {/* <div className="bottom_helper_part1"></div> */}
                        <div className="bottom_helper_part2">                    {step == 7 ? (
                            <button className="btn_question" disabled={isSubmitting} onClick={async (e) => {
                                let passOno = checkReq(formRefs[step], step)
                                if (!typeErr && !typeErr2 && !typeErr3 && passOno) {
                                    await handleSubmit(e)
                                } else {
                                    addToast({
                                        title: 'لطفا فیلد ها را به درستی پر کنید',
                                        type: 'error',
                                        duration: 4000
                                    })
                                }

                            }}>ارسال</button>
                        ) : (
                            <button className="btn_question" disabled={isSubmitting} onClick={(e) => {
                                // Update attentionCorrect for step 3 before submission if there's a catch question

                                if (step === 3 && catchQuestions[3]) {
                                    const isCorrect = validateCatchQuestion(3);
                                    setStep3AttentionCorrect(isCorrect ? 1 : 0);
                                }
                                let reqpass = checkReq(formRefs[step], step)
                                if (reqpass) {
                                    addToast({
                                        title: 'در حال ارسال داده .',
                                        type: 'loading',
                                        duration: 2000
                                    })
                                    handleSubmit(e)
                                }
                            }}>بعدی</button>
                        )}</div>
                    </div>
                </div>
                {/* <button className="support_call ">تماس با پشتیبانی</button> */}
                <button className="questionExit" style={{ display: "none" }} onClick={() => setOpenModalConf(true)}>
                    خروج
                </button>
                {openModalConf && (
                    <div className="role_modal QPage">
                        <div className="modal_header">
                            <div className="modalTxt">
                                <h3>آیا می خواهید از فرم خارج شوید ؟ </h3>
                                <p>پاسخ های شما پس از خروج ذخیره خواهد شد</p>
                            </div>
                            <div className="modal_close" onClick={() => {
                                setOpenModalConf(false)
                            }}>
                                <span>
                                    ✕
                                </span>
                            </div>
                        </div>
                        <div className="roles Modal">
                            <button className="btn-add-new" onClick={() => {
                                navigate("/forms")
                                setOpenModalConf(false)
                            }}>بلی</button>
                            <button className="delete_btn2" onClick={() => setOpenModalConf(false)}>خیر</button>
                        </div>
                    </div>
                )}
            </div >
        </>
    )
}
export default Questions