import { useState } from "react";

function Radio({data}){
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

    return(
        <>
        <div className="form_element">
            <div className="radio_question">
                <p>{data.ask}</p>
            </div>
            <div className="total_radio_holder">
            {data.options.map((opt , index) => 
            <div className="radio_holder">
                <label htmlFor={data.Rname}>{opt}</label>
                <input type="radio" className="radio" name={data.Rname} id={opt} />
            </div>
            )}
            </div>
            </div>
        </>
    )
}
export default Radio