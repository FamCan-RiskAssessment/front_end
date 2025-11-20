import { useState, useEffect } from "react";
import NavBar from "./navBar";
import "./patient_table.css";
import { APIARR, APIURL } from "./utils/config";
import { fetchDataGET, fetchDataPOST, key_stage_matcher, stageMatcher, fetchDataGETImg, cancerTypeEx, relativeTypeEx } from "./utils/tools";
import PERSIAN_HEADERS from "./assets/table_header.json"
import { useLocation } from "react-router-dom";
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
import { isNumber } from "./utils/tools";
import Loader from "./utils/loader";

// Helper function to convert boolean/null values to Persian text
const convertToPersianText = (value, key) => {
  if (value === true) return "بله";
  if (value === false) return "خیر";
  if (value === null) return "نمیدانم";
  if (value == undefined) return "موجود نیست"
  if (key == "birthDate") {
    return String(value.split("T")[0])
  }
  return String(value);
};

// Helper functions are now part of the component state,
// so we'll update the component to use the pre-loaded enum maps

// admin/form?status=1
// 1:در حال بررسی
// 2 : قبول شده
// 3 : رد شده
// 4:ؤ تکمیل نشده
// 5: ارسال شده
export default function FilterableTable() {
  const [data, setData] = useState([]);
  const [run, setRun] = useState(false)
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
  const [detailedFamilyCancerData, setDetailedFamilyCancerData] = useState({})
  const [openFamilyCancerModal, setOpenFamilyCancerModal] = useState(false)
  const [detailedCancerData, setDetailedCancerData] = useState({})
  const [openCancerModal, setOpenCancerModal] = useState(false)
  const [selectedFormForFamilyCancer, setSelectedFormForFamilyCancer] = useState(null)
  const [selectedFormForSelfCancer, setSelectedFormForSelfCancer] = useState(null)

  const [cancerTypesMap, setCancerTypesMap] = useState({})
  const [relativeTypesMap, setRelativeTypesMap] = useState({})
  const { addToast } = useToast()
  const location = useLocation();
  const userPhone = location.state?.phone;
  // debugs 
  console.log("here it comes : ", data)
  console.log("the detailed family data : ", detailedFamilyCancerData)
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

  // Load enum data when component mounts
  useEffect(() => {
    const loadEnums = async () => {
      const token = localStorage.getItem("token");

      try {
        // Load cancer types
        const cancerTypesRes = await fetchDataGET("enum/cancer-types", token);
        if (cancerTypesRes && cancerTypesRes.data) {
          const cancerMap = {};
          cancerTypesRes.data.forEach((cancer, index) => {
            cancerMap[index + 1] = cancer.name; // Assuming IDs start from 1
          });
          setCancerTypesMap(cancerMap);
        }

        // Load relative types
        const relativeTypesRes = await fetchDataGET("enum/relatives", token);
        if (relativeTypesRes && relativeTypesRes.data) {
          const relativeMap = {};
          relativeTypesRes.data.forEach((relative, index) => {
            relativeMap[index + 1] = relative.name; // Assuming IDs start from 1
          });
          setRelativeTypesMap(relativeMap);
        }
      } catch (error) {
        console.error("Error loading enums:", error);
      }
    };

    loadEnums();
  }, []);
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
        if (!run) {
          setRun(true)
        }
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
      [rowId]: { ...prev[rowId], [field]: convertToPersianText(value) }
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
              if (editedData[form_id][field] === "بله" && field != "pastSmoking") {
                editedData[form_id][field] = true;
              } else if (editedData[form_id][field] === "خیر" && field != "pastSmoking") {
                editedData[form_id][field] = false;
              } else if (editedData[form_id][field] == "null" && field != "pastSmoking") {
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
      } else if (model_name == "gail") {
        setRisks(res.data)
      } else if (model_name == "plco") {
        setRisks(res.data)
      }
    } catch (error) {
      console.error("Failed to fetch risks:", error);
      console.log("here man !")
      setInnerloading(false)
      setRisks(["ریسک مورد نظر یافت نشد"])
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
                      } else if (key == "gail" || key == "bcra" || key == "premm5" || key == "plco") {
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
                      } else if (key == "famCan") {
                        return (
                          <td className="cell_choose">
                            <button
                              className="model_in_btn"
                              onClick={() => {
                                setSelectedFormForFamilyCancer(row.id);
                                // Fetch family cancer details for this specific form
                                const fetchDetails = async () => {
                                  const token = localStorage.getItem("token");
                                  try {
                                    const familyCancerRes = await fetchDataGETImg(`admin/form/${row.id}/familycancer`, token);
                                    setDetailedFamilyCancerData(prev => ({
                                      ...prev,
                                      [row.id]: familyCancerRes.data?.familyCancers || []
                                    }));
                                    setOpenFamilyCancerModal(true);
                                  } catch (error) {
                                    console.error(`Error fetching family cancer details for form ${row.id}:`, error);
                                  }
                                };
                                fetchDetails();
                              }}
                            >
                              نمایش جزئیات
                            </button>
                          </td>
                        )
                      } else if (key == "cancerInfo") {
                        return (
                          <td className="cell_choose">
                            <button
                              className="model_in_btn"
                              onClick={() => {
                                setSelectedFormForSelfCancer(row.id);
                                // Fetch family cancer details for this specific form
                                const fetchDetails = async () => {
                                  const token = localStorage.getItem("token");
                                  try {
                                    const selfCancerRes = await fetchDataGETImg(`admin/form/${row.id}/cancer`, token);
                                    setDetailedCancerData(prev => ({
                                      ...prev,
                                      [row.id]: selfCancerRes.data?.cancers || []
                                    }));
                                    setOpenCancerModal(true);
                                  } catch (error) {
                                    console.error(`Error fetching family cancer details for form ${row.id}:`, error);
                                  }
                                };
                                fetchDetails();
                              }}
                            >
                              نمایش جزئیات
                            </button>
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
                              convertToPersianText(row[key], key)
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

      {openFamilyCancerModal && (
        <div className="role_modal">
          <div className="modal_header">
            <h3>تاریخچه سرطان خانوادگی</h3>
            <div className="modal_close" onClick={() => {
              setOpenFamilyCancerModal(false)
              setSelectedFormForFamilyCancer(null)
            }}>✕</div>
          </div>
          <div className="roles cancer-mode">
            {detailedFamilyCancerData[selectedFormForFamilyCancer]?.length === 0 || !detailedFamilyCancerData[selectedFormForFamilyCancer] ? "تاریخچه سرطان خانوادگی موجود نیست" :
              detailedFamilyCancerData[selectedFormForFamilyCancer]?.map((familyMember, index) => (
                <div key={index} className="role">
                  <div className="family-member-info">
                    <p><strong>خویشاوند:</strong> {relativeTypesMap[familyMember.relative]}</p>
                    <p><strong>وضعیت زندگی:</strong>
                      {familyMember.lifeStatus === 0 ? "فوت شده" :
                        familyMember.lifeStatus === 1 ? "زنده" :
                          familyMember.lifeStatus === 2 ? "نامشخص" : "نامشخص"}
                    </p>
                    <div className="cancers-list">
                      <p style={{ fontWeight: "bold", fontSize: "20px", borderBottom: "1px solid #ccc", padding: "1rem", }}>انواع سرطان:</p>
                      {familyMember.cancers && familyMember.cancers.length > 0 ?
                        familyMember.cancers.map((cancer, cancerIndex) => (
                          <div key={cancerIndex} className="cancer-item">
                            <p>نوع سرطان: {cancerTypesMap[cancer.cancerType]}</p>
                            <p>سن تشخیص: {cancer.cancerAge}</p>
                            {cancer.picture && (
                              <a href={`${cancer.picture}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="download-link">
                                دانلود تصویر
                              </a>
                            )}
                          </div>
                        ))
                        : "اطلاعات سرطان موجود نیست"}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {openCancerModal && (
        <div className="role_modal">
          <div className="modal_header">
            <h3>تاریخچه سرطان</h3>
            <div className="modal_close" onClick={() => {
              setOpenCancerModal(false)
              setSelectedFormForSelfCancer(null)
            }}>✕</div>
          </div>
          <div className="roles cancer-mode">
            <div className="role">
              <div className="cancer-list">
                {detailedCancerData[selectedFormForSelfCancer]?.length === 0 || !detailedCancerData[selectedFormForSelfCancer] ? "تاریخچه سرطان خانوادگی موجود نیست" :
                  detailedCancerData[selectedFormForSelfCancer]?.map((cancer, index) => {
                    return (
                      <div className="cancer-item">
                        <p>نوع سرطان: {cancerTypesMap[cancer.cancerType]}</p>
                        <p>سن تشخیص: {cancer.cancerAge}</p>
                        {cancer.picture && (
                          <a href={`${cancer.picture}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-link">
                            دانلود تصویر
                          </a>
                        )}
                      </div>

                    )
                  })
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}