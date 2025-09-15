import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./client_forms.css"

function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 fetch user's forms on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://185.231.115.28:8080/form", {
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
  console.log(forms)
  const handleAddNew = () => {
    navigate("/forms/new"); // redirect to form creation page
  };

  const handleViewForm = (formId) => {
    navigate(`/forms/${formId}`); // redirect to details page
  };

  if (loading) return <p className="text-center mt-10">Loading forms...</p>;

  return (
    <div className="forms-page-wrapper">
      <div className="forms-container">
        <h1 className="forms-title">لیست فرم‌های شما</h1>

        {forms.length === 0 ? (
          <p className="no-forms-text">فرمی ثبت نشده است.</p>
        ) : (
          <ul className="forms-list">
            {forms.map((form) => (
              <li key={form.id} className="form-item">
                <span className="form-name">{form.name}</span>
                <button
                  className="btn-view-form"
                  onClick={() => handleViewForm(form.id)}
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
  );
}

export default FormsPage;
