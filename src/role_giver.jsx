import { useState, useEffect } from "react";
import NavBar from "./navBar";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { APIURL, roleColors, sortOptions } from "./utils/config";
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
import { fetchDataGET, endpointMaker } from "./utils/tools";
import "./role_giver.css"
import "./client_forms.css"
import leftSign from './V2Form/form_left.png'
import rightSign from './V2Form/form_right.png'
import prevSign from './V2Form/arrow_right.svg'
import settingsSign from './V2Form/settings.svg'
import { Loader } from "lucide-react";
import roleAssignSign from './V2Form/roleAssign.svg'
import kickUserSign from './V2Form/kickUser.svg'
import filterSign from './V2Form/filterSign.svg'
import magnifier from './V2Form/magnifier.svg'


function RoleChanger() {
  const [roles, setroles] = useState(['super user', 'middle user', 'operator']) // for test only
  const [userRoles, setUserRoles] = useState({})
  const [whoToGive, setWhoToGive] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [openSortModal, setOpenSortModal] = useState(false)
  const [Roles, setRoles] = useState([])
  // const [RoleMap, setRoleMap] = useState({})
  const [loading, setLoading] = useState(true);
  const [idchose, setIdchose] = useState("")
  const [users, setUsers] = useState([])
  const [searchedUser, setSearchedUser] = useState('')
  const [AFS, setAFS] = useState(false)
  const [userSort, setUserSort] = useState('')
  const [searchOrder, setSearchOrder] = useState('')
  const [roleIdSort, setRoleIdSort] = useState('')
  const [page, setPage] = useState(1)
  const [pagiPrev, setPagiPrev] = useState(false)
  const [PagiNext, setPagiNext] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast()
  const userPhone = location.state?.phone;

  const nextPage = () => {
    if (PagiNext)
      setPage(p => p + 1)
  }

  const prevPage = () => {
    if (pagiPrev)
      setPage(p => p - 1)
  }

  const lineMaker = (total_page) => {
    let spans = []
    for (let i = 0; i < total_page; i++) {
      spans.push(i)
    }
    return spans
  }
  const RoleIdFinder = (role, arr) => {
    let Role_id = ""
    arr.forEach(a => {
      if (a.name == role) {
        Role_id = a.id
      }
    });
    return Role_id
  }

  // users fetching
  useEffect(() => {
    const fetchUsers = async () => {
      console.log(userSort)
      let endPoint = endpointMaker(userSort, RoleIdFinder(roleIdSort, Roles), searchedUser, searchOrder, `${APIURL}/admin/user`, page, [], true)
      console.log("here what you have done : ", endPoint)
      try {
        // ✅ Get token from localStorage (or context)
        const token = localStorage.getItem("token");
        const response = await fetch(`${endPoint}`, {
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
        console.log("basic data temp : ", json.data)
        setUsers(json.data.data);
        setPagiPrev(json.data.pagination.hasPrevPage)
        setPagiNext(json.data.pagination.hasNextPage)
        setPageCount(json.data.pagination.totalPages)
        setIdchose(0)
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, userSort, searchOrder, AFS, roleIdSort]); // run once on mount

  // getting the roles present now
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // ✅ Get token from localStorage (or context)
        const token = localStorage.getItem("token");
        const response = await fetch(`${APIURL}/admin/role`, {
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
        setRoles(json.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []); // run once on mount

  // the role fetcher
  const fetchUserRole = async (user_id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${APIURL}/admin/user/${parseInt(user_id)}/role`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        const json = await response.json();
        return json.data;
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      return null;
    }
  };

  // let filteredUsers = []
  // if (users.length > 0) {
  //   filteredUsers = users.filter((p) =>
  //     p.phone.includes(searchedUser)
  //   );
  // }

  const loadRoles = async () => {
    setLoading(true);
    let roleMap = {};

    for (let p of users) {
      let json_role = await fetchUserRole(p.id);
      if (json_role) {
        console.log("nan_barbari : ", json_role)
        roleMap[p.id] = json_role.length > 0 ? json_role[0].name : "نامعلوم";
      }
    }

    setUserRoles(roleMap);
    setLoading(false);
  };

  useEffect(() => {
    if (users.length > 0) {
      loadRoles();
    }
  }, [users]);

  // fetching and posting the new role 
  const updateUserRole = async (role) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APIURL}/admin/user/${parseInt(idchose)}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "roleIDs": [role.id]
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "خطا در تغییر نقش");
      if (res.ok) {
        addToast({
          title: 'نقش کاربر مورد نظر با موفقیت تغییر کرد',
          type: 'success',
          duration: 4000
        })
      }

      setOpenModal(false); // close modal
      loadRoles();
      console.log("✅ Role updated:", data);
    } catch (err) {
      console.error("❌ Error updating role:", err.message);
      console.log(role.id)
    }
  };

  const role_holder = (e) => {
    setOpenModal(false)
    users.forEach(p => {
      if (p.name == whoToGive) {
        alert(`شما دسترسی ${p.name} را تغییر دادید`)
      }
    });
  }

  if (loading) {
    return <Loader></Loader>;
  }

  return (
    <>
      <div className="forms_page_holder">
        <NavBar account={userPhone}></NavBar>
        <div className="forms-page-wrapper">
          <div className="forms-container">
            <div className="forms_tools">
              <div className="form_tool">
                <div className="form_search_bar">
                  <input
                    type="text"
                    className="form_search inp_question V2"
                    placeholder="جستجوی تلفن"
                    value={searchedUser}
                    onChange={(e) => {
                      setSearchedUser(e.target.value)
                      if (e.target.value == "") {
                        setAFS(p => !p)
                      }
                    }}
                  />
                </div>
                <button className="magnifier" onClick={() => setAFS(p => !p)}>
                  <span>
                    <img src={magnifier} alt="magnifier" />
                  </span>
                </button>

              </div>

              <div className="form_tool">
                <div className="sorter">
                  <select name="roleSort" id="" className="select_optionsV2" onChange={(e) => setRoleIdSort(e.target.value)}>
                    <option value="انتخاب کنید">نقش</option>
                    {Roles.map((r, index) => {
                      return <option value={r.name}>{r.name}</option>
                    })}
                  </select>
                </div>
                <div className="sorter">
                  <select name="sortOrder" id="" className="select_optionsV2" onChange={(e) => setSearchOrder(e.target.value)}>
                    <option value="انتخاب کنید">ترتیب داده</option>
                    <option value="asc">صعودی</option>
                    <option value="desc">نزولی</option>
                  </select>
                </div>
                <button className="filter_btn" onClick={() => setOpenSortModal(true)}>
                  <span>
                    اعمال فیلتر
                  </span>
                  <span>
                    <img src={filterSign} alt="filter users" />
                  </span>
                </button>
              </div>
            </div>

            {users.length === 0 ? (
              <p className="no-forms-text">کاربری یافت نشد.</p>
            ) : (
              <table className="forms-table">
                <thead>
                  <tr>
                    <th className="table-header RG">شماره ملی</th>
                    <th className="table-header RG">نقش کاربر</th>
                    <th className="table-header RG">شماره تلفن</th>
                    <th className="table-header RG">تاریخ ایجاد</th>
                    <th className="table-header RG">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => {
                    const userRole = userRoles[user.id] || 'بدون نقش';
                    const roleColor = roleColors[userRole] || '#e0e0e0'; // Default color if role not found
                    return (
                      <tr key={user.id} className="form-row">
                        <td className="table-cell RG">{user.socialSecurityNumber || 'نامشخص'}</td>
                        <td className="table-cell RG">
                          <span style={{
                            backgroundColor: roleColor, color: 'white', fontWeight: 'bold', textAlign: 'center'
                          }} className="roleInTable">
                            {userRole}
                          </span>

                        </td>
                        <td className="table-cell RG">{user.phone}</td>
                        <td className="table-cell RG">{new Date(user.createdAt).toLocaleDateString('fa-IR')}</td>
                        <td className="table-cell RG">
                          <div className="btn_formPage_holder">
                            <button
                              className="btn-view-form"
                              onClick={() => {
                                setIdchose(user.id);
                                setOpenModal(true);
                              }}
                            >
                              <img src={roleAssignSign} alt="change role" />
                            </button>
                            <button
                              className="btn-view-form"
                              onClick={() => {
                                setIdchose(user.id);
                                console.log(idchose)
                              }}
                            >
                              <img src={kickUserSign} alt="kick User" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            <div className="page_naver">
              <div className="total_pages">
                <span>تعداد صفحات {pageCount}</span>
              </div>
              <div className="page_line">
                <img src={rightSign} className="arrows" alt="rightSign" onClick={prevPage} />
                {lineMaker(pageCount).map((p, index) => {
                  return (
                    <span
                      key={index}
                      className="page_num"
                      style={page == p + 1 ? { background: "#eee" } : null}
                      onClick={() => setPage(p + 1)}
                    >
                      {p + 1}
                    </span>
                  )
                })}
                <img src={leftSign} alt="leftSign" className="arrows" onClick={nextPage} />
              </div>
            </div>
            {pageCount > 1 ? (
              <div className="btn_holder_next_prev aligner">
                <button className="btn_submit space-UD" onClick={prevPage}>صفحه ی قبلی</button>
                <button className="btn_submit space-UD" onClick={nextPage}>صفحه ی بعدی</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {openModal && (
        <div className="role_modal">
          <div className="modal_header">
            <h3>انتخاب نقش جدید</h3>
            <div className="modal_close" onClick={() => setOpenModal(false)}>
              <span>
                ✕
              </span>
            </div>
          </div>
          <div className="roles">
            {Roles.map((r, index) => (
              <div
                key={index}
                className="role"
                onClick={() => updateUserRole(r)}
              >
                {r.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {openSortModal && (
        <div className="role_modal">
          <div className="modal_header">
            <h3>دسته بندی بر حسب</h3>
            <div className="modal_close" onClick={() => setOpenSortModal(false)}>
              <span>
                ✕
              </span>
            </div>
          </div>
          <div className="roles">
            {Object.keys(sortOptions).map((sok, index) => (
              <div
                key={index}
                className="role"
                onClick={() => {
                  if (sok != "None") {
                    setUserSort(sok)
                  } else {
                    setUserSort('')
                    setSearchOrder('')
                  }
                  setOpenSortModal(false)
                }}
              >
                {sortOptions[sok]}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default RoleChanger 