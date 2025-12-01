import { useState } from "react";
import { isNumber } from "./utils/tools";
function InputBox({ data_req, data, valueSetter, value, class_change1, class_change2, relation, colRef, typeErr, limit }) {
    // const [Itext , setIText] = useState('')
    const [inpError, setInpError] = useState('')
    const [empErr, setEmpErr] = useState(false)
    const validator = (val) => {
        if (data.type == "number" && (isNumber(val) || val == "")) {
            console.log("salam!!!!!")

            valueSetter?.(val)
            setInpError("")
            typeErr?.(false)

        } else if (data.type == "text" && (!isNumber(val) || val == "")) {
            valueSetter?.(val)
            setInpError("")
            typeErr?.(false)

        } else {
            setInpError('!لطفا فرم را به درستی پر کنید')
            typeErr?.(true)
        }
        if (limit != undefined && val.length !== limit) {
            setInpError(`طول عدد وارد شده  ${limit} نمی باشد`)
            typeErr?.(true)
        }
    }
    // if(req[2] && Itext.length == 0 && req[1]){
    //     setEmpErr(true)
    // }
    // if (data.inpName == "smokeCurrent") {
    // console.log("99999999999999999999999999999999999 : ", value)
    // }
    if (relation == undefined) {
        relation = true
    }
    return (
        <>
            <div className={`form_element ${class_change1}`} style={relation ? null : { display: "none" }}>
                <div className="input_box_holder">
                    {inpError.length != 0 && (
                        <span className={inpError.length != 0 ? "error_inp faderR" : null}>{inpError}</span>
                    )}

                    <label htmlFor={data.inpName}>{data.inpName}</label>
                    <input data_req={data_req} type="text" data-Stype={data.type} className={`inp_question ${class_change2}`} maxLength={limit ? limit : 256} placeholder={data.placeHolder} value={value} onChange={(e) => {
                        validator(e.target.value)
                    }}
                        name={data.engName} id={data.inpName}
                        style={inpError.length != 0 ? { "border": "1px solid red" } : null}
                        ref={colRef == undefined ? null : colRef}
                    />
                </div>
            </div>
        </>
    )
}
export default InputBox