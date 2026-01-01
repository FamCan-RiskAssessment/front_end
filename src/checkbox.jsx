import { useState } from "react";
import checkSign from './V2Form/Check.svg'

function CheckBox({ data_req, data, checker, atba, classChange1, classChange2, roleMaker_class, multicheck, checkArray, relation }) {
    const effectiveDataReq = data_req ? data_req : "false";
    console.log(data, "  : -----------------------------------")
    return (
        <>
            <div className={`form_element ${classChange1}`} style={relation == true || relation == undefined ? { display: null } : { display: "none" }}>
                <div className="check_box_question">
                    <p>{data.ask}</p>
                </div>
                <div className="total_check_holder">
                    <div className={`check_box_holderV2 ${classChange2}`}>

                        {data.options.map((opt, index) =>
                            <>
                                {/* {opt.length == 2 && (
                                    <>
                                        <input type="checkbox" className="check_box" name={opt} id={opt} value={opt[1]} onChange={(e) => checker?.(e.target.value, e.target.checked)} />
                                        <label htmlFor={opt}>{opt[0]}</label>

                                    </>
                                )} */}
                                {opt.length != 0 && (
                                    <>
                                        <label className={`checkbox-card ${roleMaker_class}`} htmlFor={opt.engName}>
                                            <input data_req={effectiveDataReq} type="checkbox" className="check_box" name={opt.engName} id={opt.engName} onChange={(e) => {
                                                if (multicheck && e.target.checked && !(opt.engName in checkArray)) {
                                                    checker?.(a => [...a, opt.engName])
                                                } else if (multicheck && !e.target.checked) {
                                                    checker?.(a => a.filter(item => item != opt.engName))
                                                }

                                            }} />

                                            <span className="checkbox-box">
                                                <img className="checkbox-icon" src={checkSign} alt="" />
                                            </span>
                                            <span className="checkbox-text">{opt.showName}</span>

                                        </label>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>
        </>
    )
}
export default CheckBox