import { useState, useEffect, useRef } from "react";
import './model_res.css';
import NavBar from './navBar';
import { useLocation, useNavigate } from "react-router-dom";
import { fetchDataGET, endpointMaker } from "./utils/tools";
import Loader from "./utils/loader";
import leftSign from './V2Form/form_left.png';
import rightSign from './V2Form/form_right.png';
import prevSign from './V2Form/arrow_right.svg';

const ModelResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userPhone = location.state?.phone;
    const exact_form = location.state?.form
    console.log("came with the exact form : ", exact_form)
    const [data, setData] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagiPrev, setPagiPrev] = useState(false);
    const [pagiNext, setPagiNext] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [risks, setRisks] = useState({});
    const [searchInput, setSearchInput] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState({
        sortBy: '',
        sortOrder: '',
        search: '',
    })
    const skipSearchPageReset = useRef(true);

    const MODEL_NAMES = ["premm5", "gail", "bcra", "plco", "ccrat"];

    const extractRiskValue = (model_name, resultData) => {
        if (!resultData) return "-";

        if (model_name === "premm5") {
            const { p_any } = resultData;
            return p_any != null ? p_any * 100 : "-";
        }

        if (model_name === "bcra" || model_name === "gail" || model_name === "plco" || model_name === "ccrat") {
            if (resultData.AbsRisk) return resultData.AbsRisk;
            if (model_name === "plco" && resultData.plcom2012_risk_percent != null) {
                return resultData.plcom2012_risk_percent;
            }
            if (resultData.absolute_risk != null) return resultData.absolute_risk;
        }

        return "-";
    };

    const processCalcPageResponse = (items) => {
        const forms = [];
        const risksMap = {};

        for (const item of items) {
            const form = item.form;
            forms.push(form);

            const formRisks = {};
            for (const model of MODEL_NAMES) {
                formRisks[model] = extractRiskValue(model, item.results?.[model]);
            }
            risksMap[form.id] = formRisks;
        }

        return { forms, risksMap };
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setAdvancedFilters(prev => {
                if (prev.search === searchInput) return prev;
                return { ...prev, search: searchInput };
            });
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        if (skipSearchPageReset.current) {
            skipSearchPageReset.current = false;
            return;
        }
        setPage(1);
    }, [advancedFilters.search]);

    const buildEndpoint = (currentPage, filters) => {
        return endpointMaker(
            filters.sortBy,
            "",
            filters.search,
            filters.sortOrder,
            "admin/calc",
            currentPage,
            [],
            true
        );
    };
    console.log("here is the format : ", data)
    useEffect(() => {
        if (exact_form) {
            setData([exact_form]);
            setInitialLoading(false);
            return;
        }

        let cancelled = false;

        const fetchFormIds = async () => {
            setTableLoading(true);

            try {
                const token = localStorage.getItem("token");
                const endpoint = buildEndpoint(page, advancedFilters);
                const pre_forms = await fetchDataGET(endpoint, token);

                if (cancelled) return;

                setPagiNext(pre_forms.data.pagination.hasNextPage);
                setPagiPrev(pre_forms.data.pagination.hasPrevPage);
                setPageCount(pre_forms.data.pagination.totalPages);

                if (pre_forms.status === 200) {
                    const { forms, risksMap } = processCalcPageResponse(pre_forms.data.data);
                    setData(forms);
                    setRisks(risksMap);
                }
            } catch (error) {
                console.error("Failed to fetch model results:", error);
            } finally {
                if (!cancelled) {
                    setInitialLoading(false);
                    setTableLoading(false);
                }
            }
        };

        fetchFormIds();

        return () => {
            cancelled = true;
        };
    }, [page, advancedFilters, exact_form]);

    // Function to fetch risk results for a specific model and form
    const showTheRisks = async (model_name, form_id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetchDataGET(`admin/calc/${model_name}/${form_id}`, token);

            const value = extractRiskValue(model_name, res.data);
            setRisks(prev => ({
                ...prev,
                [form_id]: {
                    ...prev[form_id],
                    [model_name]: value
                }
            }));
        } catch (error) {
            console.error("Failed to fetch risks:", error);
            setRisks(prev => ({
                ...prev,
                [form_id]: {
                    ...prev[form_id],
                    [model_name]: "-"
                }
            }));
        }
    };

    useEffect(() => {
        const fetchAllRisks = async () => {
            if (data.length > 0 && exact_form) {
                await Promise.all(
                    MODEL_NAMES.map(model => showTheRisks(model, exact_form.id))
                );
            }
        };

        fetchAllRisks();
    }, [data, exact_form]);

    // Pagination functions
    const showMore = () => {
        if (pagiNext) {
            setPage(p => p + 1);
        }
    };

    const showPrev = () => {
        if (pagiPrev) {
            setPage(p => p - 1);
        }
    };

    const nextPage = () => {
        if (pagiNext) setPage(p => p + 1);
    };

    const prevPage = () => {
        if (pagiPrev) setPage(p => p - 1);
    };

    const lineMaker = (total_page) => {
        let spans = [];
        for (let i = 0; i < total_page; i++) {
            spans.push(i);
        }
        return spans;
    };

    const formatRiskCell = (formId, model) => {
        const value = risks[formId]?.[model];
        if (value === undefined) return "در حال بارگذاری...";
        return value === "-" ? "-" : JSON.stringify(value);
    };

    if (initialLoading) {
        return <Loader></Loader>;
    }

    return (
        <>
            <div className="forms_page_holder">
                <NavBar account={userPhone}></NavBar>

                <div className="forms-page-wrapper MR">
                    <div className="forms-container MR">
                        <div className="pageTitle">
                            <h2>نتایج مدل ها</h2>
                        </div>
                        <div className="forms_tools">
                            <div className="form_tool">
                                <div className="form_search_bar model-res-search">
                                    <input
                                        type="text"
                                        className="form_search inp_question V2"
                                        placeholder="جستجو بر اساس کد ملی"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                    />
                                </div>
                                {/* <button className="magnifier" onClick={() => setAFS()}>
                                    <span>
                                        <img src={magnifier} alt="magnifier" />
                                    </span>
                                </button> */}

                            </div>

                            <div className="form_tool">
                                <div className="sorter">
                                    <select name="sortOrder" id="" className="select_optionsV2" value={advancedFilters.sortOrder} onChange={(e) => setAdvancedFilters({ ...advancedFilters, sortOrder: e.target.value })}>
                                        <option value="انتخاب کنید">ترتیب داده</option>
                                        <option value="asc">صعودی</option>
                                        <option value="desc">نزولی</option>
                                    </select>
                                </div>
                                <div className="sorter">
                                    <select
                                        value={advancedFilters.sortBy}
                                        onChange={(e) => setAdvancedFilters({ ...advancedFilters, sortBy: e.target.value })}
                                        className="select_optionsV2"
                                    >
                                        <option value="">مرتب سازی بر اساس</option>
                                        <option value="id">شناسه</option>
                                        <option value="created_at">تاریخ ایجاد</option>
                                        <option value="updated_at">تاریخ بروزرسانی</option>
                                        <option value="status">وضعیت</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={`model-res-table-wrapper${tableLoading ? " is-loading" : ""}`}>
                            {tableLoading ? (
                                <div className="model-res-table-loading" aria-live="polite" aria-busy="true">
                                    <div className="model-res-table-spinner">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span>در حال بارگذاری...</span>
                                </div>
                            ) : null}

                            <table className="forms-table">
                            <thead>
                                <tr>
                                    <th className="table-header">نام و نام خانوادگی</th>
                                    <th className="table-header">کد ملی</th>
                                    <th className="table-header">PREMM5</th>
                                    <th className="table-header">GAIL(6 years)</th>
                                    <th className="table-header">BCRA</th>
                                    <th className="table-header">PLCO</th>
                                    <th className="table-header">CCRAT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((form, index) => (
                                    <tr key={form.id || index} className="form-row">
                                        <td className="table-cell MR">{form.name || "نامشخص"}</td>
                                        <td className="table-cell MR">{form.socialSecurityNumber || "نامشخص"}</td>
                                        <td className="table-cell MR">{formatRiskCell(form.id, "premm5")}</td>
                                        <td className="table-cell MR">{formatRiskCell(form.id, "gail")}</td>
                                        <td className="table-cell MR">{formatRiskCell(form.id, "bcra")}</td>
                                        <td className="table-cell MR">{formatRiskCell(form.id, "plco")}</td>
                                        <td className="table-cell MR">{formatRiskCell(form.id, "ccrat")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>

                        <div className="page_naver">
                            <div className="total_pages">
                                <span>تعداد صفحات {pageCount}</span>
                            </div>
                            <div className="page_line">
                                <img src={rightSign} className="arrows" alt="rightSign" onClick={prevPage} />
                                {lineMaker(pageCount).map((p, index) => {
                                    return (
                                        <span
                                            key={index}
                                            className="page_num"
                                            style={page == p + 1 ? { background: "#eee" } : null}
                                            onClick={() => setPage(p + 1)}
                                        >
                                            {p + 1}
                                        </span>
                                    );
                                })}
                                <img src={leftSign} alt="leftSign" className="arrows" onClick={nextPage} />
                            </div>
                        </div>

                        {pageCount > 1 ? (
                            <div className="btn_holder_next_prev aligner">
                                <button className="btn_submit space-UD" onClick={showPrev}>صفحه ی قبلی</button>
                                <button className="btn_submit space-UD" onClick={showMore}>صفحه ی بعدی</button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModelResults;