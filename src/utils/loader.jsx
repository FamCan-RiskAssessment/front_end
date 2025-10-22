import { useState } from "react";
import "./loader.css"
function Loader(){
    return(
    <>
    <div className="loader_holder">
    <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
    </div>
    <div className="loader_txt">در حال بارگذاری...</div>
    </div>
    </>
    )
}


export default Loader
