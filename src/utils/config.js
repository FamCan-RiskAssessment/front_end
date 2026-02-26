// export const APIURL = "194.62.43.192:8080"
export const APIURL = "https://api.famcan.org.ir"

// const port = "8080"
export const APIARR = ["basic", "generalhealth", "mamography", "cancerVisit", "familycancerVisit", "lungcancer", "contact"]
export const APIARR_TAB = ["basic", "generalhealth", "mamography", "cancer", "familycancer", "lungcancer", "contact"]
export const APIARR_Navid = ["basic", "cancerVisit", "familycancerVisit", "navid", "contact"]



// NEW - USE THIS
export const FormStatus = {
    Draft: 1,
    Submitted: 2,
    WaitingForPatientResponse: 3,
    WaitingForDocuments: 4,
    Rejected: 5,
    ReadyForCalculation: 6,
    Calculated: 7
}

export const formStatusLabels = {
    1: "پیش‌نویس",
    2: "ارسال شده",
    3: "در انتظار پاسخ مراجعه کننده",
    4: "در انتظار مدارک",
    5: "رد شده",
    6: "آماده محاسبه",
    7: "محاسبه شده"
}

export const statusAPIs = {
    1: "",
    2: "",
    3: "request-response",
    4: "request-documents",
    5: "reject",
    6: "accept",
    7: "calculated"
}


export const stateColors = {
    1: "#8f005a",
    2: "#c00000",
    3: "#ffc000",
    4: "#00b050",
    5: "#ccc",
    6: "#00b0f0",
    7: "#0070c0"
}

export const cancerRefs = {
    "childCancer": ["فرزند پسر", "فرزند دختر"],
    "motherCancer": ["مادر"],
    "fatherCancer": ["پدر"],
    "siblingCancer": ["خواهر ناتنی", "برادر ناتنی", "برادر", "خواهر"],
    "ameAmoCancer": ["عمه", "عمو"],
    "khaleDaeiCancer": ["دایی", "خاله"],
}

export const roleColors = {
    "مراجعه کننده": "red",
    "سوپر ادمین": "#6155F5",
    "اپراتور": "#66C2A5",
    "مدیر": "#0088FF"
}

export const sortOptions = {
    "id": "شناسه ی کاربر",
    "phone": "شماره کاربر",
    "created_at": "زمان ورود",
    "None": "برداشتن فیلتر",
}

export const listOfcategs = {
    "عمومی": false,
    "درج داده": false,
    "مدیریت مراجعه کنندگان": false,
    "مدیریت کاربران": false,
    "مدیریت دسترسی": false,
    "مدیریت فرم ها": false,
    "مدیریت اپراتور ها": false,
    "مدیریت لاگ ها": false
}
export const listDashBoardUrls = {
    "مدیریت مراجعه کنندگان": "/DashBoard/patients",
    "مدیریت کاربران": "/DashBoard/RandP",
    "مدیریت دسترسی": "/DashBoard/roleMaker",
    "مدیریت فرم ها": "/DashBoard/modelsResults",
    "مدیریت اپراتور ها": "/DashBoard/supervisorForms",
    "مدیریت لاگ ها": "/DashBoard/systemLog"
}