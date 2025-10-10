import { useEffect, useState } from "react";
import { useLocation , useNavigate } from "react-router-dom";
import NavBar from "./navBar";


function ChangePass(){
    const [innerUserPassword , setInnerUserPassword] = useState("")
    const [innerUserPassR , setInnerUserPassR] = useState("")
    const [passErr , setPassErr] = useState("")
    const navigate = useNavigate();
    const location = useLocation();
    const userPhone = location.state?.phone;
    let person = {
        name:"امیر",
        number:"09338666836"
    }
    const updateUserPass = async (passCode) => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://185.231.115.28:8080/admin/users/password`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                "password": passCode
            }),
          });
    
        //   const data = await res.json();
          if (!res.ok) throw new Error(data.message || "خطا در تغییر رمزعبور");
    
        } catch (err) {
          console.error("❌ Error updating pass:", err.message);
        }
      };

    const save_pass = () => {
        if(innerUserPassword != innerUserPassR){
            setPassErr("تکرار پسورد با پسورد  مطابقت ندارد!")
        }else{
            updateUserPass(innerUserPassword)
            navigate("/adminLogin")
        }
    }

    return(
        <>
      <NavBar account={userPhone} />
            <div className="passesholder">
                <div className="title-holder">
                    <h1>تغییر نقش</h1>
                </div>
                <div className="inputsholder">
                <input type="password" placeholder="رمز عبور جدید" className="search_bar_input" value={innerUserPassword} onChange={(e) => setInnerUserPassword(e.target.value)}/>
                <input type="password" placeholder="تکرار رمز" className="search_bar_input" value={innerUserPassR} onChange={(e) => setInnerUserPassR(e.target.value)}/>
                </div>
                <div className="btn_submit_holder">
                <button className="btn_submit" onClick={save_pass}>تغییر رمز</button>
                </div>
            </div>
        </>
        
        
    )
}
export default ChangePass