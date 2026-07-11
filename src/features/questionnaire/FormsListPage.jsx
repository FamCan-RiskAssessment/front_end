import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { APIURL } from "../../utils/config";
import { fetchDataDELETE, formTypeChecker, statusChecker, fetchDataPUT, fetchDataGETNoError } from "../../utils/tools";
import {
  canAccessDashboard,
  canCreateFormForUser,
} from "../../utils/permissions";
import "../../client_forms.css"
import { useToast } from "../../toaster";
import plusWSign from '../../V2Form/plusW.svg'
import leftSign from '../../V2Form/form_left.png'
import rightSign from '../../V2Form/form_right.png'
import prevSign from '../../V2Form/arrow_right.svg'
import panelSign from '../../V2Form/panelSign.svg'
import eyeSign from '../../V2Form/view.svg'
import deleteSign from '../../V2Form/trashCan.svg'
import subSign from '../../V2Form/checkSub.svg'
import restoreSign from '../../V2Form/restore.svg'
import fileUplode from '../../V2Form/files.svg'
import waitSign from '../../V2Form/timer.png'
import checkFull from '../../V2Form/checkfull.png'
import magnifier from '../../V2Form/magnifier.svg'
import Loader from "../../utils/loader";

/**
 * The Bahar and Navid forms-list pages were ~95% identical forks; every
 * behavioral difference between them lives in this variant table.
 *
 * - formType: which rows of GET /form belong to this flow
 * - loadParts: form sections fetched into the draft before editing
 *   (GET paths differ from PUT submit paths — cancerVisit / familycancerVisit
 *   are write-only on this API)
 * - newFormRoute: the questionnaire page for this flow
 * - cancerFlagsVia: how "already filled cancer sections" reaches the
 *   questionnaire — Bahar passes navigate() state (SCAPP/FCAPP), Navid
 *   writes the famcanFilled/selfcanFilled localStorage flags
 * - loadingFallback / modal classes: visual differences kept as-is
 */
const VARIANTS = {
  bahar: {
    formType: 1,
    loadParts: ["basic", "generalhealth", "mamography", "cancer", "listfamilycancer", "lungcancer", "contact"],
    newFormRoute: "/forms/new",
    cancerFlagsVia: "state",
    loadingFallback: <Loader></Loader>,
    modalClass: "role_modal",
    modalActionsClass: "roles Modal deleteModal",
  },
  navid: {
    formType: 2,
    loadParts: ["basic", "cancer", "familycancer", "contact", "navid"],
    newFormRoute: "/formsNavid/new",
    cancerFlagsVia: "storage",
    loadingFallback: <p className="text-center mt-10">Loading forms...</p>,
    modalClass: "role_modal QPage",
    modalActionsClass: "roles Modal",
  },
};

