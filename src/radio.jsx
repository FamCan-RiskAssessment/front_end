import { useState } from "react";

function Radio({ data_req, data, class_change1, value, class_change2, valueSetter, relation, Enum }) {
    // Option value mapping
    const optionValueMap = {
        'بله': true,
        'خیر': false,
        'نمی دانم': 'null',
        'نمیدانم': 'null',
        'نامعین': 'null',
        'احتمال دارد اما دقیق اطلاع ندارم': 'null'
    };

    // Default relation to true if undefined
    const effectiveRelation = relation !== undefined ? relation : true;
    const effectiveDataReq = effectiveRelation ? data_req : "false";

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
                                onChange={(e) => valueSetter?.(e.target.id)}
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