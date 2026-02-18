import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { APIURL } from "./utils/config";
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
import { fetchDataGET, fetchDataGETNoError, fetchDataPOST } from "./utils/tools";
import otpSign from './V2Form/otpSign.svg'
import tool_pinkSign from './V2Form/pink_tool.svg'

function LoginMessage() {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [Err, setError] = useState('')
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone || ""; // ✅ get phone from state
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes = 120 seconds
  const adminNumber = "09123456789"
  const { addToast } = useToast()
  const inputRefs = useRef([]);



  const OTP = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      addToast({
        title: "لطفا کد 6 رقمی را کامل وارد کنید",
        type: 'error',
        duration: 4000
      });
      return;
    }

    try {
      const res = await fetch(`${APIURL}/auth/verify-otp`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          otp: otpCode
        }),
      });

      const data = await res.json();
      console.log(data)
      if (!res.ok) {
        addToast({
          title: data.message || "لطفا کد ارسال شده را به درستی وارد کنید",
          type: 'error',
          duration: 4000
        })
      };

      localStorage.setItem("token", data.data.access_token);
      localStorage.setItem("number", phone)
      localStorage.setItem("permissions", JSON.stringify(data.data.permissions))
      localStorage.setItem("roles", JSON.stringify(data.data.roles))
      let userAuthed = await fetchDataGETNoError("admin/profile", data.data.access_token)
      console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHH")
      console.log(localStorage.getItem("residentEnter") && (userAuthed.status == 200 || userAuthed.status == 201))
      console.log(localStorage.getItem("residentEnter"), (userAuthed.status == 200 || userAuthed.status == 201))
      if (JSON.parse(localStorage.getItem("residentEnter")) && (userAuthed.status == 200 || userAuthed.status == 201)) {
        addToast({
          title: 'با موفقیت وارد شدید',
          type: 'success',
          duration: 4000
        })
        // navigate("/forms");
        navigate("/DashBoard")
      } else {
        navigate("/AppChoose");
      }

    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return; // Only allow digits

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);

    // Focus on the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex].focus();
  };

  useEffect(() => {
    if (timeLeft <= 0) return; // Stop when it reaches 0

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId); // cleanup
  }, [timeLeft]);
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const VerifyAgain = async () => {
    let token = localStorage.getItem("token")
    let payload = {
      phone: phone
    }
    let res = await fetchDataPOST("auth/login", token, payload)
    if (res.status == 200) {
      addToast({
        title: "کد تایید برای شما ارسال شد .",
        type: 'success',
        duration: 4000
      })
      setTimeLeft(150)
    } else {
      addToast({
        title: "خطا در ارسال کد لطفا دوباره تلاش کنیدُُ",
        type: 'error',
        duration: 4000

      })
    }
  }



  return (
    <>
      {/* {Err.length != 0 &&
        <div className= {Err.length != 0 ? "error_container fader" : null}>
        <span>{Err}</span>
        </div>
        } */}
      <div className="login_container">
        <div className="form_card">
          <img src={otpSign} alt="message_sign" />
          <h3 className="login_title">
            <span className="changeNum" onClick={() => navigate("/login")}>
              <img src={tool_pinkSign} alt="changeNumber" />
            </span>
            <span>
              {phone}
            </span>
          </h3>
          <p className="desc">
            رمز عبور یکبار مصرف به شماره تلفن بالا ارسال شد، لطفا آن را در کادر زیر وارد کنید.
          </p>
          <form onSubmit={(e) => OTP(e)} className="login_form">
            <div className="inp otp-container LogM">
              <label htmlFor="otp">کد تایید</label>
              <div className="otp-inputs" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="otp-digit"
                  />
                ))}
              </div>
            </div>
            <div className="desc middeler">
              <span> &nbsp; {minutes}:{seconds}</span>
            </div>
            <button className="btn_login LogM">ورود</button>
            {minutes == "00" && seconds == "00" && (
              <button type="button" className="btn_disabled btn_login LogM" onClick={() => VerifyAgain()}>ارسال دوباره</button>
            )}
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

export default LoginMessage