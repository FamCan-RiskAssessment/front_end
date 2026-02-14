import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./defnav.css"
import { fetchDataGET } from "./utils/tools";
import exitSign from './V2Form/exit.svg'
import timeSign from './V2Form/time.svg'
import homeSign from './V2Form/home.svg'

function NavBar({ account }) {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('')
    useEffect(() => {
        let token = localStorage.getItem("token")
        const getUserDetail = async () => {
            let res = await fetchDataGET("admin/profile", token)
            if (res.status == 200 || res.status == 201) {
                let processed_data = res.data.name + " " + res.data.lastName
                setUserName(processed_data)
            }
        }
        getUserDetail()
    }, [])
    let role = localStorage.getItem("roles")
    let nameRole = JSON.parse(role)[0].name
    // Get current date and time
    const now = new Date();
    const persianDate = now.toLocaleDateString('fa-IR');
    const timeString = now.toLocaleTimeString('fa-IR');
    const persianDateTime = `${persianDate} - ${timeString}`;

    return (
        <div
            className="help_bar_container"
        >
            <div className="top-layer">
                <div className="help_bar_parts_container">
                    <div className="help_bar_part1">
                        <h3>
                            <img src={timeSign} alt="time_sign" />
                            <span style={{ marginRight: '8px', fontSize: '0.9em', color: '#666' }}>{persianDateTime}</span>
                        </h3>
                    </div>
                    <h3 className="forms-title">ابزار های مدیریت کاربران</h3>
                    <div className="help_bar_part3">
                        <button className="btn-view-form top align_items" onClick={() => navigate("/Dashboard")}>
                            <span>صفحه ی اصلی</span>
                            <img src={homeSign} alt="home" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="bottom-layer">
                <div className="help_bar_parts_container">
                    <div className="help_bar_part1 Nav">
                        <span>خوش آمدید</span>
                        {userName && (
                            <span>{userName}</span>
                        )}
                        <span>{account}</span>
                        <span className="RoleSpan">{nameRole}</span>
                    </div>
                    <div className="help_bar_part3 dash">
                        <button className="dash_exit_btn">
                            <img src={exitSign} alt="exit_sign" />
                            <span onClick={() => navigate("/")}>خروج</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NavBar