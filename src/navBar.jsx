import React from "react";
import "./defnav.css"

function NavBar({account}){
    return(
        <nav>
            <div>
                <h2 className="account_name">{account.name}</h2>
            </div>
            <div className="item-holder">
                <ul className="nav-list">
                    <li className="nav-item"><a href="/DashBoard">صفحه ی اصلی</a></li>
                    <li className="nav-item"><a href="#">تغییر نقش</a></li>
                    <li className="nav-item"><a href="#">ثبت نام شده ها</a></li>
                </ul>
            </div>
        </nav>
    )
}

export default NavBar