function FormsListPage({ variant = "bahar" }) {
  const cfg = VARIANTS[variant];
  const [forms, setForms] = useState([]);
  const [deletedForm, setDeletedForm] = useState(0)
  const [openModalConf, setOpenModalConf] = useState(false)
  const [selectedForm, setSelectedForm] = useState(0)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [page, setPage] = useState(1)
  const [pagiPrev, setPagiPrev] = useState(false)
  const [PagiNext, setPagiNext] = useState(false)
  const [pageCount, setPageCount] = useState(0)

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

  const lineMaker = (total_page) => {
    let spans = []
    for (let i = 0; i < total_page; i++) {
      spans.push(i)
    }
    return spans
  }

  // Function to build endpoint based on filters
  const buildEndpoint = (currentPage, filters) => {
    const queryParams = [];
    queryParams.push(`page=${currentPage}`);
    if (filters.sortBy) queryParams.push(`sortBy=${filters.sortBy}`);
    if (filters.sortOrder) queryParams.push(`sortOrder=${filters.sortOrder}`);
    if (filters.search) queryParams.push(`search=${filters.search}`);
    return `form?${queryParams.join('&')}`;
  };

  const applyFilters = () => {
    setAdvancedFilters(prev => ({
      ...prev,
      search: tempSearch
    }));
    setPage(1); // Reset to first page when applying filters
  };

  // user info
  useEffect(() => {
    const permissions = JSON.parse(localStorage.getItem("permissions") || "[]")
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

  // fetch user's forms on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const endpoint = buildEndpoint(page, advancedFilters);

    fetch(`${APIURL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        setForms(json.data.data || []);
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

  /** Load every section of an existing form into the draft, then open the questionnaire. */
  const userSelectedForm = async (form_id, selfCanAPP, famCanAPP) => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      let TrueSteps = [];
      let anyFailed = false;
      const results = await Promise.all(
        cfg.loadParts.map(async (ar) => {
          try {
            const res = await fetch(`${APIURL}/form/${form_id}/${ar}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              anyFailed = true;
              TrueSteps.push(false);
              return {};
            }

            const json = await res.json();
            TrueSteps.push(true);
            return json?.data && typeof json.data === "object" ? json.data : {};
          } catch (sectionErr) {
            console.warn(`Form section fetch failed (${ar}):`, sectionErr);
            anyFailed = true;
            TrueSteps.push(false);
            return {};
          }
        })
      );

      localStorage.setItem("imperfectForm", anyFailed ? "true" : "false");

      const form_data = {};
      results.forEach((data) => {
        if (data && typeof data === "object") {
          Object.assign(form_data, data);
        }
      });

      localStorage.setItem("form_data", JSON.stringify(form_data));
      localStorage.setItem("form_id", form_id);
      localStorage.setItem("trueSteps", JSON.stringify(TrueSteps));
      if (cfg.cancerFlagsVia === "state") {
        navigate(cfg.newFormRoute, {
          state: {
            SCAPP: selfCanAPP,
            FCAPP: famCanAPP,
          },
        });
      } else {
        navigate(cfg.newFormRoute);
      }
    } catch (err) {
      console.error("Error fetching forms:", err);
      addToast({
        title: "خطا در بارگذاری فرم. دوباره تلاش کنید.",
        type: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    localStorage.setItem("form_data", null)
    localStorage.setItem("form_id", null)
    localStorage.setItem("operatorUserId", null)
    localStorage.setItem("userNeededAdress", null)
    navigate(cfg.newFormRoute); // redirect to form creation page
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
  }

  /** Row click: mark which cancer sections are already filled, then load the form. */
  const openForm = async (form) => {
    if (statusChecker(form.status) == 5) {
      let token = localStorage.getItem("token")
      await fetchDataPUT(`form/${form.id}/resubmit`, token, {})
    }
    const famcanIn = Boolean(form.filledForms.familycancer);
    const selfcanIn = Boolean(form.filledForms.cancer);
    if (cfg.cancerFlagsVia === "storage") {
      localStorage.setItem("famcanFilled", JSON.stringify(famcanIn))
      localStorage.setItem("selfcanFilled", JSON.stringify(selfcanIn))
    }
    userSelectedForm(form.id, selfcanIn, famcanIn)
  }

  if (loading) return cfg.loadingFallback;

  return (
    <>
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

            {forms.length === 0 && !formTypeChecker(forms, cfg.formType) ? (
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
                    if (form.formType == cfg.formType) {
                      return (
                        <tr key={form.id} className="form-row">
                          <td className="table-cell FM">{index + 1}</td>
                          <td className="table-cell FM">{form.socialSecurityNumber}</td>
                          <td className="table-cell FM">{form.name}</td>
                          <td className="table-cell FM">
                            <div className="btn_formPage_holder">
                              <button
                                className="btn-view-form"
                                onClick={() => openForm(form)}
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
                              <button className="btn-view-form" onClick={() => {
                                setOpenModalConf(true)
                                setSelectedForm(form.id)
                              }}>
                                <img src={deleteSign} alt="form delete" />
                              </button>
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
                {lineMaker(pageCount).map((p) => {
                  return (
                    <span key={p} className="page_num" style={page == p + 1 ? { background: "#eee", } : null} onClick={() => setPage(p + 1)}>
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
        <div className={cfg.modalClass}>
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
          <div className={cfg.modalActionsClass}>
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

export default FormsListPage;
