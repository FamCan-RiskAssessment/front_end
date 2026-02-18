import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { APIURL } from "../utils/config";
import { permExtractor, fetchDataGET, fetchDataDELETE, formTypeChecker } from "../utils/tools";
import "./client_formsNavid.css"
import ToastProvider from "../toaster";
import { useToast } from "../toaster";
import plusSign from '../V2Form/plus.svg'
import leftSign from '../V2Form/form_left.png'
import rightSign from '../V2Form/form_right.png'
import prevSign from '../V2Form/arrow_right.svg'
import homeSign from '../V2Form/home.svg'
import panelSign from '../V2Form/panelSign.svg'
import eyeSign from '../V2Form/view.svg'
import settingsSign from '../V2Form/settings.svg'
import deleteSign from '../V2Form/trashCan.svg'
function FormsPageNavid() {
  const [forms, setForms] = useState([]);
  const [deletedForm, setDeletedForm] = useState(0)
  const [openModalConf, setOpenModalConf] = useState(false)
  const [selectedForm, setSelectedForm] = useState(0)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [perms, setPerms] = useState([])
  const [role, setRole] = useState("")
  const [page, setPage] = useState(1)
  const [pagiPrev, setPagiPrev] = useState(false)
  const [PagiNext, setPagiNext] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  console.log(";;;;;;;;;;;;;;;;;;;;;;;;;;; : ", formTypeChecker(forms, 1))
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

  // user info
  useEffect(() => {
    let permissions = JSON.parse(localStorage.getItem("permissions"))
    setPerms(permissions)
    let role = JSON.parse(localStorage.getItem("roles"))
    setRole(role[0].name)
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
    fetch(`${APIURL}/form?page=${page}`, {
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
  }, [deletedForm, page]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${APIURL}/form?page=${page}`, {
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
        setPagiPrev(json.data.pagination.hasPrevPage)
        setPagiNext(json.data.pagination.hasNextPage)
        setPageCount(json.data.pagination.totalPages)
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching forms:", err);
        setLoading(false);
      });
  }, [page]);
  // how to pass the form
  const userSelectedForm = async (form_id) => {
    const token = localStorage.getItem("token");
    let APIARR = [
      "basic",
      "cancer",
      "familycancer",
      "navid",
      "contact"
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
            <div className="help_bar_part3" onClick={() => setOpenModalConf(true)}>
              {role != "بیمار" ? (
                <button className="btn-view-form top align_items" onClick={() => navigate("/Dashboard")}>
                  <span>پنل کاربری</span>
                  <img src={panelSign} alt="home" />
                </button>
              ) : null}

            </div>
          </div>
        </div>
        <div className="forms-page-wrapper">

          <div className="forms-container">
            <div className="forms_tools">
              <div className="form_tool">
                <div className="form_search_bar">
                  {/* <InputBoxV2 data={UQs.fromSearch}></InputBoxV2> */}
                  <input type="text" className="form_search inp_question V2" placeholder="جستجو" />
                </div>
                <div className="sorter">
                  {/* <OptionsV2 data={UQs.formSort}></OptionsV2> */}
                  <select name="formSort" id="" className="select_optionsV2">
                    <option value="انتخاب کنید">انتخاب کنید</option>
                    <option value="قدیمی ترین">قدیمی ترین</option>
                    <option value="جدید ترین">جدید ترین</option>

                  </select>
                </div>
              </div>
              <div className="form_tool2">
                <button className="btn-add-newV2" onClick={handleAddNew}>
                  <span>فرم جدید</span>
                  <span className="add_sign">
                    <img src={plusSign} alt="علامت جمع" />
                  </span>

                </button>
              </div>
            </div>

            {!formTypeChecker(forms, 2) ? (
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
                    console.log("########################### : ", form.formType)
                    if (form.formType == 2) {
                      return (
                        <tr key={form.id} className="form-row">
                          <td className="table-cell">{index + 1}</td>
                          <td className="table-cell">{form.socialSecurityNumber}</td>
                          <td className="table-cell">{form.name}</td>
                          <td className="table-cell">
                            <div className="btn_formPage_holder">
                              <button
                                className="btn-view-form"
                                onClick={() => userSelectedForm(form.id)}
                              >
                                <img src={eyeSign} alt="view form" />
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

            {formTypeChecker(forms, 2) && (<div className="page_naver">
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
            )}
            <div className="add-new-wrapper">

              {JSON.parse(localStorage.getItem("roles"))[0].id == 3 ?
                <button className="btn-add-new-oprator" onClick={handleAddNewForPatient}>
                  فرم جدید برای بیمار
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
        <div className="role_modal">
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

export default FormsPageNavid;
