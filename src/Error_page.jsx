import { useState } from "react";
import "./error_style.css"
import { useNavigate } from "react-router-dom";

function ErrorShower({errorType}){
  const navigate = useNavigate();
  if(errorType == undefined){
        errorType = 404
    }
    return(
        <div className="error_holder">
            <div className="error_content">
                <h1>{errorType}</h1>
                <p className="desc">متاسفانه به مشکل برخوردیم !</p>
            </div>
            <div className="back_btn">
                <button className="btn_submit" onClick={() => navigate("/")}>بازگشت به لاگین</button>
            </div>
        </div>
    )
}

export default ErrorShower