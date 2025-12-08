import { useState } from "react";
import { EnumTaker } from "./utils/tools";
function Radio({ data_req, data, class_change1, value, class_change2, valueSetter, relation, Enum }) {
    // Option value mapping
    // const [test, setTest] = useState('')
    // console.log("ffffffffffffffffffffffffffffffffffffffff : ", test, data.Rname)
    const optionValueMap = {
        'بله': true,
        'خیر': false,
        // 'بله (Postmenopausal)': true,
        // 'خیر (Premenopausal)': false,
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
                </div>
                <div className={`total_radio_holder ${class_change2}`}>
                    {data.options.map((opt) => (
                        <div className="radio_holder" key={opt}>
                            <label htmlFor={data.Rname}>{opt}</label>
                            <input
                                data_req={effectiveDataReq}
                                type="radio"
                                className="radio"
                                name={data.Rname}
                                value={optionValueMap[opt] !== undefined ? optionValueMap[opt] : opt}
                                id={opt}
                                onChange={(e) => {
                                    // Handle the enum lookup in a separate async function
                                    // setTest(e.target.value)
                                    const handleEnumChange = async () => {
                                        const enumId = await EnumTaker(`enum/${Enum}`, e.target.id);
                                        console.log("enumIdenumIdenumIdenumIdenumIdenumId : ", enumId)
                                        valueSetter?.(enumId);
                                    };
                                    if (Enum !== undefined) {
                                        handleEnumChange();
                                    } else {
                                        valueSetter?.(e.target.value)
                                    }
                                }}
                                {...Enum !== undefined ? { 'data-enum': Enum } : {}}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Radio;