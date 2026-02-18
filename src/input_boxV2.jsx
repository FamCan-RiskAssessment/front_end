import { useState } from "react";
import { fetchDataPOST, isNumber } from "./utils/tools";
import { useToast } from "./toaster";
import ToastProvider from "./toaster";

function InputBoxV2({ data_req, data, valueSetter, value, class_change1, class_change2, relation, colRef, typeErr, limit, postalSetter }) {
    // const [Itext , setIText] = useState('')
    const [inpError, setInpError] = useState('')
    const [empErr, setEmpErr] = useState(false)
    // const navigate = useNavigate();
    const { addToast } = useToast()

    // if (data.engName == "postalCode") {
    //     console.log("found that ! postalCode")
    // }
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
    const checkPostal = async (value) => {
        let token = localStorage.getItem('token')
        let payload = {
            "postalCode": `${value}`
        }
        let res = await fetchDataPOST("form/postalcode", token, payload)
        if ((res.status == 200 || res.status == 201) && Object.keys(res.data).length > 2) {
            postalSetter(res.data)
        } else if ((res.status == 200 || res.status == 201) && Object.keys(res.data).length < 2) {
            addToast({
                title: "کد پستی وارد شده نادرست است",
                type: 'error',
                duration: 4000
            })
        }
        else {
            addToast({
                title: "بررسی کد پستی با خطا مواجه شده است",
                type: 'error',
                duration: 4000
            })
        }
        console.log("postaldata tttttttttt : ", res)
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
                    <div className="coupler">
                        <input data_req={data_req} type="text" data-Stype={data.type} className={`inp_question V2 ${class_change2}`} maxLength={limit ? limit : 256} placeholder={data.placeHolder} value={value} onChange={(e) => {
                            validator(e.target.value)
                        }}
                            name={data.engName} id={data.inpName}
                            style={inpError.length != 0 ? { "border": "1px solid red" } : null}
                            ref={colRef == undefined ? null : colRef}
                        />
                        {data.engName == "postalCode" && (
                            <button type="button" className="btn-add-newV2 postalCheck" onClick={() => checkPostal(value)}>
                                استعلام
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
export default InputBoxV2