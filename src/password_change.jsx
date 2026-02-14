import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "./navBar";
import "./client_forms.css";
import plusSign from './V2Form/plus.svg'
import leftSign from './V2Form/form_left.png'
import rightSign from './V2Form/form_right.png'
import prevSign from './V2Form/arrow_right.svg'
import homeSign from './V2Form/home.svg'
import panelSign from './V2Form/panelSign.svg'
import settingsSign from './V2Form/settings.svg'
import deleteSign from './V2Form/trashCan.svg'
import subSign from './V2Form/checkSub.svg'
import restoreSign from './V2Form/restore.svg'
import fileUplode from './V2Form/files.svg'
import waitSign from './V2Form/timer.png'
import checkFull from './V2Form/checkfull.png'


function ChangePass() {
  const [innerUserPassword, setInnerUserPassword] = useState("")
  const [innerUserPassR, setInnerUserPassR] = useState("")
  const [passErr, setPassErr] = useState("")
  const navigate = useNavigate();
  const location = useLocation();
  const userPhone = location.state?.phone;
  let person = {
    name: "امیر",
    number: "09338666836"
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
    if (innerUserPassword != innerUserPassR) {
      setPassErr("تکرار پسورد با پسورد  مطابقت ندارد!")
    } else {
      updateUserPass(innerUserPassword)
      navigate("/adminLogin")
    }
  }

  const lineMaker = (total_page) => {
    let spans = []
    for (let i = 0; i < total_page; i++) {
      spans.push(i)
    }
    return spans
  };

  return (
    <>
      <div className="forms_page_holder">
        <NavBar account={userPhone} />
        <div className="forms-page-wrapper">
          <div className="forms-container">

            <div className="passesholder">
              <div className="inputsholder">
                <input type="password" placeholder="رمز عبور جدید" className="search_bar_input form_search inp_question V2" value={innerUserPassword} onChange={(e) => setInnerUserPassword(e.target.value)} />
                <input type="password" placeholder="تکرار رمز" className="search_bar_input form_search inp_question V2" value={innerUserPassR} onChange={(e) => setInnerUserPassR(e.target.value)} />
              </div>
              <div className="btn_submit_holder">
                <button className="btn_submit PC" onClick={save_pass}>تغییر رمز</button>
              </div>
              {passErr && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{passErr}</div>}
            </div>

            {/* <div className="page_naver">
              <div className="total_pages">
                <span>تعداد صفحات 1</span>
              </div>
              <div className="page_line">
                <img src={rightSign} className="arrows" alt="rightSign" />
                <span className="page_num" style={{ background: "#eee" }}>1</span>
                <img src={leftSign} alt="leftSign" className="arrows" />
              </div>
            </div>

            <div className="btn_holder_next_prev aligner">
              <button className="btn_submit space-UD" disabled>صفحه ی قبلی</button>
              <button className="btn_submit space-UD" disabled>صفحه ی بعدی</button>
            </div> */}
          </div>
        </div>
      </div>
    </>
  )
}
export default ChangePass