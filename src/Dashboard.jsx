import { useState } from "react";
import RoleChanger from "./role_giver";
import NavBar from "./navBar";
import "./DashBoard.css"
import { useLocation ,  useNavigate } from "react-router-dom";

function DashBoard(){
    let person = {
        name:"امیر",
        number:"09338666836"
    }
    const navigate = useNavigate();
    const tool_chooser = () =>{
        navigate("/DashBoard/RandP")
    }
    const tool_chooser2 = () =>{
        navigate("/DashBoard/roleMaker")
    }
    const tool_chooser3 = () =>{
        navigate("/DashBoard/patients")
    }

    return(
        <>
            <NavBar account={person}></NavBar>
            <div className="wrapper">
            <div className="title-holder">
                <h1>ابزارها</h1>
                <p className="subtitle">مدیریت نقش‌ها و بیماران</p>
            </div>

            <div className="tool_holder">
                <div className="tool_card" onClick={tool_chooser}>
                <div className="tool_image around_image role"></div>
                <div className="tool_name">
                    <span>تغییر نقش</span>
                </div>
                </div>

                <div className="tool_card" onClick={tool_chooser2}>
                <div className="tool_image around_image create"></div>
                <div className="tool_name">
                    <span>ساخت نقش</span>
                </div>
                </div>

                <div className="tool_card" onClick={tool_chooser3}>
                <div className="tool_image around_image patients"></div>
                <div className="tool_name">
                    <span>بیماران ثبت‌نام شده</span>
                </div>
                </div>
            </div>
            </div>

        </>
    )
}

export default DashBoard