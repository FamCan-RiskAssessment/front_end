// export const APIURL = "194.62.43.192:8080"
export const APIURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8080" : "")

// const port = "8080"
export const APIARR = ["basic", "generalhealth", "mamography", "cancerVisit", "familycancerVisit", "lungcancer", "contact"]
export const APIARR_TAB = ["basic", "generalhealth", "mamography", "cancer", "familycancer", "lungcancer", "contact"]
export const APIARR_Navid = ["basic", "cancerVisit", "familycancerVisit", "navid", "contact"]

/** Admin patient-table detail fields omitted from display (removed from the form UI). */
export const HIDDEN_DETAIL_FIELDS = new Set(["callExpert"])

/** Display order for the lung cancer section ("سوالات سرطان ریه") in admin patient table. */
export const LUNG_CANCER_FIELD_ORDER = [
    "insuranceStatus",
    "takmilBime",
    "lungDiseaseHistory",
    "lungCancerFamily",
    "lungCancerFamilyRelation",
    "bronshit",
    "fibroz",
    "lungill",
    "occupationalExposure",
    "pastSmoking",
    "leaveSmoke",
    "smokingTypesPast",
    "smokePastAvg",
]

/** Hidden in lung cancer section only (admin patient table). */
export const LUNG_CANCER_HIDDEN_FIELDS = new Set([
    "chronicLungDisease",
    "lungCancerHistory",
    "otherCancerHistory",
    "otherCancerType",
    "otherCancerFamily",
    "otherCancerFamilyType",
    "otherCancerFamilyRelation",
    "currentSmoking",
    "smokeCurrentAvg",
    "secondhandSmoke",
    "secondhandSmokeLocation",
    "smokeTypePast",
    "supplementaryInsurances",
    "smokingStartAgePast",
    "smokingStartAgeCurrent",
    "smokingTypesCurrent",
    "cigarettesPerDayCurrent",
    "cigarPerDayCurrent",
    "eCigPerDayCurrent",
    "pipePerDayCurrent",
    "chapoghPerDayCurrent",
    "smokedOpiumPerDayCurrent",
    "chewedOpiumPerDayCurrent",
    "hookahPerWeekCurrent",
    "cigarettesPerDayPast",
    "cigarPerDayPast",
    "eCigPerDayPast",
    "pipePerDayPast",
    "chapoghPerDayPast",
    "smokedOpiumPerDayPast",
    "chewedOpiumPerDayPast",
    "hookahPerWeekPast",
    "hypertension",
    "hypertensionTreatment",
    "heartDisease",
    "heartDiseaseTreatment",
    "diabetes",
    "diabetesTreatment",
    "famLungCanDesc",
    "Csig",
    "CsigBarg",
    "Cpip",
    "Cghel",
    "Cchop",
    "Cteryak",
    "CelecSig",
    "Psig",
    "PsigBarg",
    "Ppip",
    "Pghel",
    "Pchop",
    "Pteryak",
    "PelecSig",
])

/** Display order for the contact section ("سوالات اطلاعات کامل فردی") in admin patient table. */
export const CONTACT_FIELD_ORDER = [
    "testGen",
    "testGenPictures",
    "fmTestGen",
    "fatherTestGenPictures",
    "education",
    "name",
    "postalCode",
    "phone2",
    "phone3",
    "birthCountry",
    "country",
    "province",
    "city",
    "address",
    "brotherNumber",
    "sisterNumber",
    "paternalAuntNumber",
    "paternalUncleNumber",
    "maternalAuntNumber",
    "maternalUncleNumber",
]

const CONTACT_FIELD_ORDER_INDEX = new Map(
    CONTACT_FIELD_ORDER.map((key, index) => [key, index])
)

const LUNG_CANCER_FIELD_ORDER_INDEX = new Map(
    LUNG_CANCER_FIELD_ORDER.map((key, index) => [key, index])
)

export function isDetailFieldHidden(apiPart, key) {
    if (HIDDEN_DETAIL_FIELDS.has(key)) {
        return true
    }
    if (apiPart === "lungcancer" && LUNG_CANCER_HIDDEN_FIELDS.has(key)) {
        return true
    }
    return false
}

function sortByFieldOrder(entries, orderIndex) {
    return [...entries].sort(([keyA], [keyB]) => {
        const indexA = orderIndex.get(keyA)
        const indexB = orderIndex.get(keyB)
        const rankA = indexA !== undefined ? indexA : Number.MAX_SAFE_INTEGER
        const rankB = indexB !== undefined ? indexB : Number.MAX_SAFE_INTEGER

        if (rankA !== rankB) {
            return rankA - rankB
        }

        return keyA.localeCompare(keyB)
    })
}

export function sortDetailFieldEntries(apiPart, entries) {
    if (apiPart === "contact") {
        return sortByFieldOrder(entries, CONTACT_FIELD_ORDER_INDEX)
    }
    if (apiPart === "lungcancer") {
        return sortByFieldOrder(entries, LUNG_CANCER_FIELD_ORDER_INDEX)
    }
    return entries
}



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