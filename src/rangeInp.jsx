import { useEffect, useState } from "react";
import { isNumber } from "./utils/tools";
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
                    <input data_req={data_req} type="range" name={data.engName} value={vol} onChange={(e) => setVol(e.target.value)} max={99} min={0} step={1} defaultValue={0} className={class_change2} />
                    <div className="number">
                        <span>عدد انتخابی :  {vol}</span>
                    </div>
                </div>
            </div>
        </>
    )
}
export default RangeBox