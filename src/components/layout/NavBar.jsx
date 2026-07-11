import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css"
import { fetchDataGET } from "../../utils/tools";
import exitSign from '../../V2Form/exit.svg'
import timeSign from '../../V2Form/time.svg'
import homeSign from '../../V2Form/home.svg'
import formSign from '../../V2Form/formPageSign.svg'

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
    const roleString = localStorage.getItem("roles");
    let nameRole = "";
    try {
        const parsedRoles = roleString ? JSON.parse(roleString) : [];
        nameRole = parsedRoles?.[0]?.name || "";
    } catch (error) {
        nameRole = "";
    }
    const now = new Date();
    const persianDate = now.toLocaleDateString('fa-IR');
    const timeString = now.toLocaleTimeString('fa-IR');
    const persianDateTime = `${persianDate} - ${timeString}`;

    return (
        <div className="help_bar_container admin_navbar">
            <div className="admin_navbar__header">
                <h3 className="admin_navbar__title">ابزار های مدیریت کاربران</h3>
                <div className="admin_navbar__datetime">
                    <img src={timeSign} alt="time_sign" />
                    <span>ورود: {persianDateTime}</span>
                </div>
            </div>

            <div className="admin_navbar__user">
                <span className="admin_navbar__welcome">خوش آمدید</span>
                {userName && <span className="admin_navbar__name">{userName}</span>}
                {account && <span className="admin_navbar__phone">{account}</span>}
                {nameRole && <span className="admin_navbar__role">{nameRole}</span>}
            </div>

            <div className="admin_navbar__actions">
                <button
                    type="button"
                    className="admin_navbar__btn admin_navbar__btn--primary"
                    onClick={() => navigate("/Dashboard")}
                >
                    <img src={homeSign} alt="" />
                    <span>صفحه ی اصلی</span>
                </button>
                <button
                    type="button"
                    className="admin_navbar__btn"
                    onClick={() => navigate("/forms")}
                >
                    <img src={formSign} alt="" />
                    <span>صفحه ی فرم ها</span>
                </button>
                <button
                    type="button"
                    className="admin_navbar__btn admin_navbar__btn--danger"
                    onClick={() => navigate("/")}
                >
                    <img src={exitSign} alt="" />
                    <span>خروج</span>
                </button>
            </div>
        </div>
    )
}

export default NavBar
