import { useState } from "react";
import arrow from './V2Form/selecArrow.svg'
function OptionsV2({ data_req, data, class_change1, class_change2, valueSetter, value, relation, Enum, colRef }) {
    // console.log("this is the valueSetter : ", valueSetter, data.O)
    if (relation == undefined) {
        relation = true
    }
    if (!relation) {
        data_req = "false"
    }
    if (data.Oname == "cupsPerWeek") {
        console.log("found that !")
        console.log(relation)
    }
    const computeVal = (value) => {
        if (!relation) {
            return "انتخاب کنید"
        } else {
            return value
        }
    }
    return (
        <>
            <div className={`form_element optionV2 ${class_change1}`} style={relation ? null : { display: "none" }}>
                <span>{data.ask}</span>
                <div className={`option_holderV2 ${class_change1}`}>
                    <select
                        data_req={data_req}
                        name={data.Oname}
                        id={data.Oname}
                        onChange={(e) => valueSetter?.(e.target.value)}
                        className={`select_optionsV2 ${class_change2}`} data-enum={Enum}
                        ref={colRef == undefined ? null : colRef}
                        value={computeVal(value)}
                    >
                        {data.options.map((opt, index) =>
                            <option value={opt}>{opt}</option>
                        )}
                    </select>
                    <span className="select-arrow">
                        <img src={arrow} alt="" />
                    </span>
                </div>
            </div>
        </>
    )
}
export default OptionsV2