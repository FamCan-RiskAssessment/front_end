import { useState, useRef, useEffect } from "react";
import InputBox from "../input_box";
import InputBoxV2 from "../input_boxV2";
import Radio from "../radio";
// import RadioV2 from "../RadioV2";
import CheckBox from "../checkbox";
import Options from "../option";
import OptionsV2 from "../optionV2";
import CancerField from "../cancer_universal";
import FileUploader from "../file_uploader";
import PersonalInfo from "../personal_info";
import Loader from "../utils/loader";
import prevSign from '../V2Form/arrow_right.svg'
import homeSign from '../V2Form/home.svg'
import part1 from '../questions/P1.json'
import part2 from '../questions/P2.json'
import part3 from '../questions/P3.json'
import part4 from '../questions/P4.json'
import part5 from '../questions/P5.json'
import part6 from '../questions/P6.json'
import part7 from '../questions/P7.json'
import CQs from '../questions/catchQs.json'
import { useLocation, useNavigate } from "react-router-dom";
import { APIURL, cancerRefs } from "../utils/config";
import { useToast } from "../toaster";
import ToastProvider from "../toaster";
import { fetchDataGET, isNumber, formatAndValidateJalali, CancerAdder, fetchDataPOSTImg, persianMonths, fetchDataGETImg, dict_transformer, getKeyVal, cancerDictRefiner } from "../utils/tools";
// import "./form_elementsNavid.css"
import "../responsive_questionare.css"
import RadioV2 from "../RadioV2";
// import { set } from "animejs";
function QuestionsNavid() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [after, setAfter] = useState(false)
    const [checkEmp, setCheckEmp] = useState(false)
    const [requiredMap, setRequiredMap] = useState({});
    const [createdFormId, setCreatedFormId] = useState(0)
    const [openModalConf, setOpenModalConf] = useState(false)

    const [typeErr, setTypeErr] = useState(false)
    const [typeErr2, setTypeErr2] = useState(false)
    const [typeErr3, setTypeErr3] = useState(false)
    const [catchQuestions, setCatchQuestions] = useState({});
    const [catchAnswers, setCatchAnswers] = useState({});
    const [step3AttentionCorrect, setStep3AttentionCorrect] = useState(0);
    const [RadioMap, setRadioMap] = useState({})
    const [RelMap, setRelMap] = useState({})
    const [CheckBoxMap, setCheckBoxMap] = useState({})
    const formDataRef = useRef(new FormData()); // Keep formData in a ref so FileUploaders can access it
    const fileArraysRef = useRef({}); // Keep track of file arrays by field name

    // let checkBoxMapper = {
    //     1: true,
    //     2: false
    // }
    // Function to allow FileUploader components to add files to the shared formData
    const fillingFormData = (fieldName, file) => {
        formDataRef.current.append(fieldName, file);

        // Also track in our separate file arrays structure
        if (!fileArraysRef.current[fieldName]) {
            fileArraysRef.current[fieldName] = [];
        }
        fileArraysRef.current[fieldName].push(file);


        for (let pair of formDataRef.current.entries()) {
            // Removed logging
        }
    };

    // Function to allow FileUploader components to remove the last file from the shared formData
    const removeLastFileFromFormData = (fieldName) => {
        // Get the file array for this field
        const fieldFiles = fileArraysRef.current[fieldName] || [];

        if (fieldFiles.length > 0) {
            // Remove the last file from our tracking array
            fieldFiles.pop();

            // Rebuild the formData by getting all values for each field
            const newFormData = new FormData();
            const fieldsMap = new Map(); // To collect values by field name

            // Collect all values by field name
            for (let [key, value] of formDataRef.current.entries()) {
                if (!fieldsMap.has(key)) {
                    fieldsMap.set(key, []);
                }
                fieldsMap.get(key).push(value);
            }

            // Rebuild the formData, removing the last value for the specified field
            for (let [fieldNameKey, valuesArray] of fieldsMap) {
                if (fieldNameKey === fieldName && valuesArray.length > 0) {
                    // For the target field, add all values except the last one
                    for (let i = 0; i < valuesArray.length - 1; i++) {
                        newFormData.append(fieldNameKey, valuesArray[i]);
                    }
                } else {
                    // For other fields, add all values
                    for (let value of valuesArray) {
                        newFormData.append(fieldNameKey, value);
                    }
                }
            }

            // Update the ref
            formDataRef.current = newFormData;
        }
    };

    // const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToast } = useToast()

    // step 1
    const [atba, setatba] = useState(false)
    const [gender, setGender] = useState(0)
    // step 2
    const [isAlchol, setIsAlchol] = useState('')
    const [isSabzi, setIsSabzi] = useState('')
    const [isActivity, setIsActivity] = useState('')
    const [isHardActivity, setIsHardActivity] = useState('')
    const [isSmoke, setIsSmoke] = useState('')
    const [isSmokeAge, setIsSmokeAge] = useState('')
    const [isSmokingNow, setIsSmokingNow] = useState('')
    // step 3 
    const [isChild, setIsChild] = useState('')
    const [isAdat, setIsAdat] = useState('')
    const [isHRT, setIsHRT] = useState('')
    const [isHRT5, setIsHRT5] = useState('')
    const [isOral, setIsOral] = useState('')
    const [isColon, setIsColon] = useState('')
    const [isMamoTest, setIsMamoTest] = useState('')
    // step 4
    const [isCancer, setIsCancer] = useState('')
    const [selfCancersPreData, setSelfCancersPreData] = useState(null)
    //step 5
    const [isChildCancer, setIsChildCncer] = useState('')
    const [isMotherCancer, setIsMotherCncer] = useState('')
    const [isFatherCancer, setIsFatherCncer] = useState('')
    const [isSibsCancer, setIsSibsCncer] = useState('')
    const [isUncAuntCancer, setIsUncAuntCncer] = useState('')
    const [isUncAunt2Cancer, setIsUncAunt2Cncer] = useState('')
    const [isOtherCancer, setIsOtherCncer] = useState('')
    const [familyCancersPreData, setFamilyCancersPreData] = useState(null)

    //step 6
    const [smokeType, setSmokeType] = useState('')
    const [smokeTypePast, setSmokeTypePast] = useState('')
    const [isChronic, setIsChronic] = useState('')
    const [anySmokePast, setAnySmokePast] = useState(false)
    const [anySmoke, setAnySmoke] = useState(false)
    const [firstDeg, setFirstDeg] = useState(false)
    const [multiSmokeTypePast, setMultiSmokeTypePast] = useState([])
    const [multiSmokeTypeCurrent, setMultiSmokeTypeCurrent] = useState([])

    // const [isChronic, setIsChronic] = useState(false)
    //step 7

    const [isGeneTest, setIsGeneTest] = useState('')
    const [isFamGeneTest, setIsFamGeneTest] = useState('')

    console.log(">>>>>>>>>>>>>>>>>>>>>>>> : ", multiSmokeTypePast)

    const ArrofVals = [isAlchol, isSabzi, isActivity, isHardActivity, isSmoke, isSmokeAge, isSmokingNow, isChild, isAdat, isHRT, isHRT5, isOral, isColon, isCancer
        , isChildCancer, isMotherCancer, isFatherCancer, isSibsCancer, isUncAuntCancer, isUncAunt2Cancer, isGeneTest, isFamGeneTest
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
        // 6: useRef(null),
        // 7: useRef(null)
    };

    const cancerTable = useRef(null)
    const cancerMotherTable = useRef(null)
    const cancerFatherTable = useRef(null)
    const questionContainerRef = useRef(null);
    // const cancerTable = useRef(null)
    // const cancerMotherTable = useRef(null)
    // const cancerMotherTable = useRef(null)




    const raw = localStorage.getItem("form_data");
    const id_form = localStorage.getItem("form_id")
    const presetform = raw ? JSON.parse(raw) : null;
    // const id_form = id_form_raw ? JSON.parse(id_form_raw) : null;
    console.log("this is the fetched preset form  : ", presetform)
    // console.log("here is the form id from above : ", typeof id_form)
    // console.log("there is a data that you neeeed : ", selfCancersPreData)
    // useEffect(() => {
    //     let token = localStorage.getItem("token")
    //     const fucking_func = async () => {
    //         const res = await fetchDataGET(`enum/genders`, token);
    //         console.log("the fucking Enums : ", res)
    //     }
    //     // let sele = formRefs[1].current
    //     fucking_func()
    // }, [])

    // Enum properties:
    useEffect(() => {
        let token = localStorage.getItem("token")
        const getAns = async () => {
            const ansMap = await fetchDataGET("enum/answers", token)
            let trueData = dict_transformer(ansMap.data)
            setRadioMap(trueData)
            // console.log(ansMap)
        }
        getAns()
        const getRels = async () => {
            const res = await fetchDataGET(`enum/relatives`, token);
            let trueData = dict_transformer(res.data)
            setRelMap(trueData)
        }
        getRels()
        // Initialize CheckBoxMap: 1 for true (checked), 2 for false (unchecked)
        const checkBoxMapper = {
            true: 1,
            false: 2,
            1: true,
            2: false
        }
        setCheckBoxMap(checkBoxMapper)
        // let temp_dict = {
        //     "بله": 1,
        //     "خیر": 2,
        //     "نمیدانم": 3,
        // }
    }, [])

    // Function to inject catch questions into specified forms
    const injectCatchQuestions = () => {
        // Only inject catch questions for steps 2, 3, and 6
        if (![2, 3, 6].includes(step)) return;

        // Select a random catch question
        const randomIndex = Math.floor(Math.random() * CQs.length);
        const selectedCatchQuestion = { ...CQs[randomIndex] };

        // Handle special case for catchSum question type
        if (selectedCatchQuestion.useName === "catchSum") {
            const num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1-10
            const num2 = Math.floor(Math.random() * 10) + 1; // Random number between 1-10
            const sum = num1 + num2;

            // Update the question with the random numbers
            selectedCatchQuestion.inpName = `${num1} + ${num2} = ?`;
            selectedCatchQuestion.correctAnswer = sum; // Store the correct answer

            // Update state to track this specific catch question's answer
            setCatchAnswers(prev => ({
                ...prev,
                [`catchSum_${step}`]: sum
            }));
        } else if (selectedCatchQuestion.ans !== undefined) {
            // For other questions, store the correct answer
            setCatchAnswers(prev => ({
                ...prev,
                [selectedCatchQuestion.useName]: selectedCatchQuestion.ans
            }));
        }

        // Store the catch question for the current step
        setCatchQuestions(prev => ({
            ...prev,
            [step]: selectedCatchQuestion
        }));
    };

    // useEffect to inject catch questions when step changes
    useEffect(() => {
        injectCatchQuestions();
    }, [step]);

    useEffect(() => {
        if (presetform != null && id_form != null) {
            setCreatedFormId(id_form)
        }
    })



    // console.log("33333333333333333333333333333333333333333333333333333333333333 : ", selfCancers)

    console.log("SAMOOOOOOOOOOOOOOOOOOOOOOOOOOOOOR", familyCancersPreData, selfCancersPreData)

    // cancer preData
    useEffect(() => {
        let token = localStorage.getItem("token")
        const selfFunc = async () => {
            const res = await fetchDataGETImg(`form/${id_form}/cancer`, token);
            setSelfCancersPreData(res)
        }
        selfFunc()
        const familyFunc = async () => {
            const res = await fetchDataGETImg(`form/${id_form}/familycancer`, token);
            setFamilyCancersPreData(res)
        }
        familyFunc()
    }, [])


    useEffect(() => {
        if (presetform != null && familyCancersPreData != null) {
            let masked_cancers = cancerDictRefiner(RelMap, familyCancersPreData)
            console.log("whyInnerrrrrrrrrrrrrrrrr : ", masked_cancers)
            let formElems = []
            let stepsLoaded = JSON.parse(localStorage.getItem("trueSteps"))
            // console.log("444444444444444444444444444444444444 :  ", stepsLoaded)

            Object.keys(formRefs).forEach(fk => {
                // if (stepsLoaded[fk]) {
                let formRaw = formRefs[fk].current.querySelectorAll("input , select")
                formRaw.forEach(fR => {
                    formElems.push(fR)
                });
                // }
            })
            // console.log("########################################", presetform)
            formElems.forEach(fE => {
                // if (fE.type == "file") {
                //     console.log(fE.name == "mamoGraphyPicture")
                // }
                Object.keys(presetform).forEach(pfk => {
                    // Only process if the property exists and is not undefined
                    if (presetform[pfk] !== undefined) {

                        if (fE.type == "text" || fE.type == "number" || fE.nodeName == "SELECT") {
                            if (pfk == "birthDate" && (fE.name == "birthYear" || fE.name == "birthMonth" || fE.name == "birthDay")) {
                                // console.log("I am here in the presetform : ", pfk)
                                const [year, month, day] = presetform[pfk].split("T")[0].split("-");
                                const y = parseInt(year);
                                const m = parseInt(month);
                                const d = parseInt(day);

                                const Mkey = Object.keys(persianMonths).find(k => persianMonths[k] === m);
                                // formElems.forEach(elem => {
                                if (fE.name === "birthYear") {
                                    fE.value = y;
                                }
                                if (fE.name === "birthMonth") {
                                    fE.value = Mkey;    // since it's a SELECT
                                }
                                if (fE.name === "birthDay") {
                                    fE.value = d;
                                }
                                // });
                            } else if (fE.name == pfk) {
                                if (fE.nodeName == "SELECT" && (presetform[pfk] == null || presetform[pfk] == "")) {
                                    fE.value = "انتخاب کنید"
                                } else {
                                    fE.value = presetform[pfk]
                                }
                                if (pfk == "mediumActivityMonthInYear" || pfk == "hardActivityMonthInYear") {
                                    fE.value = `${presetform[pfk]} ماه`
                                }
                            }
                        } else if (fE.name == pfk && fE.type == "radio") {
                            if (fE.getAttribute("FaVal") == presetform[pfk]) {
                                fE.checked = true
                            } else if (fE.getAttribute("data-enum")) {
                                let token = localStorage.getItem("token")
                                const enumFinder = async () => {
                                    const res = await fetchDataGET(`enum/${fE.getAttribute("data-enum")}`, token);
                                    res.data.forEach(en => {
                                        if (en.id == presetform[pfk] && fE.getAttribute("FaVal") == en.name) {
                                            fE.checked = true
                                        }
                                    });
                                    // console.log("the fucking Enums : ", res)
                                }
                                enumFinder()
                            }
                            // console.log("trrrrrrrrrrrrrrrrrrriple : ", pfk, fE.getAttribute("FaVal"), getKeyVal(RadioMap, presetform[pfk]), presetform[pfk], pfk)
                            // console.log(presetform)
                            if (fE.getAttribute("FaVal") == getKeyVal(RadioMap, presetform[pfk])) {
                                fE.checked = true
                            }
                            if (fE.name == "cancer" && presetform[pfk] == true && fE.getAttribute("FaVal") == "بله" && JSON.parse(localStorage.getItem("selfcanFilled"))) {
                                fE.checked = true
                            }
                            if (fE.name == "cancer" && presetform[pfk] == false && fE.getAttribute("FaVal") == "خیر" && JSON.parse(localStorage.getItem("selfcanFilled"))) {
                                fE.checked = true
                            }
                        } else if (fE.name in cancerRefs && JSON.parse(localStorage.getItem("famcanFilled"))) {
                            console.log("howisthe : ", fE.name)
                            const foundTrue = Object.keys(masked_cancers).some(mc =>
                                cancerRefs[fE.name].some(cf =>
                                    cf === mc && masked_cancers[mc] === "بله"
                                )
                            );
                            if (foundTrue && fE.getAttribute("FaVal") == "بله") {
                                fE.checked = true
                            }
                            if (!foundTrue && fE.getAttribute("FaVal") == "خیر") {
                                fE.checked = true
                            }

                        } else if (fE.name == pfk && fE.type == "file") {
                            // Handle file inputs - presetform value is a URL to an image
                            if (presetform[pfk]) {
                                // Add the image URL to a custom attribute so the FileUploader component can access it
                                // console.log("find that file uploader", presetform[pfk], fE.name)
                                fE.setAttribute('data-file-url', JSON.stringify(presetform[pfk]));
                            }
                        } else if (fE.name == pfk && fE.type == "checkbox") {
                            // Use CheckBoxMap to handle 1/2 values from backend
                            if (presetform[pfk] === 1 || presetform[pfk] === true) {
                                fE.checked = true
                            } else if (presetform[pfk] === 2 || presetform[pfk] === false) {
                                fE.checked = false
                            } else {
                                fE.checked = false
                            }
                        } else if (!(fE.name in presetform) && fE.type == "checkbox") {
                            fE.checked = false
                        } else if (fE.type == "range" && fE.name == pfk) {
                            // console.log("FOOOOOOOOOOOOOOOOOOOOUND : ", fE.name, presetform[pfk], fE.defaultValue)
                            fE.defaultValue = presetform[pfk]
                        }
                    }
                })
            });

            // Set loading to false after preset data has been loaded
            setLoading(false);
        }
    }, [RadioMap, CheckBoxMap, selfCancersPreData, familyCancersPreData])




    useEffect(() => {
        // Only update states if the properties exist in presetform
        if (presetform != null) {
            if ('gender' in presetform) setGender(presetform["gender"])
            if ('drinksAlcohol' in presetform) setIsAlchol(relator_R(getKeyVal(RadioMap, presetform["drinksAlcohol"])))
            if ('lastMonthSabzijatMeal' in presetform) setIsSabzi(presetform["lastMonthSabzijatMeal"])
            if ('mediumActivityMonthInYear' in presetform) setIsActivity(presetform["mediumActivityMonthInYear"])
            if ('hardActivityMonthInYear' in presetform) setIsHardActivity(presetform["hardActivityMonthInYear"])
            if ('smokeAtLeast100' in presetform) setIsSmoke(relator_R(getKeyVal(RadioMap, presetform["smokeAtLeast100"])))
            if ('smokingAge' in presetform) setIsSmokeAge(relator_R(getKeyVal(RadioMap, presetform["smokingAge"])))
            if ('smokingNow' in presetform) setIsSmokingNow(relator_R(getKeyVal(RadioMap, presetform["smokingNow"])))
            if ('hasChildren' in presetform) {
                setIsChild(relator_R(getKeyVal(RadioMap, presetform["hasChildren"])))
            }
            if ('menopausalStatus' in presetform) setIsAdat(presetform["menopausalStatus"])
            if ('hrt' in presetform) setIsHRT(relator_R(getKeyVal(RadioMap, presetform["hrt"])))
            if ('lastFiveYearsHrtUse' in presetform) setIsHRT5(relator_R(getKeyVal(RadioMap, presetform["lastFiveYearsHrtUse"])))
            if ('oral' in presetform) setIsOral(relator_R(getKeyVal(RadioMap, presetform["oral"])))
            if ('laDeColon' in presetform) setIsColon(relator_R(getKeyVal(RadioMap, presetform["laDeColon"])))
            if ('mamoGraphy' in presetform) setIsMamoTest(relator_R(getKeyVal(RadioMap, presetform["mamoGraphy"])))
            if ('cancer' in presetform) setIsCancer(presetform["cancer"])
            if ('childCancer' in presetform) setIsChildCncer(relator_R(getKeyVal(RadioMap, presetform["childCancer"])))
            if ('motherCancer' in presetform) setIsMotherCncer(relator_R(getKeyVal(RadioMap, presetform["motherCancer"])))
            if ('fatherCancer' in presetform) setIsFatherCncer(relator_R(getKeyVal(RadioMap, presetform["fatherCancer"])))
            if ('siblingCancer' in presetform) setIsSibsCncer(relator_R(getKeyVal(RadioMap, presetform["siblingCancer"])))
            if ('ameAmoCancer' in presetform) setIsUncAuntCncer(relator_R(getKeyVal(RadioMap, presetform["ameAmoCancer"])))
            if ('khaleDaeiCancer' in presetform) setIsUncAunt2Cncer(relator_R(getKeyVal(RadioMap, presetform["khaleDaeiCancer"])))
            if ('otherRelative' in presetform) setIsOtherCncer(relator_R(getKeyVal(RadioMap, presetform["otherRelative"])))
            if ('testGen' in presetform) setIsGeneTest(relator_R(getKeyVal(RadioMap, presetform["testGen"])))
            if ('fmTestGen' in presetform) setIsFamGeneTest(relator_R(getKeyVal(RadioMap, presetform["fmTestGen"])))
            if ('smokingTypesCurrent' in presetform) setSmokeType(relator_R(getKeyVal(RadioMap, presetform["smokingTypesCurrent"])))
            if ('smokingTypesPast' in presetform) setSmokeTypePast(relator_R(getKeyVal(RadioMap, presetform["smokingTypesPast"])))
            if ('lungCancerFamily' in presetform) setFirstDeg(relator_R(getKeyVal(RadioMap, presetform["lungCancerFamily"])))
            if ('pastSmoking' in presetform) setAnySmokePast(relator_R(getKeyVal(RadioMap, presetform["pastSmoking"])))
            let arrOfCigsPast = ["Psig", "PsigBarg", "Ppip", "Pghel", "Pchop", "Pteryak", "PelecSig"]
            let arrOfCigsCurrent = ["Csig", "CsigBarg", "Cpip", "Cghel", "Cchop", "Cteryak", "CelecSig"]
            arrOfCigsPast.forEach(ac => {
                if (ac in presetform && presetform[ac] != null) {
                    setMultiSmokeTypePast(mstp => [...mstp, ac])
                }
            });
            arrOfCigsCurrent.forEach(ac => {
                if (ac in presetform && presetform[ac] != null) {
                    setMultiSmokeTypeCurrent(mstc => [...mstc, ac])
                }
            });

            setAfter(true)

        }

    }, [loading])

    useEffect(() => {
        console.log("After has changed lilililililil : ", after, loading)
        // setIsAlchol(true)
    }, [after])

    // New useEffect to handle family relatives cancer status
    useEffect(() => {
        const loadFamilyCancerData = async () => {
            if (id_form && presetform) {
                const token = localStorage.getItem("token");

                try {
                    // Fetch family cancer data
                    const familyCancerRes = await fetchDataGETImg(`form/${id_form}/familycancer`, token);
                    const familyCancerData = familyCancerRes.data?.familyCancers || [];
                    // Fetch relatives enum to map relative IDs to names
                    const relativesEnumRes = await fetchDataGET(`enum/relatives`, token);
                    const relativesEnum = relativesEnumRes.data || [];

                    // Create a map from relative ID to relative name
                    const relativeIdToName = {};
                    relativesEnum.forEach(rel => {
                        relativeIdToName[rel.id] = rel.name;
                    });

                    // Create a map of field names to relative IDs based on the state variables
                    // isChildCancer, isMotherCancer, isFatherCancer, isSibsCancer, isUncAuntCancer, isUncAunt2Cancer, isOtherCancer
                    const relativeFieldMap = {
                        1: "fatherCancer",
                        2: "motherCancer",
                        3: "siblingCancer",
                        4: "siblingCancer",
                        5: "otherRelative",
                        6: "otherRelative",
                        7: "otherRelative",
                        8: "otherRelative",
                        9: "ameAmoCancer",
                        10: "ameAmoCancer",
                        11: "khaleDaeiCancer",
                        12: "khaleDaeiCancer",
                        13: "otherRelative",

                    };

                    // Map field names to form input names based on the useState variables
                    // const fieldToInputName = {
                    //     "childCancer": "isChildCancer",
                    //     "motherCancer": "isMotherCancer",
                    //     "fatherCancer": "isFatherCancer",
                    //     "siblingCancer": "isSibsCancer",
                    //     "ameAmoCancer": "isUncAuntCancer",
                    //     "khaleDaeiCancer": "isUncAunt2Cancer",
                    //     "otherRelative": "isOtherCancer"
                    // };

                    // Create a map of relatives that have cancer
                    const relativesWithCancer = {};
                    familyCancerData.forEach(familyMember => {
                        const relativeId = familyMember.relative;
                        // Find the corresponding field name from the enum
                        const relativeName = relativeIdToName[relativeId];
                        if (relativeName) {
                            // Map the relative name to the field name
                            const fieldName = relativeFieldMap[relativeId];
                            if (fieldName) {
                                // Map the field name to input name used in the form
                                // const inputName = fieldToInputName[fieldName];
                                // if (inputName) {
                                // Check if this relative has any cancers
                                if (familyMember.cancers && familyMember.cancers.length > 0) {
                                    relativesWithCancer[fieldName] = true;
                                }
                                // }
                            }
                        }
                    });
                    // console.log("dele bare gi : ", relativesWithCancer)
                    // Now update the radio buttons in step 5 based on cancer data
                    if (formRefs[3]?.current) {
                        const formElements = formRefs[3].current.querySelectorAll("input[type='radio']");

                        formElements.forEach(radio => {
                            // Find the field name that this radio button belongs to
                            const fieldName = radio.name;
                            // console.log(fieldName)
                            // Check if this field corresponds to a relative with cancer
                            if (relativesWithCancer[fieldName]) {
                                // If the relative has cancer, check the "بله" radio button
                                if (radio.id === "بله") {
                                    radio.checked = true;
                                } else if (radio.id === "خیر") {
                                    radio.checked = false;
                                }
                            } else {
                                // If the relative doesn't have cancer, check the "خیر" radio button
                                if (radio.id === "خیر") {
                                    radio.checked = true;
                                } else if (radio.id === "بله") {
                                    radio.checked = false;
                                }
                            }
                        });
                    }

                } catch (error) {
                    console.error("Error fetching family cancer data:", error);
                }
            }
        };

        loadFamilyCancerData();
    }, [id_form, presetform]);

    // Scroll to top of questions container when step changes
    useEffect(() => {
        if (questionContainerRef.current) {
            questionContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [step]);
    const relator_S = (state) => {
        // console.log(state)
        if (state != '' && state != "انتخاب کنید") {
            // console.log(state)
            return true
        } else {
            return false
        }
    }
    const relator_R = (state, ST) => {
        if (ST !== undefined) {
            console.log("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[ : ", ST)
            console.log(state)
        }
        if (state == "سابقاً مصرف می کرده ام اما کمتر از ۱۵ سال است که ترک کرده ام" || state == "سابقاً مصرف می کردم اما بیش از ۱۵ سال است که ترک کرده ام") {
            return true
        }
        if (isNumber(state) && state != false && ((state == 2 && state != 1) || state == 3)) {
            if (ST != undefined)
                console.log("bug1", ST)

            return true
        } else if (state == 1 && typeof state !== "boolean") {
            if (ST != undefined)
                console.log("bug2", ST, typeof state)
            return false
        }
        if (state == "بله" || state == "true" || state == true && (state != "false" || state != "خیر")) {
            if (ST != undefined)
                console.log("bug3", ST)

            return true
        } else {
            // if (ST == "hi bitch!")
            // console.log("this is failed ? : ", ST, state)
            if (ST != undefined)
                console.log("bug4", ST)
            return false
        }
    }

    const relator_gen = (state) => {
        if (state == 2) {
            return true
        } else {
            return false
        }
    }

    const relator_multiCheck = (Arr, state) => {
        // console.log(Arr, state, Arr.includes(state))
        if (Arr.includes(state)) {
            return true
        } else {
            return false
        }
    }






    // I do not know but you should 
    function getValue(obj, st, name) {
        return obj[st]?.[name];
    }

    //   const isNumber = (str) => str.trim() !== "" && !isNaN(str);

    const checkReq = (FP, st) => {
        let form_inps = FP.current.querySelectorAll("input, select");
        let rads = {};
        let chks = {};
        let go1 = []
        let go2 = []
        let go3 = []
        let reqErr = false
        form_inps.forEach(fi => {
            const Name = fi.name;
            const isRequired = getValue(requiredMap, st, Name);

            if (fi.type === "radio") {
                // collect radios into rads[Name]
                if (!rads[Name]) rads[Name] = [];
                rads[Name].push(fi);
            } else if (fi.type === "checkbox") {
                // collect checkboxes into chks[Name]
                if (!chks[Name]) chks[Name] = [];
                chks[Name].push(fi);
            } else {
                // Non-radio, non-checkbox: validate directly
                if (isRequired) {
                    if (fi.value.trim() === "" || fi.value.trim() === "انتخاب کنید") {
                        fi.style.border = "2px solid red";
                        reqErr = true
                        go1.push(false)
                    } else {
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
                } else {
                    rads[groupName].forEach(r => {
                        r.parentElement.parentElement.style.border = "";
                    });
                    go2.push(true)
                }
            }
        });

        // ✅ Validate checkboxes separately
        Object.keys(chks).forEach(groupName => {
            const isRequired = getValue(requiredMap, st, groupName);
            if (isRequired) {
                const checked = chks[groupName].some(chk => chk.checked);
                if (!checked) {
                    // Mark all checkboxes in this group
                    chks[groupName].forEach(chk => {
                        chk.parentElement.parentElement.style.border = "2px solid red";
                    });
                    go3.push(false)
                    reqErr = true
                } else {
                    chks[groupName].forEach(chk => {
                        chk.parentElement.parentElement.style.border = "";
                    });
                    go3.push(true)
                }
            }
        });
        if (reqErr) {
            addToast({
                title: "لطفا تمامی سوال ها را پر کنید",
                type: 'error',
                duration: 4000
            })
        }
        let pass1 = go1.some((el) => el == false)  // true if there are invalid non-radio inputs
        let pass2 = go2.some((el) => el == false)  // true if there are invalid radio groups
        let pass3 = go3.some((el) => el == false)  // true if there are invalid checkbox groups
        // console.log(go1 , go2, go3)
        // if there is just one object pass that
        if (!pass1 && !pass2 && !pass3) {  // all validations passed
            if (step == 5) {
                return true
            } else {
                nexter()
            }
        } else {  // there are validation errors
            addToast({
                title: "لطفا تمامی سوال ها را پر کنید",
                type: 'error',
                duration: 4000
            })
            return false
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
    }, [
        gender, isAlchol, isSabzi, isActivity, isHardActivity, isSmoke, isSmokeAge,
        isSmokingNow, isChild, isAdat, isHRT, isHRT5, isOral, isColon, isCancer, isMamoTest,
        isChildCancer, isMotherCancer, isFatherCancer, isSibsCancer,
        isUncAuntCancer, isUncAunt2Cancer, isOtherCancer, isGeneTest, isFamGeneTest
    ]);
    // const smokes
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when starting submission
        console.log("get_in_there")

        const APIARR = ["basic", "cancerVisit", "familycancerVisit", "navid", "contact"];

        const form = formRefs[`${step}`].current;
        if (!form) return;

        const token_auth = localStorage.getItem("token");
        let allData = {};
        const currentFormData = formDataRef.current; // Use the shared formData
        let sendData;
        for (const elem of form.elements) {
            const { name, type, tagName } = elem;
            if (!name || elem.disabled) continue;
            if (['BUTTON', 'FIELDSET'].includes(tagName)) continue;

            let shouldProcess = false;
            let value = '';

            if (type === 'radio') {
                if (elem.checked) {
                    shouldProcess = true;
                    value = elem.value;
                }
            } else if (type === 'checkbox') {
                // Handle both checked and unchecked states for checkboxes
                // Exception: isAtba checkbox should keep its original behavior
                if (elem.name === 'isAtba') {
                    if (elem.checked) {
                        shouldProcess = true;
                        value = elem.checked;
                    } else {
                        // When unchecked, still process it (original behavior)
                        shouldProcess = true;
                        value = elem.checked;
                    }
                } else {
                    shouldProcess = true;
                    value = elem.checked;  // Use boolean value directly
                }
            } else if (tagName === 'SELECT') {
                value = elem.value;
                if (!value || value === "انتخاب کنید" || value === "انتخاب نمایید") continue;
                shouldProcess = true;
            } else if (type === 'file') {
                // Check if the file input has files either via the native files property or the custom data_toSend attribute
                const hasNativeFiles = elem.files && elem.files.length > 0;
                const hasCustomFiles = elem.getAttribute("data_toSend");
                if (hasNativeFiles || hasCustomFiles) {
                    shouldProcess = true;
                }
            } else if (type === 'text' || type === 'number' || type === 'email' || type === 'password' || type === 'tel' || type === 'url' || type === 'search' || type === 'date' || type === 'time' || type === 'datetime-local' || type === 'month' || type === 'week' || type === 'color') {
                // Handle various text-based input types
                value = elem.value;
                if (value.trim() !== '') { // Only process if not empty
                    shouldProcess = true;
                }
            } else {
                // For other input types that don't fit the above categories
                value = elem.value;
                if (value.trim() !== '') { // Only process if not empty
                    shouldProcess = true;
                }
            }

            if (!shouldProcess) continue;

            // ✅ Handle enum mapping first
            let finalValue = value;
            // console.log("namaste : ", typeof finalValue)
            const enumName = elem.getAttribute('data-enum');
            if (enumName && value && type !== "file") {
                try {
                    const res = await fetchDataGET(`enum/${enumName}`, token_auth);
                    const match = res.data.find(r => r.name === value);
                    if (match) {
                        finalValue = match.id;
                    }
                } catch (err) {
                    console.warn(`Enum resolve failed: ${enumName}`, err);
                }
            }

            // ✅ Handle file separately - can handle multiple files
            if (type === "file") {
                // // For native file inputs, get files directly from the element
                // if (elem.files && elem.files.length > 0) {
                //     // Append each file with the same field name (standard for multiple files)
                //     for (let i = 0; i < elem.files.length; i++) {
                //         const file = elem.files[i];
                //         if (file && file.name) {
                //             currentFormData.append(name, file);
                //         }
                //     }
                // }

                continue; // Skip adding this field to allData since it's handled via FormData
            }
            // ✅ Apply transformations for normal fields
            // Handle checkboxes: convert true/false to 1/2 for backend
            // Exception: isAtba keeps its original boolean behavior
            if (type === 'checkbox' && name !== "pastSmoking" && name !== "isAtba") {
                if (finalValue === true) {
                    allData[name] = 1;  // checked = 1 (true)
                } else if (finalValue === false) {
                    allData[name] = 2;  // unchecked = 2 (false)
                }
            } else if (finalValue === "true" && name !== "pastSmoking") {
                allData[name] = true;
            } else if (finalValue === "false" && name !== "pastSmoking") {
                allData[name] = false;
            } else if (finalValue === "null" && name !== "pastSmoking") {
                // allData[name] = null;
                // console.log("name is the name , : ", name)
                // pass the fucking data
            } else if (isNumber(finalValue) && name !== "socialSecurityNumber" && name !== "phone2" && name !== "phone3" && name !== "postalCode") {
                allData[name] = parseInt(finalValue, 10);
            } else {
                allData[name] = finalValue;
            }
        }

        // Handle multi-check checkboxes (arrays of selected options)
        // Convert array items to individual fields with value 1 (true)
        if (multiSmokeTypeCurrent && multiSmokeTypeCurrent.length > 0) {
            multiSmokeTypeCurrent.forEach(item => {
                allData[item] = 1;
            });
        }
        if (multiSmokeTypePast && multiSmokeTypePast.length > 0) {
            multiSmokeTypePast.forEach(item => {
                allData[item] = 1;
            });
        }

        // convert date to number & check userId
        if (step == 1) {
            let theDate = formatAndValidateJalali(allData["birthYear"], allData["birthMonth"], allData["birthDay"])
            delete allData["birthYear"]
            delete allData["birthMonth"]
            delete allData["birthDay"]
            allData["birthDate"] = theDate
            if (localStorage.getItem("operatorUserId") != null) {
                allData["userID"] = parseInt(localStorage.getItem("operatorUserId"))
            }
        }

        // Add attentionCorrect field for step 3 if a catch question was answered correctly
        if (step == 3) {
            allData["attentionCorrect"] = step3AttentionCorrect;
        }
        // if (isCancer && step == 4) {
        //     let dels = ["cancerType", "cancerAge"]
        //     let assign = "cancers"
        //     console.log("from the inner world of the self cancers !!!! HI to you fucked people : ", selfCancers)
        //     allData = CancerAdder(allData, selfCancers, dels, assign)

        // }

        console.log("Mapped allData:", allData);
        if (step == 1) {
            allData["formType"] = 2
        }

        // ✅ Append text fields to currentFormData
        if (step == 3 || step == 7) {
            Object.entries(allData).forEach(([key, value]) => {
                currentFormData.append(key, value);
            });
            for (let [key, value] of currentFormData.entries()) {
                console.log(key, value);
            }
            sendData = currentFormData
        } else {
            sendData = JSON.stringify(allData)
        }


        // ✅ Set URL and method logic
        const urlBase = `${APIURL}/form`;
        let url, method, headers;
        if (step === 1) {
            if (presetform != null && (id_form != null || id_form != "null")) {
                url = `${urlBase}/${id_form}/${APIARR[step - 1]}`;
                method = 'PUT';
                headers = {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token_auth}`
                }
            } else {
                if (localStorage.getItem("userNeededAdress").length != 0 && localStorage.getItem("userNeededAdress") != "null") {
                    url = `${APIURL}/${localStorage.getItem("userNeededAdress")}`
                } else {
                    url = `${urlBase}/${APIARR[step - 1]}`;
                }
                method = 'POST';
                headers = {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token_auth}`
                }
            }
        } else if (step == 2 || step == 3) {
            if (presetform != null && step != 2) {
                url = `${urlBase}/${id_form}/${APIARR[step - 1]}`;
            } else {
                url = `${urlBase}/${createdFormId}/${APIARR[step - 1]}`;
            }
            method = 'POST';
            headers = {
                // "Content-Type": "application/json",
                'Authorization': `Bearer ${token_auth}`
            }
            sendData = null  // ✅ No body for steps 2/3 (cancer steps)
            console.log("urrrrrrrrrrrrrrrrrrrL from cancers : ", url)
        } else {
            if (presetform != null && step != 2) {
                url = `${urlBase}/${id_form}/${APIARR[step - 1]}`;
            } else {
                url = `${urlBase}/${createdFormId}/${APIARR[step - 1]}`;
            }
            method = 'PUT';
            headers = {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token_auth}`
            }
            if (step == 3 || step == 7) {
                headers = {
                    'Authorization': `Bearer ${token_auth}`, // ⚠️ No Content-Type
                }
            }
        }

        try {
            const res = await fetch(url, {
                method,
                headers,
                // headers: {
                //     'Authorization': `Bearer ${token_auth}`, // ⚠️ No Content-Type
                // },
                ...(sendData !== null && { body: sendData }), // ✅ Only include body if not null
            });
            // Reset formData for this submission
            formDataRef.current = new FormData();
            const json = await res.json();
            console.log("|||||||||||||||||||||||||| : ", res, json, step)
            setLoading(false)
            if (json.status == 200 || json.status == 201) {
                // nexter()
            } else if (step == 1 && json.status == 403) {
                addToast({
                    title: 'کد ملی وارد شده اشتباه می باشد.',
                    type: 'error',
                    duration: 4000
                })
            } else {
                addToast({
                    title: 'خطا در اتصال به سرور لطفا دوباره تلاش کنید.',
                    type: 'error',
                    duration: 4000
                })
            }
            // console.log("Response:", json);
            if (step === 1 && json.data?.form?.id) {
                setCreatedFormId(json.data.form.id);
            }
        } catch (e) {
            if (step == 2 || step == 3) {
                nexter()
            }
            console.error("Submission error:", e);
        }
    };


    const selfCancerSender = async (nameOrRel, age, rawCancer, isALive, img) => {
        // console.log("fuck you front workers~");
        // console.log("Age:", age);
        // console.log("Cancer:", rawCancer);
        // console.log("File:", img);

        let token = localStorage.getItem("token");
        let cancerVal = 0;

        try {
            const res = await fetchDataGET(`enum/cancer-types`, token);
            const match = res.data.find(r => r.name === rawCancer);
            if (match) {
                cancerVal = match.id;
            }
        } catch (err) {
            console.warn(`Enum resolve failed: cancer-types`, err);
        }

        // Prepare payload
        const payload = {
            cancerType: cancerVal,
            cancerAge: age,
        };

        // Handle multiple images by adding them directly to the payload
        if (Array.isArray(img)) {
            // Add all image files to the payload under the same field name
            const validFiles = img.filter(file => file instanceof File);
            if (validFiles.length > 0) {
                payload.pictures = validFiles; // This will be handled by the updated fetchDataPOSTImg
            }
        } else if (img instanceof File) {
            // Single file case
            payload.pictures = img;
        } else if (img) {
            // Handle case where img is not a File object (e.g., URL)
            payload.pictures = img;
        }

        try {
            let new_item_id;
            const isCancerAdded = await fetchDataPOSTImg(
                `form/${createdFormId}/cancer`,
                token,
                payload
            );

            if (isCancerAdded.status === 200) {
                addToast({
                    title: Array.isArray(img) && img.length > 1
                        ? `${img.length} تصویر سرطان با موفقیت ذخیره شد.`
                        : 'سرطان شما با موفقیت ذخیره شد.',
                    type: 'success',
                    duration: 4000,
                });
                isCancerAdded.data.cancer
            }
        } catch (error) {
            console.error("Image upload failed:", error);
        }
    };

    const familycancerSender = async (nameOrRel, age, rawCancer, isALive, img) => {
        // console.log("fuck you front workers~");
        // console.log("Age:", age);
        // console.log("Cancer:", rawCancer);
        // console.log("File:", img);
        // console.log("nameOrRel:", nameOrRel);
        // console.log("alive ? :", isALive);


        let token = localStorage.getItem("token");
        let cancerVal = 0;
        let firstVal;

        try {
            const res = await fetchDataGET(`enum/cancer-types`, token);
            const match = res.data.find(r => r.name === rawCancer);
            if (match) {
                cancerVal = match.id;
            }
        } catch (err) {
            console.warn(`Enum resolve failed: cancer-types`, err);
        }

        try {
            const res = await fetchDataGET(`enum/relatives`, token);
            const match = res.data.find(r => r.name === nameOrRel);
            if (match) {
                firstVal = match.id;
            } else {
                firstVal = 1
            }
        } catch (err) {
            console.warn(`Enum resolve failed: cancer-types`, err);
        }

        // Prepare payload
        const payload = {
            cancerType: cancerVal,
            cancerAge: age,
            relative: firstVal,
            lifeStatus: isALive,
        };

        // Handle multiple images by adding them directly to the payload
        if (Array.isArray(img)) {
            // Add all image files to the payload under the same field name
            const validFiles = img.filter(file => file instanceof File);
            if (validFiles.length > 0) {
                payload.pictures = validFiles; // This will be handled by the updated fetchDataPOSTImg
            }
        } else if (img instanceof File) {
            // Single file case
            payload.pictures = img;
        } else if (img) {
            // Handle case where img is not a File object (e.g., URL)
            payload.pictures = img;
        }

        try {
            const isCancerAdded = await fetchDataPOSTImg(
                `form/${createdFormId}/familycancer`,
                token,
                payload
            );

            if (isCancerAdded.status === 200) {
                addToast({
                    title: Array.isArray(img) && img.length > 1
                        ? `${img.length} تصویر سرطان خانوادگی با موفقیت ذخیره شد.`
                        : 'سرطان شما با موفقیت ذخیره شد.',
                    type: 'success',
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error("Image upload failed:", error);
        }
    }







    // const atba_checker = (val) => {
    //     setatba(val)
    // }
    // Function to validate catch question answers
    const validateCatchQuestion = (stepNum) => {
        if (!catchQuestions[stepNum]) return true; // No catch question for this step

        const catchQ = catchQuestions[stepNum];
        const userAnswer = catchAnswers[`catch_${catchQ.useName}`];

        if (catchQ.useName === "catchSum") {
            // Special handling for catchSum - compare with calculated sum
            const correctAnswer = catchAnswers[`catchSum_${stepNum}`];
            return userAnswer !== undefined && parseInt(userAnswer) === correctAnswer;
        } else {
            // For other questions, compare with the stored answer
            const correctAnswer = catchQ.ans;
            return userAnswer !== undefined && userAnswer === correctAnswer;
        }
    };

    const nexter = () => {
        // Update attentionCorrect for step 3 based on catch question answer
        // if (step === 3 && catchQuestions[3]) {
        //     const isCorrect = validateCatchQuestion(3);
        //     setStep3AttentionCorrect(isCorrect ? 1 : 0);
        // }
        console.log("///////////////////// ", step)
        if (step != 5) {
            setStep(s => s + 1)
        }
    }
    const prever = () => {
        if (step != 1) {
            setStep(s => s - 1)
        }
    }
    const smokeTypeQuestion = (ST) => {
        // console.log("maraz nadaram ke bebin: " , ST)
        let the_chooseVal
        if (ST == "سیگار") {
            the_chooseVal = part7.text_cigarettesPerDay_current
        } else if (ST == "سیگار برگ") {
            the_chooseVal = part7.text_cigarPerDay_current
        } else if (ST == "پیپ") {
            the_chooseVal = part7.text_pipePerDay_current
        } else if (ST == "قلیان") {
            the_chooseVal = part7.text_hookahPerWeek_current
        } else if (ST == "چپق") {
            the_chooseVal = part7.text_chapoghPerDay_current
        } else if (ST == "سیگار الکترونیک و محصولات مشابه") {
            the_chooseVal = part7.text_eCigPerDay_current
        } else if (ST == "تریاک") {
            the_chooseVal = part7.text_smokedOpiumPerDay_current
        } else {
            the_chooseVal = null
        }
        return the_chooseVal
    }

    const smokeTypePastQuestion = (ST) => {
        // console.log("maraz nadaram ke bebin: " , ST)
        let the_chooseVal
        if (ST == "سیگار") {
            the_chooseVal = part7.text_cigarettesPerDay_past
        } else if (ST == "سیگار برگ") {
            the_chooseVal = part7.text_cigarPerDay_past
        } else if (ST == "پیپ") {
            the_chooseVal = part7.text_pipePerDay_past
        } else if (ST == "قلیان") {
            the_chooseVal = part7.text_hookahPerWeek_past
        } else if (ST == "چپق") {
            the_chooseVal = part7.text_chapoghPerDay_past
        } else if (ST == "سیگار الکترونیک و محصولات مشابه") {
            the_chooseVal = part7.text_eCigPerDay_past
        } else if (ST == "تریاک") {
            the_chooseVal = part7.text_smokedOpiumPerDay_past
        } else {
            the_chooseVal = null
        }
        return the_chooseVal
    }
    const smokesNow = smokeTypeQuestion(smokeType)
    // console.log(smokesNow)
    const smokesPast = smokeTypePastQuestion(smokeTypePast)

    // if (loading) {
    //     return <Loader></Loader>;
    // }

    return (
        <>
            <div className="question_container">
                {/* <div className="desktop_helper">
                    <h2 className="question_title">سامانه ریسک سنجی آنلاین</h2>
                    <div className="progress_text">بخش {step}/5</div>
                    <div className="progress_bar_container">
                        <div
                            className="progress_bar_fill"
                            style={{ width: `${(step / 5) * 100}%` }}
                        ></div>
                    </div>
                </div> */}

                <div
                    className="help_bar_container"
                    style={{ "--progress": `${(step / 7) * 100}%` }}
                >
                    <div className="help_bar_parts_container">
                        <div className="help_bar_part1" onClick={prever}>
                            <img src={prevSign} alt="arrow_img" />
                            <span>قبلی</span>
                        </div>
                        <div className="help_bar_part2">فرم ریسک سنجی</div>
                        <div className="help_bar_part3" onClick={() => setOpenModalConf(true)}>
                            <img src={homeSign} alt="home" />
                        </div>
                    </div>
                </div>
                <div className="question_form_container" ref={questionContainerRef}>
                    {/* form part 1*/}

                    <form ref={formRefs[1]} style={step == 1 ? null : { display: "none " }} className="question_form P1">
                        <div className="form_title">اطلاعات شخصی</div>
                        <RadioV2 data_req={"true"} data={part1[0]} Enum={"genders"} valueSetter={setGender}></RadioV2>
                        <OptionsV2 data_req={"true"} data={part1[1]} relation={true}></OptionsV2>
                        <OptionsV2 data_req={"true"} data={part1[2]} relation={true}></OptionsV2>
                        <OptionsV2 data_req={"true"} data={part1[3]} relation={true}></OptionsV2>
                        <CheckBox data={part1[4]} atba={atba} checker={setatba}></CheckBox>
                        {atba && <InputBoxV2 data_req={"true"} data={part1[5]} limit={10}></InputBoxV2>}
                        {!atba && <InputBoxV2 data_req={"true"} data={part1[6]} limit={10}></InputBoxV2>}
                        <InputBoxV2 data_req={"true"} data={part1[7]}></InputBoxV2>
                        <InputBoxV2 data_req={"true"} data={part1[8]}></InputBoxV2>
                    </form>
                    {/* form part 4 */}

                    <form ref={formRefs[2]} style={step == 2 ? null : { display: "none " }} className="question_form P2">
                        <div className="form_title">{part4.title}</div>

                        <RadioV2 data_req={"true"} class_change1={"P2"} class_change2={"P2_inner"} mapper={RadioMap} data={part4.radio_opts_cancer} valueSetter={setIsCancer}></RadioV2>
                        <CancerField data_req={selfCancersPreData != null ? "false" : "true"} data_Inp1={null} data_Options={part4.cancerCard.cancerType} data_Radio={null} data_Inp2={part4.cancerCard.cancerAge} relation={relator_R(isCancer)} Enum={"cancer-types"} canArrFunc={null} canArr={null} senderFunc={selfCancerSender} preData={selfCancersPreData}></CancerField>
                    </form>
                    {/* form part 5 */}

                    <form ref={formRefs[3]} style={step == 3 ? null : { display: "none " }} className="question_form P2">
                        <div className="form_title">{part5.title}</div>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_childCancer} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsChildCncer} relation={relator_R(isChild)}></RadioV2>
                        <CancerField data_req={"true"} data_Inp1={part5.childCard.childName} data_Inp2={part5.childCard.childCancerAge} data_Options={part5.childCard.childCancerType} data_Radio={part5.childCard.childLifeStatus} relation={relator_R(isChildCancer)} Enum={"cancer-types"} senderFunc={familycancerSender} preData={familyCancersPreData} famrel={"فرزند"}></CancerField>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_motherCancer} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsMotherCncer}></RadioV2>
                        <CancerField data_req={"true"} data_Inp1={part5.motherCard.motherName} data_Inp2={part5.motherCard.motherCancerAge} data_Options={part5.motherCard.motherCancerType} data_Radio={part5.motherCard.motherLifeStatus} relation={relator_R(isMotherCancer)} Enum={"cancer-types"} senderFunc={familycancerSender} preData={familyCancersPreData} famrel={"مادر"}></CancerField>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_fatherCancer} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsFatherCncer}></RadioV2>
                        <CancerField data_req={"true"} data_Inp1={part5.fatherCard.fatherName} data_Inp2={part5.fatherCard.fatherCancerAge} data_Options={part5.fatherCard.fatherCancerType} data_Radio={part5.fatherCard.fatherLifeStatus} relation={relator_R(isFatherCancer)} Enum={"cancer-types"} senderFunc={familycancerSender} preData={familyCancersPreData} famrel={"پدر"}></CancerField>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_bsCancer} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsSibsCncer}></RadioV2>
                        <CancerField data_req={"true"} data_Inp1={part5.siblingCard.siblingType} data_Inp2={part5.siblingCard.siblingCancerAge} data_Options={part5.siblingCard.siblingCancerType} data_Radio={part5.siblingCard.siblingLifeStatus} relation={relator_R(isSibsCancer)} Enum={"cancer-types"} senderFunc={familycancerSender} preData={familyCancersPreData} famrel={["برادر", "خواهر"]}></CancerField>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_ameAmoCancer} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsUncAuntCncer}></RadioV2>
                        <CancerField data_req={"true"} data_Inp1={part5.uncleAuntCard.uncleAuntType} data_Inp2={part5.uncleAuntCard.uncleAuntCancerAge} data_Options={part5.uncleAuntCard.uncleAuntCancerType} data_Radio={part5.uncleAuntCard.uncleAuntLifeStatus} relation={relator_R(isUncAuntCancer)} Enum={"cancer-types"} senderFunc={familycancerSender} preData={familyCancersPreData} famrel={["عمه", "عمو"]}></CancerField>

                        <RadioV2 data_req={"true"} data={part5.radio_opts_khaleDaeiCancer} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsUncAunt2Cncer}></RadioV2>
                        <CancerField data_req={"true"} data_Inp1={part5.khaleDaeiCard.khaleDaeiType} data_Inp2={part5.khaleDaeiCard.khaleDaeiCancerAge} data_Options={part5.khaleDaeiCard.khaleDaeiCancerType} data_Radio={part5.khaleDaeiCard.khaleDaeiLifeStatus} relation={relator_R(isUncAunt2Cancer)} Enum={"cancer-types"} senderFunc={familycancerSender} preData={familyCancersPreData} famrel={["خاله", "دایی"]}></CancerField>
                    </form>
                    {/* form part 7 */}
                    <form ref={formRefs[4]} id="form7" style={step == 4 ? null : { display: "none" }} action="" className="question_form P2">
                        <div className="form_title">{part6.title}</div>
                        <OptionsV2 data_req={"true"} data={part7.combine_option_insurance} class_change1={"P2"} class_change2={"P2_inner"}></OptionsV2>
                        <RadioV2 data_req={"true"} data={part7.radio_takmili_bime} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2>
                        <RadioV2 data_req={"true"} data={part7.radio_chronicLungDisease} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsChronic}></RadioV2>
                        <OptionsV2 data_req={"true"} data={part7.combine_option_chronicLungDisease} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isChronic)}></OptionsV2>

                        {/* Inject catch question randomly in step 6 if applicable */}
                        {/* {step === 6 && catchQuestions[6] && (
                            catchQuestions[6].input_type === "radio_input" ?
                            <RadioV2 data_req={"true"} data={catchQuestions[6]} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2> :
                            <InputBoxV2 data_req={"true"} data={catchQuestions[6]} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={(val) => {
                                setCatchAnswers(prev => ({
                                    ...prev,
                                    [`catch_${catchQuestions[6].useName}`]: val
                                }));
                            }}></InputBoxV2>
                        )} */}

                        <RadioV2 data_req={"true"} data={part7.radio_lungCancerHistory} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2>
                        <RadioV2 data_req={"true"} data={part7.radio_lungCancerFamily} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setFirstDeg}></RadioV2>
                        <OptionsV2 data_req={"true"} data={part7.combine_option_lungCancerFamilyRelation} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(firstDeg)}></OptionsV2>
                        <OptionsV2 data_req={"true"} data={part7.combine_option_occupationalExposure} class_change1={"P2"} class_change2={"P2_inner"}></OptionsV2>
                        <RadioV2 data={part7.radio_currentSmoking} class_change1={"P2"} mapper={RadioMap} class_change2={"P2_inner"} valueSetter={setAnySmoke} ></RadioV2>
                        {/* <OptionsV2 data_req={"true"} data={part7.combine_option_smokingTypes_current} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setSmokeType} relation={relator_R(anySmoke)}></OptionsV2> */}
                        <CheckBox data={part7.check_smokeTypeCurrent} class_change1={"P2"} class_change2={"P2_inner"} checker={setMultiSmokeTypeCurrent} multicheck={true} checkArray={multiSmokeTypeCurrent} relation={relator_R(anySmoke)}></CheckBox>
                        <InputBoxV2 data_req={"false"} data={part7.text_cigarettesPerDay_current} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypeCurrent, 'Csig')}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_cigarPerDay_current} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypeCurrent, "CsigBarg")}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_eCigPerDay_current} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypeCurrent, 'CelecSig')}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_pipePerDay_current} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypeCurrent, 'Cpip')}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_chapoghPerDay_current} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypeCurrent, 'Cchop')}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_smokedOpiumPerDay_current} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypeCurrent, 'Cteryak')}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_hookahPerWeek_current} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypeCurrent, 'Cghel')}></InputBoxV2>

                        {/* {smokeType != null && smokeType != "انتخاب کنید" && (
                            <InputBoxV2 data={part7.text_using_now} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(anySmoke)}></InputBoxV2>
                        )}
                        {smokeType != null && smokeType == "تریاک" && (
                            <InputBoxV2 data={part7.text_chewedOpiumPerDay_past} class_change1={"P2"} class_change2={"P2_inner"}></InputBoxV2>
                        )} */}
                        <RadioV2 data={part7.radio_heartDisease} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} des={true}></RadioV2>
                        <RadioV2 data={part7.radio_diabetes} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} des={true}></RadioV2>
                        <RadioV2 data={part7.radio_hypertension} mapper={RadioMap} class_change1={"P2"} class_change2={"P2_inner"} des={true}></RadioV2>


                        <OptionsV2 data={part7.combine_option_secondhandSmokeLocation} class_change1={"P2"} class_change2={"P2_inner"}></OptionsV2>
                        <RadioV2 data_req={"true"} mapper={RadioMap} data={part7.radio_pastSmoking} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setAnySmokePast}></RadioV2>
                        {/* <InputBoxV2 data_req={"false"} data={part7.text_smokingStartAge_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(anySmokePast)}></InputBoxV2> */}
                        {/* <InputBoxV2 data_req={"false"} data={part7.text_leaveSmoke} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(anySmokePast)}></InputBoxV2> */}
                        {/* <OptionsV2 data={part7.combine_option_smokingTypes_past} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setSmokeTypePast} relation={relator_R(anySmokePast)}></OptionsV2> */}
                        {/* {smokeTypePast != null && smokeTypePast != "انتخاب کنید" && ( */}
                        {/* <InputBoxV2 data_req={"false"} data={part7.text_using_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(anySmokePast)}></InputBoxV2> */}
                        {/* )} */}
                        {/* {smokeType != null && smokeTypePast == "تریاک" && ( */}
                        {/* <InputBoxV2 data_req={"true"} data={part7.text_chewedOpiumPerDay_past} class_change1={"P2"} class_change2={"P2_inner"}></InputBoxV2> */}
                        {/* )} */}
                        <CheckBox data={part7.check_smokeTypePast} class_change1={"P2"} class_change2={"P2_inner"} checker={setMultiSmokeTypePast} multicheck={true} checkArray={multiSmokeTypePast} relation={relator_R(anySmokePast)}></CheckBox>

                        <InputBoxV2 data_req={"false"} data={part7.text_cigarettesPerDay_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypePast, 'Psig')}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_cigarPerDay_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypePast, "PsigBarg")}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_eCigPerDay_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypePast, 'PelecSig')}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_pipePerDay_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypePast, 'Ppip')}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_chapoghPerDay_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypePast, 'Pchop')}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_smokedOpiumPerDay_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypePast, 'Pteryak')}></InputBoxV2>
                        <InputBoxV2 data_req={"false"} data={part7.text_hookahPerWeek_past} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_multiCheck(multiSmokeTypePast, 'Pghel')}></InputBoxV2>



                    </form>
                    <form ref={formRefs[5]} id="form7" style={step == 5 ? null : { display: "none" }} action="" className="question_form P2">
                        <div className="form_title">{part7.title}</div>

                        {/* <RadioV2 data_req={"true"} data={part6.radio_opts_testGen} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsGeneTest}></RadioV2> */}
                        {/* <FileUploader data={part6.attachment_testGen} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isGeneTest)} fillingFormData={fillingFormData} removeLastFileFromFormData={removeLastFileFromFormData}></FileUploader> */}

                        {/* <RadioV2 data_req={"true"} data={part6.radio_opts_fmTestGen} class_change1={"P2"} class_change2={"P2_inner"} valueSetter={setIsFamGeneTest}></RadioV2> */}
                        {/* <FileUploader data={part6.attachment_fmTestGen} class_change1={"P2"} class_change2={"P2_inner"} relation={relator_R(isFamGeneTest)} fillingFormData={fillingFormData} removeLastFileFromFormData={removeLastFileFromFormData}></FileUploader> */}

                        <OptionsV2 data_req={"true"} data={part6.options_education} class_change1={"P2"} class_change2={"P2_inner"}></OptionsV2>

                        {/* <RadioV2 data_req={"true"} data={part6.radio_opts_callExpert} class_change1={"P2"} class_change2={"P2_inner"}></RadioV2> */}
                        <PersonalInfo data_req={"true"} data_inp1={part6.personalInfo.fullName} data_inp2={part6.personalInfo.mobileNumber1} data_inp3={part6.personalInfo.mobileNumber2} data_inp4={part6.personalInfo.province}
                            data_inp5={part6.personalInfo.city} data_inp6={part6.personalInfo.postalCode} data_opt={part6.personalInfo.birthCountry} data_inp7={part6.personalInfo.address}
                            data_check={part6.personalInfo.confidentialityAgreement} typeErr={setTypeErr} typeErr2={setTypeErr2} typeErr3={setTypeErr3}
                        ></PersonalInfo>
                    </form>
                </div>
                <div className="btn_holder_next_prev" style={{ display: "none" }}>
                    <button className="btn_question" onClick={prever}>قبلی</button>

                    {step == 5 ? (
                        <button className="btn_question" onClick={(e) => {

                            let passOno = checkReq(formRefs[step], step)
                            if (!typeErr && !typeErr2 && !typeErr3 && passOno) {
                                handleSubmit(e)
                                addToast({
                                    title: 'پاسخ های شما با موفقیت ذخیره شد',
                                    type: 'success',
                                    duration: 4000
                                })
                                navigate("/formsNavid")
                            } else {
                                console.log(passOno, typeErr, typeErr2, typeErr3)

                                addToast({
                                    title: 'لطفا فیلد ها را به درستی پر کنید',
                                    type: 'error',
                                    duration: 4000
                                })
                            }


                        }}>ارسال</button>
                    ) : (
                        <button className="btn_question" onClick={(e) => {
                            // Update attentionCorrect for step 3 before submission if there's a catch question
                            // if (step === 3 && catchQuestions[3]) {
                            //     const isCorrect = validateCatchQuestion(3);
                            //     setStep3AttentionCorrect(isCorrect ? 1 : 0);
                            // }
                            checkReq(formRefs[step], step)
                            handleSubmit(e)
                        }}>بعدی</button>
                    )}
                </div>
                {/* <button className="support_call ">تماس با پشتیبانی</button>
                <button className="questionExit" onClick={() => setOpenModalConf(true)}>
                    خروج
                </button> */}

                <div className="bottom_helper_container">
                    <div className="bottom_helper_parts_container">
                        {/* <div className="bottom_helper_part1"></div> */}
                        <div className="bottom_helper_part2">                    {step == 7 ? (
                            <button className="btn_question" onClick={(e) => {

                                checkReq(formRefs[step], step)
                                if (!typeErr && !typeErr2 && !typeErr3) {
                                    handleSubmit(e)
                                    addToast({
                                        title: 'پاسخ های شما با موفقیت ذخیره شد',
                                        type: 'success',
                                        duration: 4000
                                    })
                                    navigate("/forms")
                                } else {
                                    addToast({
                                        title: 'لطفا فیلد ها را به درستی پر کنید',
                                        type: 'error',
                                        duration: 4000
                                    })
                                }


                            }}>ارسال</button>
                        ) : (
                            <button className="btn_question" onClick={(e) => {
                                // Update attentionCorrect for step 3 before submission if there's a catch question
                                if (step === 3 && catchQuestions[3]) {
                                    const isCorrect = validateCatchQuestion(3);
                                    setStep3AttentionCorrect(isCorrect ? 1 : 0);
                                }
                                checkReq(formRefs[step], step)
                                // console.log("the check what : ", reqpass)
                                // if (reqpass) {
                                handleSubmit(e)
                                // }
                            }}>بعدی</button>
                        )}</div>
                    </div>
                </div>
            </div >



            {openModalConf && (
                <div className="role_modal">
                    <div className="modal_header">
                        <div className="modalTxt">
                            <h3>آیا می خواهید از فرم خارج شوید ؟ </h3>
                            <p>پاسخ های شما پس از خروج ذخیره خواهد شد</p>
                        </div>
                        <div className="modal_close" onClick={() => {
                            setOpenModalConf(false)
                        }}>
                            <span>
                                ✕
                            </span>
                        </div>
                    </div>
                    <div className="roles Modal">
                        <button className="btn-add-new" onClick={() => {
                            navigate("/formsNavid")
                            setOpenModalConf(false)
                        }}>بلی</button>
                        <button className="delete_btn2" onClick={() => setOpenModalConf(false)}>خیر</button>
                    </div>
                </div>
            )}
        </>
    )
}
export default QuestionsNavid