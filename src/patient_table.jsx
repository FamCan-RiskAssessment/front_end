import { useState, useEffect } from "react";
import NavBar from "./navBar";
import "./patient_table.css";
import { APIARR, APIURL } from "./utils/config";
import { fetchDataGET, fetchDataPOST, key_stage_matcher, stageMatcher } from "./utils/tools";
import PERSIAN_HEADERS from "./assets/table_header.json"
import { useLocation } from "react-router-dom";
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
import { isNumber } from "./utils/tools";
import Loader from "./utils/loader";
// admin/form?status=1
// 1:در حال بررسی  
// 2 : قبول شده
// 3 : رد شده
// 4:ؤ تکمیل نشده
// 5: ارسال شده
export default function FilterableTable() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("All");
  const [editingCell, setEditingCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [innerloading, setInnerloading] = useState(true)
  const [editedData, setEditedData] = useState({});
  const [filteredData2, setFilteredData2] = useState([]);
  const [editedId, setEditedId] = useState(0)
  const [page, setPage] = useState(1)
  const [pagiPrev, setPagiPrev] = useState(false)
  const [pagiNext, setPagiNext] = useState(false)
  const [selectedFormId, setSelectedFormId] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [risks, setRisks] = useState({})
  const [openModalRisks, setOpenModalRisks] = useState(false)
  const [modelList, setModelList] = useState([])
  const { addToast } = useToast()
  const location = useLocation();
  const userPhone = location.state?.phone;
  // debugs 
  console.log("here it comes : ", data)
  // console.log("maybe the answer : " , editedData)
  const statuses = ["در حال بررسی", "قبول شده", "رد شده", "تکمیل نشده", "ارسال شده"]

  useEffect(() => {
    let token = localStorage.getItem("token")
    const fetchModels = async () => {
      let res = await fetchDataGET("admin/calc/all-models", token)
      setModelList(res.data)
      // console.log("this is the res for the models : " , res.data)
    }
    fetchModels()
  }, [])

  useEffect(() => {
    const fetchformIds = async () => {
      let pre_forms = null
      let token = localStorage.getItem("token")
      let role = JSON.parse(localStorage.getItem("roles"))
      console.log("check the name : ", role[0])
      if (filter == "All" && role[0].name == "اپراتور") {
        pre_forms = await fetchDataGET(`admin/operator-form?page=${page}&pageSize=10`, token)
      } else if (filter == "All" && role[0].name != "اپراتور") {
        let stid = 0
        statuses.forEach((s, i) => {
          if (s == filter) {
            stid = i + 1
          }
        });
        console.log("used Operator1")
        pre_forms = await fetchDataGET(`admin/form?page=${page}&pageSize=10`, token)
      } else if (filter != "All" && role[0].name != "اپراتور") {
        pre_forms = await fetchDataGET(`admin/form?page=${page}&pageSize=10&status=${stid}`, token)
      } else {
        let stid = 0
        statuses.forEach((s, i) => {
          if (s == filter) {
            stid = i + 1
          }
        });
        // console.log("here is the id : " ,  stid)
        console.log("used Operator2")
        pre_forms = await fetchDataGET(`admin/operator-form?page=${page}&pageSize=10&status=${stid}`, token)
      }
      console.log("here is the filter : ", pre_forms)
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
  }, [page, filter]);

  // show me more 
  const showMore = () => {
    if (pagiNext) {
      setPage(p => p + 1)
    }
  }

  const showPrev = () => {
    if (pagiPrev) {
      setPage(p => p - 1)
    }
  }

  // Filter by 'status'
  useEffect(() => {
    // if (data.length === 0) {
    //   setFilteredData2([]);
    //   return;
    // }

    // if (filter === "All") {
    //   setFilteredData2(data);
    // } else {
    //   setFilteredData2(data.filter(item => item.status === filter));
    // }
  }, [data]);

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
    console.log("this is the token man : ", token_auth)
    const matchAndSend = async () => {
      for (const ar of APIARR) {
        for (const form_id of Object.keys(editedData)) {
          let temporal_data = await fetchDataGET(`form/${form_id}/${ar}`, token_auth)
          for (const field of Object.keys(editedData[form_id])) {
            let res = key_stage_matcher(field, temporal_data.data)
            if (res) {
              if (editedData[form_id][field] === "true" && field != "pastSmoking") {
                editedData[form_id][field] = true;
              } else if (editedData[form_id][field] === "false" && field != "pastSmoking") {
                editedData[form_id][field] = false;
              } else if (editedData[form_id][field] === "null" && field != "pastSmoking") {
                editedData[form_id][field] = null;
              } else if (isNumber(editedData[form_id][field]) && field != "socialSecurityNumber" && field != "postalCode") {
                editedData[form_id][field] = parseInt(editedData[form_id][field]);
              } else if (editedData[form_id][field] == "انتخاب کنید" || editedData[form_id][field] == "انتخاب نمایید" || editedData[form_id][field] == "") {
                continue
              }
              const payload = {
                [field]: editedData[form_id][`${field}`]
              }
              try {
                const response = await fetch(`http://${APIURL}/admin/form/${form_id}/${ar}`, {
                  method: 'PATCH',
                  headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token_auth}`
                  },
                  body: JSON.stringify(payload),
                });

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                } else {
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

  const saveTheIdAndOpetions = (form_id) => {
    setOpenModal(true)
    setSelectedFormId(form_id)
  }

  const sendToCalcModel = async (model_id) => {
    let token = localStorage.getItem("token")
    let bodyData = {
      "calcID": model_id,
      "formID": selectedFormId
    }
    let res = await fetchDataPOST("admin/calc/model", token, bodyData)
    setSelectedFormId(0)
    setOpenModal(false)
    console.log("this is the input and model output : ", res)
  }


  // useEffect(() => {

  // })
  const showTheRisks = async (model_name, form_id) => {
    try {
      const token = localStorage.getItem("token");
      setInnerloading(true)
      const res = await fetchDataGET(`admin/calc/${model_name}/${form_id}`, token);
      if (res.status == 200) {
        setInnerloading(false)
      }
      if (model_name === "premm5") {
        const the_probs = res.data; // assuming res.data has gene_probs and p_any
        const { gene_probs, p_any } = the_probs;

        // Merge gene_probs and p_any into a single flat object
        const combinedRisks = {
          ...gene_probs,
          total: p_any
        };

        setRisks(combinedRisks); // ✅ Now risks contains all keys
        // console.log("Combined risks:", combinedRisks);
      } else if (model_name == "bcra") {
        // console.log("this is the bcra pro : " , res)
        setRisks(res.data)
      }
    } catch (error) {
      console.error("Failed to fetch risks:", error);
    }
  }
  // fetchFormRisk(1)

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
              {statuses.map(status => (
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
              {data.length > 0 ? (
                data.map(row => (
                  <tr key={row.id || row.user_id || Math.random()}>
                    {PERSIAN_HEADERS.map(({ key }) => {
                      if (key == "modelEnterence") {
                        return (
                          <td className="cell_choose" key={key}>
                            <button className="model_in_btn" onClick={() => saveTheIdAndOpetions(row.id)}>ورود به مدل</button>
                          </td>
                        )
                      } else if (key == "gbr" || key == "bcra" || key == "premm5") {
                        return (
                          <td
                            className="cell_choose"
                            key={key}
                          >
                            <button className="model_in_btn" onClick={() => {
                              showTheRisks(key, row.id)
                              setOpenModalRisks(true)
                            }}>نمایش نتایج</button>
                          </td>
                        )
                      } else {
                        return (
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
                        )
                      }
                    })}
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
      {openModal && (
        <div className="role_modal">
          <div className="modal_header">
            <h3>مدل ها</h3>
            <div className="modal_close" onClick={() => {
              setOpenModal(false)
              setSelectedFormId(0)
            }}>✕</div>
          </div>
          <div className="roles">
            {modelList.map((m, index) => (
              <div
                key={index}
                className="role"
                onClick={() => sendToCalcModel(m.id)} // pass role directly instead of e.target.value
              >
                {m.name}
              </div>
            ))}
          </div>
        </div>
      )}


      {openModalRisks && (
        <div className="role_modal">
          {innerloading ? <Loader></Loader> : (
            <>
              <div className="modal_header">
                <h3>احتمال ریسک ها</h3>
                <div className="modal_close" onClick={() => {
                  setOpenModalRisks(false)
                  setRisks({})
                }}>✕</div>
              </div>
              <div className="roles">
                {Object.keys(risks).length == 0 ? "ریسک هنوز محاسبه نشده است!" : null}
                {Object.keys(risks).map((rk, index) => (
                  <div
                    key={index}
                    className="role"
                  >
                    نتیجه ی احتمال {rk} : {risks[rk]}
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      )}
    </>
  );
}