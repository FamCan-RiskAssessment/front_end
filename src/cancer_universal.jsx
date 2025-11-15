import { useState, useEffect, useRef } from "react";
import InputBox from "./input_box";
import Options from "./option";
import Radio from "./radio";
import { data } from "react-router-dom";
import { isNumber, fetchDataGET } from "./utils/tools";

function CancerField({ data_req, data_Inp1, data_Options, data_Radio, data_Inp2, relation, Enum, canArrFunc, canArr, senderFunc, famrel }) {
    const [cancerArray, setCancerArray] = useState([])
    const [relData, setRelData] = useState("")
    const [inp1, setInp1] = useState("")
    const [inp2, setInp2] = useState("")
    const [opt, setOpt] = useState("")
    const [rad, setRad] = useState("")
    const [image, setImage] = useState(null)
    const [realImage, setRealImage] = useState(null)

    const ageRef = useRef(null)
    const typeRef = useRef(null)
    useEffect(() => {
        if (famrel != undefined && famrel != null) {
            setRelData(famrel)
        }
    })
    // console.log(cancerArray)
    const inpSetter1 = (val) => {
        setInp1(v => val)
    }
    const inpSetter2 = (val) => {
        setInp2(v => val)
    }
    const optSetter = (val) => {
        setOpt(v => val)
    }
    const radSetter = (val) => {
        if (val == "فوت شده") {
            setRad(0)
        } else {
            setRad(1)
        }
    }
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // create a URL for preview
            setRealImage(file)
            setImage(URL.createObjectURL(file));
        }
    };
    // console.log(cancerArray)
    const add_row = async () => {
        if ((inp1 || data_Inp1 == null) && (inp2 || data_Inp2 == null) && (opt || data_Options == null) && (rad || data_Radio == null)) {
            setCancerArray((prev) => [...prev, [inp1, opt, inp2, rad, image]]);
            const enumName = typeRef.current.getAttribute('data-enum');
            let token = localStorage.getItem("token")
            console.log("fuckU fuckU fuckU fuckU fuckU fuckU fuckU fuckU fuckU fuckU fuckU fuckU fuckU fuckU fuckU fuckU ")
            if (enumName) {
                try {
                    const res = await fetchDataGET(`enum/${enumName}`, token);
                    const match = res.data.find(r => r.name === typeRef.current.value);
                    if (match) {
                        let payload = {
                            cancerAge: isNumber(inp2) ? parseInt(inp2) : null,
                            cancerType: match.id,
                        }
                        let nextcanArr = [...canArr, payload]
                        console.log("are you working th ebitch of  alll th eakjhakjdhajaihp;")
                        canArrFunc(nextcanArr)
                    }
                } catch (err) {
                    console.warn(`Enum resolve failed: ${enumName}`, err);
                }
            }

        }

        setInp1("");
        setInp2("");
        setOpt("");
        setRad("");
        setImage(null)
    }
    if (relation == undefined) {
        relation = true
    }
    if (!relation) {
        data_req = "false"
    }
    return (
        <>
            <div className="cancer_element" style={relation ? null : { display: "none" }}>
                <div className="cancer_title">
                    <p>در جدول نام، نوع یا انواع سرطان و سن ابتلا را درج کنید</p>
                </div>
                <div className="jadval_and_form">
                    <div className="total_cancer_holder">
                        {data_Inp1 != null && <InputBox data_req={data_req} data={data_Inp1} valueSetter={inpSetter1} colRef={ageRef}></InputBox>}
                        {data_Options != null && <Options data_req={data_req} data={data_Options} valueSetter={setOpt} Enum={Enum} colRef={typeRef}></Options>}
                        {data_Inp2 != null && <InputBox data_req={data_req} data={data_Inp2} valueSetter={inpSetter2}></InputBox>}
                        {data_Radio != null && <Radio data_req={data_req} data={data_Radio} valueSetter={radSetter}></Radio>}
                        <div className="tah_holder">
                            <div className="form_element">
                                <div className="total_file_uploader">
                                    <label htmlFor="file_uploader">لطفا عکسی بارگذاری کنید</label>
                                    <input type="file" className="file_uploader" accept="image/*" onChange={handleFileChange} />
                                </div>
                            </div>
                            <button type="button" className="btn_question jadval_adder" onClick={
                                () => {
                                    add_row()
                                    senderFunc(relData, inp2, opt, rad, realImage)
                                }
                            }>اضافه</button>
                        </div>
                    </div>
                    <div className="table_holder">
                        <table border="0.5" cellSpacing="0" cellPadding="8">
                            <thead className="sar_jadval">
                                <tr>

                                    <th>{data_Inp1 != null && "ارتباط"}</th>
                                    <th>{data_Options != null && "سرطان"}</th>
                                    <th>{data_Inp2 != null && "سن"}</th>
                                    <th>{data_Radio != null && "در قید حیات"}</th>
                                    <th>تصویر</th>
                                    <th>عمل</th>

                                </tr>
                            </thead>
                            <tbody>
                                {cancerArray.map((canEl, index) => (
                                    <tr key={index}>
                                        <td>{canEl[0]}</td>
                                        <td>{canEl[1]}</td>
                                        <td>{canEl[2]}</td>
                                        <td>{canEl[3]}</td>
                                        <td>
                                            <img src={canEl[4]} alt="preview" />
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn_question"
                                                onClick={() => {
                                                    setCancerArray((prev) => prev.filter((_, i) => i !== index))
                                                    deleteTheCan()
                                                }
                                                }
                                            >
                                                حذف
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        </>
    )
}

export default CancerField