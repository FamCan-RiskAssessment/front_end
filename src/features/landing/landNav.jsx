import { useState } from "react";
import './totalLand.css'
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import famCanLogo from './bossLogo.svg'
function LandNav() {
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <div className="modernNav">
            <div className="logo-holder">
                <div className="logo">
                    <img src={famCanLogo} alt="famCan logo" />
                </div>
                <h2 className="title-famcan">فم کن</h2>
            </div>
            <div className="btns">
                {/* <button className="callsup" onClick={() => navigate("/aboutUs")}>درباره ما</button> */}
                <button className="callsup">تماس با پشتیبانی</button>
                <button className="enter hover1" onClick={() => {
                    localStorage.setItem("residentEnter", JSON.stringify(true))
                    navigate("/login")
                }}>ورود</button>
            </div>
        </div>
    )
}

export default LandNav