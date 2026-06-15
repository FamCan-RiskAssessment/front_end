import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { APIURL } from "../utils/config";
import { fetchDataGET, fetchDataDELETE, formTypeChecker, statusChecker, fetchDataPUT, fetchDataGETNoError } from "../utils/tools";
import {
  canAccessDashboard,
  canCreateFormForUser,
} from "../utils/permissions";
import UQs from '../utils/utilQs.json'
import "../client_forms.css"
import ToastProvider from "../toaster";
import { useToast } from "../toaster";
import plusSign from '../V2Form/plus.svg'
import plusWSign from '../V2Form/plusW.svg'
import leftSign from '../V2Form/form_left.png'
import rightSign from '../V2Form/form_right.png'
import prevSign from '../V2Form/arrow_right.svg'
import homeSign from '../V2Form/home.svg'
import panelSign from '../V2Form/panelSign.svg'
import eyeSign from '../V2Form/view.svg'
import settingsSign from '../V2Form/settings.svg'
import deleteSign from '../V2Form/trashCan.svg'
import subSign from '../V2Form/checkSub.svg'
import restoreSign from '../V2Form/restore.svg'
import fileUplode from '../V2Form/files.svg'
import waitSign from '../V2Form/timer.png'
import checkFull from '../V2Form/checkfull.png'
import magnifier from '../V2Form/magnifier.svg'



