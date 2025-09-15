import { useState } from "react";

function InputBox({data , valueSetter , class_change1 , class_change2}){
    const [Itext , setIText] = useState('')
    const [inpError , setInpError] = useState('')
    const validator = (val) => {
        if (data.type == "number" && Number.isFinite(Number(val))){
            setIText(val)
            valueSetter(val)
            setInpError("")
        }else if(data.type == "text" && !Number.isFinite(Number(val))){
            setIText(val)
            valueSetter(val)
            setInpError("")
        }else{
            setInpError('!لطفا فرم را به درستی پر کنید')
        }
    }

    return(
        <>
        <div className={`form_element ${class_change1}`}>
        <div className="input_box_holder">
            {inpError.length != 0 && (
                <span className={inpError.length != 0 ? "error_inp faderR" : null}>{inpError}</span>
            )}
            
            <label htmlFor={data.inpName}>{data.inpName}</label>
            <input type="text" className={`inp_question ${class_change2}`} placeholder={data.placeHolder} value={Itext} onChange={(e) => validator(e.target.value)}
             name={data.engName} id={data.inpName} 
             style={inpError.length != 0 ? {"border":"1px solid red"} : null}
             />
        </div>
        </div>
        </>
    )
}
export default InputBox