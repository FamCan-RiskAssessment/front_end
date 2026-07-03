import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import NavBar from "./navBar";
import Loader from "./utils/loader";
import PatientFormActions from "./components/patient/PatientFormActions";
import PatientSectionForm from "./components/patient/PatientSectionForm";
import PatientCancerSection from "./components/patient/PatientCancerSection";
import { usePatientEnums } from "./components/patient/usePatientEnums";
import { usePatientActions, savePatientSection } from "./components/patient/usePatientActions";
import {
    APIARR_TAB,
    APIARR_Navid,
    getFormStatusColor,
    isDetailFieldHidden,
    resolveFormStatusLabel,
    sortDetailFieldEntries,
} from "./utils/config";
import { fetchAdminFormRowById, fetchDataGET } from "./utils/tools";
import {
    PART_NAMES_BAHAR,
    PART_NAMES_NAVID,
    buildSectionPayload,
    formatValueForEdit,
    isFieldVisibleForGender,
    READONLY_META_FIELDS,
} from "./utils/patientFieldConfig";
import { useToast } from "./toaster";
import { canAccessDashboardRoute, DASHBOARD_ROUTES } from "./utils/permissions";
import "./client_forms.css";
import "./form_elements.css";
import "./patient_table.css";
import "./patient_detail.css";

const SELF_CANCER_PARTS = new Set(["cancer", "cancerVisit"]);
const FAMILY_CANCER_PARTS = new Set(["familycancer", "familycancerVisit"]);

function getApiArray(formType) {
    return formType === 1 ? APIARR_TAB : APIARR_Navid;
}

function getPartNames(formType) {
    return formType === 1 ? PART_NAMES_BAHAR : PART_NAMES_NAVID;
}

function resolvePatientName(basic, contact) {
    const candidates = [contact?.name, basic?.name, basic?.fullName, contact?.fullName];
    for (const candidate of candidates) {
        if (candidate && String(candidate).trim() && String(candidate).trim() !== "نامشخص") {
            return String(candidate).trim();
        }
    }
    return "";
}

function filterSectionData(apiPart, sectionData, gender) {
    if (!sectionData || sectionData.error) {
        return sectionData;
    }

    const filtered = {};
    sortDetailFieldEntries(
        apiPart,
        Object.entries(sectionData).filter(([key]) => {
            return (
                !READONLY_META_FIELDS.has(key) &&
                !isDetailFieldHidden(apiPart, key) &&
                isFieldVisibleForGender(key, gender)
            );
        })
    ).forEach(([key, value]) => {
        filtered[key] = value;
    });
    return filtered;
}

function isCancerListSection(apiPart) {
    return SELF_CANCER_PARTS.has(apiPart) || FAMILY_CANCER_PARTS.has(apiPart);
}

