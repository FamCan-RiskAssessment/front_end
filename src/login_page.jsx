import { useState } from "react";
import './login_page.css'
import { APIURL } from "./utils/config";
import { useLocation , useNavigate } from "react-router-dom";
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
function Login_page(){
    const [phone , setphone] = useState('')
    const [Err  , setError] = useState('')
    const navigate = useNavigate();
    const { addToast } = useToast()
    const form_submitted = async (e) =>{
        e.preventDefault();        
        try{
            const res = await fetch(`http://${APIURL}/auth/login`, {
                method:'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({phone}),
            })
            const data = await res.json()
            if (!res.ok){
                addToast({
                    title: "لطفا دوباره تلاش کنید",
                    type: 'error',
                    duration: 4000
                  })
            };
            if(res.ok){
                addToast({
                    title: 'خوش آمدید',
                    type: 'success',
                    duration: 4000
                  })
                navigate("/otp", { state: { phone } });;
            }
        }catch(err){
            setError(err.message)
            setTimeout(() => {
                setError('')
            } , 3000)
        }
    } 

    const adminLoginNav = () => {
        navigate("/adminLogin")
    }



    return(
        <>
    {/* {Err.length != 0 &&
        <div className= {Err.length != 0 ? "error_container fader" : null}>
        <span>{Err}</span>
        <i className="fa fa-ban"></i>
        </div>
    } */}
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
        <button className="support_call fixed_in_login">تماس با پشتیبانی</button>
        <div className="admin_enter">
        <button className="support_call2" onClick={adminLoginNav} style={{display:"none"}}>ورود اعضا</button>
        </div>
        <p className="copy_right">
            شرکت سرطان های ارثی و فامیلی فم کن
        </p>
        </>
    )
}

export default Login_page