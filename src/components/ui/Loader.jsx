import { useState } from "react";
import "./Loader.css"
function Loader({ message }) {
    return (
        <>
            <div className="loader_holder">
                <div class="spinner">
                    <div class="bounce1"></div>
                    <div class="bounce2"></div>
                    <div class="bounce3"></div>
                </div>
                <div className="loader_txt">{message ? message : "در حال بارگذاری"}...</div>
            </div>
        </>
    )
}


export default Loader
