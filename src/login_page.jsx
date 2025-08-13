import { useState } from "react";
import './login_page.css'
function Login_page(){
    return(
        <>
        <div className="login_container">
            <div className="form_card">
                <h3 className="login_title">سامانه ریسک سنجی آنلاین</h3>
                <form action="" method="post" className="login_form">
                    <div className="inp">
                    <label htmlFor="telephone">تلفن</label>
                    <input type="text" name="telephone" id="telephone" placeholder="09xxxxxxxxx"/>
                    </div>
                    <div className="inp">
                    <label htmlFor="mellicode">کدملی</label>
                    <input type="text" name="mellicode" id="mellicode" placeholder="xxxxxxxxxx"/>
                    </div>
                    <button className="btn_login">ورود</button>
                </form>
            </div>
        </div>
        <button className="support_call ">تماس با پشتیبانی</button>
        <p className="copy_right">
            شرکت سرطان های ارثی و فامیلی فم کن
        </p>
        </>
    )
}

export default Login_page