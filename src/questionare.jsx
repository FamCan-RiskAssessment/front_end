import { useState } from "react";
import InputBox from "./input_box";
import Radio from "./radio";
import CheckBox from "./checkbox";
import Options from "./option";
import part1 from './questions/P1.json'

import "./form_elements.css"
function Questions(){
    const [atba , setatba] = useState(false)
    let test_data = {
        inpName:"سن",
        type:"number",
        placeHolder:"سن",    
    }

    let radio_opts = {
        options:["مرد" , "زن"],
        Rname:"جنسیت",
        ask:"جنسیت خود را انتخاب کنبد: "
    }

    let check_opts = {
        options:["سیگار" , "قلیان" , "مشروبات الکلی"],
        ask:"کدام یک از گزینه های زیر را مصرف می کنید ؟ "
    }
    let combine_option = {
        options:["دی" , "آذر"],
        Oname:"ماه"
    }

    const atba_checker = (val) =>{
        setatba(val)
    } 




    return(
        <>
        <div className="question_container">
            <h2 className="question_title">سامانه ریسک سنجی آنلاین</h2>
            <div className="question_form_container">
            <form action="" className="question_form P1">
                {part1.map((ele , idx) =>
                    <> 
                    {ele.input_type == "radio_input" && (
                        <Radio data={ele}></Radio>
                    )}
                    {ele.input_type == "selection_input" && (
                        <Options data={ele}></Options>
                    )}
                    {ele.input_type == "checkbox_input" && (
                        <CheckBox data={ele}></CheckBox>
                    )}
                    {ele.input_type == "input_text" && (
                        <InputBox data={ele}></InputBox>
                    )}
                    </>
                )}
            </form>
            </div>
            <div className="btn_holder_next_prev">
                <button className="btn_question">بعدی</button>
                <button className="btn_question">قبلی</button>
            </div>
            <button className="support_call ">تماس با پشتیبانی</button>
            </div>
        </>
    )
}
export default Questions