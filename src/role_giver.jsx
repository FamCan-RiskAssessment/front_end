import { useState } from "react";
import PersonCard from "./card";
import "./role_giver.css"
function RoleChanger(){
    let people = [{
    name:"Amir",
    meli_code:"1115556669",
    telephone:"09338666836",
    hist:"شنبه ، 16 مرداد ساعت 1 صبح ",
    level:"کاربر معمولی",
    admin:false
},
{
    name:"حمید",
    meli_code:"0000000000",
    telephone:"09858558585",
    hist:"شنبه ، 16 مرداد ساعت 1 صبح ",
    level:"کاربر معمولی",
    admin:false
}]

    return(
        <div className="all_holder">
            <div className="title-holder">
                <h1>تغییر نقش</h1>
            </div>
            <div className="card-holder">
                {people.map((p , index) => 
                    <PersonCard person={p} key={index} index={index}></PersonCard> 
                )}
            </div>
        </div>
    )
}

export default RoleChanger 