import { useRef } from "react";
import "./OtpOperatorPage.css";
import { fetchDataPOST } from "./utils/tools";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import ToastProvider from "./toaster";
import { useToast } from "./toaster";

export default function OtpPage({ onSubmit }) {
    const inputsRef = useRef([]);
    const { addToast } = useToast()
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e, index) => {
        const value = e.target.value;

        // Move to next box when typing
        if (value && index < 5) {
            inputsRef.current[index + 1].focus();
        }

        // Move to previous if deleting
        if (!value && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const otp = inputsRef.current.map(input => input.value).join("");
        let token = localStorage.getItem("token")
        let payload = {
            "phone": localStorage.getItem("oprUserPhone"),
            "otp": otp
        }
        const oprUserver = await fetchDataPOST("admin/operator/validate-user/verify", token, payload)
        if (oprUserver.status == 200) {
            addToast({
                title: "کاربر با موفقیت پویش شد",
                type: 'success',
                duration: 4000
            })
            localStorage.setItem("userNeededAdress", "admin/operator/form")
            localStorage.setItem("operatorUserId", oprUserver.data.userId)
            navigate("/forms/new")
        }

    };

    return (
        <div className="otp-container">
            <div className="otp-card">
                <h2>تایید شماره موبایل</h2>
                <p className="otp-msg">کد پیامک شده را وارد کنید:</p>

                <form className="otp-form" onSubmit={handleSubmit}>
                    <div className="otp-inputs">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <input
                                key={i}
                                type="text"
                                maxLength="1"
                                ref={(el) => (inputsRef.current[i] = el)}
                                onChange={(e) => handleChange(e, i)}
                            />
                        ))}
                    </div>

                    <button type="submit" className="otp-btn">تایید</button>
                </form>

                <p className="resend">
                    کدی دریافت نکردید؟{" "}
                    <a href="#" id="resend-btn">ارسال دوباره</a>
                </p>
            </div>
        </div>
    );
}
