import { useEffect, useState } from "react";
import { APIURL } from "../../utils/config";
import { fetchDataDELETE, fetchDataGETImg } from "../../utils/tools";
import { useToast } from "../../components/ui/Toast";
import Loader from "../../components/ui/Loader";

function CancerAddForm({ formId, isFamilyCancer, onClose, cancerTypesMap, relativeTypesMap }) {
    const [cancerType, setCancerType] = useState("");
    const [cancerAge, setCancerAge] = useState("");
    const [relativeType, setRelativeType] = useState("");
    const [relativeName, setRelativeName] = useState("");
    const [lifeStatus, setLifeStatus] = useState(1);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const { addToast } = useToast();

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setImageFiles((prev) => [...prev, ...files]);
            setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!cancerType || !cancerAge || (isFamilyCancer && (!relativeType || !relativeName.trim()))) {
            addToast({
                title: "لطفاً تمام فیلدهای الزامی را پر کنید",
                type: "error",
                duration: 4000,
            });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            let cancerTypeId = null;
            let relativeTypeId = null;

            for (const [id, name] of Object.entries(cancerTypesMap)) {
                if (name === cancerType) {
                    cancerTypeId = parseInt(id);
                    break;
                }
            }

            if (isFamilyCancer) {
                for (const [id, name] of Object.entries(relativeTypesMap)) {
                    if (name === relativeType) {
                        relativeTypeId = parseInt(id);
                        break;
                    }
                }
            }

            const cancerAgeInt = parseInt(cancerAge);
            const lifeStatusInt = parseInt(lifeStatus);
            let response;

            if (isFamilyCancer) {
                const formData = new FormData();
                formData.append("relative", relativeTypeId);
                formData.append("lifeStatus", lifeStatusInt);
                formData.append("cancerAge", cancerAgeInt);
                formData.append("cancerType", cancerTypeId);
                formData.append("name", relativeName.trim());
                imageFiles.forEach((file) => formData.append("pictures", file));

                response = await fetch(`${APIURL}/admin/form/${formId}/familycancer`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
            } else if (imageFiles.length > 0) {
                const formData = new FormData();
                formData.append("cancerAge", cancerAgeInt);
                formData.append("cancerType", cancerTypeId);
                imageFiles.forEach((file) => formData.append("pictures", file));

                response = await fetch(`${APIURL}/admin/form/${formId}/cancer`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
            } else {
                response = await fetch(`${APIURL}/admin/form/${formId}/cancer`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ cancerAge: cancerAgeInt, cancerType: cancerTypeId }),
                });
            }

            const result = await response.json();
            if (response.ok) {
                addToast({
                    title: result.message || `سرطان ${isFamilyCancer ? "خانوادگی" : "فردی"} با موفقیت اضافه شد`,
                    type: "success",
                    duration: 4000,
                });
                onClose();
            } else {
                throw new Error(result.message || "خطا در اضافه کردن سرطان");
            }
        } catch (error) {
            addToast({
                title: error.message || "خطا در اضافه کردن سرطان",
                type: "error",
                duration: 4000,
            });
        }
    };

    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => {
                if (preview) URL.revokeObjectURL(preview);
            });
        };
    }, [imagePreviews]);

    return (
        <div className="cancer-add-form">
            <form onSubmit={handleSubmit}>
                {isFamilyCancer && (
                    <>
                        <div className="form-group">
                            <label>نسبت خانوادگی:</label>
                            <select value={relativeType} onChange={(e) => setRelativeType(e.target.value)} className="form-control">
                                <option value="">انتخاب کنید</option>
                                {Object.entries(relativeTypesMap).map(([id, name]) => (
                                    <option key={id} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>نام:</label>
                            <input
                                type="text"
                                value={relativeName}
                                onChange={(e) => setRelativeName(e.target.value)}
                                className="form-control"
                                placeholder="نام بستگان"
                                required
                            />
                        </div>
                    </>
                )}

                <div className="form-group">
                    <label>نوع سرطان:</label>
                    <select value={cancerType} onChange={(e) => setCancerType(e.target.value)} className="form-control">
                        <option value="">انتخاب کنید</option>
                        {Object.entries(cancerTypesMap).map(([id, name]) => (
                            <option key={id} value={name}>{name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>سن در زمان تشخیص سرطان:</label>
                    <input
                        type="number"
                        value={cancerAge}
                        onChange={(e) => setCancerAge(e.target.value)}
                        className="form-control"
                        min="0"
                        max="120"
                    />
                </div>

                {isFamilyCancer && (
                    <div className="form-group">
                        <label>وضعیت زندگی:</label>
                        <div>
                            <label>
                                <input type="radio" name="lifeStatus" value={1} checked={lifeStatus === 1} onChange={(e) => setLifeStatus(parseInt(e.target.value))} />
                                زنده
                            </label>
                            <label style={{ marginLeft: "15px" }}>
                                <input type="radio" name="lifeStatus" value={0} checked={lifeStatus === 0} onChange={(e) => setLifeStatus(parseInt(e.target.value))} />
                                فوت شده
                            </label>
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label>تصویر (اختیاری):</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="form-control" multiple />
                    <div className="image-previews-container">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="image-preview-item">
                                <img src={preview} alt={`Preview ${index + 1}`} style={{ maxWidth: "200px", maxHeight: "200px" }} />
                                <button type="button" onClick={() => removeImage(index)} className="remove-image-btn">×</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-actions" style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                    <button type="submit" className="btn_submit btn-primary">ثبت سرطان</button>
                    <button type="button" onClick={onClose} className="btn_submit btn-secondary">لغو</button>
                </div>
            </form>
        </div>
    );
}

export default function PatientModals({
    modelList,
    openModelModal,
    onCloseModelModal,
    onSelectModel,
    openStatusModal,
    onCloseStatusModal,
    statusOptions,
    onSelectStatus,
    openCancerModal,
    onCloseCancerModal,
    detailedCancerData,
    selectedFormForSelfCancer,
    cancerDeled,
    onDeleteCancer,
    openFamilyCancerModal,
    onCloseFamilyCancerModal,
    detailedFamilyCancerData,
    selectedFormForFamilyCancer,
    familyCancerDeled,
    onDeleteFamilyCancer,
    addCancerModal,
    onCloseAddCancerModal,
    cancerTypesMap,
    relativeTypesMap,
}) {
    const resolveCancerType = (value) => cancerTypesMap?.[value] || value;
    const resolveRelative = (value) => relativeTypesMap?.[value] || value;
    return (
        <>
            {openModelModal && (
                <div className="role_modal">
                    <div className="modal_header">
                        <h3>مدل‌ها</h3>
                        <div className="modal_close" onClick={onCloseModelModal}><span>✕</span></div>
                    </div>
                    <div className="roles">
                        {modelList.map((m) => (
                            <div key={m.id} className="role_table" onClick={() => onSelectModel(m.id)}>
                                {m.name.toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {openStatusModal && (
                <div className="role_modal">
                    <div className="modal_header">
                        <h3>تغییر وضعیت به ...</h3>
                        <div className="modal_close" onClick={onCloseStatusModal}><span>✕</span></div>
                    </div>
                    <div className="roles">
                        {statusOptions.map((m, index) => (
                            <div key={index} className="role_table" onClick={() => onSelectStatus(m.api)}>
                                {m.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {openFamilyCancerModal && (
                <div className="role_modal">
                    <div className="modal_header">
                        <h3>تاریخچه سرطان خانوادگی</h3>
                        <div className="modal_close" onClick={onCloseFamilyCancerModal}><span>✕</span></div>
                    </div>
                    <div className="roles cancer-mode">
                        {!detailedFamilyCancerData[selectedFormForFamilyCancer]?.length ? (
                            "تاریخچه سرطان خانوادگی موجود نیست"
                        ) : (
                            detailedFamilyCancerData[selectedFormForFamilyCancer].map((familyMember, index) => (
                                <div key={index} className="role_table">
                                    <div className="family-member-info">
                                        <p><strong>خویشاوند:</strong> {resolveRelative(familyMember.relative)}</p>
                                        {familyMember.name && <p><strong>نام:</strong> {familyMember.name}</p>}
                                        <p><strong>وضعیت زندگی:</strong> {familyMember.lifeStatus === 0 ? "فوت شده" : familyMember.lifeStatus === 1 ? "زنده" : "نامشخص"}</p>
                                        <div className="cancers-list">
                                            {familyMember.cancers?.map((cancer, cancerIndex) => {
                                                if (familyCancerDeled.includes(cancer.id)) return null;
                                                return (
                                                    <div key={cancerIndex} className="cancer-item">
                                                        <div className="top_cancer_holder">
                                                            <p>نوع سرطان: {resolveCancerType(cancer.cancerType)}</p>
                                                            <button className="modal_close" onClick={() => onDeleteFamilyCancer(cancer.id, selectedFormForFamilyCancer)}>
                                                                <span>✕</span>
                                                            </button>
                                                        </div>
                                                        <p>سن تشخیص: {cancer.cancerAge}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {openCancerModal && (
                <div className="role_modal">
                    <div className="modal_header">
                        <h3>تاریخچه سرطان</h3>
                        <div className="modal_close" onClick={onCloseCancerModal}><span>✕</span></div>
                    </div>
                    <div className="roles cancer-mode">
                        {!detailedCancerData[selectedFormForSelfCancer]?.length ? (
                            "تاریخچه سرطان موجود نیست"
                        ) : (
                            detailedCancerData[selectedFormForSelfCancer].map((cancer, index) => {
                                if (cancerDeled.includes(cancer.id)) return null;
                                return (
                                    <div key={index} className="cancer-item">
                                        <div className="top_cancer_holder">
                                            <p>نوع سرطان: {resolveCancerType(cancer.cancerType)}</p>
                                            <button className="modal_close" onClick={() => onDeleteCancer(cancer.id, selectedFormForSelfCancer)}>
                                                <span>✕</span>
                                            </button>
                                        </div>
                                        <p>سن تشخیص: {cancer.cancerAge}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {addCancerModal && (
                <div className="role_modal">
                    <div className="modal_header">
                        <h3>اضافه کردن سرطان</h3>
                        <div className="modal_close" onClick={onCloseAddCancerModal}><span>✕</span></div>
                    </div>
                    <div className="roles cancer-mode">
                        <div className="role_table">
                            <CancerAddForm
                                formId={selectedFormForSelfCancer || selectedFormForFamilyCancer}
                                isFamilyCancer={!!selectedFormForFamilyCancer}
                                onClose={onCloseAddCancerModal}
                                cancerTypesMap={cancerTypesMap}
                                relativeTypesMap={relativeTypesMap}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export async function fetchCancerDetails(formId, token) {
    const selfCancerRes = await fetchDataGETImg(`admin/form/${formId}/cancer`, token);
    return selfCancerRes.data?.cancers || [];
}

export async function fetchFamilyCancerDetails(formId, token) {
    const familyCancerRes = await fetchDataGETImg(`admin/form/${formId}/familycancer`, token);
    return familyCancerRes.data?.familyCancers || [];
}

export async function deleteCancerRecord(formId, cancerId, token) {
    return fetchDataDELETE(`admin/form/${formId}/cancer/${cancerId}`, token);
}

export async function deleteFamilyCancerRecord(formId, cancerId, token) {
    return fetchDataDELETE(`admin/form/${formId}/familycancer/${cancerId}`, token);
}
