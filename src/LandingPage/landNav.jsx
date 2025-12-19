import { useState } from "react";
import './totalLand.css'
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
function LandNav() {
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <div className="modernNav">
            <div className="logo-holder">
                <div className="logo"></div>
                <h2 className="title-famcan">فم کن</h2>
            </div>
            <div className="btns">
                <button className="callsup">تماس با پشتیبانی</button>
                <button className="enter hover1" onClick={() => navigate("/attention")}>ورود</button>
            </div>
        </div>
    )
}

export default LandNav