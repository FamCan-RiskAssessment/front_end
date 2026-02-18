import { useState } from "react";
import './login_page.css'
import { APIURL } from "./utils/config";
import { useLocation, useNavigate } from "react-router-dom";

import { useToast } from "./toaster";
import ToastProvider from "./toaster";

// Import sponsor logos
import bimeSalamteMan from './assets/logos/bime-salamte-man-icon.png';
import logoHybrid from './assets/logos/Logo Hybrid 2.png';
import pajooheshkadeh from './assets/logos/پژوهشکده.png';
import shahidBeheshti from './assets/logos/شهیدبهشتی.jpg';
import tehranUni from './assets/logos/لوگو انگلیسی دانشگاه تهران.jpg';
import behdasht from './assets/logos/لوگو-وزارت-بهداشت-2-3.jpg';
import mazandaran from './assets/logos/مازندران.webp';
import mohavateBehdashti from './assets/logos/معاونت بهداشتی وزارت.jpg';

function Login_page() {
    const [phone, setphone] = useState('')
    const [Err, setError] = useState('')
    const navigate = useNavigate();
    const { addToast } = useToast()
    const form_submitted = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${APIURL}/auth/login`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            })
            const data = await res.json()
            if (!res.ok) {
                addToast({
                    title: "لطفا دوباره تلاش کنید",
                    type: 'error',
                    duration: 4000
                })
            };
            if (res.ok) {
                addToast({
                    title: 'خوش آمدید',
                    type: 'success',
                    duration: 4000
                })
                navigate("/otp", { state: { phone } });;
            }
        } catch (err) {
            setError(err.message)
            setTimeout(() => {
                setError('')
            }, 3000)
        }
    }

    const adminLoginNav = () => {
        navigate("/adminLogin")
    }



    return (
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
                            <input type="text" name="telephone" id="telephone" placeholder="09xxxxxxxxx" value={phone} onChange={(e) => setphone(e.target.value)} />
                        </div>
                        {/* <div className="inp">
                    <label htmlFor="mellicode">کدملی</label>
                    <input type="text" name="mellicode" id="mellicode" placeholder="xxxxxxxxxx"/>
                    </div> */}
                        <button className="btn_login">ورود</button>
                    </form>
                </div>
                <div className="sponsors-section">
                    <h3 className="sponsors-title">حامیان ما</h3>
                    <div className="sponsors-grid">
                        <img src={bimeSalamteMan} alt="بیمه سلامت من" className="sponsor-logo" />
                        <img src={logoHybrid} alt="لوگو هیبرید" className="sponsor-logo" />
                        <img src={pajooheshkadeh} alt="پژوهشکده" className="sponsor-logo" />
                        <img src={shahidBeheshti} alt="دانشگاه شهید بهشتی" title="اعتبارسنجی و بومی سازی مدل های معتبر پیش بینی خطر  سرطان‌ ریه در جمعیت ایرانی (فازهای اول و دوم پروژه ملی پیشگیری فردمحور سرطان) طبقه‌بندی خطر و ثبت موارد. کد طرح: 43017023" className="sponsor-logo" />
                        <img src={tehranUni} alt="دانشگاه تهران" title="طراحی، تولید و اعتبارسنجی سامانه ریسکسنجی سرطانهای پستان و کولورکتال در جمعیت ایرانی
(فازهای اول و دوم پروژه ملی پیشگیری فردمحور سرطان). کد طرح: 1404-1-107-91678" className="sponsor-logo" />
                        <img src={behdasht} alt="وزارت بهداشت" className="sponsor-logo" />
                        <img src={mazandaran} alt="مازندران" className="sponsor-logo" />
                        <img src={mohavateBehdashti} alt="معاونت بهداشتی" className="sponsor-logo" />
                    </div>
                </div>
            </div>
            <button className="support_call fixed_in_login">تماس با پشتیبانی</button>
            <div className="admin_enter">
                <button className="support_call2" onClick={adminLoginNav}>ورود اعضا</button>
            </div>
            <p className="copy_right">
                انجمن سرطان های ارثی و فامیلی فم کن
            </p>
        </>
    )
}

export default Login_page