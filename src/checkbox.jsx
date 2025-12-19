import { useState } from "react";

function CheckBox({ data_req, data, checker, atba, classChange1, classChange2, multicheck, checkArray, relation }) {
    const effectiveDataReq = data_req ? data_req : "false";
    console.log(relation, "-----------------------------------")
    return (
        <>
            <div className={`form_element ${classChange1}`} style={relation == true || relation == undefined ? { display: null } : { display: "none" }}>
                <div className="check_box_question">
                    <p>{data.ask}</p>
                </div>
                <div className="total_check_holder">
                    {data.options.map((opt, index) =>
                        <div className={`check_box_holder ${classChange2}`}>
                            {opt.length == 2 && (
                                <>
                                    <label htmlFor={opt}>{opt[0]}</label>
                                    <input type="checkbox" className="check_box" name={opt} id={opt} value={opt[1]} onChange={(e) => checker?.(e.target.value, e.target.checked)} />
                                </>
                            )}
                            {opt.length != 2 && (
                                <>
                                    <label htmlFor={opt.showName}>{opt.showName}</label>
                                    <input data_req={effectiveDataReq} type="checkbox" className="check_box" name={opt.engName} id={opt.engName} onChange={(e) => {
                                        if (multicheck && e.target.checked && !(opt.engName in checkArray)) {
                                            checker?.(a => [...a, opt.engName])
                                        } else if (multicheck && !e.target.checked) {
                                            checker?.(a => a.filter(item => item != opt.engName))
                                        }

                                    }} />
                                </>
                            )}
                        </div>
                        // console.log("this is fucking data : "  , opt.length)

                    )}
                </div>
            </div>
        </>
    )
}
export default CheckBox