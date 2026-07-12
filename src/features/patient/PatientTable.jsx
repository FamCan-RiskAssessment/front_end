import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/layout/NavBar";
import Loader from "../../components/ui/Loader";
import PatientFormActions from "./PatientFormActions";
import { usePatientEnums } from "./usePatientEnums";
import { usePatientActions } from "./usePatientActions";
import { formStatusLabels, stateColors } from "../../utils/config";
import { endpointMaker } from "../../utils/tools";
import { apiFetch } from "../../api/client";
import { shouldUseOperatorFormEndpoint } from "../../utils/permissions";
import leftSign from "../../V2Form/form_left.png";
import rightSign from "../../V2Form/form_right.png";
import "../../client_forms.css";
import "../../form_elements.css";
import "./PatientTable.css";
import "./PatientDetail.css";

const statuses = ["در حال بررسی", "قبول شده", "رد شده", "تکمیل نشده", "ارسال شده"];

function buildEndpoint(useOperatorForms, currentPage, currentFilter, filters) {
    let endpoint = useOperatorForms ? "admin/operator-form" : "admin/form";

    let statusId = null;
    if (currentFilter !== "All") {
        statuses.forEach((s, i) => {
            if (s === currentFilter) {
                statusId = i + 1;
            }
        });
    }

    const additionalFilters = [
        { key: "formType", value: filters.formType },
        { key: "gender", value: filters.gender },
        { key: "birthYear", value: filters.birthYear },
    ];

    endpoint = endpointMaker(
        filters.sortBy,
        filters.filledByOperatorID,
        filters.search,
        filters.sortOrder,
        endpoint,
        currentPage,
        additionalFilters,
        true
    );

    if (statusId !== null) {
        const separator = endpoint.includes("?") ? "&" : "?";
        endpoint += `${separator}status=${statusId}`;
    }

    additionalFilters.forEach((filter) => {
        if (filter.value !== "" && filter.value !== null && filter.value !== undefined) {
            const separator = endpoint.includes("?") ? "&" : "?";
            endpoint += `${separator}${filter.key}=${filter.value}`;
        }
    });

    return endpoint;
}

