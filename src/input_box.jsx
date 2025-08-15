import { useState } from "react";

function InputBox({data}){
    const [Itext , setIText] = useState('')
    const [inpError , setInpError] = useState('')
    console.log(data.type == "number")
    const validator = (val) => {
        if (data.type == "number" && Number.isFinite(Number(val))){
            setIText(val)
            setInpError("")
        }else if(data.type == "text" && !Number.isFinite(Number(val))){
            setIText(val)
            setInpError("")
        }else{
            setInpError('!لطفا فرم را به درستی پر کنید')
        }
    }

    return(
        <>
        <div className="form_element">
        <div className="input_box_holder">
            {inpError.length != 0 && (
                <span className={inpError.length != 0 ? "error_inp faderR" : null}>{inpError}</span>
            )}
            
            <label htmlFor={data.inpName}>{data.inpName}</label>
            <input type="text" className="inp_question" placeholder={data.placeHolder} value={Itext} onChange={(e) => validator(e.target.value)}
             name={data.inpName} id={data.inpName} 
             style={inpError.length != 0 ? {"border":"1px solid red"} : null}
             />
        </div>
        </div>
        </>
    )
}
export default InputBox