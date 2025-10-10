import { useState, useEffect } from "react";
// import anime from "animejs";
import "./card.css";

function PersonCard({ person ,index, idP ,clicker, opener , role}) {
  const [admin, setAdmin] = useState(false);
  // const [userType, setUserType] = useState("کاربر معمولی");

  const admin_maker = () => {
    setAdmin(true);
    setUserType("ادمین");
    clicker(person.name);
    opener(true);
  };

//   useEffect(() => {
//     if (admin) {
//       anime({
//         targets: `.card_tot[index="${index}"]`,
//         backgroundColor: "#d1fae5", // soft green highlight
//         duration: 600,
//         easing: "easeInOutQuad",
//       });
//     }
//   }, [admin, index]);
  return (
    <div className="card_tot" index={index}>
      <div className="`12 `">
        <h3>{person.name}</h3>
        <span className={`badge ${admin ? "admin" : "user"}`}>
          {role}
        </span>
      </div>

      <div className="card_body">
        <p><strong>کدملی:</strong> {person.meli_code}</p>
        <p><strong>تلفن همراه:</strong> {person.phone}</p>
        <p><strong>تاریخ عضویت:</strong> {person.hist}</p>
      </div>

      <div className="btn_holder">
        <button className="btn promote" onClick={() => {clicker(idP);opener(true)}}>
          ارتقا دسترسی
        </button>
        <button className="btn kick">اخراج</button>
      </div>
    </div>
  );
}

export default PersonCard;