export default function FilterableTable() {
    const location = useLocation();
    const navigate = useNavigate();
    const userPhone = location.state?.phone;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagiPrev, setPagiPrev] = useState(false);
    const [pagiNext, setPagiNext] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [totalFormCount, setTotalFormCount] = useState(0);
    const [filter, setFilter] = useState("All");
    const [filtersApplied, setFiltersApplied] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        sortBy: "",
        sortOrder: "",
        search: "",
        formType: "",
        gender: "",
        birthYear: "",
        filledByOperatorID: "",
    });

    const { cancerTypesMap, relativeTypesMap } = usePatientEnums();
    const { openModelInput, openStatusChange, modals } = usePatientActions(data, {
        cancerTypesMap,
        relativeTypesMap,
    });

    useEffect(() => {
        const fetchForms = async () => {
            const useOperatorForms = shouldUseOperatorFormEndpoint();
            const endpoint = buildEndpoint(useOperatorForms, page, filter, advancedFilters);

            setLoading(true);
            try {
                const response = await apiFetch(endpoint, { parse: "response" });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (result?.data) {
                    setPagiNext(result.data?.pagination?.hasNextPage || false);
                    setPagiPrev(result.data?.pagination?.hasPrevPage || false);
                    setPageCount(result.data?.pagination?.totalPages || 0);
                    setTotalFormCount(
                        result.data?.pagination?.totalItems
                        ?? result.data?.pagination?.total
                        ?? result.data?.total
                        ?? 0
                    );
                    setData(result.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching forms:", error);
            } finally {
                setLoading(false);
                setFiltersApplied(false);
            }
        };

        fetchForms();
    }, [page, filter, filtersApplied]);

    const applyFilters = () => {
        setPage(1);
        setFiltersApplied(true);
    };

    const resetFilters = () => {
        setAdvancedFilters({
            sortBy: "",
            sortOrder: "",
            search: "",
            formType: "",
            gender: "",
            birthYear: "",
            filledByOperatorID: "",
        });
        setPage(1);
        setFiltersApplied(true);
    };

    if (loading && data.length === 0) {
        return <Loader />;
    }

    return (
        <div className="forms_page_holder">
            <NavBar account={userPhone} />
            <div className="forms-page-wrapper PT">
                <div className="forms-container PT">
                    <div className="total_patients_holder">
                        <div className="pageTitle patient_table_summary">
                            <h2>کاربران ثبت‌نام شده</h2>
                            <p>تعداد کل فرم‌های ثبت شده: {totalFormCount}</p>
                        </div>

                        <div className="table_controles">
                            <div className="table_tools">
                                <div className="advanced_filters">
                                    <h4>فیلترهای پیشرفته</h4>

                                    <div className="filter_row">
                                        <div className="filter_group">
                                            <label>مرتب سازی بر اساس:</label>
                                            <select
                                                value={advancedFilters.sortBy}
                                                onChange={(e) => setAdvancedFilters({ ...advancedFilters, sortBy: e.target.value })}
                                            >
                                                <option value="">انتخاب کنید</option>
                                                <option value="id">شناسه</option>
                                                <option value="created_at">تاریخ ایجاد</option>
                                                <option value="updated_at">تاریخ بروزرسانی</option>
                                                <option value="status">وضعیت</option>
                                            </select>
                                        </div>
                                        <div className="filter_group">
                                            <label>ترتیب:</label>
                                            <select
                                                value={advancedFilters.sortOrder}
                                                onChange={(e) => setAdvancedFilters({ ...advancedFilters, sortOrder: e.target.value })}
                                            >
                                                <option value="">انتخاب کنید</option>
                                                <option value="asc">صعودی</option>
                                                <option value="desc">نزولی</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="filter_row">
                                        <div className="filter_group">
                                            <label>جستجو:</label>
                                            <input
                                                type="text"
                                                placeholder="جستجو بر اساس شماره تلفن..."
                                                value={advancedFilters.search}
                                                onChange={(e) => setAdvancedFilters({ ...advancedFilters, search: e.target.value })}
                                            />
                                        </div>
                                        <div className="filter_group">
                                            <label>نوع فرم:</label>
                                            <select
                                                value={advancedFilters.formType}
                                                onChange={(e) => setAdvancedFilters({ ...advancedFilters, formType: e.target.value })}
                                            >
                                                <option value="">همه</option>
                                                <option value="1">بهار</option>
                                                <option value="2">نوید</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="filter_row">
                                        <div className="filter_group">
                                            <label>جنسیت:</label>
                                            <select
                                                value={advancedFilters.gender}
                                                onChange={(e) => setAdvancedFilters({ ...advancedFilters, gender: e.target.value })}
                                            >
                                                <option value="">همه</option>
                                                <option value="male">مرد</option>
                                                <option value="female">زن</option>
                                            </select>
                                        </div>
                                        <div className="filter_group">
                                            <label>سال تولد:</label>
                                            <input
                                                type="number"
                                                placeholder="سال تولد"
                                                value={advancedFilters.birthYear}
                                                onChange={(e) => setAdvancedFilters({ ...advancedFilters, birthYear: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="filter_row">
                                        <div className="filter_group">
                                            <label>شناسه اپراتور:</label>
                                            <input
                                                type="number"
                                                placeholder="شناسه اپراتور"
                                                value={advancedFilters.filledByOperatorID}
                                                onChange={(e) => setAdvancedFilters({ ...advancedFilters, filledByOperatorID: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="patient_filter_actions">
                                        <button type="button" className="btn_reset_filters" onClick={resetFilters}>
                                            ریست فیلترها
                                        </button>
                                        <button type="button" className="btn_question refined" onClick={applyFilters}>
                                            اعمال فیلترها
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="patient_table_wrapper">
                            {loading && <div className="patient_table_loading">در حال بارگذاری...</div>}
                            <table className="patient_data_table">
                                <thead>
                                    <tr>
                                        <th>شناسه</th>
                                        <th>نام</th>
                                        <th>شناسه اپراتور</th>
                                        <th>نوع فرم</th>
                                        <th>وضعیت</th>
                                        <th>عملیات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length > 0 ? (
                                        data.map((row) => {
                                            const statusColorKey = Object.keys(formStatusLabels).find(
                                                (key) => formStatusLabels[key] === row.status
                                            );
                                            return (
                                                <tr key={row.id}>
                                                    <td data-label="شناسه">{row.id}</td>
                                                    <td data-label="نام">{row.name || "نامشخص"}</td>
                                                    <td data-label="شناسه اپراتور">{row.operatorId ?? "-"}</td>
                                                    <td data-label="نوع فرم">{row.formType === 1 ? "بهار" : "نوید"}</td>
                                                    <td data-label="وضعیت">
                                                        <span
                                                            className="form_status_show patient_table_status"
                                                            style={{ background: stateColors[statusColorKey] }}
                                                        >
                                                            {row.status || "نامشخص"}
                                                        </span>
                                                    </td>
                                                    <td data-label="عملیات">
                                                        <PatientFormActions
                                                            row={row}
                                                            onModelInput={openModelInput}
                                                            onStatusChange={openStatusChange}
                                                            layout="stack"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="no_data_message">
                                                داده‌ای موجود نیست
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="page_naver">
                            <div className="total_pages">
                                <span>تعداد صفحات {pageCount}</span>
                            </div>
                            <div className="page_line">
                                <img
                                    src={rightSign}
                                    className="arrows"
                                    alt="rightSign"
                                    onClick={() => setPage((a) => Math.max(1, a - 1))}
                                />
                                {Array.from({ length: pageCount }, (_, p) => (
                                    <span
                                        key={p}
                                        className="page_num"
                                        style={page === p + 1 ? { background: "#eee" } : null}
                                        onClick={() => setPage(p + 1)}
                                    >
                                        {p + 1}
                                    </span>
                                ))}
                                <img
                                    src={leftSign}
                                    alt="leftSign"
                                    className="arrows"
                                    onClick={() => setPage((a) => Math.min(pageCount, a + 1))}
                                />
                            </div>
                        </div>

                        <div className="btn_holder_next_prev">
                            <button
                                type="button"
                                className="btn_submit space-UD"
                                disabled={!pagiPrev}
                                onClick={() => pagiPrev && setPage((p) => p - 1)}
                            >
                                صفحه ی قبلی
                            </button>
                            <button
                                type="button"
                                className="btn_submit space-UD"
                                disabled={!pagiNext}
                                onClick={() => pagiNext && setPage((p) => p + 1)}
                            >
                                صفحه ی بعدی
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {modals}
        </div>
    );
}
