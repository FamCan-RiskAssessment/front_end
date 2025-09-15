import { useState } from "react";

function Radio({data , class_change1 , class_change2 , valueSetter}){
    // const [Itext , setIText] = useState('')
    // const [inpError , setInpError] = useState('')

    // const validator = (val) => {
    //     if (data.type == "number" && Number.isFinite(val)){
    //         setIText(v => val)
    //     }else if(data.type == "text" && !Number.isFinite(val)){
    //         setIText(v => val)
    //     }else{
    //         setInpError('!لطفا فرم را به درستی پر کنید')
    //     }
    // }
    // console.log(class_change[1])

    return(
        <>
        <div className={`form_element ${class_change1}`}>
            <div className="radio_question">
                <p>{data.ask}</p>
            </div>
            <div className={`total_radio_holder ${class_change2}`}>
            {data.options.map((opt , index) => 
            <div className="radio_holder">
                <label htmlFor={data.Rname}>{opt}</label>
                {opt == "بله" && data.options.length != 4 && (
                <input type="radio" className="radio" name={data.Rname} value={true} id={opt} onChange={(e) => valueSetter(e.target.id)} />
                )}
                {opt == "خیر" && data.options.length != 4 && (
                <input type="radio" className="radio" name={data.Rname} value={false} id={opt} onChange={(e) => valueSetter(e.target.id)} />
                )}
                {(opt == "نمی دانم" || opt=="نمیدانم" || opt == "نامعین") && data.options.length != 4 && (
                <input type="radio" className="radio" name={data.Rname} value="null" id={opt} onChange={(e) => valueSetter(e.target.id)} />
                )}
                {(opt == "مرد" || opt == "زن") && (
                <input type="radio" className="radio" name={data.Rname} value={opt} id={opt} onChange={(e) => valueSetter(e.target.id)} />
                )}
                {(opt == "سابقاً مصرف می کرده ام اما کمتر از ۱۵ سال است که ترک کرده ام" || opt == "سابقاً مصرف می کردم اما بیش از ۱۵ سال است که ترک کرده ام") && (
                <input type="radio" className="radio" name={data.Rname} value={opt} id={opt} onChange={(e) => valueSetter(e.target.id)} />
                )}
                {(opt == "خارج از کشور" || opt == "ایران") && (
                    <input type="radio" className="radio" name={data.Rname} value={opt} id={opt} onChange={(e) => valueSetter(e.target.id)} />
                )}
                {data.options.length >= 4 && (
                <input type="radio" className="radio" name={data.Rname} value={opt} id={opt} onChange={(e) => valueSetter(e.target.id)} />
                )}
            </div>
            )}
            </div>
            </div>
        </>
    )
}
export default Radio