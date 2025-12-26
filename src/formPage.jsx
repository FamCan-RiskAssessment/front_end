import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { APIURL } from "./utils/config";
import { permExtractor, fetchDataGET, fetchDataDELETE, formTypeChecker } from "./utils/tools";
import "./client_forms.css"
import ToastProvider from "./toaster";
import { useToast } from "./toaster";
import RangeBox from "./rangeInp";

import part3 from './questions/P3.json'

function FormsPage() {
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
    fetch(`http://${APIURL}/form?page=${page}`, {
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
    fetch(`http://${APIURL}/form?page=${page}`, {
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
      "generalhealth",
      "mamography",
      "cancer",
      "familycancer",
      "contact",
      "lungcancer"
    ];

    try {
      setLoading(true);

      // Wait for all fetch requests to complete
      let TrueSteps = [];
      const results = await Promise.all(
        APIARR.map(async (ar, index) => {
          const res = await fetch(`http://${APIURL}/form/${form_id}/${ar}`, {
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
      navigate("/forms/new");
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
    navigate("/forms/new"); // redirect to form creation page
  };

  const handleAddNewForPatient = () => {
    navigate("/operator/userMobile")
  }


  if (loading) return <p className="text-center mt-10">Loading forms...</p>;

  return (
    <>
      <div className="dashboard_btns">
        {role != "بیمار" ? (<button className="btn_submit place_independently" onClick={() => {
          navigate('/DashBoard', { state: { permissions: perms } })
        }}>ورود به پنل</button>) : null}
        <button className="btn_submit spider" onClick={() => navigate("/login")}>خروج</button>
      </div>
      <div className="forms-page-wrapper">
        <div className="forms-container">
          <h1 className="forms-title">لیست فرم‌های شما</h1>

          {forms.length === 0 && !formTypeChecker(forms, 1) ? (
            <p className="no-forms-text">فرمی ثبت نشده است.</p>
          ) : (
            <ul className="forms-list">
              {forms.map((form, index) => {
                if (form.formType == 1) {
                  return (
                    <li key={form.id} className="form-item">
                      <span className="form-name">{index + 1}</span>
                      <span className="social-num">{form.socialSecurityNumber}</span>
                      <span className="form-name">{form.name}</span>
                      <div className="btn_formPage_holder">
                        <button
                          className="btn-view-form"
                          onClick={() => userSelectedForm(form.id)}
                        >
                          مشاهده
                        </button>
                        <button className="delete_btn2" onClick={() => {
                          setOpenModalConf(true)
                          setSelectedForm(form.id)
                        }}>حذف فرم</button>
                      </div>
                    </li>
                  )
                }
              })}
            </ul>
          )}

          <div className="add-new-wrapper">
            <button className="btn-add-new" onClick={handleAddNew}>
              افزودن فرم جدید
            </button>
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
              <button className="btn_submit space-UD" onClick={nextPage}>صفحه ی بعدی</button>
              <button className="btn_submit space-UD" onClick={prevPage}>صفحه ی قبلی</button>
            </div>
          ) : null}

        </div>

      </div>

      {openModalConf && (
        <div className="role_modal">
          <div className="modal_header">
            <h3>آیا می خواهید فرم را حذف کنید ؟ </h3>
            <div className="modal_close" onClick={() => {
              setOpenModalConf(false)
            }}>✕</div>
          </div>
          <div className="roles">
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
