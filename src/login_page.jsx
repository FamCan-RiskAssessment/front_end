import { useState } from "react";
import './login_page.css'
function Login_page(){
    const [phone , setphone] = useState('')
    const [Err  , setError] = useState('')
    const form_submitted = async (e) =>{
        e.preventDefault();        
        try{
            const res = await fetch("http://185.231.115.28:8080/auth/login", {
                method:'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({phone}),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Login failed");
            localStorage.setItem("token", data.token);
            window.location.href = "/otp";
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
                <form onSubmit={(e) => form_submitted(e)} className="login_form">
                    <div className="inp">
                    <label htmlFor="telephone">تلفن</label>
                    <input type="text" name="telephone" id="telephone" placeholder="09xxxxxxxxx" value={phone} onChange={(e) => setphone(e.target.value)}/>
                    </div>
                    {/* <div className="inp">
                    <label htmlFor="mellicode">کدملی</label>
                    <input type="text" name="mellicode" id="mellicode" placeholder="xxxxxxxxxx"/>
                    </div> */}
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