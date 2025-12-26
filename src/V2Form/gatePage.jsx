import { useEffect } from "react";
import timeIcon from './Icon.svg'

// import { useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
function GatePage() {
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <>
            <div className="gatecontainer">
                <div className="form_card">
                    <div className="section">
                        <img src={timeIcon} alt="timeIcon" />
                    </div>
                    <div className="section">
                        <h3 className="gateTitle">ارزیابی هوشمند ریسک سرطان،
                            در کمتر از ۱۵ دقیقه</h3>
                    </div>
                    <div className="section">
                        <p>با پرکردن فرمی ساده و محرمانه، یک تحلیل شخصی‌شده بر اساس آخرین پژوهش‌های جهانی دریافت کنید.به همراه توصیه‌های عملی برای گام‌های بعدی.</p>
                    </div>
                    <div className="section">
                        <button className="gatebtn" onClick={() => navigate("/attention")}>شروع ارزیابی رایگان</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default GatePage