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

// Load the Persian header mapping
const headerMapping = {};
PERSIAN_HEADERS.forEach(item => {
  headerMapping[item.key] = item.label;
});

// Helper function to convert field keys to Persian labels
const getFieldLabel = (key) => {
  return headerMapping[key] || key; // Return Persian label if available, otherwise return the key itself
};

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
  const [formDetails, setFormDetails] = useState({}); // Store details for each form by ID
  const [loadingDetails, setLoadingDetails] = useState({}); // Track loading state for each form
  const [editingCells, setEditingCells] = useState({}); // Track which cells are being edited {formId: {apiPart: {fieldName: value}}}
  const [editingFormPart, setEditingFormPart] = useState(null); // Track which form part is being edited
  const [openApiSections, setOpenApiSections] = useState({}); // Track which API sections are open for each form {formId: [apiPart1, apiPart2, ...]}
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

  // Function to fetch details for a specific form and API part
  const fetchFormPartDetails = async (formId, apiPart) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetchDataGET(`admin/form/${formId}/${apiPart}`, token);
      setFormDetails(prev => ({
        ...prev,
        [formId]: {
          ...prev[formId],
          [apiPart]: response.data
        }
      }));
    } catch (error) {
      console.error(`Error fetching ${apiPart} for form ${formId}:`, error);
    }
  };

  // Function to toggle drawer and fetch data if not already loaded
  const toggleDrawer = async (formId) => {
    const drawer = document.getElementById(`drawer-${formId}`);
    if (drawer) {
      const isCurrentlyOpen = drawer.classList.contains('open');

      // If opening the drawer for the first time, fetch all parts
      if (!isCurrentlyOpen) {
        setLoadingDetails(prev => ({ ...prev, [formId]: true }));

        // Fetch all API parts for this form
        for (const apiPart of APIARR) {
          if (!formDetails[formId] || !formDetails[formId][apiPart]) {
            await fetchFormPartDetails(formId, apiPart);
          }
        }

        setLoadingDetails(prev => ({ ...prev, [formId]: false }));
      }

      drawer.classList.toggle('open');
    }
  };

  // Function to handle double click on a form field for editing
  const handleFieldDoubleClick = (formId, apiPart, fieldName, currentValue) => {
    setEditingCells(prev => ({
      ...prev,
      [formId]: {
        ...(prev[formId] || {}),
        [apiPart]: {
          ...((prev[formId] || {})[apiPart] || {}),
          [fieldName]: currentValue
        }
      }
    }));
    setEditingFormPart(`${formId}-${apiPart}-${fieldName}`);
  };

  // Function to handle changes to edited fields
  const handleFieldChange = (formId, apiPart, fieldName, value) => {
    setEditingCells(prev => ({
      ...prev,
      [formId]: {
        ...(prev[formId] || {}),
        [apiPart]: {
          ...((prev[formId] || {})[apiPart] || {}),
          [fieldName]: value
        }
      }
    }));
  };

  // Function to save edited field to server
  const saveFieldToServer = async (formId, apiPart, fieldName, fieldValue) => {
    const token = localStorage.getItem("token");
    try {
      // Convert the field value based on its type
      let processedValue = fieldValue;
      if (fieldValue === "بله") processedValue = true;
      else if (fieldValue === "خیر") processedValue = false;
      else if (fieldValue === "null" || fieldValue === null) processedValue = null;
      else if (!isNaN(fieldValue) && fieldValue !== "" && fieldValue !== "انتخاب کنید" && fieldValue !== "انتخاب نمایید") {
        processedValue = Number(fieldValue);
      }

      const payload = { [fieldName]: processedValue };

      const response = await fetch(`http://${APIURL}/admin/form/${formId}/${apiPart}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      addToast({
        title: result.message || "تغییرات با موفقیت ذخیره شد",
        type: 'success',
        duration: 4000
      });

      // Update the local state after successful save
      setFormDetails(prev => ({
        ...prev,
        [formId]: {
          ...(prev[formId] || {}),
          [apiPart]: {
            ...((prev[formId] || {})[apiPart] || {}),
            [fieldName]: processedValue
          }
        }
      }));

      // Clear the editing state
      setEditingFormPart(null);
      setEditingCells(prev => {
        const newPrev = { ...prev };
        if (newPrev[formId] && newPrev[formId][apiPart]) {
          delete newPrev[formId][apiPart][fieldName];
          if (Object.keys(newPrev[formId][apiPart]).length === 0) {
            delete newPrev[formId][apiPart];
          }
        }
        return newPrev;
      });

      return true;
    } catch (error) {
      console.error('Error saving field:', error);
      addToast({
        title: "خطا در ذخیره تغییرات",
        type: 'error',
        duration: 4000
      });
      return false;
    }
  };

  // Function to toggle individual API section
  const toggleApiSection = (formId, apiPart) => {
    const sectionContent = document.querySelector(`#form-${formId}-section-${apiPart} .api_part_content`);

    setOpenApiSections(prev => {
      const currentFormSections = prev[formId] || [];
      const isCurrentlyOpen = currentFormSections.includes(apiPart);

      if (isCurrentlyOpen) {
        // Close the section
        const newSections = currentFormSections.filter(section => section !== apiPart);
        // Remove open class after a delay to allow animation
        if (sectionContent) {
          setTimeout(() => {
            if (sectionContent) sectionContent.classList.remove('open');
          }, 300);
        }
        return {
          ...prev,
          [formId]: newSections
        };
      } else {
        // Open the section
        const newSections = [...currentFormSections, apiPart];
        // Add open class to the section content
        if (sectionContent) {
          sectionContent.classList.add('open');
        }
        return {
          ...prev,
          [formId]: newSections
        };
      }
    });
  };

  // Helper function to check if an API section is open
  const isApiSectionOpen = (formId, apiPart) => {
    return (openApiSections[formId] || []).includes(apiPart);
  };

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

  // Part names for the drawer titles
  const partNames = [
    "اطلاعات شخصی",
    "سوالات سلامت فردی",
    "سوالات مصرف دارو",
    "سوالات سرطان فردی",
    "سوالات سرطان خانواده",
    "سوالات اطلاعات کامل فردی",
    "سوالات سرطان ریه"
  ];

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

        {/* Drawer-style interface for form sections */}
        <div className="form_sections_container">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <div key={row.id || row.user_id || Math.random()} className="form_section_drawer">
                <div
                  className="drawer_header"
                  onClick={() => toggleDrawer(row.id)}
                >
                  <h3 className="drawer_title">فرم {row.id || rowIndex + 1} - {row.name || "نامشخص"}</h3>
                  <div className="drawer_controls">
                    <button
                      className="model_enter_btn"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the drawer toggle
                        saveTheIdAndOpetions(row.id);
                      }}
                    >
                      ورودی به مدل
                    </button>
                    <span className="drawer_arrow">▼</span>
                  </div>
                </div>

                <div id={`drawer-${row.id || rowIndex}`} className="drawer_content">
                  {loadingDetails[row.id] ? (
                    <p>در حال بارگذاری...</p>
                  ) : (
                    APIARR.map((apiPart, partIndex) => {
                      const partData = formDetails[row.id]?.[apiPart] || {};

                      // Filter out metadata fields
                      const filteredData = {};
                      Object.keys(partData).forEach(key => {
                        if (key !== "id" && key !== "userID" && key !== "__typename" &&
                          key !== "status" && key !== "createdAt" && key !== "updatedAt") {
                          filteredData[key] = partData[key];
                        }
                      });

                      return (
                        <div key={apiPart} id={`form-${row.id}-section-${apiPart}`} className="api_part_drawer">
                          <div
                            className="api_part_header"
                            onClick={() => toggleApiSection(row.id, apiPart)}
                          >
                            <h4 className="part_title">{partNames[partIndex] || `بخش ${partIndex + 1}`}</h4>
                            <span className="api_part_arrow">
                              {isApiSectionOpen(row.id, apiPart) ? '▲' : '▼'}
                            </span>
                          </div>

                          <div className={`api_part_content ${isApiSectionOpen(row.id, apiPart) ? 'open' : ''}`}>
                            {/* Add special buttons for cancer sections */}
                            {apiPart === "cancer" && (
                              <button
                                className="cancer_btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFormForSelfCancer(row.id);
                                  // Fetch self cancer details for this specific form
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
                                      console.error(`Error fetching self cancer details for form ${row.id}:`, error);
                                    }
                                  };
                                  fetchDetails();
                                }}
                              >
                                نمایش جزئیات سرطان فردی
                              </button>
                            )}
                            {apiPart === "familycancer" && (
                              <button
                                className="family_cancer_btn"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                نمایش جزئیات سرطان خانوادگی
                              </button>
                            )}

                            <div className="part_data">
                              {Object.keys(filteredData).length > 0 ? (
                                Object.entries(filteredData).map(([key, value]) => {
                                  const isCurrentlyEditing = editingFormPart === `${row.id}-${apiPart}-${key}`;
                                  const editingValue = editingCells[row.id]?.[apiPart]?.[key] !== undefined
                                    ? editingCells[row.id]?.[apiPart]?.[key]
                                    : convertToPersianText(value, key);

                                  return (
                                    <div key={key} className="data_row">
                                      <span className="data_key">{getFieldLabel(key)}:</span>
                                      <span
                                        className="data_value"
                                        onDoubleClick={() => handleFieldDoubleClick(row.id, apiPart, key, convertToPersianText(value, key))}
                                      >
                                        {isCurrentlyEditing ? (
                                          <input
                                            type="text"
                                            value={editingValue}
                                            onChange={(e) => handleFieldChange(row.id, apiPart, key, e.target.value)}
                                            onBlur={() => saveFieldToServer(row.id, apiPart, key, editingValue)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                saveFieldToServer(row.id, apiPart, key, editingValue);
                                              }
                                            }}
                                            autoFocus
                                            style={{ width: "100%" }}
                                          />
                                        ) : (
                                          convertToPersianText(value, key)
                                        )}
                                      </span>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="no_data">اطلاعاتی موجود نیست</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no_data_message">داده‌ای موجود نیست</div>
          )}
        </div>

        <div className="btn_holder_next_prev">
          <button className="btn_submit space-UD" onClick={showPrev}>صفحه ی قبلی</button>
          <button className="btn_submit space-UD" onClick={showMore}>صفحه ی بعدی</button>
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
                {m.name.toUpperCase()}
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