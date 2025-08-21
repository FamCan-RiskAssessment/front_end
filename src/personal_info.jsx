import { useState } from "react";
import InputBox from "./input_box";
import Radio from "./radio";
import CheckBox from "./checkbox";

function PersonalInfo({data_inp1 , data_inp2 , data_inp3 , data_inp4 , data_inp5 , data_inp6 , data_inp7 , data_opt , data_check  }){
    return(
        <>
            <h2>لطفا اطلاعات خود را وارد کنید</h2>
            <div className="personal_element">
                <InputBox data={data_inp1} class_change1={"grider"} class_change2={"grider_inner"}></InputBox>
                <InputBox data={data_inp2} class_change1={"grider"} class_change2={"grider_inner"}></InputBox>
                <InputBox data={data_inp3} class_change1={"grider"} class_change2={"grider_inner"}></InputBox>
                <InputBox data={data_inp4} class_change1={"grider"} class_change2={"grider_inner"}></InputBox>
                <Radio data={data_opt} class_change1={"grider"} class_change2={"grider_inner"}></Radio>
                <InputBox data={data_inp5} class_change1={"grider"} class_change2={"grider_inner"}></InputBox>
                <InputBox data={data_inp6} class_change1={"grider"} class_change2={"grider_inner"}></InputBox>       
                <InputBox data={data_inp6} class_change1={"grider"} class_change2={"grider_inner"}></InputBox>
                <InputBox data={data_inp7} class_change1={"grider"} class_change2={"grider_inner_spec"}></InputBox>
                <CheckBox data={data_check}></CheckBox>

            </div>
        </>
    )
}
export default PersonalInfo