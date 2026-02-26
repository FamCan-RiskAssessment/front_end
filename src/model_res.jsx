import { useState, useEffect } from "react";
import './model_res.css';
import NavBar from './navBar';
import { useLocation } from "react-router-dom";
import { APIARR } from "./utils/config";
import { fetchDataGET, endpointMaker } from "./utils/tools";
import Loader from "./utils/loader";
import leftSign from './V2Form/form_left.png';
import rightSign from './V2Form/form_right.png';
import prevSign from './V2Form/arrow_right.svg';

const ModelResults = () => {
    const location = useLocation();
    const userPhone = location.state?.phone;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagiPrev, setPagiPrev] = useState(false);
    const [pagiNext, setPagiNext] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [risks, setRisks] = useState({});
    const [advancedFilters, setAdvancedFilters] = useState({
        sortBy: '',
        sortOrder: '',
        search: '',
    })
    // const mapOforgs = {
    //     "صعودی": "asc",
    //     "نزولی": "desc"
    // }

    // Function to build endpoint based on user role and filters
    const buildEndpoint = (roleName, currentPage, currentFilter, filters) => {
        let endpoint = '';

        // Determine base endpoint based on user role
        if (roleName === "اپراتور") {
            endpoint = 'admin/operator-form';
        } else {
            endpoint = 'admin/form';
        }

        // Add additional filters based on specifications
        const additionalFilters = [];

        // Use endpointMaker to build the full endpoint with pagination and status
        endpoint = endpointMaker(
            filters.sortBy,
            "",
            filters.search,
            filters.sortOrder,
            endpoint,
            currentPage,
            [],
            true
        );

        // Add status filter if applicable
        // if (statusId !== null) {
        // const separator = endpoint.includes('?') ? '&' : '?';
        // endpoint += `${separator}status=${statusId}`;
        // }

        if (additionalFilters.length != 0) {
            additionalFilters.forEach(filter => {
                if (filter.value !== '' && filter.value !== null && filter.value !== undefined) {
                    const separator = endpoint.includes('?') ? '&' : '?';
                    endpoint += `${separator}${filter.key}=${filter.value}`;
                }
            });
        }


        return endpoint;
    };
    console.log("here is the format : ", data)
    // Function to fetch all forms with pagination
    useEffect(() => {
        const fetchFormIds = async () => {
            let pre_forms = null;
            let token = localStorage.getItem("token");
            let role = JSON.parse(localStorage.getItem("roles"));
            let endpoint = buildEndpoint(role[0], page, "", advancedFilters)
            console.log("check the name : ", role[0]);

            // Fetch forms with pagination
            pre_forms = await fetchDataGET(`${endpoint}`, token);

            console.log("here is the filter : ", pre_forms);
            setPagiNext(pre_forms.data.pagination.hasNextPage);
            setPagiPrev(pre_forms.data.pagination.hasPrevPage);
            setPageCount(pre_forms.data.pagination.totalPages);

            if (pre_forms.status === 200) {
                // Create a new array to hold the updated forms
                const updatedForms = [];

                // Process each form sequentially (or use Promise.all for parallel)
                // for (const pf of pre_forms.data.data) {
                //     let updatedForm = { ...pf }; // Start with a copy of the original form

                //     // Process each API endpoint
                //     for (const ar of APIARR) {
                //         try {
                //             let user_part_form = await fetchDataGET(`form/${pf.id}/${ar}`, token);
                //             updatedForm = { ...updatedForm, ...user_part_form.data };
                //         } catch (error) {
                //             console.error(`Error fetching form ${pf.id} for ${ar}:`, error);
                //         }
                //     }

                //     updatedForms.push(updatedForm);
                // }

                // Update state with the fully updated array
                setData(pre_forms.data.data);
                setLoading(false);
            }
        };
        fetchFormIds();
    }, [page, advancedFilters]);

    // Function to fetch risk results for a specific model and form
    const showTheRisks = async (model_name, form_id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetchDataGET(`admin/calc/${model_name}/${form_id}`, token);

            if (model_name === "premm5") {
                const the_probs = res.data; // assuming res.data has gene_probs and p_any
                const { gene_probs, p_any } = the_probs;

                // Merge gene_probs and p_any into a single flat object
                const combinedRisks = p_any * 100

                setRisks(prev => ({
                    ...prev,
                    [form_id]: {
                        ...prev[form_id],
                        [model_name]: combinedRisks
                    }
                }));
            } else if (model_name == "bcra" || model_name == "gail" || model_name == "plco" || model_name == "ccrat") {
                if (res.data.AbsRisk) {
                    setRisks(prev => ({
                        ...prev,
                        [form_id]: {
                            ...prev[form_id],
                            [model_name]: res.data.AbsRisk
                        }
                    }));
                } else if (model_name == "plco") {
                    setRisks(prev => ({
                        ...prev,
                        [form_id]: {
                            ...prev[form_id],
                            [model_name]: res.data.plcom2012_risk_percent
                        }
                    }));
                } else {
                    setRisks(prev => ({
                        ...prev,
                        [form_id]: {
                            ...prev[form_id],
                            [model_name]: res.data.absolute_risk
                        }
                    }));
                }
            }
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

    // Fetch risk results for all models when component loads
    useEffect(() => {
        const fetchAllRisks = async () => {
            if (data.length > 0) {
                for (const form of data) {
                    await Promise.all([
                        showTheRisks("premm5", form.id),
                        showTheRisks("gail", form.id),
                        showTheRisks("bcra", form.id),
                        showTheRisks("plco", form.id),
                        showTheRisks("ccrat", form.id)
                    ]);
                }
            }
        };

        fetchAllRisks();
    }, [data]);

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

    if (loading) {
        return <Loader></Loader>;
    }

    return (
        <>
            <div className="forms_page_holder">
                <NavBar account={userPhone}></NavBar>

                <div className="forms-page-wrapper">
                    <div className="forms-container MR">
                        <div className="forms_tools">
                            <div className="form_tool">
                                <div className="form_search_bar">
                                    <input
                                        type="text"
                                        className="form_search inp_question V2"
                                        placeholder="جستجوی تلفن"
                                        value={advancedFilters.search}
                                        onChange={(e) => {
                                            setAdvancedFilters({ ...advancedFilters, search: e.target.value })
                                        }}
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

                        <table className="forms-table">
                            <thead>
                                <tr>
                                    <th className="table-header">نام</th>
                                    <th className="table-header">PREMM5</th>
                                    <th className="table-header">GAIL(6 years)</th>
                                    <th className="table-header">BCRA</th>
                                    <th className="table-header">PLCO</th>
                                    <th className="table-header">CCRAT</th>
                                    <th className="table-header">کد ملی</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((form, index) => (
                                    <tr key={form.id || index} className="form-row">
                                        <td className="table-cell MR">{form.name || "نامشخص"}</td>
                                        <td className="table-cell MR">{risks[form.id]?.premm5 ? JSON.stringify(risks[form.id].premm5) : 'در حال بارگذاری...'}</td>
                                        <td className="table-cell MR">{risks[form.id]?.gail ? JSON.stringify(risks[form.id].gail) : 'در حال بارگذاری...'}</td>
                                        <td className="table-cell MR">{risks[form.id]?.bcra ? JSON.stringify(risks[form.id].bcra) : 'در حال بارگذاری...'}</td>
                                        <td className="table-cell MR">{risks[form.id]?.plco ? JSON.stringify(risks[form.id].plco) : 'در حال بارگذاری...'}</td>
                                        <td className="table-cell MR">{risks[form.id]?.ccrat ? JSON.stringify(risks[form.id].ccrat) : 'در حال بارگذاری...'}</td>
                                        <td className="table-cell MR">{form.socialSecurityNumber || "نامشخص"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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