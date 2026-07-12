import { useCallback, useEffect, useState } from "react";
import { formStatusLabels, statusAPIs } from "../../utils/config";
import {
    activeStats,
    fetchDataGET,
    fetchDataPOST,
    fetchDataPUT,
} from "../../utils/tools";
import { apiFetch } from "../../api/client";
import { useToast } from "../../components/ui/Toast";
import PatientModals, {
    deleteCancerRecord,
    deleteFamilyCancerRecord,
    fetchCancerDetails,
    fetchFamilyCancerDetails,
} from "./PatientModals";

function getFormRowsSignature(rows) {
    return rows.map((row) => `${row.id}:${row.status ?? ""}`).join("|");
}

export function usePatientActions(
    initialData = [],
    { cancerTypesMap = {}, relativeTypesMap = {}, onStatusUpdated } = {}
) {
    const { addToast } = useToast();
    const [data, setData] = useState(initialData);
    const [modelList, setModelList] = useState([]);
    const [selectedFormId, setSelectedFormId] = useState(0);
    const [openModelModal, setOpenModelModal] = useState(false);
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [detailedCancerData, setDetailedCancerData] = useState({});
    const [detailedFamilyCancerData, setDetailedFamilyCancerData] = useState({});
    const [openCancerModal, setOpenCancerModal] = useState(false);
    const [openFamilyCancerModal, setOpenFamilyCancerModal] = useState(false);
    const [selectedFormForSelfCancer, setSelectedFormForSelfCancer] = useState(null);
    const [selectedFormForFamilyCancer, setSelectedFormForFamilyCancer] = useState(null);
    const [cancerDeled, setCancerDeled] = useState([]);
    const [familyCancerDeled, setFamilyCancerDeled] = useState([]);
    const [addCancerModal, setAddCancerModal] = useState(false);

    useEffect(() => {
        setData((prev) => {
            if (getFormRowsSignature(prev) === getFormRowsSignature(initialData)) {
                return prev;
            }
            return initialData;
        });
    }, [initialData]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchModels = async () => {
            const res = await fetchDataGET("admin/calc/all-models", token);
            setModelList(res.data || []);
        };
        fetchModels();
    }, []);

    const getNewStatusFromAPI = useCallback((apiEndpoint) => {
        const statusKey = Object.keys(statusAPIs).find((key) => statusAPIs[key] === apiEndpoint);
        return statusKey ? formStatusLabels[statusKey] : "وضعیت نامشخص";
    }, []);

    const openModelInput = useCallback((formId) => {
        setSelectedFormId(formId);
        setOpenModelModal(true);
    }, []);

    const openStatusChange = useCallback((formId) => {
        setSelectedFormId(formId);
        setOpenStatusModal(true);
    }, []);

    const sendToCalcModel = useCallback(async (modelId) => {
        const token = localStorage.getItem("token");
        const bodyData = { calcID: modelId, formID: selectedFormId };
        const res = await fetchDataPOST("admin/calc/model", token, bodyData, true);

        if (res.status !== 200) {
            addToast({
                title: res.data != null ? res.data.error : res.message,
                type: "error",
                duration: 4000,
            });
        } else {
            addToast({
                title: "ریسک مورد نظر با موفقیت محاسبه شد",
                type: "success",
                duration: 4000,
            });
            setData((prev) =>
                prev.map((form) =>
                    form.id === selectedFormId
                        ? { ...form, status: getNewStatusFromAPI("calculated") }
                        : form
                )
            );
            onStatusUpdated?.(selectedFormId, getNewStatusFromAPI("calculated"));
        }
        setSelectedFormId(0);
        setOpenModelModal(false);
    }, [addToast, getNewStatusFromAPI, onStatusUpdated, selectedFormId]);

    const adminStatChanger = useCallback(async (api, formId) => {
        const token = localStorage.getItem("token");
        const res = await fetchDataPUT(`admin/operator/form/${formId}/${api}`, token, {});

        if (res.status === 200 || res.status === 201) {
            addToast({
                title: "وضعیت فرم با موفقیت تغییر کرد",
                type: "success",
                duration: 4000,
            });
            setData((prev) =>
                prev.map((form) =>
                    form.id === formId ? { ...form, status: getNewStatusFromAPI(api) } : form
                )
            );
            onStatusUpdated?.(formId, getNewStatusFromAPI(api));
            return true;
        }

        addToast({
            title: "خطا در اتصال به سرور لطفا دوباره تلاش کنید",
            type: "error",
            duration: 4000,
        });
        return false;
    }, [addToast, getNewStatusFromAPI, onStatusUpdated]);

    const showSelfCancerDetails = useCallback(async (formId) => {
        const token = localStorage.getItem("token");
        setSelectedFormForSelfCancer(formId);
        setCancerDeled([]);
        try {
            const cancers = await fetchCancerDetails(formId, token);
            setDetailedCancerData((prev) => ({ ...prev, [formId]: cancers }));
            setOpenCancerModal(true);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const showFamilyCancerDetails = useCallback(async (formId) => {
        const token = localStorage.getItem("token");
        setSelectedFormForFamilyCancer(formId);
        setFamilyCancerDeled([]);
        try {
            const familyCancers = await fetchFamilyCancerDetails(formId, token);
            setDetailedFamilyCancerData((prev) => ({ ...prev, [formId]: familyCancers }));
            setOpenFamilyCancerModal(true);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const openAddCancer = useCallback((formId, isFamily = false) => {
        setAddCancerModal(true);
        if (isFamily) {
            setSelectedFormForFamilyCancer(formId);
            setSelectedFormForSelfCancer(null);
        } else {
            setSelectedFormForSelfCancer(formId);
            setSelectedFormForFamilyCancer(null);
        }
    }, []);

    const deleteCancer = useCallback(async (cancerId, formId) => {
        const token = localStorage.getItem("token");
        await deleteCancerRecord(formId, cancerId, token);
        setCancerDeled((prev) => [...prev, cancerId]);
    }, []);

    const deleteFamilyCancer = useCallback(async (cancerId, formId) => {
        const token = localStorage.getItem("token");
        await deleteFamilyCancerRecord(formId, cancerId, token);
        setFamilyCancerDeled((prev) => [...prev, cancerId]);
    }, []);

    const statusOptions = selectedFormId ? activeStats(selectedFormId, data) : [];

    const modals = (
        <PatientModals
            modelList={modelList}
            openModelModal={openModelModal}
            onCloseModelModal={() => {
                setOpenModelModal(false);
                setSelectedFormId(0);
            }}
            onSelectModel={sendToCalcModel}
            openStatusModal={openStatusModal}
            onCloseStatusModal={() => {
                setOpenStatusModal(false);
                setSelectedFormId(0);
            }}
            statusOptions={statusOptions}
            onSelectStatus={async (api) => {
                await adminStatChanger(api, selectedFormId);
                setOpenStatusModal(false);
            }}
            openCancerModal={openCancerModal}
            onCloseCancerModal={() => {
                setOpenCancerModal(false);
                setSelectedFormForSelfCancer(null);
                setCancerDeled([]);
            }}
            detailedCancerData={detailedCancerData}
            selectedFormForSelfCancer={selectedFormForSelfCancer}
            cancerDeled={cancerDeled}
            onDeleteCancer={deleteCancer}
            openFamilyCancerModal={openFamilyCancerModal}
            onCloseFamilyCancerModal={() => {
                setOpenFamilyCancerModal(false);
                setSelectedFormForFamilyCancer(null);
                setFamilyCancerDeled([]);
            }}
            detailedFamilyCancerData={detailedFamilyCancerData}
            selectedFormForFamilyCancer={selectedFormForFamilyCancer}
            familyCancerDeled={familyCancerDeled}
            onDeleteFamilyCancer={deleteFamilyCancer}
            addCancerModal={addCancerModal}
            onCloseAddCancerModal={() => {
                setAddCancerModal(false);
                setSelectedFormForSelfCancer(null);
                setSelectedFormForFamilyCancer(null);
                setCancerDeled([]);
                setFamilyCancerDeled([]);
            }}
            cancerTypesMap={cancerTypesMap}
            relativeTypesMap={relativeTypesMap}
        />
    );

    return {
        data,
        setData,
        openModelInput,
        openStatusChange,
        adminStatChanger,
        showSelfCancerDetails,
        showFamilyCancerDetails,
        openAddCancer,
        modals,
        getNewStatusFromAPI,
    };
}

export async function savePatientSection(formId, apiPart, payload) {
    const entries = Object.entries(payload);

    if (entries.length === 0) {
        return { message: "تغییری برای ذخیره وجود ندارد" };
    }

    let lastResult = null;
    for (const [fieldName, fieldValue] of entries) {
        const response = await apiFetch(`admin/form/${formId}/${apiPart}`, {
            method: "PATCH",
            body: { [fieldName]: fieldValue },
            parse: "response",
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `HTTP error ${response.status}`);
        }
        lastResult = result;
    }

    return lastResult;
}
