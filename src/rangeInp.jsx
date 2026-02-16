import { useEffect, useState } from "react";
import { isNumber } from "./utils/tools";
import plusSign from './V2Form/plus.svg'
import minusSign from './V2Form/minusSign.svg'
function RangeBox({ data_req, data, valueSetter, class_change1, class_change2, relation, preData }) {
    // const [Itext , setIText] = useState('')
    const [vol, setVol] = useState(0)
    useEffect(() => {
        if (preData != undefined || preData != null) {
            setVol(preData)
        }
    }, [preData])
    if (relation == undefined) {
        relation = true
    }
    return (
        <>
            <div className={`form_element ${class_change1}`} style={relation ? null : { display: "none" }}>
                <div className="rangeBox_holder">
                    <label htmlFor={data.engName}>{data.inpName}</label>
                    <input data_req={data_req} type="range" name={data.engName} value={vol} onChange={(e) => setVol(e.target.value)} max={data.lim != undefined ? data.lim : 99} min={0} step={1} defaultValue={0} className={class_change2} />
                    <div className="number">
                        <span className="increase R" onClick={() => setVol(vo => {
                            let v = Number(vo)
                            if (data.lim && v == data.lim) {
                                return v
                            } else {
                                if (v >= 100) {
                                    return v
                                } else {
                                    return v + 1
                                }
                            }
                        })}>
                            <img src={plusSign} alt="plusSign" />
                        </span>
                        <span className="self_number">عدد انتخابی :  {vol}</span>
                        <span className="decrease R" onClick={() => setVol(vo => {
                            let v = Number(vo)
                            if (v == 0) {
                                return v
                            } else {
                                return v - 1
                            }
                        })}>
                            <img src={minusSign} alt="minusSign" />
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}
export default RangeBox