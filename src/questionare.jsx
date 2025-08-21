import { useState } from "react";
import InputBox from "./input_box";
import Radio from "./radio";
import CheckBox from "./checkbox";
import Options from "./option";
import CancerField from "./cancer_universal";
import FileUploader from "./file_uploader";
import PersonalInfo from "./personal_info";

import part1 from './questions/P1.json'
import part2 from './questions/P2.json'
import part3 from './questions/P3.json'
import part4 from './questions/P4.json'
import part5 from './questions/P5.json'
import part6 from './questions/P6.json'

import "./form_elements.css"
function Questions(){
    const [step , setStep] = useState(1)
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
    const nexter = () => {
        if(step != 6){
            setStep(s => s + 1)
        }
    }
    const prever = () => {
        if (step != 1){
            setStep(s => s - 1)
        }
    }
    



    return(
        <>
        <div className="question_container">
            <h2 className="question_title">سامانه ریسک سنجی آنلاین</h2>
            <div className="question_form_container">
            {step == 1 && (

            <form action="" className="question_form P1">
                <Radio data={part1[0]}></Radio>
                <Options data={part1[1]}></Options>
                <Options data={part1[2]}></Options>
                <Options data={part1[3]}></Options>
                <CheckBox data={part1[4]} atba={atba} checker={atba_checker}></CheckBox>
                {!atba && <InputBox data={part1[5]}></InputBox>}
                {atba && <InputBox data={part1[6]}></InputBox>}
                <InputBox data={part1[7]}></InputBox>
                <InputBox data={part1[8]}></InputBox>
            </form>


            )}
            {step == 2 && (
            <form action="" className="question_form P2">
                <Radio data={part2.radio_opts_alcohol} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Options data={part2.combine_option_amountAlcohol} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Options data={part2.combine_option_lastMonthSabzijatMeal} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Options data={part2.combine_option_lastMonthSabzijatWeight} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Options data={part2.combine_option_mediumActivityMonthInYear} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Options data={part2.combine_option_mediumActivityHourInWeek} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Options data={part2.combine_option_hardActivityMonthInYear} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Options data={part2.combine_option_hardActivityHourInWeek} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Radio data={part2.radio_opts_smoking100} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Options data={part2.combine_option_smokingAge} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Radio data={part2.radio_opts_smokingNow} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Options data={part2.combine_option_leaveSmokingAge} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Options data={part2.combine_option_countSmokingDaily} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Options data={part2.combine_option_t_gh_daily} class_change1={"P2"} class_change2={"P2_inner"}></Options>
        </form>
            )}

            {step == 3 && (
            <form action="" className="question_form P2">
                <Options data={part3.combine_option_ghaedeAge} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Radio data={part3.radio_opts_children} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Options data={part3.combine_option_firstChildBirthAge} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Radio data={part3.radio_opts_menopausal_status} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Options data={part3.combine_option_menopause} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Radio data={part3.radio_opts_hrt} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Options data={part3.combine_option_hrt_use_length} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Radio data={part3.radio_opts_lastFiveYears_HRT_use} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_HRT_current_use} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Options data={part3.combine_option_intended_HRT_use} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Radio data={part3.radio_opts_hrt_Type} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_oral} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Options data={part3.combine_option_oralDuration} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                <Radio data={part3.radio_opts_oral2LastYears} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_mamoGraphy} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_falop} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_andometrioz} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_leavePestan} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_leaveTokhmdan} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_laDe_colon} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_laDe_pol} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_asp_la_mo} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_nsaiD_la_mo} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data={part3.radio_opts_lastFiveYearBloodTestInStool} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
            </form>
            )}
            {step == 4 && (
            <form action="" className="question_form P2">
                    <Radio class_change1={"P2"} class_change2={"P2_inner"} data={part4.radio_opts_cancer}></Radio>
                    <CancerField data_Inp1={null} data_Options={part4.cancerCard.cancerType} data_Radio={null} data_Inp2={part4.cancerCard.cancerAge}></CancerField>
            </form>
            )}
            {step == 5 && (
            <form action="" className="question_form P2">
                    <Radio data={part5.radio_opts_childCancer} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                    <CancerField data_Inp1={part5.childCard.childName} data_Inp2={part5.childCard.childCancerAge} data_Options={part5.childCard.childCancerType} data_Radio={part5.childCard.childLifeStatus}></CancerField> 
                    <Radio data={part5.radio_opts_motherCancer} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                    <CancerField data_Inp1={part5.motherCard.motherName} data_Inp2={part5.motherCard.motherCancerAge} data_Options={part5.motherCard.motherCancerType} data_Radio={part5.motherCard.motherLifeStatus}></CancerField> 
                    <Radio data={part5.radio_opts_fatherCancer} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                    <CancerField data_Inp1={part5.fatherCard.fatherName} data_Inp2={part5.fatherCard.fatherCancerAge} data_Options={part5.fatherCard.fatherCancerType} data_Radio={part5.fatherCard.fatherLifeStatus}></CancerField> 
                    <Radio data={part5.radio_opts_bsCancer} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                    <CancerField data_Inp1={part5.siblingCard.siblingName} data_Inp2={part5.siblingCard.siblingCancerAge} data_Options={part5.siblingCard.siblingCancerType} data_Radio={part5.siblingCard.siblingLifeStatus}></CancerField> 
                    <Radio data={part5.radio_opts_ameAmoCancer} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                    <CancerField data_Inp1={part5.uncleAuntCard.uncleAuntName} data_Inp2={part5.uncleAuntCard.uncleAuntCancerAge} data_Options={part5.uncleAuntCard.uncleAuntCancerType} data_Radio={part5.uncleAuntCard.uncleAuntLifeStatus}></CancerField> 
                    <Radio data={part5.radio_opts_khaleDaeiCancer} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                    <CancerField data_Inp1={part5.khaleDaeiCard.khaleDaeiName} data_Inp2={part5.khaleDaeiCard.khaleDaeiCancerAge} data_Options={part5.khaleDaeiCard.khaleDaeiCancerType} data_Radio={part5.khaleDaeiCard.khaleDaeiLifeStatus}></CancerField> 
                    <CancerField data_Inp1={part5.otherRelativeCard.otherRelation} data_Inp2={part5.otherRelativeCard.otherCancerAge} data_Options={part5.otherRelativeCard.otherCancerType} data_Radio={part5.otherRelativeCard.otherLifeStatus}></CancerField> 
            </form>
            )}
            {step == 6 && (
                <form action="" className="question_form P2">
                    <Radio data={part6.radio_opts_testGen} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                    <FileUploader data={part6.attachment_testGen} class_change1={"P2"} class_change2={"P2_inner"}></FileUploader>
                    <Radio data={part6.radio_opts_fmTestGen} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                    <FileUploader data={part6.attachment_fmTestGen} class_change1={"P2"} class_change2={"P2_inner"}></FileUploader>
                    <Radio data={part6.radio_opts_callExpert} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                    <PersonalInfo data_inp1={part6.personalInfo.fullName} data_inp2={part6.personalInfo.mobileNumber1} data_inp3={part6.personalInfo.mobileNumber2} data_inp4={part6.personalInfo.province}
                                  data_inp5={part6.personalInfo.city} data_inp6={part6.personalInfo.postalCode} data_opt={part6.personalInfo.birthCountry} data_inp7={part6.personalInfo.address}
                                  data_check={part6.personalInfo.confidentialityAgreement}
                    ></PersonalInfo>
            </form>
            )}
            </div>
            <div className="btn_holder_next_prev">
                <button className="btn_question" onClick={nexter}>بعدی</button>
                <button className="btn_question" onClick={prever}>قبلی</button>
            </div>
            <button className="support_call ">تماس با پشتیبانی</button>
            </div>
        </>
    )
}
export default Questions