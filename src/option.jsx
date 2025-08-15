import { useState } from "react";

function Options({data}){
    return(
        <>
        <div className="form_element">
            <select name={data.Optname} id={data.Optname} className="select_options">
                {data.options.map((opt , index) => 
                    <option value={opt}>{opt}</option>
                )}
            </select>
        </div>
        </>
    )
}
export default Options