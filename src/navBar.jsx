import React from "react";
import { useLocation ,  useNavigate } from "react-router-dom";
import "./defnav.css"

function NavBar({account}){
  const navigate = useNavigate();
    return(
        <nav>
            <div className="account-holder">
                <h2 className="account_name">{account}</h2>
                <h2 className="account_name mob" onClick={() => navigate("/DashBoard")}>صفحه ی اصلی</h2>
                <h2 className="quit-btn" onClick={() => navigate("/")}>خروج</h2>

            </div>
            <div className="item-holder">
                <ul className="nav-list">
                    <li className="nav-item"><a href="/DashBoard">صفحه ی اصلی</a></li>
                    {/* <li className="nav-item"><a href="#">تغییر نقش</a></li> */}
                    {/* <li className="nav-item"><a href="#">ثبت نام شده ها</a></li> */}
                </ul>
            </div>
        </nav>
    )
}

export default NavBar