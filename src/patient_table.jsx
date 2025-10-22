import { useState, useEffect } from "react";
import NavBar from "./navBar";
import "./patient_table.css";
import { APIARR , APIURL } from "./utils/config";
import { fetchDataGET , key_stage_matcher , stageMatcher} from "./utils/tools";
import PERSIAN_HEADERS from "./assets/table_header.json"
import { useLocation } from "react-router-dom";
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
import { isNumber } from "./utils/tools";
import Loader from "./utils/loader";


export default function FilterableTable() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("All");
  const [editingCell, setEditingCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editedData, setEditedData] = useState({});
  const [filteredData2, setFilteredData2] = useState([]);
  const [editedId , setEditedId] = useState(0)
  const [page , setPage]=  useState(1)
  const [pagiPrev , setPagiPrev] = useState(false)
  const [pagiNext , setPagiNext] = useState(false)
  const { addToast } = useToast()
  const location = useLocation();
  const userPhone = location.state?.phone;
  // debugs 
  console.log("here it comes : " , data)
  // console.log("maybe the answer : " , editedData)

  useEffect(() => {
    const fetchformIds = async () => {
    let token = localStorage.getItem("token")
    let pre_forms = await fetchDataGET(`admin/form?page=${page}&pageSize=20` , token)
    setPagiNext(pre_forms.data.pagination.hasNextPage)
    setPagiPrev(pre_forms.data.pagination.hasPrevPage)
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
  }, [page]);

  // show me more 
const showMore = () => {
    if(pagiNext){
        setPage(p => p + 1)
    }
}

const showPrev = () => {
    if(pagiPrev){
        setPage(p => p - 1)
    }
}
  
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
    // Optional: update editedData if you're tracking per-row edits separately
    setEditedData(prev => ({
      ...prev,
      [rowId]: { ...prev[rowId], [field]: e.target.value }
    }));
    setEditedId(parseInt(rowId));
  
    // Update the main data array
    setData(prevData =>
      prevData.map(item =>
        item.id === rowId ? { ...item, [field]: e.target.value } : item
      )
    );
  };
//  TO DO : Ask kian about that and let him change how data is managed
  const handleSave = () => {
    const updatedData = data.map(row =>
      editedData[row.id] ? { ...row, ...editedData[row.id] } : row
    );
    console.log(updatedData)
    setData(updatedData);
    setFilteredData2(updatedData);
    // console.log("Saving to DB:", updatedData);
    let token_auth = localStorage.getItem("token")
    console.log("this is the token man : " , token_auth)
    const matchAndSend = async () =>{
      for (const ar of APIARR) {
        for(const form_id of Object.keys(editedData)){
          let temporal_data = await fetchDataGET(`form/${form_id}/${ar}`, token_auth)
          for(const field of Object.keys(editedData[form_id])){
            let res = key_stage_matcher(field , temporal_data.data)
            if(res){
              if (editedData[form_id][field] === "true" && field != "pastSmoking") {
                  editedData[form_id][field] = true;
              } else if (editedData[form_id][field] === "false" && field != "pastSmoking") {
                  editedData[form_id][field] = false;
              } else if (editedData[form_id][field] === "null" && field != "pastSmoking") {
                  editedData[form_id][field] = null;
              } else if (isNumber(editedData[form_id][field]) && field != "socialSecurityNumber" && field != "postalCode") {
                  editedData[form_id][field] = parseInt(editedData[form_id][field]);
              } else if(editedData[form_id][field] == "انتخاب کنید" || editedData[form_id][field] == "انتخاب نمایید" || editedData[form_id][field] == ""){
                  continue
              }
              const payload = {
                [field]:editedData[form_id][`${field}`]
              }
              try {
                const response = await fetch(`http://${APIURL}/admin/form/${form_id}/${ar}`, {
                  method: 'PATCH',
                  headers: { "Content-Type": "application/json",
                            'Authorization': `Bearer ${token_auth}`},
                  body: JSON.stringify(payload),
                });
  
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }else{
                  const result = await response.json();
                  setEditingCell(null)
                  addToast({
                    title: result.message,
                    type: 'success',
                    duration: 4000
                  })
                  console.log('PUT success:', result);
                }
              } catch (error) {
                console.error('PUT request failed:', error);
              }
            }

          }
        }
      }
    }

    matchAndSend()
  };

  if (loading) {
    return <Loader></Loader>;
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
        <div className="btn_holder_next_prev">
            <button className="btn_submit space-UD" onClick={showMore}>صفحه ی بعدی</button>
            <button className="btn_submit space-UD" onClick={showPrev}>صفحه ی قبلی</button>
          </div>
      </div>
    </>
  );
}