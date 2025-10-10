import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { APIURL } from "./utils/config";
import { permExtractor } from "./utils/tools";
import "./client_forms.css"

function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = location.state?.permissions;
  // print(permissions)
  // console.log("Permissions:", permissions);

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
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching forms:", err);
        setLoading(false);
      });
  }, []);

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
    {permissions.length > 1 ? (<button className="btn_submit place_independently" onClick={() => {
      navigate('/DashBoard' , { state: { permissions: permissions } })
      }}>ورود به پنل</button>) : null}
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
                <button
                  className="btn-view-form"
                  onClick={() => userSelectedForm(form.id)}
                >
                  مشاهده
                </button>
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
