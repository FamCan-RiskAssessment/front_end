import { useState } from "react";

function Radio({data , class_change1 , class_change2 , valueSetter}){
    // const [Itext , setIText] = useState('')
    // const [inpError , setInpError] = useState('')

    // const validator = (val) => {
    //     if (data.type == "number" && Number.isFinite(val)){
    //         setIText(v => val)
    //     }else if(data.type == "text" && !Number.isFinite(val)){
    //         setIText(v => val)
    //     }else{
    //         setInpError('!لطفا فرم را به درستی پر کنید')
    //     }
    // }
    // console.log(class_change[1])

    return(
        <>
        <div className={`form_element ${class_change1}`}>
            <div className="radio_question">
                <p>{data.ask}</p>
            </div>
            <div className={`total_radio_holder ${class_change2}`}>
            {data.options.map((opt , index) => 
            <div className="radio_holder">
                <label htmlFor={data.Rname}>{opt}</label>
                <input type="radio" className="radio" name={data.Rname} id={opt} onChange={(e) => valueSetter(e.target.id)} />
            </div>
            )}
            </div>
            </div>
        </>
    )
}
export default Radio