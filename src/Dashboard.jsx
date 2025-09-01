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

    return(
        <>
            <NavBar account={person}></NavBar>
            <div className="tool_holder">
                <div className="tool_card" onClick={tool_chooser}>
                    <div className="tool_image">
                    </div>
                    <div className="tool_name">
                        <span>تغییر نقش</span>
                    </div>
                </div>

                <div className="tool_card">
                    <div className="tool_image" onClick={tool_chooser2}>
                    </div>
                    <div className="tool_name">
                        <span>ساخت نقش</span>
                    </div>
                </div>

                <div className="tool_card">
                    <div className="tool_image">
                    </div>
                    <div className="tool_name">
                        <span>tool</span>
                    </div>
                </div>


            </div>
        </>
    )
}

export default DashBoard