function FormsPage() {
  const [forms, setForms] = useState([]);
  const [deletedForm, setDeletedForm] = useState(0)
  const [openModalConf, setOpenModalConf] = useState(false)
  const [selectedForm, setSelectedForm] = useState(0)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [perms, setPerms] = useState([])
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [page, setPage] = useState(1)
  const [pagiPrev, setPagiPrev] = useState(false)
  const [PagiNext, setPagiNext] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [opOpts, setOpOpts] = useState(false)

  // State for advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    sortBy: '',
    sortOrder: '',
    search: '',
  });
  const [tempSearch, setTempSearch] = useState(''); // Temporary storage for search input

  const nextPage = () => {
    if (PagiNext)
      setPage(p => p + 1)

  }
  const prevPage = () => {
    if (pagiPrev)
      setPage(p => p - 1)
  }


  const { addToast } = useToast()
  console.log(forms)

  const lineMaker = (total_page) => {
    let spans = []
    for (let i = 0; i < total_page; i++) {
      spans.push(i)
    }
    return spans
  }

  // Function to build endpoint based on filters
  const buildEndpoint = (currentPage, filters) => {
    let endpoint = 'form';

    // Build query parameters
    const queryParams = [];

    // Add pagination
    queryParams.push(`page=${currentPage}`);

    // Add sorting and search filters
    if (filters.sortBy) queryParams.push(`sortBy=${filters.sortBy}`);
    if (filters.sortOrder) queryParams.push(`sortOrder=${filters.sortOrder}`);
    if (filters.search) queryParams.push(`search=${filters.search}`);

    // Join query parameters with '&'
    const queryString = queryParams.join('&');
    return `form?${queryString}`;
  };

  const applyFilters = () => {
    // Update the main search filter with the temporary value
    setAdvancedFilters(prev => ({
      ...prev,
      search: tempSearch
    }));
    setPage(1); // Reset to first page when applying filters
  };


  // user info
  useEffect(() => {
    const permissions = JSON.parse(localStorage.getItem("permissions") || "[]")
    setPerms(permissions)
    setShowAdminPanel(canAccessDashboard(permissions))
  }, [])


  const deleteForm = async (form_id) => {
    let token = localStorage.getItem("token")
    let res = await fetchDataDELETE(`form/${form_id}`, token)
    if (res.status == 200) {
      addToast({
        title: res.message,
        type: 'success',
        duration: 4000
      })
      setDeletedForm(form_id)
    }
  }

  // 🔹 fetch user's forms on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    // Build endpoint with filters
    const endpoint = buildEndpoint(page, advancedFilters);

    fetch(`${APIURL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ token auth
      },
    })
      .then((res) => res.json())
      .then((json) => {
        // console.log("fucking data : " , json)
        setForms(json.data.data || []); // assuming API returns { data: [...] }
        setDeletedForm(0)
        setPagiPrev(json.data.pagination.hasPrevPage)
        setPagiNext(json.data.pagination.hasNextPage)
        setPageCount(json.data.pagination.totalPages)
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching forms:", err);
        setLoading(false);
      });
  }, [deletedForm, page, advancedFilters]);
  // how to pass the form
  const userSelectedForm = async (form_id) => {
    const token = localStorage.getItem("token");
    let APIARR = [
      "basic",
      "cancer",
      "familycancer",
      "contact",
      "navid"
    ];

    try {
      setLoading(true);

      // Wait for all fetch requests to complete
      let TrueSteps = [];
      const results = await Promise.all(
        APIARR.map(async (ar, index) => {
          const res = await fetch(`${APIURL}/form/${form_id}/${ar}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            localStorage.setItem("imperfectForm", true)
            TrueSteps.push(false)
          } else {
            localStorage.setItem("imperfectForm", false)
            console.log("*********************************************", res)
            TrueSteps.push(true)
          }
          const json = await res.json();
          return json.data;
        })
      );

      // Merge all form data into one object
      let form_data = {};
      results.forEach(data => {
        Object.assign(form_data, data);
      });

      // Save after all fetches complete
      localStorage.setItem("form_data", JSON.stringify(form_data));
      localStorage.setItem("form_id", form_id);
      localStorage.setItem("trueSteps", JSON.stringify(TrueSteps))
      console.log("✅ All stages fetched:", results);
      navigate("/formsNavid/new");
    } catch (err) {
      console.error("Error fetching forms:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleAddNew = () => {
    localStorage.setItem("form_data", null)
    localStorage.setItem("form_id", null)
    localStorage.setItem("operatorUserId", null)
    localStorage.setItem("userNeededAdress", null)
    navigate("/formsNavid/new"); // redirect to form creation page
  };

  const handleAddNewForPatient = () => {
    navigate("/operator/userMobile")
  }

  const checkNewUser = async () => {
    let token = localStorage.getItem("token")
    let res = await fetchDataGETNoError("admin/profile", token)
    if (res.status == 404) {
      navigate("/residentEnter")
    } else if (res.status == 200 || res.status == 201) {
      navigate("/Dashboard")
    }
    // else if (role == "سوپر ادمین") {
    //   navigate("/Dashboard")
    // }
    console.log("]]]]]]]]]]]]]]]]]] : ", res)
  }


  if (loading) return <p className="text-center mt-10">Loading forms...</p>;

  return (
    <>
      {/* <div className="dashboard_btns">
        {role != "بیمار" ? (<button className="btn_submit place_independently" onClick={() => {
          navigate('/DashBoard', { state: { permissions: perms } })
        }}>ورود به پنل</button>) : null}
        <button className="btn_submit spider" onClick={() => navigate("/login")}>خروج</button>
      </div> */}
      <div className="forms_page_holder">
        <div
          className="help_bar_container"
        >
          <div className="help_bar_parts_container">
            <div className="help_bar_part1">
              <img src={prevSign} alt="arrow_img" />
              <span onClick={() => navigate("/")}>خروج</span>
            </div>
            <h3 className="forms-title">لیست فرم‌های شما</h3>
            <div className="help_bar_part3">
              {showAdminPanel ? (
                <button className="btn-view-form top align_items" onClick={() => checkNewUser()}>
                  <span>پنل کاربری</span>
                  <img src={panelSign} alt="home" />
                </button>
              ) : null}

            </div>
          </div>
        </div>
        <div className="forms-page-wrapper FM">

          <div className="forms-container">
            <div className="forms_tools">
              <div className="form_tool">
                <div className="form_search_bar">
                  <input
                    type="text"
                    className="form_search inp_question V2"
                    placeholder="جستجو"
                    value={tempSearch}
                    onChange={(e) => setTempSearch(e.target.value)}
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
                  <select
                    value={advancedFilters.sortOrder}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, sortOrder: e.target.value })}
                    className="select_optionsV2"
                  >
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
              <div className="form_tool2">
                <button className="btn-add-newV2" onClick={handleAddNew}>
                  <span>فرم جدید</span>
                  <span className="add_sign">
                    <img src={plusWSign} alt="علامت جمع" />
                  </span>

                </button>
              </div>
            </div>

            {forms.length === 0 && !formTypeChecker(forms, 2) ? (
              <p className="no-forms-text">فرمی ثبت نشده است.</p>
            ) : (
              <table className="forms-table">
                <thead>
                  <tr>
                    <th className="table-header">ردیف</th>
                    <th className="table-header">شماره ملی</th>
                    <th className="table-header">نام</th>
                    <th className="table-header">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form, index) => {
                    if (form.formType == 2) {
                      return (
                        <tr key={form.id} className="form-row">
                          <td className="table-cell FM">{index + 1}</td>
                          <td className="table-cell FM">{form.socialSecurityNumber}</td>
                          <td className="table-cell FM">{form.name}</td>
                          <td className="table-cell FM">
                            <div className="btn_formPage_holder">
                              <button
                                className="btn-view-form"
                                onClick={async () => {
                                  if (statusChecker(form.status) == 5) {
                                    let token = localStorage.getItem("token")
                                    let res = await fetchDataPUT(`form/${form.id}/resubmit`, token, {})
                                  }
                                  if (form.filledForms.familycancer) {
                                    localStorage.setItem("famcanFilled", JSON.stringify(true))
                                  } else {
                                    localStorage.setItem("famcanFilled", JSON.stringify(false))
                                  }
                                  if (form.filledForms.cancer) {
                                    localStorage.setItem("selfcanFilled", JSON.stringify(true))
                                  } else {
                                    localStorage.setItem("selfcanFilled", JSON.stringify(false))
                                  }
                                  userSelectedForm(form.id)
                                }}
                                disabled={statusChecker(form.status) == 1 || statusChecker(form.status) == 4 || statusChecker(form.status) == 5 ? null : true}
                              >

                                {(() => {
                                  let checkedSt = statusChecker(form.status)
                                  if (checkedSt == 1) {
                                    return (
                                      <img src={eyeSign} alt="eye Sign" />
                                    )
                                  } else if (checkedSt == 2) {
                                    return (
                                      <img src={subSign} alt="submitted" title="فرم در انتظار تایید است لطفا منتظر بمانید" />
                                    )
                                  } else if (checkedSt == 5) {
                                    return (
                                      <img src={restoreSign} alt="submitted" title="فرم شما رد شده است لطفا دوباره فرم خود را بفرستید" />
                                    )
                                  } else if (checkedSt == 4) {
                                    return (
                                      <img src={fileUplode} alt="submitted" title="فایل های لازم را آپلود کرده و سپس فرم را دوباره بفرستید" />
                                    )
                                  } else if (checkedSt == 3) {
                                    return (
                                      <img src={waitSign} alt="waitSign" title="فرم شما در دست بررسی است ، کارشناسان در حال ارتباط گرفتن با شما هستند لطفا منتظر بمانید" />
                                    )
                                  } else if (checkedSt == 6 || checkedSt == 7) {
                                    return (
                                      <img src={checkFull} alt="submitted success" title="فرم شما تایید شد ، از مشارکت شما متشکریم " />
                                    )
                                  }
                                })()}
                              </button>
                              {/* <div className="setting_holder"> */}
                              {/* <img src={settingsSign} alt="form settings" /> */}
                              {/* {opOpts && ( */}
                              {/* <div className="settings"> */}
                              <button className="btn-view-form" onClick={() => {
                                setOpenModalConf(true)
                                setSelectedForm(form.id)
                              }}>
                                <img src={deleteSign} alt="form delete" />
                              </button>
                              {/* </div> */}
                              {/* // )} */}
                              {/* </div> */}
                            </div>
                          </td>
                        </tr>
                      )
                    }
                    return null;
                  })}
                </tbody>
              </table>
            )}
            <div className="page_naver">
              <div className="total_pages">
                <span>تعداد صفحات {pageCount}</span>
              </div>
              <div className="page_line">
                <img src={rightSign} className="arrows" alt="rightSign" onClick={() => setPage(a => a - 1)} />
                {lineMaker(pageCount).map((p, index) => {
                  return (
                    <span className="page_num" style={page == p + 1 ? { background: "#eee", } : null} onClick={() => setPage(p + 1)}>
                      {p + 1}
                    </span>
                  )
                })}
                <img src={leftSign} alt="leftSign" className="arrows" onClick={() => setPage(a => a + 1)} />

              </div>
            </div>
            <div className="add-new-wrapper">

              {canCreateFormForUser() ?
                <button className="btn-add-new-oprator" onClick={handleAddNewForPatient}>
                  فرم جدید برای کاربر دیگر
                </button>
                :
                null
              }

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
      {openModalConf && (
        <div className="role_modal QPage">
          <div className="modal_header">
            <h3>آیا می خواهید فرم را حذف کنید ؟ </h3>
            <div className="modal_close" onClick={() => {
              setOpenModalConf(false)
            }}>
              <span>
                ✕
              </span>
            </div>
          </div>
          <div className="roles Modal">
            <button className="btn-add-new" onClick={() => {
              deleteForm(selectedForm)
              setOpenModalConf(false)
            }}>بلی</button>
            <button className="delete_btn2" onClick={() => setOpenModalConf(false)}>خیر</button>
          </div>
        </div>
      )}

    </>
  );
}

export default FormsPage;
