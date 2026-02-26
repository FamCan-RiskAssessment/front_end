import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from './navBar'
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
import { fetchDataGET, fetchDataDELETE } from './utils/tools';
import { APIURL } from './utils/config';
import "./client_forms.css";
import plusSign from './V2Form/plus.svg'
import leftSign from './V2Form/form_left.png'
import rightSign from './V2Form/form_right.png'
import prevSign from './V2Form/arrow_right.svg'
import settingsSign from './V2Form/settings.svg'
import deleteSign from './V2Form/trashCan.svg'
import checkSign from './V2Form/Check.svg'

function RoleMaker() {
  const [clicked, setClicked] = useState(false)
  const [roleName, setRoleName] = useState("");
  const [permArray, setPermArray] = useState([]);
  const [permData, setPermData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState(null)
  const navigate = useNavigate();
  const [Err, setError] = useState("")
  const [roles, setRoles] = useState([])
  const [deletedRole, setDeletedRole] = useState(0)
  const roleMakerForm = useRef(null)
  const location = useLocation();
  const { addToast } = useToast()
  const userPhone = location.state?.phone;
  let role = JSON.parse(localStorage.getItem("roles"))
  let perms = JSON.parse(localStorage.getItem("pagesOneCango"))
  useEffect(() => {
    // let checkPerms = JSON.parse(localStorage.getItem("permissions"))
    role.forEach(r => {
      if (r.name == "مراجعه کننده" || r.name != "سوپر ادمین") {
        navigate("/error_page", { state: { error_type: 403 } })
      }
    });
  }, [])
  useEffect(() => {
    const fetchRoles = async () => {
      let token = localStorage.getItem("token")
      let roles = await fetchDataGET("admin/role", token)
      setRoles(roles.data)
    }
    fetchRoles()
    setNewRole(null)
    setDeletedRole(0)
  }, [newRole, deletedRole])

  const deleteRole = async (role_id) => {
    let token = localStorage.getItem("token")
    let res = await fetchDataDELETE(`admin/role/${role_id}`, token)
    if (res.status == 200) {
      addToast({
        title: res.message,
        type: 'success',
        duration: 4000
      })
      setDeletedRole(role_id)
    }
  }

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // ✅ Get token from localStorage (or context)
        const token = localStorage.getItem("token");
        const response = await fetch(`${APIURL}/admin/permission`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // ✅ attach token here
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        setPermData(json);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []); // run once on mount

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  let person = {
    name: "امیر",
    number: "09338666836"
  }
  const permissions = []
  permData.data.map((p, index) => {
    permissions[index] = {
      showName: p.name,
      engName: p.id
    }
    // console.log(p)
  })
  const check_box_data = {
    options: permissions,
    ask: "انتخاب دسترسی"
  }

  // let permissions = ["changing" , "removing" , "adding"]
  const permChooser = (id, isChecked) => {
    setPermArray((prev) => {
      if (isChecked) {
        // ✅ add id if not already present
        return prev.includes(id) ? prev : [...prev, id];
      } else {
        // ✅ remove id if unchecked
        return prev.filter((permId) => permId !== id);
      }
    });
  };

  const collectAndSend = async (e) => {
    e.preventDefault();
    try {
      const token_auth = localStorage.getItem("token");
      const bodyData = {
        name: roleName,
        permissionIDs: permArray.map((id) => Number(id)), // ensure numbers
      };

      const res = await fetch(`${APIURL}/admin/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token_auth}`,
        },
        body: JSON.stringify(bodyData),
      });

      let data;
      try {
        data = await res.json(); // <-- might fail if response has no JSON
        if (res.ok) {
          setNewRole(bodyData)
          addToast({
            title: data.message,
            type: 'success',
            duration: 4000
          })
        }
      } catch {
        data = {};
      }

      console.log("Response status:", res.status);
      console.log("Response body:", data);

      if (!res.ok) {
        if (res.status == 409) {
          addToast({
            title: "لطفا نقش های تکراری وارد نکنید",
            type: 'error',
            duration: 4000
          })
        } else {
          addToast({
            title: "مشکلی پیش آمده است لطفا دوباره تلاش کنید",
            type: 'error',
            duration: 4000
          })
        }
      }

      // navigate("/DashBoard");
    } catch (err) {
      // console.error("Error in collectAndSend:", err);
      // setError(err.message);
      // setTimeout(() => setError(""), 3000);
    }
  };

  const lineMaker = (total_page) => {
    let spans = []
    for (let i = 0; i < total_page; i++) {
      spans.push(i)
    }
    return spans
  }

  return (
    <>
      <div className="forms_page_holder">
        <NavBar account={userPhone}></NavBar>
        <div className="forms-page-wrapper">
          <div className="forms-container" style={{ display: 'flex', flexDirection: 'row', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Left side: Table of existing roles */}
            <div style={{ flex: '1', minWidth: '40%' }}>
              <div className="title-holder">
                <h1>ساخت نقش جدید</h1>
                <p className="subtitle">انتخاب دسترسی‌ها و ایجاد نقش برای مدیریت بهتر</p>
              </div>

              <form className="role_form" onSubmit={collectAndSend} ref={roleMakerForm}>
                <div className="form_group">
                  <label htmlFor="roleName" className="form_label">نام نقش</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="مثلاً مدیر بیماران"
                    className="form_input"
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </div>

                <div className="perm_section">
                  <h2 className="perm_title">لیست دسترسی‌ها</h2>
                  <div className="perm_holder" style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    {permissions.map((perm, index) => (
                      <label key={perm.engName} className="checkbox-card" htmlFor={perm.engName}>
                        <input
                          type="checkbox"
                          className="check_box"
                          name={perm.engName}
                          id={perm.engName}
                          onChange={(e) => permChooser(perm.engName, e.target.checked)}
                          checked={permArray.includes(perm.engName)}
                        />
                        <span className="checkbox-box">
                          <img className="checkbox-icon" src={checkSign} alt="" />
                        </span>
                        <span className="checkbox-text">{perm.showName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn_submit">ساخت نقش</button>
              </form>
            </div>







            {/* Right side: Form to create new role */}
            <div style={{ flex: '1', minWidth: '40%' }}>
              <div className="forms_tools">
                <div className="form_tool">
                  <div className="form_search_bar">
                    <input type="text" className="form_search inp_question V2" placeholder="جستجو" />
                  </div>
                  <div className="sorter">
                    <select name="roleSort" id="" className="select_optionsV2">
                      <option value="انتخاب کنید">انتخاب کنید</option>
                      <option value="جدید ترین">جدید ترین</option>
                      <option value="قدیمی ترین">قدیمی ترین</option>
                    </select>
                  </div>
                </div>
              </div>

              {roles.length === 0 ? (
                <p className="no-forms-text">نقشی یافت نشد.</p>
              ) : (
                <table className="forms-table">
                  <thead>
                    <tr>
                      <th className="table-header">نام نقش</th>
                      <th className="table-header">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role, index) => (
                      <tr key={role.id} className="form-row">
                        <td className="table-cell">{role.name}</td>
                        <td className="table-cell">
                          <div className="btn_formPage_holder RM">
                            <button
                              className="btn-view-form"
                              onClick={() => deleteRole(role.id)}
                            >
                              <img src={deleteSign} alt="delete role" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RoleMaker