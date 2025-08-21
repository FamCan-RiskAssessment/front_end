import { useState } from "react";

function CheckBox({data , checker , atba}){
    return(
        <>
        <div className="form_element">
            <div className="check_box_question">
                <p>{data.ask}</p>
            </div>
            <div className="total_check_holder">
            {data.options.map((opt , index) => 
            <div className="check_box_holder">
                <label htmlFor={opt}>{opt}</label>
                <input type="checkbox" className="check_box" name={opt} id={opt} value={atba} onChange={(e) => checker(e.target.checked)} />
            </div>
            )}
            </div>
            </div>
        </>
    )
}
export default CheckBox