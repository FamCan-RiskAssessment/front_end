import { useState } from "react";
import { EnumTaker } from "./utils/tools";
function RadioV2({ data_req, data, class_change1, value, class_change2, valueSetter, des, relation, Enum, mapper }) {
    // Option value mapping
    // const [test, setTest] = useState('')
    // console.log("ffffffffffffffffffffffffffffffffffffffff : ", test, data.Rname)
    const optionValueMap = {
        'بله': true,
        'خیر': false,
        'نمی دانم': 'null',
        'نمیدانم': 'null',
        'نامعین': 'null',
        'اطلاع ندارم': 'null',
        'احتمال دارد اما دقیق اطلاع ندارم': 'null',
        'سابقاً مصرف می کرده ام اما کمتر از ۱۵ سال است که ترک کرده ام': true,
        'سابقاً مصرف می کردم اما بیش از ۱۵ سال است که ترک کرده ام': true,
    };

    // Default relation to true if undefined
    const effectiveRelation = relation !== undefined ? relation : true;
    const effectiveDataReq = effectiveRelation ? data_req : "false";
    const tempFunction = (opt, optVals) => {
        if (optVals[opt] == 'null') {
            return 3
        } else {
            return opt
        }
    }
    const computeValue = (opt) => {
        if (relation === false) return "null";

        if (!Enum && mapper && mapper[opt] !== undefined && !des) {
            return mapper[opt];
        }

        return tempFunction(opt, optionValueMap);
    };

    if (data.Rname == "currentHrtUse") {
        console.log("we have passed", effectiveRelation)
    }
    return (
        <>
            <div
                className={`form_element ${class_change1}`}
                style={effectiveRelation ? null : { display: "none" }}
            >
                <div className="radio_question">
                    <p>{data.ask}</p>
                    <p className="data_desc">{data.desc}</p>
                </div>
                <div className={`total_radio_holder V2 ${class_change2}`}>
                    <div className="radio-group">
                        {data.options.map((opt, index) => (
                            <div className="nothing" key={opt}>
                                <input
                                    data_req={effectiveDataReq}
                                    type="radio"
                                    className="radio"
                                    name={data.Rname}
                                    value={computeValue(opt)}
                                    FaVal={opt}
                                    id={`${data.Rname}-${index}`}
                                    onChange={(e) => {
                                        // Handle the enum lookup in a separate async function
                                        // setTest(e.target.value)
                                        const handleEnumChange = async () => {
                                            const enumId = await EnumTaker(`enum/${Enum}`, e.target.value);
                                            console.log("enumIdenumIdenumIdenumIdenumIdenumId : ", enumId)
                                            valueSetter?.(enumId);
                                        };
                                        if (Enum !== undefined) {
                                            handleEnumChange();
                                        } else {
                                            valueSetter?.(opt)
                                        }
                                    }}
                                    {...Enum !== undefined ? { 'data-enum': Enum } : {}}
                                />
                                <label className="radio-card" htmlFor={`${data.Rname}-${index}`}>
                                    <span>{opt}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default RadioV2;