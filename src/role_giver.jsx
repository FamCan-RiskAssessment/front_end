import { useState , useEffect} from "react";
import PersonCard from "./card";
import NavBar from "./navBar";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { APIURL } from "./utils/config";
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
import "./role_giver.css"
function RoleChanger(){
    const [searchedUser , setSearchedUser] = useState('')
    const [roles , setroles] = useState(['super user' , 'middle user' , 'operator']) // for test only
    const [userRoles , setUserRoles] = useState({})
    const [whoToGive , setWhoToGive] = useState('')
    const [openModal , setOpenModal] = useState(false)
    const [Roles , setRoles] = useState([])
    const [loading, setLoading] = useState(true);
    const [idchose , setIdchose] = useState("")
    const [users , setUsers] = useState([])
    const location = useLocation();
    const { addToast } = useToast()
    const userPhone = location.state?.phone;
//     let people = [{
//     id:0,
//     name:"Amir",
//     meli_code:"1115556669",
//     telephone:"09338666836",
//     hist:"شنبه ، 16 مرداد ساعت 1 صبح ",
//     level:Roles[0],
//     admin:false
// },
// {
//     id:1,
//     name:"حمید",
//     meli_code:"0000000000",
//     telephone:"09858558585",
//     hist:"شنبه ، 16 مرداد ساعت 1 صبح ",
//     level:Roles[1],
//     admin:false
// }]
// users fetching
useEffect(() => {
  const fetchRoles = async () => {
    try {
      // ✅ Get token from localStorage (or context)
      const token = localStorage.getItem("token");
      const response = await fetch(`http://${APIURL}/admin/user`, {
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
      setUsers(json.data.data);
      setIdchose(0)
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchRoles();
}, []); // run once on mount

// getting the roles present now
useEffect(() => {
    const fetchRoles = async () => {
      try {
        // ✅ Get token from localStorage (or context)
        const token = localStorage.getItem("token");
        const response = await fetch(`http://${APIURL}/admin/role`, {
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
      `http://${APIURL}/admin/user/${parseInt(user_id)}/role`,
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

let filteredPeople = []
if(users.length > 0){
  filteredPeople = users.filter((p) =>
  // p.name.toLowerCase().includes(searchedUser.toLowerCase())
  p.phone.includes(searchedUser)
  );
}



const loadRoles = async () => {
  setLoading(true);
  let roleMap = {};

  for (let p of filteredPeople) {
    let json_role = await fetchUserRole(p.id);
    if (json_role) {
      console.log(json_role)
      roleMap[p.id] = json_role[0].name;
    }
  }

  setUserRoles(roleMap);
  setLoading(false);
};


useEffect(() => {
  if (filteredPeople.length > 0) {
    loadRoles();
  }
}, [users , searchedUser]);



//   fetching and posting the new role \

const updateUserRole = async (role) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://${APIURL}/admin/users/${parseInt(idchose)}/roles`, {
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
      if(res.ok){
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



const role_holder = (e) =>{
    setOpenModal(false)
    people.forEach(p => {
        if(p.name == whoToGive){
            alert(`شما دسترسی ${p.name} را تغییر دادید`)
        }
    });
}

    return(
        <>
        <NavBar account={userPhone}></NavBar>
        <div className="all_holder">
            <div className="title-holder">
                <h1>تغییر نقش</h1>
            </div>
            <div className="search_bar">
                    <input type="text" placeholder="جستجو ی کاربر" className="search_bar_input" value={searchedUser} onChange={(e) => setSearchedUser(e.target.value)}/>
                    <button className="btn_submit">جستجو</button>
            </div>
            <div className="card-holder">
                {filteredPeople.length > 0 &&  filteredPeople.map((p , index) => 
                  <PersonCard person={p} key={index} index={index} idP={p.id} clicker={setIdchose} opener={setOpenModal} role={userRoles[p.id]}></PersonCard> 
              )}
            </div>
        </div>
        {openModal && (
        <div className="role_modal">
            <div className="modal_header">
            <h3>نقش ها</h3>
            <div className="modal_close" onClick={() => setOpenModal(false)}>✕</div>
            </div>
            <div className="roles">
            {Roles.map((r, index) => (
                <div 
                key={index} 
                className="role" 
                onClick={() => updateUserRole(r)} // pass role directly instead of e.target.value
                >
                {r.name}
                </div>
            ))}
            </div>
        </div>
        )}


        </>

    )
}

export default RoleChanger 