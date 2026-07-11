import arrow from '../../V2Form/selecArrow.svg'

/**
 * Select control used across the questionnaires. Two visual variants (former
 * option.jsx and optionV2.jsx forks): V2 adds the custom arrow, description
 * text, object-option support ({title, value}) and placeholder reset when the
 * question is hidden. DOM attributes (data_req / data-enum / name) are
 * harvested by the questionnaires and stay exactly as before.
 */
export function Options({ data_req, data, class_change1, class_change2, valueSetter, value, relation, Enum, colRef }) {
    if (relation == undefined) {
        relation = true
    }
    if (!relation) {
        data_req = "false"
    }
    return (
        <>
            <div className={`form_element ${class_change1}`} style={relation ? null : { display: "none" }}>
                <div className={`option_holder ${class_change1}`}>
                    <span>{data.ask}</span>
                    <select
                        data_req={data_req}
                        name={data.Oname}
                        id={data.Oname}
                        onChange={(e) => valueSetter?.(e.target.value)}
                        className={`select_options ${class_change2}`} data-enum={Enum}
                        ref={colRef == undefined ? null : colRef}
                        value={value}
                    >
                        {data.options.map((opt, index) =>
                            <option key={`${data.Oname}-${index}`} value={opt}>{opt}</option>
                        )}
                    </select>
                </div>
            </div>
        </>
    )
}

export function OptionsV2({ data_req, data, class_change1, class_change2, valueSetter, value, relation, Enum, colRef }) {
    if (relation == undefined) {
        relation = true
    }
    if (!relation) {
        data_req = "false"
    }
    const computeVal = (value) => {
        if (!relation) {
            return "انتخاب کنید"
        } else {
            return value
        }
    }
    const getOptionLabel = (opt) => {
        if (opt && typeof opt === "object" && !Array.isArray(opt)) {
            return opt.title ?? "";
        }
        return opt;
    }
    const getOptionValue = (opt) => {
        if (opt && typeof opt === "object" && !Array.isArray(opt)) {
            return opt.value;
        }
        return opt;
    }
    return (
        <>
            <div className={`form_element optionV2 ${class_change1}`} style={relation ? null : { display: "none" }}>
                <span>{data.ask}</span>
                <p className="data_desc">{data.desc}</p>
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
                            <option key={`${data.Oname}-${index}`} value={getOptionValue(opt)}>{getOptionLabel(opt)}</option>
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
