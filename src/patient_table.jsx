import { useState, useEffect } from "react";
import NavBar from "./navBar";
import "./patient_table.css";
import { APIARR } from "./utils/config";
import { fetchDataGET } from "./utils/tools";
import PERSIAN_HEADERS from "./assets/table_header.json"
import { useLocation } from "react-router-dom";
export default function FilterableTable() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("All");
  const [editingCell, setEditingCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editedData, setEditedData] = useState({});
  const [filteredData2, setFilteredData2] = useState([]);
  const [editedId , setEditedId] = useState(0)
  const location = useLocation();
  const userPhone = location.state?.phone;
  console.log("here it comes : " , data)

  useEffect(() => {
    const fetchformIds = async () => {
    let token = localStorage.getItem("token")
    let pre_forms = await fetchDataGET("admin/forms" , token)
    if (pre_forms.status === 200) {
      // Create a new array to hold the updated forms
      const updatedForms = [];
      
      // Process each form sequentially (or use Promise.all for parallel)
      for (const pf of pre_forms.data.data) {
        let updatedForm = { ...pf }; // Start with a copy of the original form
        
        // Process each API endpoint
        for (const ar of APIARR) {
          try {
            let user_part_form = await fetchDataGET(`form/${pf.id}/${ar}`, token);
            updatedForm = { ...updatedForm, ...user_part_form.data };
          } catch (error) {
            console.error(`Error fetching form ${pf.id} for ${ar}:`, error);
          }
        }
        
        updatedForms.push(updatedForm);
      }
      
      // Update state with the fully updated array
      setData(updatedForms);
      setLoading(false);
    }
  };

  fetchformIds();   
  }, []);
  
  // Filter by 'status'
  useEffect(() => {
    if (data.length === 0) {
      setFilteredData2([]);
      return;
    }

    if (filter === "All") {
      setFilteredData2(data);
    } else {
      setFilteredData2(data.filter(item => item.status === filter));
    }
  }, [filter, data]);

  const statusOptions = [...new Set(data.map(item => item.status).filter(Boolean))];

  const person = {
    name: "امیر",
    number: "09338666836"
  };

  const handleDoubleClick = (rowId, field, value) => {
    setEditingCell({ rowId, field });
    setEditedData(prev => ({
      ...prev,
      [rowId]: { ...prev[rowId], [field]: value }
    }));
  };

  const handleChange = (e, rowId, field) => {
    setEditedData(prev => ({
      ...prev,
      [rowId]: { ...prev[rowId], [field]: e.target.value }
    }));
    setEditedId(parseInt(rowId))
  };
//  TO DO : Ask kian about that and let him change how data is managed
  const handleSave = () => {
    const updatedData = data.map(row =>
      editedData[row.id] ? { ...row, ...editedData[row.id] } : row
    );
    console.log(updatedData)
    setData(updatedData);
    setFilteredData2(updatedData);
    setEditingCell(null);
    setEditedData({});
    // console.log("Saving to DB:", updatedData);
    const token_auth = localStorage.getItem("token")
    const data_to_send = []
    // 🚀 Send to server
    fetch(`http://185.231.115.28:8080/admin/forms/${editedId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token_auth}`
                },
        // body: JSON.stringify(data_to_send),
    })
        .then(() => alert('Success!'))
        .catch((e) => console.log(e));
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  return (
    <>
      <NavBar account={userPhone} />
      <div className="total_patients_holder">
        <div className="filter_holder">
          <div className="select_filter">
            <label className="label_title">فیلتر وضعیت</label>
            <select
              className="select_options"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">همه</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleSave} className="btn_question">
            ذخیره تغییرات
          </button>
          <p>برای تغییر دادن هر فیلد دابل کلیک کنید.</p>
        </div>

        <div className="table_holder lower_width">
          <table border="1" cellSpacing="0" cellPadding="8" dir="rtl" borderColor="#ddd">
            <thead className="sar_jadval">
              <tr>
                {PERSIAN_HEADERS.map(({ key, label }) => (
                  <th key={key}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData2.length > 0 ? (
                filteredData2.map(row => (
                  <tr key={row.id || row.user_id || Math.random()}>
                    {PERSIAN_HEADERS.map(({ key }) => (
                      <td
                        className="cell_choose"
                        key={key}
                        onDoubleClick={() => handleDoubleClick(row.id, key, row[key])}
                      >
                        {editingCell?.rowId === row.id && editingCell?.field === key ? (
                          <div className="excel_input_holder">
                            <input
                              type="text"
                              value={
                                editedData[row.id]?.[key] !== undefined
                                  ? editedData[row.id][key]
                                  : row[key] ?? ""
                              }
                              onChange={(e) => handleChange(e, row.id, key)}
                              className="w-full border rounded p-1"
                              autoFocus
                            />
                          </div>
                        ) : (
                          row[key] != null ? String(row[key]) : ""
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={PERSIAN_HEADERS.length} style={{ textAlign: "center" }}>
                    داده‌ای موجود نیست
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}