import { useState } from "react";
import './login_page.css'
import { useLocation , useNavigate } from "react-router-dom";
import { APIURL } from "./utils/config";
function AdminLogin_page(){
    const [phone , setphone] = useState('')
    const [Apassword , setApassword] = useState('')
    const [Err  , setError] = useState('')
    const navigate = useNavigate();
    const form_submitted = async (e) =>{
        e.preventDefault();        
        try{
            const res = await fetch(`http://${APIURL}/auth/admin/login`, {
                method:'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "phone":phone,
                    "password":Apassword
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Login failed");
            if(res.ok){
                navigate("/DashBoard");
            }
        }catch(err){
            setError(err.message)
            setTimeout(() => {
                setError('')
            } , 3000)
        }
    } 




    return(
        <>
    {Err.length != 0 &&
        <div className= {Err.length != 0 ? "error_container fader" : null}>
        <span>{Err}</span>
        <i className="fa fa-ban"></i>
        </div>
    }
        <div className="login_container">            
            <div className="form_card">
                <h3 className="login_title">سامانه ریسک سنجی آنلاین</h3>
                <p className="login_desc">صفحه ورود ادمین</p>
                <form onSubmit={(e) => form_submitted(e)} className="login_form">
                    <div className="inp">
                    <label htmlFor="telephone">نام کاربری</label>
                    <input type="text" name="telephone" id="telephone" placeholder="09xxxxxxxxx" value={phone} onChange={(e) => setphone(e.target.value)}/>
                    </div>
                    <div className="inp">
                    <label htmlFor="mellicode">رمز عبور</label>
                    <input type="password" placeholder="xxxxxxxxxx" value={Apassword} onChange={(e) => setApassword(e.target.value)}/>
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

export default AdminLogin_page