import { useState } from "react";
import './login_pageV3.css'
import { APIURL } from "../utils/config";
import { useLocation, useNavigate } from "react-router-dom";

import { useToast } from "../toaster";
import ToastProvider from "../toaster";
import { User, IdCard, Building } from "lucide-react";
import { fetchDataPOST } from "../utils/tools";

// Import sponsor logos
import bimeSalamteMan from '../assets/logos/bime-salamte-man-icon.png';
import logoHybrid from '../assets/logos/Logo Hybrid 2.png';
import pajooheshkadeh from '../assets/logos/پژوهشکده.png';
import shahidBeheshti from '../assets/logos/شهیدبهشتی.jpg';
import tehranUni from '../assets/logos/لوگو انگلیسی دانشگاه تهران.jpg';
import behdasht from '../assets/logos/لوگو-وزارت-بهداشت-2-3.jpg';
import mazandaran from '../assets/logos/مازندران.webp';
import mohavateBehdashti from '../assets/logos/معاونت بهداشتی وزارت.jpg';

function ResidentRegister() {
    const [uname, setUname] = useState('');
    const [ulast, setUlast] = useState('')
    const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
    const [company, setCompany] = useState('');
    const [Err, setError] = useState('');
    const navigate = useNavigate();
    const { addToast } = useToast();

    const form_submitted = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!uname.trim() || !ulast.trim()) {
            addToast({
                title: "لطفا نام و نام خانوادگی را وارد کنید",
                type: 'error',
                duration: 4000
            });
            return;
        }

        if (!socialSecurityNumber.trim()) {
            addToast({
                title: "لطفا کد ملی را وارد کنید",
                type: 'error',
                duration: 4000
            });
            return;
        }

        if (!company.trim()) {
            addToast({
                title: "لطفا محل کار را وارد کنید",
                type: 'error',
                duration: 4000
            });
            return;
        }

        // try {
        // const res = await fetch(`http://${APIURL}/admin/profile/submit`, {
        //     method: 'POST',
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //         name: uname,
        //         lastName: ulast,
        //         socialSecurityNumber: socialSecurityNumber,
        //         healthCenter: company
        //     }),
        // });

        let payload = {
            name: uname,
            lastName: ulast,
            socialSecurityNumber: socialSecurityNumber,
            healthCenter: company
        }
        let token = localStorage.getItem("token")
        const data = await fetchDataPOST("admin/profile/submit", token, payload)
        // const data = await res.json();

        if (data.status == 200 || data.status == 201) {
            addToast({
                title: data.message || "پروفایل شما ذخیره شد",
                type: 'success',
                duration: 4000
            });
        } else {
            addToast({
                title: data.message || "خطا در ثبت اطلاعات",
                type: 'error',
                duration: 4000
            });
        }

        // if (res.ok) {
        //     addToast({
        //         title: 'ثبت نام با موفقیت انجام شد',
        //         type: 'success',
        //         duration: 4000
        //     });

        // Navigate to a success page or login page
        navigate("/login"); // Adjust this route as needed
    }
    // } catch (err) {
    //     setError(err.message);
    //     addToast({
    //         title: "خطایی رخ داده است. لطفا دوباره تلاش کنید.",
    //         type: 'error',
    //         duration: 4000
    //     });
    //     setTimeout(() => {
    //         setError('');
    //     }, 3000);
    // }

    const adminLoginNav = () => {
        navigate("/adminLogin");
    };

    return (
        <>
            <div className="login_container">
                <div className="middles">
                    <div className="colgroup">
                        <img src={behdasht} alt="وزارت بهداشت" className="sponsor-logo" />
                        <img src={mohavateBehdashti} alt="معاونت بهداشتی" className="sponsor-logo" />
                        <img src={tehranUni} alt="دانشگاه تهران" title="طراحی، تولید و اعتبارسنجی سامانه ریسکسنجی سرطانهای پستان و کولورکتال در جمعیت ایرانی
(فازهای اول و دوم پروژه ملی پیشگیری فردمحور سرطان). کد طرح: 1404-1-107-91678" className="sponsor-logo" />
                    </div>
                    <div className="middle_form">
                        <h3 className="login_title clear_title">
                            سامانه ی ریسک سنجی و تشخیص سرطان
                        </h3>
                        <div className="form_cardV3 resCard">
                            <h3 className="login_title">لطفا اطلاعات زیر را وارد کنید</h3>
                            <form onSubmit={(e) => form_submitted(e)} className="login_form">
                                <div className="inp resInp">
                                    <label htmlFor="fullName">نام</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        id="fullName"
                                        placeholder="نام و نام خانوادگی خود را وارد کنید"
                                        value={uname}
                                        onChange={(e) => setUname(e.target.value)}
                                    />
                                </div>
                                <div className="inp resInp">
                                    <label htmlFor="fullName">نام و نام خانوادگی</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        id="fullName"
                                        placeholder="نام و نام خانوادگی خود را وارد کنید"
                                        value={ulast}
                                        onChange={(e) => setUlast(e.target.value)}
                                    />
                                </div>
                                <div className="inp resInp">
                                    <label htmlFor="socialSecurityNumber">کد ملی</label>
                                    <input
                                        type="text"
                                        name="socialSecurityNumber"
                                        id="socialSecurityNumber"
                                        placeholder="کد ملی 10 رقمی خود را وارد کنید"
                                        value={socialSecurityNumber}
                                        onChange={(e) => setSocialSecurityNumber(e.target.value)}
                                        maxLength="10"
                                    />
                                </div>

                                <div className="inp resInp">
                                    <label htmlFor="company">مرکز</label>
                                    <input
                                        type="text"
                                        name="company"
                                        id="company"
                                        placeholder="نام مرکز خود را وارد کنید"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className="btn_login">ثبت نام</button>
                            </form>
                        </div>
                    </div>
                    <div className="colgroup">
                        <img src={bimeSalamteMan} alt="بیمه سلامت من" className="sponsor-logo" />
                        <img src={shahidBeheshti} alt="دانشگاه شهید بهشتی" title="اعتبارسنجی و بومی سازی مدل های معتبر پیش بینی خطر  سرطان‌ ریه در جمعیت ایرانی (فازهای اول و دوم پروژه ملی پیشگیری فردمحور سرطان) طبقه‌بندی خطر و ثبت موارد. کد طرح: 43017023" className="sponsor-logo" />
                        <img src={mazandaran} alt="مازندران" className="sponsor-logo" />
                    </div>
                </div>
                <div className="rowgroup">
                    <img src={pajooheshkadeh} alt="پژوهشکده" className="sponsor-logo big-logo" />
                    <img src={logoHybrid} alt="لوگو هیبرید" className="sponsor-logo big-logo" />
                </div>
            </div>
            <div className="call-holder">
                <button className="support_call">تماس با پشتیبانی</button>
            </div>
            <div className="admin_enter" style={{ display: "none" }}>
                <button className="support_call2" onClick={adminLoginNav}>ورود اعضا</button>
            </div>
            <p className="copy_right">
                انجمن سرطان های ارثی و فامیلی فم کن
            </p>
        </>
    );
}

export default ResidentRegister;