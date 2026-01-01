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
