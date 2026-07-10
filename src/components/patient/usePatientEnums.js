import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { enumQueryOptions } from "../../api/enums";
import { dict_transformer } from "../../utils/tools";

const ENUM_NAMES = ["answers", "relatives", "genders", "menopausal-statuses", "cancer-types"];

/**
 * Loads the patient-detail enum maps through the shared enum cache.
 * Return shape is identical to the legacy hook:
 * { radioMap, cancerTypesMap, relativeTypesMap, loading }
 */
export function usePatientEnums() {
    const results = useQueries({ queries: ENUM_NAMES.map(enumQueryOptions) });
    const [answersQ, relativesQ, gendersQ, menopausalQ, cancerTypesQ] = results;
    const loading = results.some((r) => r.isLoading);

    const radioMap = useMemo(() => {
        if (!answersQ.data || !relativesQ.data || !gendersQ.data || !menopausalQ.data) return {};
        return {
            answers: dict_transformer(answersQ.data.data),
            relatives: dict_transformer(relativesQ.data.data),
            gender: dict_transformer(gendersQ.data.data),
            menopausalMap: dict_transformer(menopausalQ.data.data),
        };
    }, [answersQ.data, relativesQ.data, gendersQ.data, menopausalQ.data]);

    const cancerTypesMap = useMemo(() => {
        const map = {};
        cancerTypesQ.data?.data?.forEach((cancer, index) => {
            map[index + 1] = cancer.name;
        });
        return map;
    }, [cancerTypesQ.data]);

    const relativeTypesMap = useMemo(() => {
        const map = {};
        relativesQ.data?.data?.forEach((relative, index) => {
            map[index + 1] = relative.name;
        });
        return map;
    }, [relativesQ.data]);

    return { radioMap, cancerTypesMap, relativeTypesMap, loading };
}
