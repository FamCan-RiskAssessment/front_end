import { useState } from "react";

function Options({data_req , data , class_change1 , class_change2 , valueSetter , relation}){
    if(relation == undefined){
        relation = true
    }
    if(!relation){
        data_req = "false"
    }
    if(data.Oname == "cupsPerWeek"){
        console.log("found that !")
        console.log(relation)
    }    
    return(
        <>
        <div className={`form_element ${class_change1}`} style={relation ? null : {display:"none"}}>
            <div className={`option_holder ${class_change1}`}>
                <span>{data.ask}</span>
            <select data_req={data_req} name={data.Oname} id={data.Oname} onChange={(e) => valueSetter(e.target.value)}  className={`select_options ${class_change2}`}>
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