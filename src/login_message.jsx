import { useState  , useEffect ,  } from "react";
import { useLocation ,  useNavigate } from "react-router-dom";

function LoginMessage(){
    const [message , setMessage] = useState('')
    const [Err  , setError] = useState('')
    const location = useLocation();
    const navigate = useNavigate();
    const phone = location.state?.phone || ""; // ✅ get phone from state
    const [timeLeft, setTimeLeft] = useState(10); // 2 minutes = 120 seconds


    const OTP = async (e) => {
        e.preventDefault(); // ✅ correct spelling
      
        try {
          const res = await fetch("http://185.231.115.28:8080/auth/verify-otp", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: phone,  // ✅ send phone
              otp: message   // ✅ send OTP with correct key
            }),
          });
      
          const data = await res.json(); // ✅ await
      
          if (!res.ok) throw new Error(data.message || "Login failed");
      
          localStorage.setItem("token", data.token);
          navigate("/questions")
      
        } catch (err) {
          setError(err.message);
        }
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


    return(
        <>
        {Err.length != 0 &&
        <div className= {Err.length != 0 ? "error_container fader" : null}>
        <span>{Err}</span>
        </div>
        }
        <div className="login_container">            
        <div className="form_card">
            <h3 className="login_title">سامانه ریسک سنجی آنلاین</h3>
            <form onSubmit={(e) => OTP(e)} className="login_form">
                <div className="inp">
                <label htmlFor="message">کد</label>
                <input type="text" name="message" id="message" placeholder="xxxxx" value={message} onChange={(e) => setMessage(e.target.value)}/>
                </div>
                <div className="desc">
                    <span>کدی به شماره تلفن شما ارسال شد لطفاآن را وارد کنید.</span>
                    <span>{minutes}:{seconds}</span>
                </div>
                {minutes == "00" && seconds =="00" && (
                <button className="btn_disabled btn_login">ارسال دوباره</button>                    
                )}
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

export default LoginMessage