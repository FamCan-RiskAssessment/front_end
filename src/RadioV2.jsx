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
    const getOptionLabel = (opt) => {
        if (opt && typeof opt === "object" && !Array.isArray(opt)) {
            return opt.title ?? "";
        }
        return opt;
    };

    const getOptionExplicitValue = (opt) => {
        if (opt && typeof opt === "object" && !Array.isArray(opt)) {
            return opt.value;
        }
        return undefined;
    };

    const computeValue = (opt) => {
        if (relation === false) return "null";

        const explicitValue = getOptionExplicitValue(opt);
        if (explicitValue !== undefined) {
            return explicitValue;
        }

        const optionLabel = getOptionLabel(opt);

        if (!Enum && mapper && mapper[optionLabel] !== undefined && !des) {
            return mapper[optionLabel];
        }

        return tempFunction(optionLabel, optionValueMap);
    };

    // Check if vertical layout is needed (more than 3 options or any label > 20 chars)
    const needsVerticalLayout = data.options.length > 3 || data.options.some(opt => getOptionLabel(opt).length > 20);

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
                    <div className={`radio-group ${needsVerticalLayout ? 'radio-group-vertical' : ''}`}>
                        {data.options.map((opt, index) => {
                            const optionLabel = getOptionLabel(opt);
                            return (
                            <div className="nothing" key={`${data.Rname}-${index}-${optionLabel}`}>
                                <input
                                    data_req={effectiveDataReq}
                                    type="radio"
                                    className="radio"
                                    name={data.Rname}
                                    value={computeValue(opt)}
                                    FaVal={computeValue(opt)}
                                    id={`${data.Rname}-${index}`}
                                    onChange={(e) => {
                                        const handleEnumChange = async () => {
                                            const enumId = await EnumTaker(`enum/${Enum}`, e.target.value);
                                            console.log("enumIdenumIdenumIdenumIdenumIdenumId : ", enumId)
                                            valueSetter?.(enumId);
                                        };
                                        if (Enum !== undefined) {
                                            handleEnumChange();
                                        } else {
                                            valueSetter?.(optionLabel)
                                        }
                                    }}
                                    {...Enum !== undefined ? { 'data-enum': Enum } : {}}
                                />
                                <label className="radio-card" htmlFor={`${data.Rname}-${index}`}>
                                    <span>{optionLabel}</span>
                                </label>
                            </div>
                        )})}
                    </div>
                </div>
            </div>
        </>
    );
}

export default RadioV2;