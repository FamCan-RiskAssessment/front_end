import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../toaster";
import {
    createFamilyCancer,
    createSelfCancer,
    deleteFamilyCancer,
    deleteSelfCancer,
    fetchFamilyCancerList,
    fetchSelfCancerList,
    findMapId,
    normalizeFamilyCancers,
    normalizeSelfCancers,
    replaceFamilyCancer,
    replaceSelfCancer,
} from "./patientCancerApi";

const EMPTY_SELF = { cancerType: "", cancerAge: "" };
const EMPTY_FAMILY = {
    relativeType: "",
    name: "",
    lifeStatus: 1,
    cancerType: "",
    cancerAge: "",
};

export default function PatientCancerSection({
    formId,
    variant,
    cancerTypesMap,
    relativeTypesMap,
}) {
    const isFamily = variant === "family";
    const { addToast } = useToast();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(isFamily ? EMPTY_FAMILY : EMPTY_SELF);
    const [imageFiles, setImageFiles] = useState([]);

    const loadRows = useCallback(async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            if (isFamily) {
                const data = await fetchFamilyCancerList(formId, token);
                setRows(normalizeFamilyCancers(data, cancerTypesMap, relativeTypesMap));
            } else {
                const data = await fetchSelfCancerList(formId, token);
                setRows(normalizeSelfCancers(data, cancerTypesMap));
            }
        } catch (error) {
            console.error(error);
            addToast({ title: "خطا در بارگذاری تاریخچه سرطان", type: "error", duration: 4000 });
        } finally {
            setLoading(false);
        }
    }, [addToast, cancerTypesMap, formId, isFamily, relativeTypesMap]);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    const resetForm = () => {
        setForm(isFamily ? { ...EMPTY_FAMILY } : { ...EMPTY_SELF });
        setImageFiles([]);
        setEditingId(null);
        setFormOpen(false);
    };

    const openAddForm = () => {
        setForm(isFamily ? { ...EMPTY_FAMILY } : { ...EMPTY_SELF });
        setImageFiles([]);
        setEditingId(null);
        setFormOpen(true);
    };

    const openEditForm = (row) => {
        if (isFamily) {
            setForm({
                relativeType: row.relative,
                name: row.name,
                lifeStatus: row.lifeStatus ?? 1,
                cancerType: row.cancerType,
                cancerAge: String(row.cancerAge ?? ""),
            });
        } else {
            setForm({
                cancerType: row.cancerType,
                cancerAge: String(row.cancerAge ?? ""),
            });
        }
        setImageFiles([]);
        setEditingId(row.id);
        setFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const cancerTypeId = findMapId(cancerTypesMap, form.cancerType);

        if (!cancerTypeId || !form.cancerAge) {
            addToast({ title: "نوع سرطان و سن تشخیص الزامی است", type: "error", duration: 4000 });
            return;
        }

        if (isFamily && (!form.relativeType || !form.name.trim())) {
            addToast({ title: "نسبت و نام الزامی است", type: "error", duration: 4000 });
            return;
        }

        setSaving(true);
        try {
            let response;
            if (isFamily) {
                const relativeTypeId = findMapId(relativeTypesMap, form.relativeType);
                const payload = {
                    relativeTypeId,
                    lifeStatus: parseInt(form.lifeStatus, 10),
                    cancerAge: form.cancerAge,
                    cancerTypeId,
                    name: form.name,
                };
                response = editingId
                    ? await replaceFamilyCancer(formId, token, editingId, payload, imageFiles)
                    : await createFamilyCancer(formId, token, payload, imageFiles);
            } else {
                const payload = { cancerTypeId, cancerAge: form.cancerAge, imageFiles };
                response = editingId
                    ? await replaceSelfCancer(formId, token, editingId, payload)
                    : await createSelfCancer(formId, token, payload);
            }

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "خطا در ذخیره");
            }

            addToast({
                title: result.message || (editingId ? "رکورد با موفقیت ویرایش شد" : "رکورد با موفقیت اضافه شد"),
                type: "success",
                duration: 4000,
            });
            resetForm();
            loadRows();
        } catch (error) {
            addToast({ title: error.message || "خطا در ذخیره", type: "error", duration: 4000 });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm("این رکورد حذف شود؟")) {
            return;
        }
        const token = localStorage.getItem("token");
        try {
            const res = isFamily
                ? await deleteFamilyCancer(formId, token, row.id)
                : await deleteSelfCancer(formId, token, row.id);
            if (res.ok || res.status === 200) {
                addToast({ title: "رکورد حذف شد", type: "success", duration: 4000 });
                if (editingId === row.id) {
                    resetForm();
                }
                loadRows();
            } else {
                throw new Error("حذف ناموفق بود");
            }
        } catch (error) {
            addToast({ title: error.message || "خطا در حذف", type: "error", duration: 4000 });
        }
    };

    if (loading) {
        return <p className="patient_cancer_loading">در حال بارگذاری تاریخچه...</p>;
    }

    return (
        <div className="patient_cancer_section">
            <div className="patient_cancer_section_top">
                <p className="patient_cancer_hint">
                    {isFamily
                        ? "تاریخچه سرطان بستگان. ویرایش با جایگزینی رکورد (حذف و ثبت مجدد) انجام می‌شود."
                        : "تاریخچه سرطان فردی. ویرایش با جایگزینی رکورد (حذف و ثبت مجدد) انجام می‌شود."}
                </p>
                <button type="button" className="patient_section_btn patient_section_btn--primary" onClick={openAddForm}>
                    <Plus size={16} />
                    <span>افزودن ردیف</span>
                </button>
            </div>

            {formOpen && (
                <form className="patient_cancer_form" onSubmit={handleSubmit}>
                    <h4>{editingId ? "ویرایش رکورد" : "افزودن رکورد جدید"}</h4>
                    {isFamily && (
                        <>
                            <label>
                                نسبت
                                <select
                                    dir="rtl"
                                    className="patient_field_input patient_field_select"
                                    value={form.relativeType}
                                    onChange={(e) => setForm({ ...form, relativeType: e.target.value })}
                                    required
                                >
                                    <option value="">انتخاب کنید</option>
                                    {Object.entries(relativeTypesMap).map(([id, name]) => (
                                        <option key={id} value={name}>{name}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                نام
                                <input
                                    className="patient_field_input"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </label>
                            <fieldset className="patient_cancer_life_status">
                                <legend>وضعیت</legend>
                                <label>
                                    <input
                                        type="radio"
                                        name="lifeStatus"
                                        checked={form.lifeStatus === 1}
                                        onChange={() => setForm({ ...form, lifeStatus: 1 })}
                                    />
                                    زنده
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="lifeStatus"
                                        checked={form.lifeStatus === 0}
                                        onChange={() => setForm({ ...form, lifeStatus: 0 })}
                                    />
                                    فوت شده
                                </label>
                            </fieldset>
                        </>
                    )}
                    <label>
                        نوع سرطان
                        <select
                            dir="rtl"
                            className="patient_field_input patient_field_select"
                            value={form.cancerType}
                            onChange={(e) => setForm({ ...form, cancerType: e.target.value })}
                            required
                        >
                            <option value="">انتخاب کنید</option>
                            {Object.entries(cancerTypesMap).map(([id, name]) => (
                                <option key={id} value={name}>{name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        سن تشخیص
                        <input
                            className="patient_field_input"
                            type="number"
                            min="0"
                            max="120"
                            value={form.cancerAge}
                            onChange={(e) => setForm({ ...form, cancerAge: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        تصاویر (اختیاری)
                        <input
                            className="patient_field_input"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                        />
                    </label>
                    <div className="patient_cancer_form_actions">
                        <button type="submit" className="patient_section_btn patient_section_btn--primary" disabled={saving}>
                            {saving ? "در حال ذخیره..." : editingId ? "ذخیره ویرایش" : "ثبت رکورد"}
                        </button>
                        <button type="button" className="patient_section_btn" onClick={resetForm}>
                            لغو
                        </button>
                    </div>
                </form>
            )}

            <div className="patient_cancer_table_wrapper">
                <table className="patient_cancer_table">
                    <thead>
                        <tr>
                            {isFamily && <th>نسبت</th>}
                            {isFamily && <th>نام</th>}
                            {isFamily && <th>وضعیت</th>}
                            <th>نوع سرطان</th>
                            <th>سن تشخیص</th>
                            <th>تصاویر</th>
                            <th>عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={isFamily ? 7 : 4} className="patient_no_data">
                                    رکوردی ثبت نشده است
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr key={row.id}>
                                    {isFamily && <td data-label="نسبت">{row.relative}</td>}
                                    {isFamily && <td data-label="نام">{row.name || "—"}</td>}
                                    {isFamily && (
                                        <td data-label="وضعیت">
                                            {row.lifeStatus === 0 ? "فوت شده" : row.lifeStatus === 1 ? "زنده" : "—"}
                                        </td>
                                    )}
                                    <td data-label="نوع سرطان">{row.cancerType}</td>
                                    <td data-label="سن تشخیص">{row.cancerAge}</td>
                                    <td data-label="تصاویر">
                                        {(row.pictures || []).length ? (
                                            <div className="patient_image_links">
                                                {row.pictures.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="download-link">
                                                        تصویر {i + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td data-label="عملیات">
                                        <div className="patient_cancer_row_actions">
                                            <button type="button" className="patient_cancer_row_btn" onClick={() => openEditForm(row)}>
                                                <Pencil size={14} />
                                                <span>ویرایش</span>
                                            </button>
                                            <button type="button" className="patient_cancer_row_btn patient_cancer_row_btn--danger" onClick={() => handleDelete(row)}>
                                                <Trash2 size={14} />
                                                <span>حذف</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
