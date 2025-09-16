import { useState , useEffect} from "react";
import PersonCard from "./card";
import NavBar from "./navBar";
import "./role_giver.css"
function RoleChanger(){
    const [searchedUser , setSearchedUser] = useState('')
    const [roles , setroles] = useState(['super user' , 'middle user' , 'operator']) // for test only
    const [whoToGive , setWhoToGive] = useState('')
    const [openModal , setOpenModal] = useState(false)
    const [Roles , setRoles] = useState([])
    const [loading, setLoading] = useState(true);
    const [idchose , setIdchose] = useState("")
    console.log(idchose)
    let people = [{
    id:0,
    name:"Amir",
    meli_code:"1115556669",
    telephone:"09338666836",
    hist:"شنبه ، 16 مرداد ساعت 1 صبح ",
    level:Roles[0],
    admin:false
},
{
    id:1,
    name:"حمید",
    meli_code:"0000000000",
    telephone:"09858558585",
    hist:"شنبه ، 16 مرداد ساعت 1 صبح ",
    level:Roles[1],
    admin:false
}]

let person = {
    name:"امیر",
    number:"09338666836"
}
// getting the roles present now
useEffect(() => {
    const fetchRoles = async () => {
      try {
        // ✅ Get token from localStorage (or context)
        const token = localStorage.getItem("token");
        const response = await fetch("http://185.231.115.28:8080/admin/roles", {
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

//   fetching and posting the new role \

const updateUserRole = async (role) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://185.231.115.28:8080/admin/users/${parseInt(idchose)}/roles`, {
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

    //   setUserType(roleName); // update UI
    //   setAdmin(roleName === "ادمین");
      setOpenModal(false); // close modal
      setIdClicked(0)
      console.log("✅ Role updated:", data);
    } catch (err) {
      console.error("❌ Error updating role:", err.message);
      console.log(role.id)
    }
  };

const filteredPeople = people.filter((p) =>
p.name.toLowerCase().includes(searchedUser.toLowerCase())
);

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
        <NavBar account={person}></NavBar>
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
                    <PersonCard person={p} key={index} index={index} idP={p.id} clicker={setIdchose} opener={setOpenModal}></PersonCard> 
                )}
            </div>
        </div>
        {openModal && (
        <div className="role_modal">
            <div className="modal_header">
            <h3>نقش ها</h3>
            <div className="modal_close" onClick={() => setOpenModal(false)}>✕</div>
            </div>
            <div className="roles">s
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