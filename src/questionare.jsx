import { useState } from "react";
import InputBox from "./input_box";
import Radio from "./radio";
import CheckBox from "./checkbox";
import Options from "./option";

import "./form_elements.css"
function Questions(){
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
    return(
        <>
        <div className="question_container">
            <h2 className="question_title">سامانه ریسک سنجی آنلاین</h2>
            <div className="question_form_container">
            <form action="" className="question_form">
                <InputBox data={test_data}></InputBox>
                <Radio data={radio_opts}></Radio>
                <CheckBox data={check_opts}></CheckBox>
                <Options data={combine_option}></Options>
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