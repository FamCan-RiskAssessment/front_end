import { useState } from "react";
import PersonCard from "./card";
import NavBar from "./navBar";
import "./role_giver.css"
function RoleChanger(){
    const [searchedUser , setSearchedUser] = useState('')
    const [roles , setroles] = useState(['super user' , 'middle user' , 'operator']) // for test only
    const [whoToGive , setWhoToGive] = useState('')
    const [openModal , setOpenModal] = useState(false)
    const [Roles , setRoles] = useState(["common" , "common"])
    console.log("this is fucking openModal : " , openModal)
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
            <div className="card-holder">
                <div className="search_bar">
                    <input type="text" placeholder="جستجو ی کاربر" className="search_bar_input" value={searchedUser} onChange={(e) => setSearchedUser(e.target.value)}/>
                    <button className="btn_question">جستجو</button>
                </div>
                {filteredPeople.length > 0 &&  filteredPeople.map((p , index) => 
                    <PersonCard person={p} key={index} index={index} clicker={setWhoToGive} opener={setOpenModal}></PersonCard> 
                )}
            </div>
        </div>
        {openModal && (
            <div className="role_modal">
            <div className="modal_header">
            <div>نقش ها</div>
            <div className="modal_close" onClick={() => setOpenModal(false)}>بستن</div>
            </div>
            <div className="roles">
                {roles.map((r , index) => 
                <div className="role" onClick={(e) => role_holder(e.target.value)}>{r}</div>
                )}
            </div>
        </div>
        )}

        </>

    )
}

export default RoleChanger 