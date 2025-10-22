import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { APIURL } from "./utils/config";
import { permExtractor , fetchDataGET , fetchDataDELETE } from "./utils/tools";
import "./client_forms.css"
import ToastProvider from "./toaster";
import { useToast } from "./toaster";

function FormsPage() {
  const [forms, setForms] = useState([]);
  const [deletedForm , setDeletedForm] = useState(0)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [perms , setPerms] = useState([])
  const { addToast } = useToast()

  // user info
 useEffect(() => {
  let permissions = JSON.parse(localStorage.getItem("permissions"))
  setPerms(permissions)
 } , [])


 const deleteForm = async (form_id) =>{
    let token = localStorage.getItem("token")
    let res = await fetchDataDELETE(`form/${form_id}` , token)
    if(res.status == 200){
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
    fetch(`http://${APIURL}/form`, {
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
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching forms:", err);
        setLoading(false);
      });
  }, [deletedForm]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://${APIURL}/form`, {
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
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching forms:", err);
        setLoading(false);
      });
  }, []);
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
      const results = await Promise.all(
        APIARR.map(async (ar) => {
          const res = await fetch(`http://${APIURL}/form/${form_id}/${ar}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
  
          if (!res.ok) throw new Error(`Failed to fetch ${ar}`);
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
  
      console.log("✅ All stages fetched:", form_data);
      navigate("/forms/new");
    } catch (err) {
      console.error("Error fetching forms:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleAddNew = () => {
    localStorage.setItem("form_data" , null)
    localStorage.setItem("form_id" , null)
    navigate("/forms/new"); // redirect to form creation page
  };

  if (loading) return <p className="text-center mt-10">Loading forms...</p>;

  return (
    <>
    {perms.length > 1 ? (<button className="btn_submit place_independently" onClick={() => {
      navigate('/DashBoard' , { state: { permissions: perms } })
      }}>ورود به پنل</button>) : null}
    <button className="btn_submit spider" onClick={() => navigate("/")}>خروج</button>
    <div className="forms-page-wrapper">
      <div className="forms-container">
        <h1 className="forms-title">لیست فرم‌های شما</h1>

        {forms.length === 0 ? (
          <p className="no-forms-text">فرمی ثبت نشده است.</p>
        ) : (
          <ul className="forms-list">
            {forms.map((form) => (
              <li key={form.id} className="form-item">
                <span className="form-name">{form.id}</span>
                <div className="btn_formPage_holder">
                <button
                  className="btn-view-form"
                  onClick={() => userSelectedForm(form.id)}
                >
                  مشاهده
                </button>
                <button className="delete_btn2" onClick={() => deleteForm(form.id)}>حذف فرم</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="add-new-wrapper">
          <button className="btn-add-new" onClick={handleAddNew}>
            افزودن فرم جدید
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default FormsPage;
