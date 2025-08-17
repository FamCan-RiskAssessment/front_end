import { useState } from "react";

function Options({data}){
    return(
        <>
        <div className="form_element">
            <div className="option_holder">
                <span>{data.Oname}</span>
            <select name={data.Oname} id={data.Oname} className="select_options">
                {data.options.map((opt , index) => 
                    <option value={opt}>{opt}</option>
                )}
            </select>
            </div>
        </div>
        </>
    )
}
export default Options