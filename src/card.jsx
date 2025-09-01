import { useState , useEffect } from "react";
import "./card.css"
import {animate} from "animejs"
function PersonCard({person, index , clicker , opener} ){
    const [admin , setadmin] = useState(false)
    const [userType , setUserType] = useState("کاربر معمولی")
    console.log(index)
    const admin_maker = () => {
        setadmin(a => true)
        setUserType(u => "ادمین")
        clicker(a => person.name)
        opener(true)
    }
    useEffect(() => {
        if(admin){
            animate(`.card_tot[index="${index}"]` , {
                backgroundColor:"#6cffbb",
                duration:500,
            })
        }
    })
    return(
        <div className="card_tot" index={index}>
            <div className="card">
            <div className="name">
                <h3>نام : {person.name}</h3>
            </div>
            <div className="meli-code">
                <h3>کدملی : {person.meli_code}</h3>
            </div>
            <div className="shomare">
                <h3>تلفن همراه : {person.telephone}</h3>
            </div>
            <div className="btn-holder">
                <button className="promote" onClick={() => admin_maker()}>
                    ارتقا دسترسی
                </button>
                <button className="kick">
                    اخراج
                </button>
            </div>
            </div>
            <div className="hist_level">
            <div className="hist">
                تاریخ عضویت : {person.hist}
            </div>
            <div className="level">
                سطح دسترسی : {userType}
            </div>
            </div>
        </div>
    )
}

export default PersonCard