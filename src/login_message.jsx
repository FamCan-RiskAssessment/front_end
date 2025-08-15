import { useState  , useEffect } from "react";

function LoginMessage(){
    const [message , setMessage] = useState('')
    const [Err  , setError] = useState('')
    const [timeLeft, setTimeLeft] = useState(10); // 2 minutes = 120 seconds


    const OTP = async (e) => {
        e.preventDefualt
        try{
            const res = await fetch("http://185.231.115.28:8080/auth/verify-otp" , {
                method:'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({message}),
            })

            const data = res.json()
            if (!res.ok) throw new Error(data.message || "Login failed");
            localStorage.setItem("token", data.token);
            window.location.href = "/question";
        }catch(err){
            setError(err.message)
        }
    } 
    useEffect(() => {
        if (timeLeft <= 0) return; // Stop when it reaches 0
    
        const timerId = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
    
        return () => clearInterval(timerId); // cleanup
      }, [timeLeft]);
      const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
      const seconds = String(timeLeft % 60).padStart(2, "0");
      console.log(minutes)


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