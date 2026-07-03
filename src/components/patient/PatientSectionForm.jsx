import {
    formatValueForDisplay,
    formatValueForEdit,
    getFieldLabel,
    getOptionLabel,
    getSelectOptions,
    isFieldVisibleForGender,
    PLACEHOLDER_OPTIONS,
    READONLY_META_FIELDS,
    resolveFieldInputType,
} from "../../utils/patientFieldConfig";

export default function PatientSectionForm({
    apiPart,
    sectionData,
    gender,
    radioMap,
    editing,
    editedValues,
    onFieldChange,
}) {
    if (!sectionData || sectionData.error) {
        return (
            <p className="patient_section_error">
                {sectionData?.error ? `خطا در بارگذاری: ${sectionData.error}` : "اطلاعاتی موجود نیست"}
            </p>
        );
    }

    const entries = Object.entries(sectionData).filter(([key]) => {
        return !READONLY_META_FIELDS.has(key) && isFieldVisibleForGender(key, gender);
    });

    if (entries.length === 0) {
        return <p className="patient_no_data">اطلاعاتی موجود نیست</p>;
    }

    return (
        <div className="patient_fields_grid">
            {entries.map(([key, value]) => {
                if (key === "cancers" || key === "familyCancers") {
                    return null;
                }

                const label = getFieldLabel(key, gender);
                if (!label) {
                    return null;
                }

                const inputType = resolveFieldInputType(key, value);
                const displayValue = formatValueForDisplay(key, value, radioMap);
                const editValue = editedValues?.[key] ?? formatValueForEdit(key, value, radioMap);

                if (key === "formType") {
                    return (
                        <div key={key} className="patient_field_row">
                            <label className="patient_field_label">{label}</label>
                            <div className="patient_field_value">{value === 1 ? "بهار" : "نوید"}</div>
                        </div>
                    );
                }

                return (
                    <div key={key} className="patient_field_row">
                        <label className="patient_field_label" htmlFor={`field-${apiPart}-${key}`}>
                            {label}
                        </label>
                        <div className="patient_field_value">
                            {editing && inputType !== "images" ? (
                                <FieldEditor
                                    id={`field-${apiPart}-${key}`}
                                    fieldKey={key}
                                    inputType={inputType}
                                    value={editValue}
                                    radioMap={radioMap}
                                    onChange={(next) => onFieldChange(key, next)}
                                />
                            ) : inputType === "images" && Array.isArray(value) && value.length > 0 ? (
                                <div className="patient_image_links">
                                    {value.map((url, index) => (
                                        <a
                                            key={index}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="download-link"
                                        >
                                            دانلود تصویر {index + 1}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <span>{displayValue}</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function FieldEditor({ id, fieldKey, inputType, value, radioMap, onChange }) {
    if (inputType === "enum" || inputType === "select" || inputType === "boolean") {
        const baseOptions = getSelectOptions(fieldKey, radioMap) || ["بله", "خیر"];
        const options = [...baseOptions];
        if (
            value &&
            !options.some((opt) => getOptionLabel(opt) === value) &&
            !PLACEHOLDER_OPTIONS.has(String(value).trim())
        ) {
            options.unshift(value);
        }

        return (
            <select
                id={id}
                dir="rtl"
                className="patient_field_input patient_field_select"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">انتخاب کنید</option>
                {options.map((opt, index) => {
                    const label = getOptionLabel(opt);
                    return (
                        <option key={`${fieldKey}-${label}-${index}`} value={label}>
                            {label}
                        </option>
                    );
                })}
            </select>
        );
    }

    if (inputType === "number") {
        return (
            <input
                id={id}
                type="number"
                className="patient_field_input"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    return (
        <input
            id={id}
            type="text"
            className="patient_field_input"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}