export default function PatientDetail() {
    const { formId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { radioMap, cancerTypesMap, relativeTypesMap, loading: enumsLoading } = usePatientEnums();

    const [loading, setLoading] = useState(true);
    const [formMeta, setFormMeta] = useState(null);
    const [formDetails, setFormDetails] = useState({});
    const [gender, setGender] = useState(1);
    const [editingSection, setEditingSection] = useState(null);
    const [editedSections, setEditedSections] = useState({});
    const [savingSection, setSavingSection] = useState(null);

    const handleStatusUpdated = useCallback((updatedFormId, newStatus) => {
        setFormMeta((prev) =>
            prev && prev.id === updatedFormId ? { ...prev, status: newStatus } : prev
        );
    }, []);

    const actionsInitialData = useMemo(
        () => (formMeta ? [formMeta] : []),
        [formMeta]
    );

    const { openModelInput, openStatusChange, modals } = usePatientActions(
        actionsInitialData,
        { cancerTypesMap, relativeTypesMap, onStatusUpdated: handleStatusUpdated }
    );

    useEffect(() => {
        if (!canAccessDashboardRoute(DASHBOARD_ROUTES.PATIENTS)) {
            navigate("/error_page", { state: { error_type: 403 } });
        }
    }, [navigate]);

    const loadForm = useCallback(async () => {
        const token = localStorage.getItem("token");
        setLoading(true);

        try {
            const [basicRes, listRow] = await Promise.all([
                fetchDataGET(`admin/form/${formId}/basic`, token),
                fetchAdminFormRowById(formId, token).catch(() => null),
            ]);
            const basic = basicRes.data;
            const formType = basic.formType || 1;
            const apiArray = getApiArray(formType);

            setGender(basic.gender || 1);

            const details = { basic };
            await Promise.all(
                apiArray
                    .filter((part) => part !== "basic")
                    .map(async (apiPart) => {
                        try {
                            const res = await fetchDataGET(`admin/form/${formId}/${apiPart}`, token);
                            details[apiPart] = res.data;
                        } catch (error) {
                            details[apiPart] = { error: error.message, incomplete: true };
                        }
                    })
            );

            const contact = details.contact || {};
            const urlStatus = searchParams.get("status");
            const urlName = searchParams.get("name");
            const urlOperatorId = searchParams.get("operatorId");

            const status =
                resolveFormStatusLabel(listRow?.status) ??
                resolveFormStatusLabel(basic?.status) ??
                resolveFormStatusLabel(basic?.statusLabel) ??
                resolveFormStatusLabel(urlStatus) ??
                "—";

            setFormMeta({
                id: Number(formId),
                name: resolvePatientName(basic, contact) || urlName || listRow?.name || "",
                operatorId:
                    listRow?.operatorId ??
                    basic.filledByOperatorID ??
                    basic.operatorId ??
                    (urlOperatorId ? Number(urlOperatorId) : undefined),
                status,
                formType,
            });

            setFormDetails(details);
        } catch (error) {
            console.error(error);
            addToast({
                title: "خطا در بارگذاری اطلاعات فرم",
                type: "error",
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    }, [addToast, formId, searchParams]);

    useEffect(() => {
        loadForm();
    }, [loadForm]);

    const apiArray = useMemo(() => {
        return formMeta ? getApiArray(formMeta.formType) : [];
    }, [formMeta]);

    const partNames = useMemo(() => {
        return formMeta ? getPartNames(formMeta.formType) : [];
    }, [formMeta]);

    const startSectionEdit = (apiPart) => {
        const sectionData = filterSectionData(apiPart, formDetails[apiPart], gender);
        const initial = {};
        Object.entries(sectionData || {}).forEach(([key, value]) => {
            initial[key] = formatValueForEdit(key, value, radioMap);
        });
        setEditedSections((prev) => ({ ...prev, [apiPart]: initial }));
        setEditingSection(apiPart);
    };

    const cancelSectionEdit = (apiPart) => {
        setEditingSection((current) => (current === apiPart ? null : current));
        setEditedSections((prev) => {
            const next = { ...prev };
            delete next[apiPart];
            return next;
        });
    };

    const handleFieldChange = (apiPart, key, value) => {
        setEditedSections((prev) => ({
            ...prev,
            [apiPart]: {
                ...(prev[apiPart] || {}),
                [key]: value,
            },
        }));
    };

    const saveSection = async (apiPart) => {
        setSavingSection(apiPart);
        try {
            const edited = editedSections[apiPart] || {};
            const original = formDetails[apiPart] || {};
            const changed = {};

            Object.entries(edited).forEach(([key, editValue]) => {
                const originalLabel = formatValueForEdit(key, original[key], radioMap);
                if (editValue !== originalLabel) {
                    changed[key] = editValue;
                }
            });

            if (Object.keys(changed).length === 0) {
                addToast({
                    title: "تغییری اعمال نشده است",
                    type: "info",
                    duration: 3000,
                });
                cancelSectionEdit(apiPart);
                return;
            }

            const payload = buildSectionPayload(changed, radioMap, gender);
            const result = await savePatientSection(formId, apiPart, payload);

            setFormDetails((prev) => ({
                ...prev,
                [apiPart]: {
                    ...(prev[apiPart] || {}),
                    ...payload,
                },
            }));

            if (apiPart === "basic" && payload.gender !== undefined) {
                setGender(payload.gender);
            }

            addToast({
                title: result.message || "تغییرات با موفقیت ذخیره شد",
                type: "success",
                duration: 4000,
            });
            cancelSectionEdit(apiPart);
        } catch (error) {
            addToast({
                title: error.message || "خطا در ذخیره تغییرات",
                type: "error",
                duration: 4000,
            });
        } finally {
            setSavingSection(null);
        }
    };

    if (loading || enumsLoading) {
        return <Loader />;
    }

    if (!formMeta) {
        return (
            <div className="forms_page_holder">
                <NavBar />
                <div className="patient_detail_empty">فرم یافت نشد.</div>
            </div>
        );
    }

    const statusBg = getFormStatusColor(formMeta.status);

    return (
        <div className="forms_page_holder">
            <NavBar />
            <div className="forms-page-wrapper PT">
                <div className="forms-container PT patient_detail_page" dir="rtl">
                    <div className="patient_detail_header">
                        <div className="patient_detail_title_block">
                            <h2>جزئیات فرم #{formMeta.id}</h2>
                            {formMeta.name ? (
                                <p className="patient_detail_name">{formMeta.name}</p>
                            ) : (
                                <p className="patient_detail_name patient_detail_name--muted">نام در فرم ثبت نشده</p>
                            )}
                            <div className="patient_detail_meta">
                                <span className="patient_detail_meta_item">
                                    <strong>شناسه اپراتور:</strong> {formMeta.operatorId ?? "—"}
                                </span>
                                <span className="patient_detail_meta_item">
                                    <strong>نوع فرم:</strong> {formMeta.formType === 1 ? "بهار" : "نوید"}
                                </span>
                                <span
                                    className="patient_detail_meta_item patient_detail_meta_status"
                                    style={{ background: statusBg }}
                                >
                                    <strong>وضعیت:</strong> {formMeta.status}
                                </span>
                            </div>
                        </div>
                        <PatientFormActions
                            row={formMeta}
                            onModelInput={openModelInput}
                            onStatusChange={openStatusChange}
                            showEdit={false}
                            layout="wrap"
                        />
                    </div>

                    <div className="patient_sections_stack">
                        {apiArray.map((apiPart, partIndex) => {
                            const sectionData = filterSectionData(apiPart, formDetails[apiPart], gender);
                            const isEditing = editingSection === apiPart;
                            const showCancerTable = isCancerListSection(apiPart);

                            return (
                                <section key={apiPart} className="patient_section_card">
                                    <div className="patient_section_card_header">
                                        <h3>{partNames[partIndex] || `بخش ${partIndex + 1}`}</h3>
                                        {!showCancerTable && (
                                            <div className="patient_section_card_actions">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="patient_section_btn patient_section_btn--primary"
                                                            disabled={savingSection === apiPart}
                                                            onClick={() => saveSection(apiPart)}
                                                        >
                                                            {savingSection === apiPart ? "در حال ذخیره..." : "ذخیره بخش"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="patient_section_btn"
                                                            onClick={() => cancelSectionEdit(apiPart)}
                                                        >
                                                            لغو
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="patient_section_btn patient_section_btn--primary"
                                                        onClick={() => startSectionEdit(apiPart)}
                                                    >
                                                        ویرایش بخش
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <PatientSectionForm
                                        apiPart={apiPart}
                                        sectionData={sectionData}
                                        gender={gender}
                                        radioMap={radioMap}
                                        editing={!showCancerTable && isEditing}
                                        editedValues={editedSections[apiPart]}
                                        onFieldChange={(key, value) => handleFieldChange(apiPart, key, value)}
                                    />

                                    {showCancerTable && (
                                        <PatientCancerSection
                                            formId={formMeta.id}
                                            variant={SELF_CANCER_PARTS.has(apiPart) ? "self" : "family"}
                                            cancerTypesMap={cancerTypesMap}
                                            relativeTypesMap={relativeTypesMap}
                                        />
                                    )}
                                </section>
                            );
                        })}
                    </div>
                </div>
            </div>
            {modals}
        </div>
    );
}
