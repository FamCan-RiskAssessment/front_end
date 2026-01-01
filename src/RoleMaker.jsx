import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from './navBar'
import CheckBox from './checkbox';
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
import { fetchDataGET, fetchDataDELETE } from './utils/tools';
import { APIURL } from './utils/config';
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
        const response = await fetch(`http://${APIURL}/admin/permission`, {
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

  if (loading) return <p>Loading...</p>;

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
        return [...prev, id];
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

      const res = await fetch(`http://${APIURL}/admin/role`, {
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

  return (
    <>
      <NavBar account={userPhone}></NavBar>
      <div className="all_holder">
        {Err.length != 0 &&
          <div className={Err.length != 0 ? "error_container fader" : null}>
            <span>لطفا نقش های تکراری وارد نکنید</span>
            <i className="fa fa-ban"></i>
          </div>
        }
        <div className='role_holder'>
          {roles.map((r, index) => {
            return (
              <>
                <div key={index} className='role_card'>
                  <div className='role_name'>{r.name}</div>
                  <button className='delete_btn' onClick={() => deleteRole(r.id)}>حذف نقش</button>
                </div>
              </>
            )
          })}
        </div>
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
            <div className="perm_holder">
              <CheckBox
                data={check_box_data}
                classChange1={"checkBox_column"}
                classChange2={"width_and_centererV2"}
                roleMaker_class={"columner"}
                checker={permChooser}
              />
            </div>
          </div>

          <button type="submit" className="btn_submit">ساخت نقش</button>
        </form>
      </div>

    </>
  )
}
export default RoleMaker