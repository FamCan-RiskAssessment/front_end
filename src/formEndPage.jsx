import { useEffect, useState } from "react";
import checkimg from './V2Form/checkSub.svg'
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
function FormEnd() {
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <>
            <div className="end_page_holder">
                <div className="end_page_details">
                    <img src={checkimg} alt="checkimg" />
                    <p className="details">
                        فرم شما با موفقیت ثبت شد! پس از بررسی و تأیید فرم شما ، همکاران ما با شما تماس خواهند گرفت . با تشکر از همراهی شما
                    </p>
                    <button className="btn-add-newV2" onClick={() => navigate('/forms')}>بازگشت به صفحه ی فرم ها</button>
                </div>
            </div>
        </>
    )
}

export default FormEnd