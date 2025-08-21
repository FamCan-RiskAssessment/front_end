import { useState } from "react";

function Options({data , class_change1 , class_change2 , valueSetter}){
    return(
        <>
        <div className={`form_element ${class_change1}`}>
            <div className={`option_holder ${class_change1}`}>
                <span>{data.Oname}</span>
            <select name={data.Oname} id={data.Oname} onChange={(e) => valueSetter(e.target.value)}  className={`select_options ${class_change2}`}>
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