import { APIURL } from "../../utils/config";
import { fetchDataDELETE, fetchDataGETImg } from "../../utils/tools";

export async function fetchSelfCancerList(formId, token) {
    const res = await fetchDataGETImg(`admin/form/${formId}/cancer`, token);
    return res.data?.cancers || [];
}

export async function fetchFamilyCancerList(formId, token) {
    const res = await fetchDataGETImg(`admin/form/${formId}/familycancer`, token);
    return res.data?.familyCancers || [];
}

export function normalizeSelfCancers(cancers, cancerTypesMap) {
    return (cancers || []).map((cancer) => ({
        id: cancer.id,
        cancerType: cancerTypesMap[cancer.cancerType] || cancer.cancerType,
        cancerTypeId: cancer.cancerType,
        cancerAge: cancer.cancerAge,
        pictures: cancer.pictures || [],
    }));
}

export function normalizeFamilyCancers(familyCancers, cancerTypesMap, relativeTypesMap) {
    const rows = [];
    (familyCancers || []).forEach((member) => {
        (member.cancers || []).forEach((cancer) => {
            rows.push({
                id: cancer.id,
                relative: relativeTypesMap[member.relative] || member.relative,
                relativeId: member.relative,
                name: member.name || "",
                lifeStatus: member.lifeStatus,
                cancerType: cancerTypesMap[cancer.cancerType] || cancer.cancerType,
                cancerTypeId: cancer.cancerType,
                cancerAge: cancer.cancerAge,
                pictures: cancer.pictures || [],
            });
        });
    });
    return rows;
}

function findMapId(map, label) {
    for (const [id, name] of Object.entries(map)) {
        if (name === label) {
            return parseInt(id, 10);
        }
    }
    return null;
}

export async function createSelfCancer(formId, token, { cancerTypeId, cancerAge, imageFiles = [] }) {
    if (imageFiles.length > 0) {
        const formData = new FormData();
        formData.append("cancerAge", parseInt(cancerAge, 10));
        formData.append("cancerType", cancerTypeId);
        imageFiles.forEach((file) => formData.append("pictures", file));
        return fetch(`${APIURL}/admin/form/${formId}/cancer`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
    }

    return fetch(`${APIURL}/admin/form/${formId}/cancer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            cancerAge: parseInt(cancerAge, 10),
            cancerType: cancerTypeId,
        }),
    });
}

export async function createFamilyCancer(formId, token, payload, imageFiles = []) {
    const formData = new FormData();
    formData.append("relative", payload.relativeTypeId);
    formData.append("lifeStatus", payload.lifeStatus);
    formData.append("cancerAge", parseInt(payload.cancerAge, 10));
    formData.append("cancerType", payload.cancerTypeId);
    formData.append("name", payload.name.trim());
    imageFiles.forEach((file) => formData.append("pictures", file));

    return fetch(`${APIURL}/admin/form/${formId}/familycancer`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
}

/** No dedicated PUT endpoint — replace record by delete then create. */
export async function replaceSelfCancer(formId, token, cancerId, data) {
    await fetchDataDELETE(`admin/form/${formId}/cancer/${cancerId}`, token);
    return createSelfCancer(formId, token, data);
}

export async function replaceFamilyCancer(formId, token, cancerId, data, imageFiles) {
    await fetchDataDELETE(`admin/form/${formId}/familycancer/${cancerId}`, token);
    return createFamilyCancer(formId, token, data, imageFiles);
}

export async function deleteSelfCancer(formId, token, cancerId) {
    return fetchDataDELETE(`admin/form/${formId}/cancer/${cancerId}`, token);
}

export async function deleteFamilyCancer(formId, token, cancerId) {
    return fetchDataDELETE(`admin/form/${formId}/familycancer/${cancerId}`, token);
}

export { findMapId };
