import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import './program_choice.css'


function ChooseApp() {
    const location = useLocation();
    const navigate = useNavigate();
    const BaharApp = () => {
        navigate('/forms')
    }

    const NavidApp = () => {
        navigate('/formsNavid')
    }

    return (
        <>
            <div className="card_holder">
                <div className="form_card less_height">
                    <div className="title">
                        <h2>لطفا طرح خود را انتخاب کنید</h2>
                    </div>
                    <div className="btn_holder_next_prev_design aligner">
                        <button className="btn-view-form top space-UD" onClick={BaharApp}>طرح بهار</button>
                        <button className="btn-view-form top space-UD" onClick={NavidApp}>طرح نوید</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChooseApp