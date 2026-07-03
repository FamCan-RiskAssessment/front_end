import { useEffect, useState } from "react";
import { fetchDataGET, dict_transformer } from "../../utils/tools";

export function usePatientEnums() {
    const [radioMap, setRadioMap] = useState({});
    const [cancerTypesMap, setCancerTypesMap] = useState({});
    const [relativeTypesMap, setRelativeTypesMap] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        const loadEnums = async () => {
            try {
                const [ansMap, relMap, genMap, menoMap, cancerTypesRes, relativeTypesRes] = await Promise.all([
                    fetchDataGET("enum/answers", token),
                    fetchDataGET("enum/relatives", token),
                    fetchDataGET("enum/genders", token),
                    fetchDataGET("enum/menopausal-statuses", token),
                    fetchDataGET("enum/cancer-types", token),
                    fetchDataGET("enum/relatives", token),
                ]);

                setRadioMap({
                    answers: dict_transformer(ansMap.data),
                    relatives: dict_transformer(relMap.data),
                    gender: dict_transformer(genMap.data),
                    menopausalMap: dict_transformer(menoMap.data),
                });

                if (cancerTypesRes?.data) {
                    const cancerMap = {};
                    cancerTypesRes.data.forEach((cancer, index) => {
                        cancerMap[index + 1] = cancer.name;
                    });
                    setCancerTypesMap(cancerMap);
                }

                if (relativeTypesRes?.data) {
                    const relativeMap = {};
                    relativeTypesRes.data.forEach((relative, index) => {
                        relativeMap[index + 1] = relative.name;
                    });
                    setRelativeTypesMap(relativeMap);
                }
            } catch (error) {
                console.error("Error loading patient enums:", error);
            } finally {
                setLoading(false);
            }
        };

        loadEnums();
    }, []);

    return { radioMap, cancerTypesMap, relativeTypesMap, loading };
}
