import { useState, useEffect, useCallback } from "react";
import NavBar from "./navBar";
import "./patient_table.css";
import { APIARR, APIURL } from "./utils/config";
import { fetchDataGET, fetchDataGETTab, fetchDataPOST, key_stage_matcher, stageMatcher, fetchDataGETImg, cancerTypeEx, relativeTypeEx, fetchDataDELETE } from "./utils/tools";
import PERSIAN_HEADERS from "./assets/table_header.json"
import { useLocation } from "react-router-dom";
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
import { isNumber } from "./utils/tools";
import Loader from "./utils/loader";
import CancerField from "./cancer_universal";
import part4 from './questions/P4.json'
import part5 from './questions/P5.json'

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
  const [cancerDeled, setCancerDeled] = useState([])
  const [AddCancerModal, setAddCancerModal] = useState(false)
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
      // Still update the state to indicate that this section had an error
      setFormDetails(prev => ({
        ...prev,
        [formId]: {
          ...prev[formId],
          [apiPart]: { error: error.message, incomplete: true }
        }
      }));
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
        const updatedForms = [];
        // Process each form from the API exactly once to prevent duplicates
        for (const pf of pre_forms.data.data) {
          let updatedForm = { ...pf }; // Start with base form data

          // Combine data from all API parts for this specific form
          for (const ar of APIARR) {
            const user_part_form = await fetchDataGETTab(`form/${pf.id}/${ar}`, token);

            // Spread the additional data but keep the original id from pf
            updatedForm = { ...updatedForm, ...user_part_form.data, id: pf.id };
          }

          // Add this form only once to the results array
          updatedForms.push(updatedForm);
        }

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
          try {
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
                  addToast({
                    title: `خطا در ذخیره فیلد ${field}: ${error.message}`,
                    type: 'error',
                    duration: 4000
                  });
                }
              }

            }
          } catch (error) {
            console.error(`Error fetching data for form ${form_id} during save:`, error);
            addToast({
              title: `خطا در بارگذاری داده‌های فرم ${form_id}: ${error.message}`,
              type: 'error',
              duration: 4000
            });
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

  // how to delete the cancer
  const deleteCancer = async (canId, form_id) => {
    let token = localStorage.getItem("token")
    let delAns = await fetchDataDELETE(`admin/form/${form_id}/cancer/${canId}`, token)
    setCancerDeled(ar => [...ar, canId])
    if (delAns.ok) {
      console.log("delete was successful!")
    }
  }


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
              <div key={`form-${row.id || rowIndex}`} className="form_section_drawer">
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

                <div id={`drawer-${row.id || `row-${rowIndex}`}`} className="drawer_content">
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
                              <>
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
                                <button
                                  className="add_cancer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAddCancerModal(true);
                                    setSelectedFormForSelfCancer(row.id);
                                  }}
                                >
                                  اضافه کردن سرطان
                                </button>
                              </>
                            )}
                            {apiPart === "familycancer" && (
                              <>
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
                                <button
                                  className="add_cancer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAddCancerModal(true);
                                    setSelectedFormForFamilyCancer(row.id);
                                  }}
                                >
                                  اضافه کردن سرطان خانوادگی
                                </button>
                              </>
                            )}

                            <div className="part_data">
                              {partData.error ? (
                                <p className="error_message">خطا در بارگذاری داده‌ها: {partData.error}</p>
                              ) : Object.keys(filteredData).length > 0 ? (
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
                className="role_table"
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
                    className="role_table"
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
                <div key={index} className="role_table">
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
            <div className="role_table">
              <div className="cancer-list">
                {detailedCancerData[selectedFormForSelfCancer]?.length === 0 || !detailedCancerData[selectedFormForSelfCancer] ? "تاریخچه سرطان خانوادگی موجود نیست" :
                  detailedCancerData[selectedFormForSelfCancer]?.map((cancer, index) => {
                    if (!(cancer.id in cancerDeled)) {

                      return (
                        <div className="cancer-item" >
                          <div className="top_cancer_holder">
                            <p>نوع سرطان: {cancerTypesMap[cancer.cancerType]}</p>
                            <button className="modal_close" onClick={() => deleteCancer(cancer.id, selectedFormForSelfCancer)}>✕</button>
                          </div>
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
                    }
                  })
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Cancer Modal */}
      {AddCancerModal && (
        <div className="role_modal">
          <div className="modal_header">
            <h3>اضافه کردن سرطان</h3>
            <div className="modal_close" onClick={() => {
              setAddCancerModal(false);
              setSelectedFormForSelfCancer(null);
              setSelectedFormForFamilyCancer(null);
            }}>✕</div>
          </div>
          <div className="roles cancer-mode">
            <div className="role_table">
              <CancerAddForm
                formId={selectedFormForSelfCancer || selectedFormForFamilyCancer}
                isFamilyCancer={!!selectedFormForFamilyCancer}
                onClose={() => {
                  setAddCancerModal(false);
                  setSelectedFormForSelfCancer(null);
                  setSelectedFormForFamilyCancer(null);
                }}
                cancerTypesMap={cancerTypesMap}
                relativeTypesMap={relativeTypesMap}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Simple form component for adding cancers
function CancerAddForm({ formId, isFamilyCancer, onClose, cancerTypesMap, relativeTypesMap }) {
  const [cancerType, setCancerType] = useState("");
  const [cancerAge, setCancerAge] = useState("");
  const [relativeType, setRelativeType] = useState("");
  const [lifeStatus, setLifeStatus] = useState(1); // 1 for alive, 0 for deceased
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { addToast } = useToast();

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cancerType || !cancerAge || (isFamilyCancer && !relativeType)) {
      addToast({
        title: "لطفاً تمام فیلدهای الزامی را پر کنید",
        type: 'error',
        duration: 4000
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Get the IDs for cancer type and relative type from the map
      let cancerTypeId = null;
      let relativeTypeId = null;

      // Get cancer type ID
      for (const [id, name] of Object.entries(cancerTypesMap)) {
        if (name === cancerType) {
          cancerTypeId = parseInt(id);
          break;
        }
      }

      // If this is a family cancer, get relative type ID
      if (isFamilyCancer) {
        for (const [id, name] of Object.entries(relativeTypesMap)) {
          if (name === relativeType) {
            relativeTypeId = parseInt(id);
            break;
          }
        }
      }

      // Prepare the data for the sender function
      const relation = isFamilyCancer ? relativeType : null;
      const cancerAgeInt = parseInt(cancerAge);
      const lifeStatusInt = parseInt(lifeStatus);

      // Call the fetchDataPOST function directly similar to cancer_universal.jsx
      let response;
      if (imageFile) {
        // Send as form data if there's an image file
        const formData = new FormData();

        if (isFamilyCancer) {
          formData.append('relative', relativeTypeId);
          formData.append('lifeStatus', lifeStatusInt);
          formData.append('cancerAge', cancerAgeInt);
          formData.append('cancerType', cancerTypeId);
          formData.append('file', imageFile);

          response = await fetch(`http://${APIURL}/admin/form/${formId}/familycancer`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
        } else {
          formData.append('cancerAge', cancerAgeInt);
          formData.append('cancerType', cancerTypeId);
          formData.append('file', imageFile);

          response = await fetch(`http://${APIURL}/admin/form/${formId}/cancer`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
        }
      } else {
        // Send as JSON if no image file
        const payload = isFamilyCancer ?
          {
            relative: relativeTypeId,
            lifeStatus: lifeStatusInt,
            cancers: [{
              cancerAge: cancerAgeInt,
              cancerType: cancerTypeId
            }]
          } :
          {
            cancerAge: cancerAgeInt,
            cancerType: cancerTypeId
          };

        response = await fetch(`http://${APIURL}/admin/form/${formId}/${isFamilyCancer ? 'familycancer' : 'cancer'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (response.ok) {
        addToast({
          title: result.message || `سرطان ${isFamilyCancer ? 'خانوادگی' : 'فردی'} با موفقیت اضافه شد`,
          type: 'success',
          duration: 4000
        });
        onClose(); // Close the modal after successful submission
      } else {
        throw new Error(result.message || `خطا در اضافه کردن سرطان ${isFamilyCancer ? 'خانوادگی' : 'فردی'}`);
      }
    } catch (error) {
      console.error(`Error adding ${isFamilyCancer ? 'family' : 'self'} cancer:`, error);
      addToast({
        title: error.message || `خطا در اضافه کردن سرطان ${isFamilyCancer ? 'خانوادگی' : 'فردی'}`,
        type: 'error',
        duration: 4000
      });
    }
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="cancer-add-form">
      <form onSubmit={handleSubmit}>
        {isFamilyCancer && (
          <div className="form-group">
            <label>نسبت خانوادگی:</label>
            <select
              value={relativeType}
              onChange={(e) => setRelativeType(e.target.value)}
              className="form-control"
            >
              <option value="">انتخاب کنید</option>
              {Object.entries(relativeTypesMap).map(([id, name]) => (
                <option key={id} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>نوع سرطان:</label>
          <select
            value={cancerType}
            onChange={(e) => setCancerType(e.target.value)}
            className="form-control"
          >
            <option value="">انتخاب کنید</option>
            {Object.entries(cancerTypesMap).map(([id, name]) => (
              <option key={id} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>سن در زمان تشخیص سرطان:</label>
          <input
            type="number"
            value={cancerAge}
            onChange={(e) => setCancerAge(e.target.value)}
            className="form-control"
            min="0"
            max="120"
            placeholder="سن تشخیص"
          />
        </div>

        {isFamilyCancer && (
          <div className="form-group">
            <label>وضعیت زندگی:</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="lifeStatus"
                  value={1}
                  checked={lifeStatus === 1}
                  onChange={(e) => setLifeStatus(parseInt(e.target.value))}
                />
                زنده
              </label>
              <label style={{ marginLeft: '15px' }}>
                <input
                  type="radio"
                  name="lifeStatus"
                  value={0}
                  checked={lifeStatus === 0}
                  onChange={(e) => setLifeStatus(parseInt(e.target.value))}
                />
                فوت شده
              </label>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>تصویر (اختیاری):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-control"
          />
          {imagePreview && (
            <div className="image-preview" style={{ marginTop: '10px' }}>
              <p>پیش نمایش تصویر:</p>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
          )}
        </div>

        <div className="form-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn_submit btn-primary">ثبت سرطان</button>
          <button type="button" onClick={onClose} className="btn_submit btn-secondary">لغو</button>
        </div>
      </form>
    </div>
  );
}