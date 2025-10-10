import { useState , useRef , useEffect } from "react";
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
import part7 from './questions/P7.json'
import { useLocation , useNavigate } from "react-router-dom";
import { APIURL } from "./utils/config";
import { useToast } from "./toaster";
import ToastProvider from "./toaster";
import "./form_elements.css"
import "./responsive_questionare.css"
// import { set } from "animejs";
function Questions(){
    const [step , setStep] = useState(1)
    const [checkEmp , setCheckEmp] = useState(false)
    const [requiredMap, setRequiredMap] = useState({});
    const [createdFormId , setCreatedFormId] = useState(0)
    const navigate = useNavigate();
    const { addToast } = useToast()

    // step 1
    const [atba , setatba] = useState(false)
    // step 2
    const [isAlchol , setIsAlchol] = useState('')
    const [isSabzi , setIsSabzi] = useState('')
    const [isActivity , setIsActivity] = useState('')
    const [isHardActivity , setIsHardActivity] = useState('')
    const [isSmoke , setIsSmoke] = useState('')
    const [isSmokeAge , setIsSmokeAge] = useState('')
    const [isSmokingNow , setIsSmokingNow] = useState('')
    // step 3 
    const [isChild , setIsChild] = useState('') 
    const [isAdat , setIsAdat] = useState('')
    const [isHRT , setIsHRT] = useState('')
    const [isHRT5 , setIsHRT5] = useState('')
    const [isOral , setIsOral] = useState('')
    const [isColon , setIsColon] = useState('')
    // step 4
   const [isCancer , setIsCancer] = useState('') 
   //step 5
   const [isChildCancer , setIsChildCncer] = useState('')
   const [isMotherCancer , setIsMotherCncer] = useState('')
   const [isFatherCancer , setIsFatherCncer] = useState('')
   const [isSibsCancer , setIsSibsCncer] = useState('')
   const [isUncAuntCancer , setIsUncAuntCncer] = useState('')
   const [isUncAunt2Cancer , setIsUncAunt2Cncer] = useState('')

   const [isGeneTest , setIsGeneTest] = useState('')
   const [isFamGeneTest , setIsFamGeneTest] = useState('')

    //step 6

    //step 7
    const [smokeType , setSmokeType] = useState('')
    const [smokeTypePast , setSmokeTypePast] = useState('')

    const ArrofVals = [isAlchol , isSabzi , isActivity , isHardActivity , isSmoke , isSmokeAge , isSmokingNow , isChild , isAdat ,isHRT , isHRT5 , isOral , isColon , isCancer
    ,isChildCancer,isMotherCancer,isFatherCancer,isSibsCancer,isUncAuntCancer,isUncAunt2Cancer,isGeneTest,isFamGeneTest
    ]
    // console.log("the alchol we masraf" , isAlchol)
    // console.log("the sigar we smoke " ,isSmoke)
    // form refrences
    const formRefs = {
        1: useRef(null),
        2: useRef(null),
        3: useRef(null),
        4: useRef(null),
        5: useRef(null),
        6: useRef(null),
        7: useRef(null)
        };




    console.log("############################" , step , "#############################")

    const raw = localStorage.getItem("form_data");
    const id_form = localStorage.getItem("form_id")
    const presetform = raw ? JSON.parse(raw) : null;
    console.log("this is the fetched preset form  : " , presetform)
    // document.addEventListener("DOMContentLoaded" , () => {
        
    // })
    useEffect(() => {
        if(presetform != null){
            setIsAlchol(presetform["drinksAlcohol"])
            setIsSabzi(presetform["lastMonthSabzijatMeal"])
            setIsActivity(presetform["mediumActivityMonthInYear"])
            let formElems = []
            Object.keys(formRefs).forEach(fk => {
                let formRaw = formRefs[fk].current.querySelectorAll("input , select")
                formRaw.forEach(fR => {
                    formElems.push(fR)
                });
            })
            console.log("########################################" , presetform)
            formElems.forEach(fE  => {
                Object.keys(presetform).forEach(pfk => {
                    if(fE.name == pfk && (fE.type == "text" || fE.type == "number" || fE.nodeName === 'SELECT')){
                        fE.value = presetform[pfk]
                    }else if(fE.name == pfk && fE.type == "radio"){
                        if(fE.id == presetform[pfk]){
                            fE.checked = true
                        }
                        if(fE.id == "بله" && (presetform[pfk] == true || presetform[pfk] == "true")){
                            fE.checked = true
                        }else if(fE.id == "خیر" && (presetform[pfk] == false ||  presetform[pfk] == "false")){
                            fE.checked = true
                        }
                    }
                })
            });

        }
    } , [])
    const relator_S = (state) => {
        if(state != '' && state != "انتخاب کنید"){
            return true
        }else{
            return false
        }
    }
    const relator_R = (state) =>{
        if(state == "بله" || state == true){
            return true
        }else{
            return false
        }
    }






    // I do not know but you should 
    function getValue(obj, st, name) {
        return obj[st]?.[name];
      }
      
      const isNumber = (str) => str.trim() !== "" && !isNaN(str);
      
      const checkReq = (FP, st) => {
        let form_inps = FP.current.querySelectorAll("input, select");
        let rads = {};
        let go1  = []
        let go2 = []
        let reqErr = false
        form_inps.forEach(fi => {
          const Name = fi.name;
          const isRequired = getValue(requiredMap, st, Name);
            
          if (fi.type === "radio") {
            // collect radios into rads[Name]
            if (!rads[Name]) rads[Name] = [];
            rads[Name].push(fi);
          } else {
            // Non-radio: validate directly
            if (isRequired) {
              if (fi.value.trim() === "" || fi.value.trim() === "انتخاب کنید") {
                fi.style.border = "2px solid red";
                reqErr = true
                go1.push(false)
              }else{
                fi.style.border = "";
                go1.push(true)
                }
            }
          }
        });
      
        // ✅ Validate radios separately
        Object.keys(rads).forEach(groupName => {
          const isRequired = getValue(requiredMap, st, groupName);
          if (isRequired) {
            const checked = rads[groupName].some(r => r.checked);
            if (!checked) {
              // Mark all radios in this group
              rads[groupName].forEach(r => {
                r.parentElement.parentElement.style.border = "2px solid red";
              });
              go2.push(false)
              reqErr = true
            }else{
                rads[groupName].forEach(r => {
                    r.parentElement.parentElement.style.border = "";
                  });
                go2.push(true)
            }
          }
        });
        if(reqErr){
            addToast({
                title: "لطفا تمامی سوال ها را پر کنید",
                type: 'error',
                duration: 4000
              })
        }
        let pass1 = go1.some((el) => el == false)
        let pass2 = go2.some((el) => el == false) 
        // console.log(go1 , go2)
        // if there is just one object pass that
        if(!pass2 && !pass1){
            nexter()
        }else if(go1.length == 0 || go2.length == 0){
            if(go1.length >= 1 && !pass1){
                nexter()
            }else if(go2.length >= 1 && !pass2){
                nexter()
            }
        }
      };

    useEffect(() => {
        let bigger_dict = {}
        Object.keys(formRefs).forEach(key => {
        //    console.log(formRefs[key])
            const fields = formRefs[key].current.querySelectorAll("input, select, textarea");
            const dict = {};
            fields.forEach((el) => {
                const name = el.name;
                const type = el.type;
                const isReq = el.getAttribute("data_req") === "true"; // ← use your prop here
                dict[name] = isReq;
            });
           bigger_dict[key] = dict            
        });
        // Build dictionary of required fields from props or DOM
        setRequiredMap(bigger_dict);
        // console.log(bigger_dict)
      } , [
        isAlchol, isSabzi, isActivity, isHardActivity, isSmoke, isSmokeAge,
        isSmokingNow, isChild, isAdat, isHRT, isHRT5, isOral, isColon, isCancer,
        isChildCancer, isMotherCancer, isFatherCancer, isSibsCancer,
        isUncAuntCancer, isUncAunt2Cancer, isGeneTest, isFamGeneTest
      ]);
    // const smokes
    const handleSubmit = (e) => {
        e.preventDefault();
        let APIARR = ["basic" , "generalhealth" , "mamography" , "cancer" , "familycancer" , "contact" , "lungcancer"]
        const allData = {};
        // ${APIURL} 
        // Collect data from all forms
        // Object.values(formRefs).forEach((formRef) => {
        const form = formRefs[`${step}`].current;
        if (form) {
            const formData = new FormData(form);
            for (let [name, value] of formData) {
            // ✅ Convert "true" / "false" / "null" strings back

            if (value === "true" && name != "pastSmoking") {
                allData[name] = true;
            } else if (value === "false" && name != "pastSmoking") {
                allData[name] = false;
            } else if (value === "null" && name != "pastSmoking") {
                allData[name] = null;
            } else if (isNumber(value) && name != "socialSecurityNumber" && name != "postalCode") {
                allData[name] = parseInt(value);
            } else if(value == "انتخاب کنید" || value == "انتخاب نمایید" || value == ""){
                continue
            }else{
                allData[name] = value
            }
            }
        }
        // });
        console.log(allData)
        const token_auth = localStorage.getItem("token")
        if(step == 1){
            // 🚀 Send to server
            fetch(presetform != null && id_form != null ? `http://${APIURL}/form/${id_form}/${APIARR[step - 1]}` : `http://${APIURL}/form/${APIARR[step - 1]}`, {
                method: presetform != null && id_form != null ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 
                            'Authorization': `Bearer ${token_auth}`
                        },
                body: JSON.stringify(allData),
            })
                .then(res => res.json())
                .then((json) => {
                    setCreatedFormId(json.data.form.id)
                })
                .catch((e) => console.log(e));
        }else{
            fetch(presetform != null && id_form != null ? `http://${APIURL}/form/${id_form}/${APIARR[step - 1]}` : `http://${APIURL}/form/${createdFormId}/${APIARR[step - 1]}`, {
                method:'PUT',
                headers: { 'Content-Type': 'application/json', 
                            'Authorization': `Bearer ${token_auth}`
                        },
                body: JSON.stringify(allData),
            })
                .catch((e) => console.log(e));
                // navigate("/forms")
        }

        };

    const updateTheForm = (e) => {
            e.preventDefault();
          
            const allData = {};
          
            // Collect data from all forms
            Object.values(formRefs).forEach((formRef) => {
              const form = formRef.current;
              if (form) {
                const formData = new FormData(form);
                for (let [name, value] of formData) {
                  // ✅ Convert "true" / "false" / "null" strings back
                  if (value === "true" && name !== "pastSmoking") {
                    allData[name] = true;
                  } else if (value === "false" && name !== "pastSmoking") {
                    allData[name] = false;
                  } else if (value === "null" && name !== "pastSmoking") {
                    allData[name] = null;
                  } else if (
                    isNumber(value) &&
                    name !== "socialSecurityNumber" &&
                    name !== "postalCode"
                  ) {
                    allData[name] = parseInt(value);
                  } else {
                    allData[name] = value;
                  }
                }
              }
            });
          
            // 👉 Add form_id here
            allData.form_id = parseInt(id_form); // You can replace this with a dynamic value
          
            console.log("Final ", allData);
          
            const token_auth = localStorage.getItem("token");
          
            // 🚀 Send to server
            fetch("http://185.231.115.28:8080/form", {
              method: "PUT", // 🔥 changed POST -> PUT
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token_auth}`,
              },
              body: JSON.stringify(allData),
            })
              .then((res) => {
                if (!res.ok) throw new Error("Failed to update form");
                return res.json();
              })
              .then(() => alert("Form updated successfully!"))
              .catch((e) => console.error(e));
          
            navigate("/forms");
          };
          

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
        
        if(step != 7){
            setStep(s => s + 1)
        }        
    }
    const prever = () => {
        if (step != 1){
            setStep(s => s - 1)
        }
    }
    const smokeTypeQuestion = (ST) => {
        // console.log("maraz nadaram ke bebin: " , ST)
        let the_chooseVal
        if(ST == "سیگار"){
            the_chooseVal =  part7.text_cigarettesPerDay_current 
        }else if(ST == "سیگار برگ"){
            the_chooseVal =  part7.text_cigarPerDay_current
        }else if(ST == "پیپ"){
            the_chooseVal =  part7.text_pipePerDay_current
        }else if(ST == "قلیان"){
            the_chooseVal =  part7.text_hookahPerWeek_current
        }else if(ST == "چپق"){
            the_chooseVal =  part7.text_chapoghPerDay_current
        }else if(ST == "سیگار الکترونیک و محصولات مشابه"){
            the_chooseVal =  part7.text_eCigPerDay_current
        }else if(ST == "تریاک"){
            the_chooseVal =  part7.text_smokedOpiumPerDay_current
        }else{
            the_chooseVal = null
        }
        return the_chooseVal
    }

    const smokeTypePastQuestion = (ST) => {
        // console.log("maraz nadaram ke bebin: " , ST)
        let the_chooseVal
        if(ST == "سیگار"){
            the_chooseVal =  part7.text_cigarettesPerDay_past 
        }else if(ST == "سیگار برگ"){
            the_chooseVal =  part7.text_cigarPerDay_past
        }else if(ST == "پیپ"){
            the_chooseVal =  part7.text_pipePerDay_past
        }else if(ST == "قلیان"){
            the_chooseVal =  part7.text_hookahPerWeek_past
        }else if(ST == "چپق"){
            the_chooseVal =  part7.text_chapoghPerDay_past
        }else if(ST == "سیگار الکترونیک و محصولات مشابه"){
            the_chooseVal =  part7.text_eCigPerDay_past
        }else if(ST == "تریاک"){
            the_chooseVal =  part7.text_smokedOpiumPerDay_past
        }else{
            the_chooseVal = null
        }
        return the_chooseVal
    }
    const smokesNow = smokeTypeQuestion(smokeType)
    const smokesPast = smokeTypePastQuestion(smokeTypePast)


    return(
        <>
        <div className="question_container">
            <h2 className="question_title">سامانه ریسک سنجی آنلاین</h2>
            <div className="question_form_container">
                {/* form part 1*/}

            <form ref={formRefs[1]} style={step==1 ? null : {display:"none "}}  className="question_form P1">
                <Radio data_req={"true"} data={part1[0]}></Radio>
                <Options data_req={"true"} data={part1[1]} relation={true}></Options>
                <Options data_req={"true"} data={part1[2]} relation={true}></Options>
                <Options data_req={"true"} data={part1[3]} relation={true}></Options>
                <CheckBox data={part1[4]} atba={atba} checker={atba_checker}></CheckBox>
                {atba && <InputBox data_req={"true"} data={part1[5]}></InputBox>}
                {!atba && <InputBox data_req={"true"} data={part1[6]}></InputBox>}
                <InputBox data_req={"true"} data={part1[7]}></InputBox>
                <InputBox data_req={"true"} data={part1[8]}></InputBox>
            </form>
                {/* form part 2 */}
            <form ref={formRefs[2]} style={step==2 ? null : {display:"none "}}  className="question_form P2">
                <Radio data_req={"true"} data={part2.radio_opts_alcohol} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsAlchol}></Radio>
                <Options data={part2.combine_option_amountAlcohol} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isAlchol)}></Options>

                <Options data_req={"true"} data={part2.combine_option_lastMonthSabzijatMeal} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsSabzi} preSet={presetform} ></Options>
                <Options data={part2.combine_option_lastMonthSabzijatWeight} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={null} relation={relator_S(isSabzi)}></Options>

                <Options data_req={"true"} data={part2.combine_option_mediumActivityMonthInYear} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsActivity}></Options>
                <Options data={part2.combine_option_mediumActivityHourInWeek} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_S(isActivity)}></Options>

                <Options data_req={"true"} data={part2.combine_option_hardActivityMonthInYear} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsHardActivity}></Options>
                <Options data={part2.combine_option_hardActivityHourInWeek} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_S(isHardActivity)}></Options>
                
                <Radio data_req={"true"} data={part2.radio_opts_smoking100} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsSmoke}></Radio>
                {/* {isSmoke == 'بله' && ( */}
                    <>
                        <Options data_req={"true"} data={part2.combine_option_smokingAge} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsSmokeAge} relation={relator_R(isSmoke)}></Options>
                        {/* {isSmokeAge != "انتخاب کنید" && isSmokeAge != "" && isSmokeAge != "هیچوقت به طور منظم سیگار یا قلیان نکشیده ام" && ( */}
                        <>
                            <Radio data_req={"true"} data={part2.radio_opts_smokingNow} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsSmokingNow} relation={relator_S(isSmokeAge) && relator_R(isSmoke)}></Radio>
                            {/* {isSmokingNow == 'بله' && ( */}
                            <>
                            <Options data_req={"true"} data={part2.combine_option_countSmokingDaily} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow)}></Options>
                            <Options data_req={"true"} data={part2.combine_option_t_gh_daily} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow)}></Options>
                            </>
                            {/* )} */}
                            {/* {isSmokingNow == 'خیر' && ( */}
                                <>
                                <Options data_req={"true"} data={part2.combine_option_leaveSmokingAge} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow) == true}></Options>
                                <Options data_req={"true"} data={part2.combine_option_countSmokingDaily_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow) == true}></Options>
                                <Options data_req={"true"} data={part2.combine_option_t_gh_daily_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isSmokingNow) == true}></Options>
                                </>
                            {/* )} */}
                        </>
                        {/* )} */}
                    </>
                {/* )} */}

        </form>
                {/* form part 3 */}

            <form ref={formRefs[3]} style={step==3 ? null : {display:"none "}}  className="question_form P2">
                <Options data_req={"true"} data={part3.combine_option_ghaedeAge} class_change1={"P2"} class_change2={"P2_inner"}></Options>

                <Radio data_req={"true"} data={part3.radio_opts_children} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsChild}></Radio>
                <Options data={part3.combine_option_firstChildBirthAge} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isChild)}></Options>

                <Radio data_req={"true"} data={part3.radio_opts_menopausal_status} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsAdat}></Radio>
                <Options data={part3.combine_option_menopause} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isAdat)}></Options>

                <Radio data_req={"true"} data={part3.radio_opts_hrt} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsHRT}></Radio>
                <Options data={part3.combine_option_hrt_use_length} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isHRT)}></Options>
 
                <Radio data_req={"true"} data={part3.radio_opts_lastFiveYears_HRT_use} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsHRT5}></Radio>
                    <>
                    <Radio data_req={"true"} data={part3.radio_opts_HRT_current_use} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isHRT5)}></Radio>
                    <Options data_req={"true"} data={part3.combine_option_intended_HRT_use} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isHRT5)}></Options>
                    <Radio data_req={"true"} data={part3.radio_opts_hrt_Type} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isHRT5)}></Radio>
                    </>

                <Radio data_req={"true"} data={part3.radio_opts_oral} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsOral}></Radio>
                <Options data={part3.combine_option_oralDuration} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isOral)}></Options>

                <Radio data_req={"true"} data={part3.radio_opts_oral2LastYears} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data_req={"true"} data={part3.radio_opts_mamoGraphy} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data_req={"true"} data={part3.radio_opts_falop} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data_req={"true"} data={part3.radio_opts_andometrioz} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data_req={"true"} data={part3.radio_opts_leavePestan} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data_req={"true"} data={part3.radio_opts_leaveTokhmdan} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
    
                <Radio data_req={"true"} data={part3.radio_opts_laDe_colon} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsColon}></Radio>
                <Radio data={part3.radio_opts_laDe_pol} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isColon)}></Radio>

                <Radio data_req={"true"} data={part3.radio_opts_asp_la_mo} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data_req={"true"} data={part3.radio_opts_nsaiD_la_mo} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                <Radio data_req={"true"} data={part3.radio_opts_lastFiveYearBloodTestInStool} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
            </form>
                {/* form part 4 */}

            <form ref={formRefs[4]} style={step==4 ? null : {display:"none "}}  className="question_form P2">
                    <Radio data_req={"true"} class_change1={"P2"} class_change2={"P2_inner"} data={part4.radio_opts_cancer} valueSetter={setIsCancer}></Radio>
                    <CancerField data_req={"true"} data_Inp1={null} data_Options={part4.cancerCard.cancerType} data_Radio={null} data_Inp2={part4.cancerCard.cancerAge} relation={relator_R(isCancer)}></CancerField>
            </form>
                {/* form part 5 */}

            <form ref={formRefs[5]} style={step==5 ? null : {display:"none "}}  className="question_form P2">
                    
                    <Radio data_req={"true"} data={part5.radio_opts_childCancer} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsChildCncer}></Radio>
                    <CancerField data_req={"true"} data_Inp1={part5.childCard.childName} data_Inp2={part5.childCard.childCancerAge} data_Options={part5.childCard.childCancerType} data_Radio={part5.childCard.childLifeStatus} relation={relator_R(isChildCancer)}></CancerField> 

                    <Radio data_req={"true"} data={part5.radio_opts_motherCancer} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsMotherCncer}></Radio>
                    <CancerField data_req={"true"} data_Inp1={part5.motherCard.motherName} data_Inp2={part5.motherCard.motherCancerAge} data_Options={part5.motherCard.motherCancerType} data_Radio={part5.motherCard.motherLifeStatus} relation={relator_R(isMotherCancer)}></CancerField> 

                    <Radio data_req={"true"} data={part5.radio_opts_fatherCancer} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsFatherCncer}></Radio>
                    <CancerField data_req={"true"} data_Inp1={part5.fatherCard.fatherName} data_Inp2={part5.fatherCard.fatherCancerAge} data_Options={part5.fatherCard.fatherCancerType} data_Radio={part5.fatherCard.fatherLifeStatus} relation={relator_R(isFatherCancer)}></CancerField> 

                    <Radio data_req={"true"} data={part5.radio_opts_bsCancer} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsSibsCncer}></Radio>
                    <CancerField data_req={"true"} data_Inp1={part5.siblingCard.siblingName} data_Inp2={part5.siblingCard.siblingCancerAge} data_Options={part5.siblingCard.siblingCancerType} data_Radio={part5.siblingCard.siblingLifeStatus} relation={relator_R(isSibsCancer)}></CancerField> 
                    
                    <Radio data_req={"true"} data={part5.radio_opts_ameAmoCancer} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsUncAuntCncer}></Radio>
                    <CancerField data_req={"true"} data_Inp1={part5.uncleAuntCard.uncleAuntName} data_Inp2={part5.uncleAuntCard.uncleAuntCancerAge} data_Options={part5.uncleAuntCard.uncleAuntCancerType} data_Radio={part5.uncleAuntCard.uncleAuntLifeStatus} relation={relator_R(isUncAuntCancer)}></CancerField> 

                    <Radio data_req={"true"} data={part5.radio_opts_khaleDaeiCancer} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsUncAunt2Cncer}></Radio>
                    <CancerField data_req={"true"} data_Inp1={part5.khaleDaeiCard.khaleDaeiName} data_Inp2={part5.khaleDaeiCard.khaleDaeiCancerAge} data_Options={part5.khaleDaeiCard.khaleDaeiCancerType} data_Radio={part5.khaleDaeiCard.khaleDaeiLifeStatus} relation={relator_R(isUncAunt2Cancer)}></CancerField> 

                    <CancerField data_req={"true"} data_Inp1={part5.otherRelativeCard.otherRelation} data_Inp2={part5.otherRelativeCard.otherCancerAge} data_Options={part5.otherRelativeCard.otherCancerType} data_Radio={part5.otherRelativeCard.otherLifeStatus}></CancerField> 
            </form>
                {/* form part 6 */}
                <form ref={formRefs[6]} id="form6" style={step==6 ? null : {display:"none"}}  className="question_form P2">
                    <Radio data_req={"true"} data={part6.radio_opts_testGen} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsGeneTest}></Radio>
                    <FileUploader data={part6.attachment_testGen} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isGeneTest)}></FileUploader>

                    <Radio data_req={"true"} data={part6.radio_opts_fmTestGen} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsFamGeneTest}></Radio>
                    <FileUploader data={part6.attachment_fmTestGen} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isFamGeneTest)}></FileUploader>

                    <Radio data_req={"true"} data={part6.radio_opts_callExpert} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                    <PersonalInfo data_req={"true"} data_inp1={part6.personalInfo.fullName} data_inp2={part6.personalInfo.mobileNumber1} data_inp3={part6.personalInfo.mobileNumber2} data_inp4={part6.personalInfo.province}
                                  data_inp5={part6.personalInfo.city} data_inp6={part6.personalInfo.postalCode} data_opt={part6.personalInfo.birthCountry} data_inp7={part6.personalInfo.address}
                                  data_check={part6.personalInfo.confidentialityAgreement}
                    ></PersonalInfo>
            </form>
                {/* form part 7 */}
                <form ref={formRefs[7]} id="form7" style={step==7 ? null : {display:"none"}} action="" className="question_form P2">
                        <Options data_req={"true"} data={part7.combine_option_insurance} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                        <Radio data_req={"true"} data={part7.radio_hypertension} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                        <Radio data_req={"true"} data={part7.radio_hypertension_treatment} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                        <Radio data_req={"true"} data={part7.radio_heartDisease} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                        <Radio data_req={"true"} data={part7.radio_heartDisease_treatment} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                        <Radio data_req={"true"} data={part7.radio_diabetes} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                        <Radio data_req={"true"} data={part7.radio_diabetes_treatment} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                        <Radio data_req={"true"} data={part7.radio_chronicLungDisease} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                        <Radio data_req={"true"} data={part7.radio_lungCancerHistory} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                        <Radio data_req={"true"} data={part7.radio_lungCancerFamily} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                        <Options data_req={"true"} data={part7.combine_option_lungCancerFamilyRelation} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                        <Options data_req={"true"} data={part7.combine_option_occupationalExposure} class_change1={"P2"} class_change2={"P2_inner"}></Options>
                        <Radio data={part7.radio_currentSmoking} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                        <Options data_req={"true"} data={part7.combine_option_smokingTypes_current} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setSmokeType}></Options>
                        {smokeType.length != 0 && smokeType != "انتخاب کنید" && (
                        <InputBox data={smokesNow} class_change1={"P2"} class_change2={"P2_inner"}></InputBox> 
                        )}
                        {smokeType == "تریاک" && (
                        <InputBox data={part7.text_chewedOpiumPerDay_past} class_change1={"P2"} class_change2={"P2_inner"}></InputBox> 
                        )}
                        <Radio data_req={"true"} data={part7.radio_pastSmoking} class_change1={"P2"} class_change2={"P2_inner"}></Radio>
                        <InputBox data_req={"true"} data={part7.text_smokingStartAge_past} class_change1={"P2"} class_change2={"P2_inner"}></InputBox>
                        <Options data={part7.combine_option_smokingTypes_past} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setSmokeTypePast}></Options>
                        {smokeTypePast.length != 0 && smokeTypePast != "انتخاب کنید" && (
                        <InputBox data_req={"true"} data={smokesPast} class_change1={"P2"} class_change2={"P2_inner"}></InputBox> 
                        )}
                        {smokeTypePast == "تریاک" && (
                        <InputBox data_req={"true"} data={part7.text_chewedOpiumPerDay_past} class_change1={"P2"} class_change2={"P2_inner"}></InputBox> 
                        )}



                </form>

            </div>
            <div className="btn_holder_next_prev">
                {step == 7 ? (
                    <button className="btn_question" onClick={(e) => {
                            handleSubmit(e)
                            addToast({
                                title: 'پاسخ های شما با موفقیت ذخیره شد',
                                type: 'success',
                                duration: 4000
                              })
                            navigate("/forms")

                    }}>ارسال</button>
                ) : (
                <button className="btn_question" onClick={(e) => {
                    checkReq(formRefs[step] , step)
                    handleSubmit(e)
                }}>بعدی</button>
                )}
                <button className="btn_question" onClick={prever}>قبلی</button>
            </div>
            <button className="support_call ">تماس با پشتیبانی</button>
            </div>
        </>
    )
}
export default Questions