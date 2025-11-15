import { useState } from "react";
import ToastProvider from "./toaster";
import { useToast } from "./toaster";
import { fetchDataPOST, isNumber } from "./utils/tools";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

function OperatorUserMobile() {

    const [oprUserPhone, setOprUserPhone] = useState("")
    const { addToast } = useToast()
    const navigate = useNavigate();
    const location = useLocation();

    const checkAndSend = async (e) => {
        e.preventDefault();
        if (oprUserPhone.length != 11) {
            addToast({
                title: "شماره را به درستی وارد کنید",
                type: 'error',
                duration: 4000
            })
        } else {
            let token = localStorage.getItem("token")
            let payload = {
                phone: oprUserPhone
            }
            let phoneAnswer = await fetchDataPOST("admin/operator/validate-user/request", token, payload)
            if (phoneAnswer.status == 200) {
                localStorage.setItem("oprUserPhone", oprUserPhone)
                navigate("/operator/userVerification")
            }
        }
    }



    return (
        <div className="otp-container">
            <div className="otp-card">
                <h2>شماره موبایل</h2>
                <p className="otp-msg">شماره تماس کاربر را وارد کنید:</p>

                <form className="otp-form">
                    <div className="otp-inputs">
                        <input type="text" className="opr-user-mobile" value={oprUserPhone} onChange={(e) => setOprUserPhone(e.target.value)} />
                    </div>

                    <button type="submit" className="otp-btn" onClick={checkAndSend}>تایید</button>
                </form>
            </div>
        </div>
    )
}


export default OperatorUserMobile