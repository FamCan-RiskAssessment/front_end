import { useState , useEffect } from "react";
import InputBox from "./input_box";
import Options from "./option";
import Radio from "./radio";
import { data } from "react-router-dom";

function CancerField({data_Inp1 , data_Options , data_Radio , data_Inp2}){
    const [cancerArray , setCancerArray] = useState([])
    const [inp1 , setInp1] = useState("")
    const [inp2 , setInp2] = useState("")
    const [opt , setOpt] = useState("")
    const [rad , setRad] = useState("")
    const [image , setImage] = useState(null)
    console.log(cancerArray)
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
        setRad(v => val)
    }
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          // create a URL for preview
          setImage(URL.createObjectURL(file));
        }
      };
    const add_row = () =>{
        if ((inp1 || data_Inp1 == null) && (inp2 || data_Inp2 == null) && (opt || data_Options == null) && (rad || data_Radio == null)) {
            setCancerArray((prev) => [...prev, [inp1, opt, inp2, rad ,image]]);
        }
        setInp1("");
        setInp2("");
        setOpt("");
        setRad("");
        setImage(null)
    }

    return(
        <>
        <div className="cancer_element">
            <div className="cancer_title">
                <p>در جدول نام، نوع یا انواع سرطان و سن ابتلا را درج کنید</p>
            </div>
            <div className="jadval_and_form">
            <div className="total_cancer_holder">
                {data_Inp1 != null && <InputBox data={data_Inp1} valueSetter={inpSetter1}></InputBox>}
                {data_Options != null && <Options data={data_Options} valueSetter={setOpt}></Options>}
                {data_Inp2 != null && <InputBox data={data_Inp2} valueSetter={inpSetter2}></InputBox>}
                {data_Radio != null && <Radio data={data_Radio} valueSetter={radSetter}></Radio>}
                <div className="tah_holder">
                    <div className="form_element">
                        <div className="total_file_uploader">
                        <label htmlFor="file_uploader">لطفا عکسی بارگذاری کنید</label>
                        <input type="file" className="file_uploader" accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>
                    <button type="button" className="btn_question" onClick={add_row}>اضافه</button>
                </div>
            </div>
            <div className="table_holder">
            <table border="0.5" cellSpacing="0" cellPadding="8">
                <thead className="sar_jadval">
                <tr>

                    <th>{data_Inp1 != null && "Input 1"}</th>
                    <th>{data_Options != null && "options"}</th>
                    <th>{data_Inp2 != null && "Input 2"}</th>
                    <th>{data_Radio != null && "radio"}</th>
                    <th>image</th>
                    <th>Action</th>

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
                        <img src={canEl[4]} alt="preview"/>
                    </td>
                    <td>
                        <button
                        type="button"
                        className="btn_question"
                        onClick={() =>
                            setCancerArray((prev) => prev.filter((_, i) => i !== index))
                        }
                        >
                        ❌ Delete
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            </div>
            </div>
        </>
    )
}

export default CancerField