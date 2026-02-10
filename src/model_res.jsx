import { useState, useEffect } from "react";
import './model_res.css';
import NavBar from './navBar';
import { useLocation } from "react-router-dom";
import { APIARR } from "./utils/config";
import { fetchDataGET } from "./utils/tools";
import Loader from "./utils/loader";

const ModelResults = () => {
    const location = useLocation();
    const userPhone = location.state?.phone;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagiPrev, setPagiPrev] = useState(false);
    const [pagiNext, setPagiNext] = useState(false);
    const [risks, setRisks] = useState({});
    console.log("here is the format : ", data)
    // Function to fetch all forms with pagination
    useEffect(() => {
        const fetchFormIds = async () => {
            let pre_forms = null;
            let token = localStorage.getItem("token");
            let role = JSON.parse(localStorage.getItem("roles"));
            console.log("check the name : ", role[0]);

            // Fetch forms with pagination
            pre_forms = await fetchDataGET(`admin/form?page=${page}&pageSize=10`, token);

            console.log("here is the filter : ", pre_forms);
            setPagiNext(pre_forms.data.pagination.hasNextPage);
            setPagiPrev(pre_forms.data.pagination.hasPrevPage);

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
    }, [page]);

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
                    [model_name]: "ریسک مورد نظر یافت نشد"
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

    if (loading) {
        return <Loader></Loader>;
    }

    return (
        <>
            <NavBar account={userPhone}></NavBar>
            <div className="page-holder">
                <h2 className="model_results_title">نتایج مدل‌های ریسک سنجی</h2>
                <div className="model_results_container">
                    <table className="results_table">
                        <thead>
                            <tr>
                                <th>نام</th>
                                <th>PREMM5</th>
                                <th>GAIL(6 years)</th>
                                <th>BCRA</th>
                                <th>PLCO</th>
                                <th>CCRAT</th>
                                <th>کد ملی</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((form, index) => (
                                <tr key={form.id || index}>
                                    <td>{form.name || "نامشخص"}</td>
                                    <td>{risks[form.id]?.premm5 ? JSON.stringify(risks[form.id].premm5) : 'در حال بارگذاری...'}</td>
                                    <td>{risks[form.id]?.gail ? JSON.stringify(risks[form.id].gail) : 'در حال بارگذاری...'}</td>
                                    <td>{risks[form.id]?.bcra ? JSON.stringify(risks[form.id].bcra) : 'در حال بارگذاری...'}</td>
                                    <td>{risks[form.id]?.plco ? JSON.stringify(risks[form.id].plco) : 'در حال بارگذاری...'}</td>
                                    <td>{risks[form.id]?.ccrat ? JSON.stringify(risks[form.id].ccrat) : 'در حال بارگذاری...'}</td>
                                    <td>{form.socialSecurityNumber || "نامشخص"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="btn_holder_next_prev juster">
                    <button className="btn_submit space-UD" onClick={showPrev}>صفحه ی قبلی</button>
                    <button className="btn_submit space-UD" onClick={showMore}>صفحه ی بعدی</button>
                </div>
            </div>
        </>
    );
};

export default ModelResults;