import {useState} from "react";
import './login_pageV3.css'
import {APIURL} from "../utils/config";
import {useNavigate} from "react-router-dom";

import {useToast} from "../toaster";

// Import sponsor logos
import bimeSalamteMan from '../assets/logos/bime-salamte-man-icon.png';
import logoHybrid from '../assets/logos/Logo Hybrid 2.png';
import pajooheshkadeh from '../assets/logos/پژوهشکده.png';
import shahidBeheshti from '../assets/logos/شهیدبهشتی.jpg';
import tehranUni from '../assets/logos/لوگو انگلیسی دانشگاه تهران.jpg';
import behdasht from '../assets/logos/لوگو-وزارت-بهداشت-2-3.jpg';
import mazandaran from '../assets/logos/مازندران.webp';
import mohavateBehdashti from '../assets/logos/معاونت بهداشتی وزارت.jpg';
import {Phone} from "lucide-react";

function Login_pageV3() {
    const [phone, setphone] = useState('')
    const [Err, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    const {addToast} = useToast()
    const handleLogin = async (e) => {
        e?.preventDefault?.();
        if (isLoading) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${APIURL}/auth/login`, {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({phone}),
            })
            const data = await res.json()
            if (!res.ok) {
                addToast({
                    title: "لطفا دوباره تلاش کنید",
                    type: 'error',
                    duration: 4000
                })
                return;
            }

            addToast({
                title: 'خوش آمدید',
                type: 'success',
                duration: 4000
            })
            navigate("/otp", {state: {phone}});
        } catch (err) {
            setError(err.message)
            setTimeout(() => {
                setError('')
            }, 3000)
        } finally {
            setIsLoading(false);
        }
    }

    const handlePhoneKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
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
                <div className="middles">
                    <div className="colgroup">
                        <img src={behdasht} alt="وزارت بهداشت" className="sponsor-logo"/>
                        <img src={mohavateBehdashti} alt="معاونت بهداشتی" className="sponsor-logo"/>
                        <img src={tehranUni} alt="دانشگاه تهران" title="طراحی، تولید و اعتبارسنجی سامانه ریسکسنجی سرطانهای پستان و کولورکتال در جمعیت ایرانی
(فازهای اول و دوم پروژه ملی پیشگیری فردمحور سرطان). کد طرح: 1404-1-107-91678" className="sponsor-logo"/>
                    </div>
                    <div className="middle_form">
                        <h3 className="login_title clear_title">
                            سامانه ی ریسک سنجی و تشخیص سرطان
                        </h3>
                        <div className="form_card">
                            <Phone color="#cf4776" size={128}/>
                            <h3 className="login_title">برای شروع، شماره تلفن خود را وارد کنید.</h3>
                            <form onSubmit={handleLogin} className="login_form">
                                <div className="inp">
                                    <label htmlFor="telephone">تلفن</label>
                                    <input data-clarity-mask="true" type="tel" name="telephone" id="telephone"
                                           placeholder="مثال: 09123456789" value={phone}
                                           inputMode="tel"
                                           enterKeyHint="go"
                                           autoComplete="tel"
                                           disabled={isLoading}
                                           onChange={(e) => setphone(e.target.value)}
                                           onKeyDown={handlePhoneKeyDown}/>
                                </div>
                                {/* <div className="inp">
                    <label htmlFor="mellicode">کدملی</label>
                    <input type="text" name="mellicode" id="mellicode" placeholder="xxxxxxxxxx"/>
                    </div> */}
                                <button type="submit" className="btn_login" disabled={isLoading}>
                                    {isLoading && <span className="btn_login_spinner" aria-hidden="true" />}
                                    {isLoading ? 'در حال ورود...' : 'ورود'}
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="colgroup">
                        <img src={bimeSalamteMan} alt="بیمه سلامت من" className="sponsor-logo"/>
                        <img src={shahidBeheshti} alt="دانشگاه شهید بهشتی"
                             title="اعتبارسنجی و بومی سازی مدل های معتبر پیش بینی خطر  سرطان‌ ریه در جمعیت ایرانی (فازهای اول و دوم پروژه ملی پیشگیری فردمحور سرطان) طبقه‌بندی خطر و ثبت موارد. کد طرح: 43017023"
                             className="sponsor-logo"/>
                        <img src={mazandaran} alt="مازندران" className="sponsor-logo"/>
                    </div>
                </div>
                <div className="rowgroup">
                    <img src={pajooheshkadeh} alt="پژوهشکده" className="sponsor-logo big-logo"/>
                    <img src={logoHybrid} alt="لوگو هیبرید" className="sponsor-logo big-logo"/>
                </div>
            </div>
            <div className="call-holder">
                <button className="support_call">تماس با پشتیبانی</button>
            </div>
            <div className="admin_enter" style={{display: "none"}}>
                <button className="support_call2" onClick={adminLoginNav}>ورود اعضا</button>
            </div>
            <p className="copy_right">
                انجمن سرطان های ارثی و فامیلی فم کن
            </p>
        </>
    )
}

export default Login_pageV3


{/* <div className="sponsors-section">
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
                </div> */
}