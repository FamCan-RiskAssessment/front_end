import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { APIURL, formStatusLabels, stateColors } from "./utils/config";
import { fetchDataGET, fetchDataPUT, form_ids_finder, getKeyVal } from "./utils/tools";
import "./client_forms.css";
import "./supervisor.css";
import NavBar from "./navBar";
import ToastProvider from "./toaster";
import { useToast } from "./toaster";
import leftSign from './V2Form/form_left.png';
import rightSign from './V2Form/form_right.png';
import prevSign from './V2Form/arrow_right.svg';
import settingsSign from './V2Form/settings.svg';
import roleAssignSign from './V2Form/roleAssign.svg';
import magnifier from './V2Form/magnifier.svg'


function SupervisorPage() {
    const [formInfos, setFormInfos] = useState({});
    const [OPRoleId, setOPRoleId] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [OPArr, setOPArr] = useState([]);
    const [filteredOPArr, setFilteredOPArr] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFormId, setSelectedFormId] = useState(0);
    const [changedOPId, setChangedOPId] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [pagiPrev, setPagiPrev] = useState(false);
    const [pagiNext, setPagiNext] = useState(false);
    const [pageCount, setPageCount] = useState(0);

    // State for advanced filters
    const [advancedFilters, setAdvancedFilters] = useState({
        sortBy: '',
        sortOrder: '',
        search: '',
    });
    const [tempSearch, setTempSearch] = useState(''); // Temporary storage for search input
    const navigate = useNavigate();
    const { addToast } = useToast();
    let userPhone = localStorage.getItem("number");
    console.log(formInfos)
    const lineMaker = (total_page) => {
        let spans = [];
        for (let i = 0; i < total_page; i++) {
            spans.push(i);
        }
        return spans;
    };

    const nextPage = () => {
        if (pagiNext) setPage(p => p + 1);
    };

    const prevPage = () => {
        if (pagiPrev) setPage(p => p - 1);
    };

    // Function to build endpoint based on filters
    const buildEndpoint = (currentPage, filters) => {
        let endpoint = 'admin/form';

        // Build query parameters
        const queryParams = [];

        // Add pagination
        queryParams.push(`page=${currentPage}`);
        queryParams.push('pageSize=10'); // Keep pageSize consistent

        // Add sorting and search filters
        if (filters.sortBy) queryParams.push(`sortBy=${filters.sortBy}`);
        if (filters.sortOrder) queryParams.push(`sortOrder=${filters.sortOrder}`);
        if (filters.search) queryParams.push(`search=${filters.search}`);

        // Join query parameters with '&'
        const queryString = queryParams.join('&');
        return `admin/form?${queryString}`;
    };

    // Fetch forms
    useEffect(() => {
        let token = localStorage.getItem("token");
        const get_forms = async () => {
            try {
                // Build endpoint with filters
                const endpoint = buildEndpoint(page, advancedFilters);

                let data = await fetchDataGET(endpoint, token);
                console.log("this is the data : ", data);
                setPagiNext(data.data.pagination.hasNextPage);
                setPagiPrev(data.data.pagination.hasPrevPage);
                setPageCount(data.data.pagination.totalPages);

                let form_ids = form_ids_finder(data.data.data);
                console.log("this is the form_ids : ", form_ids);
                setFormInfos(form_ids);
            } catch (error) {
                console.error("Error fetching forms:", error);
            } finally {
                setLoading(false);
            }
        };

        // Fetch data when any of these dependencies change
        setLoading(true);
        get_forms();
    }, [changedOPId, page, advancedFilters]); // Include all advancedFilters in dependency array

    // Get operator role ID
    useEffect(() => {
        let token = localStorage.getItem("token");
        const OPRoleIdFetch = async () => {
            try {
                let fetched = await fetchDataGET("admin/role", token);
                fetched.data.forEach(fd => {
                    if (fd.name == "اپراتور") {
                        setOPRoleId(fd.id);
                    }
                });
            } catch (error) {
                console.error("Error fetching role:", error);
            }
        };
        OPRoleIdFetch();
    }, []);

    const openOpers = async (form_id) => {
        setOpenModal(true);
        let token = localStorage.getItem("token");
        let fetchedOps = await fetchDataGET(`admin/role/${OPRoleId}/owners`, token);
        setOPArr(fetchedOps.data);
        setFilteredOPArr(fetchedOps.data); // Initially show all operators
        setSearchTerm(""); // Reset search term when opening modal
        console.log("this is form_id : ", form_id);
        setSelectedFormId(form_id);
    };

    // Function to handle search input changes
    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        // Filter operators based on search term
        const filtered = OPArr.filter(op => {
            const phoneMatch = op.phone && op.phone.toLowerCase().includes(value.toLowerCase());
            const idMatch = op.id && op.id.toString().includes(value);
            const lastNameMatch = (op.lastName || op.last_name) && (op.lastName || op.last_name).toLowerCase().includes(value.toLowerCase());

            return phoneMatch || idMatch || lastNameMatch;
        });

        setFilteredOPArr(filtered);
    };

    const changeTheOper = async (OA) => {
        setOpenModal(false);
        let token = localStorage.getItem("token");
        let payload = {
            operatorId: OA.id
        };
        let Opchange = await fetchDataPUT(`admin/form/${selectedFormId}/operator`, token, payload);
        setChangedOPId(OA.id);
        if (Opchange.status == 200) {
            addToast({
                title: Opchange.message,
                type: 'success',
                duration: 4000
            });
            console.log(Opchange);
        }
    };

    const applyFilters = () => {
        // Update the main search filter with the temporary value
        setAdvancedFilters(prev => ({
            ...prev,
            search: tempSearch
        }));
        setPage(1); // Reset to first page when applying filters
    };

    if (loading) return <p className="text-center mt-10">Loading forms...</p>;

    return (
        <>
            <div className="forms_page_holder">
                <NavBar account={userPhone}></NavBar>

                <div className="forms-page-wrapper">
                    <div className="forms-container">
                        <div className="forms_tools">
                            <div className="form_tool">
                                <div className="form_search_bar">
                                    <input
                                        type="text"
                                        className="form_search inp_question V2"
                                        placeholder="جستجو"
                                        value={tempSearch}
                                        onChange={(e) => {
                                            setTempSearch(e.target.value)
                                        }}
                                    />
                                </div>
                                <button className="magnifier" onClick={applyFilters}>
                                    <span>
                                        <img src={magnifier} alt="search" />
                                    </span>
                                </button>
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

                        {Object.keys(formInfos).length === 0 ? (
                            <p className="no-forms-text">فرمی یافت نشد.</p>
                        ) : (
                            <table className="forms-table">
                                <thead>
                                    <tr>
                                        <th className="table-header SP">شناسه فرم</th>
                                        <th className="table-header SP">اپراتور</th>
                                        <th className="table-header SP">وضعیت</th>
                                        <th className="table-header SP">عملیات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(formInfos).map((formId, index) => {
                                        const formInfo = formInfos[formId];
                                        const statusText = formInfo.status || 'نامشخص';
                                        const statusColor = stateColors[getKeyVal(formStatusLabels, formInfo.status)] || '#e0e0e0';

                                        return (
                                            <tr key={formId} className="form-row">
                                                <td className="table-cell SP">{formId}</td>
                                                <td className="table-cell SP">{formInfo.operatorId ? formInfo.operatorId : "-"}</td>
                                                <td className="table-cell SP">
                                                    <span
                                                        style={{
                                                            backgroundColor: statusColor, color: 'white', fontWeight: 'bold', textAlign: 'center'
                                                        }}
                                                        className="statusInTable"
                                                    >
                                                        {statusText}
                                                    </span>
                                                </td>
                                                <td className="table-cell SP">
                                                    <div className="btn_formPage_holder SP">
                                                        <button
                                                            className="btn-view-form"
                                                            onClick={() => openOpers(formId)}
                                                        >
                                                            <img src={roleAssignSign} alt="change operator" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
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
                                <button className="btn_submit space-UD" onClick={prevPage}>صفحه ی قبلی</button>
                                <button className="btn_submit space-UD" onClick={nextPage}>صفحه ی بعدی</button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {openModal && (
                <div className="role_modal">
                    <div className="modal_header">
                        <h3>انتخاب اپراتور جدید</h3>
                        <div className="modal_close" onClick={() => setOpenModal(false)}>
                            <span>
                                ✕
                            </span>
                        </div>
                    </div>
                    <div className="search-bar-container" style={{ padding: '1rem' }}>
                        <label htmlFor="userSearch">
                            جستجو بر اساس نام خانوادگی،شماره تلفن یا شناسه
                        </label>
                        <input
                            type="text"
                            className="form_search inp_question V2"
                            placeholder="جستجو"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            name="userSearch"
                        />
                    </div>
                    <div className="roles">
                        <table className="forms-table">
                            <thead>
                                <tr>
                                    <th className="table-header">شناسه</th>
                                    <th className="table-header">نام</th>
                                    <th className="table-header">نام خانوادگی</th>
                                    <th className="table-header">شماره تلفن</th>
                                    <th className="table-header">کد ملی</th>
                                    <th className="table-header">مرکز</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOPArr.map((OA, index) => (
                                    <tr
                                        key={index}
                                        className="form-row"
                                        onClick={() => changeTheOper(OA)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className="table-cell">{OA.id || '-'}</td>
                                        <td className="table-cell">{OA.firstName || OA.first_name || '-'}</td>
                                        <td className="table-cell">{OA.lastName || OA.last_name || '-'}</td>
                                        <td className="table-cell">{OA.phone || '-'}</td>
                                        <td className="table-cell">{OA.nationalId || OA.socialSecurityNumber || OA.national_id || '-'}</td>
                                        <td className="table-cell">{OA.center || OA.workCenter || OA.work_center || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredOPArr.length === 0 && searchTerm !== "" && (
                            <div className="no-results-message" style={{ textAlign: 'center', padding: '1rem', color: '#7a4ca0' }}>
                                هیچ نتیجه‌ای یافت نشد
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default SupervisorPage;