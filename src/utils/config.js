export const APIURL = "194.62.43.192:8080"
// const port = "8080"
export const APIARR = ["basic", "generalhealth", "mamography", "cancer", "familycancer", "lungcancer", "contact"]
export const APIARR_Navid = ["basic", "cancer", "familycancer", "navid", "contact"]



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
    3: "در انتظار پاسخ بیمار",
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
    7: ""
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