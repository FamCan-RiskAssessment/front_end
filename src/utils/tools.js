// import { Aod } from "@mui/icons-material";
import { APIURL, formStatusLabels, sortOptions, statusAPIs } from "./config";
import jalaali from 'jalaali-js';

export const permExtractor = (perms, permCheck) => {
  return perms.some(p => p.name === permCheck);
};

export const persianMonths = {
  فروردین: 1,
  اردیبهشت: 2,
  خرداد: 3,
  تیر: 4,
  مرداد: 5,
  شهریور: 6,
  مهر: 7,
  آبان: 8,
  آذر: 9,
  دی: 10,
  بهمن: 11,
  اسفند: 12
};



export const formatAndValidateJalali = (year, month, day) => {
  console.log(year, month, day)
  // Validate by attempting conversion to Gregorian
  const monthNumber = persianMonths[month];
  try {
    // const greg = jalaali.toGregorian(year, monthNumber, day);
    // // Then convert back to ensure it's valid
    // const back = jalaali.toJalaali(greg.gy, greg.gm, greg.gd);
    // if (back.jy === year && back.jm === month && back.jd === day) {
    //   return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // }
    const formatted = `${year}-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return formatted
  } catch (e) {
    throw new Error('Invalid Jalali date');
  }
}


export const isNumber = (value) => {
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value !== 'string') return false;
  return value.trim() !== '' && !isNaN(value);
};


export const form_ids_finder = (form_array) => {
  let ids = {}
  form_array.forEach(fa => {
    let inner_obj = {}
    inner_obj["status"] = fa.status
    inner_obj["user_id"] = fa.user_id
    inner_obj["operatorId"] = fa.operatorId
    ids[fa.id] = inner_obj
  });
  return ids
}

export const key_stage_matcher = (selectedKey, stage) => {
  let stageKeys = Object.keys(stage)
  let found = false
  stageKeys.forEach(sk => {
    if (sk == selectedKey) {
      found = true
    }
  });
  return found
}
export const stageMatcher = (inStage, outStage) => {
  let senderDict = {}
  for (const key in Object.keys(inStage)) {
    for (const key2 in Object.keys(outStage)) {
      console.log("from the tools : ", key2)
      if (key == key2) {
        senderDict[key] = inStage[key]
      }
    }
  }
  return senderDict
}


export const fetchDataGET = async (endpoint, token_auth) => {
  const res = await fetch(`http://${APIURL}/${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token_auth}`
    },

  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");

  return data;
};

export const fetchDataGETNoError = async (endpoint, token_auth) => {
  const res = await fetch(`http://${APIURL}/${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token_auth}`
    },

  });

  const data = await res.json();
  return data;
};

export const fetchDataGETTab = async (endpoint, token_auth) => {
  const res = await fetch(`http://${APIURL}/${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token_auth}`
    },

  });

  const data = await res.json();
  if (res.ok && "formType" in data.data) {
    delete data.data.formType
  }
  // if (!res.ok) throw new Error(data.message || "Request failed");

  return data;
};
// utils/fetchItemWithImage.js
// utils/fetchCancerList.js
export const fetchDataGETImg = async (endpoint, token) => {
  const res = await fetch(`http://${APIURL}/${endpoint}`, { // adjust endpoint as needed
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch cancers: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data; // { status: 200, message: "OK", data: { cancer: true, cancers: [...] } }
};



export const fetchDataDELETE = async (endpoint, token_auth) => {
  const res = await fetch(`http://${APIURL}/${endpoint}`, {
    method: "DELETE",
    headers: {
      'Authorization': `Bearer ${token_auth}`,
    },
  });

  // Note: DELETE responses may or may not have a body.
  // We try to parse JSON, but handle cases where it might be empty.
  let data = {};
  if (res.headers.get("content-type")?.includes("application/json")) {
    data = await res.json();
  }

  if (!res.ok) {
    throw new Error(data.message || "DELETE request failed");
  }

  return data; // May be empty object if no JSON response
};



export const fetchDataPUT = async (endpoint, token_auth, bodyData) => {
  console.log(bodyData)
  const res = await fetch(`http://${APIURL}/${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token_auth}`,
    },
    body: JSON.stringify(bodyData), // Send the updated data in the request body
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "PUT request failed");
  console.log("this is th data in the tools : ", data)
  return data;
};


export const fetchDataPOST = async (endpoint, token_auth, bodyData, passErr) => {
  // console.log(bodyData);
  const res = await fetch(`http://${APIURL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token_auth}`,
    },
    body: JSON.stringify(bodyData),
  });
  const data = await res.json();
  if (!res.ok && passErr == false) throw new Error(data.message || "POST request failed");
  console.log("this is the data in the tools: ", data);
  return data;
};


export const fetchDataPOSTImg = async (endpoint, token_auth, bodyData) => {
  const formData = new FormData();

  // Append all fields - handle arrays of files by appending each item with the same field name
  for (const key in bodyData) {
    if (bodyData[key] !== null && bodyData[key] !== undefined) {
      if (Array.isArray(bodyData[key])) {
        // If the value is an array (e.g., multiple files), append each item with the same key
        bodyData[key].forEach(item => {
          if (item !== null && item !== undefined) {
            formData.append(key, item);
          }
        });
      } else {
        // If it's a single item, append normally
        formData.append(key, bodyData[key]);
      }
    }
  }

  const res = await fetch(`http://${APIURL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token_auth}`,
      // ❌ Don't set Content-Type manually — fetch sets it automatically for FormData
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "POST request failed");
  console.log("this is the data in the tools: ", data);
  return data;
};



export const CancerAdder = (data, cancersArr, deletables, assigned) => {
  deletables.forEach(d => {
    delete data[d]
  });
  data[assigned] = cancersArr
  return data
}

// Add these functions to the file
export const extractDay = (dateString) => {
  if (!dateString) return null;
  const match = dateString.match(/T(\d{2}):\d{2}:\d{2}/);
  return match ? match[1] : null;
};

export const extractMonth = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('T')[0].split('-');
  return parts.length === 3 ? parts[1] : null;
};

export const extractYear = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('T')[0].split('-');
  return parts.length === 3 ? parts[0] : null;
};

export const cancerTypeEx = async (can, rev) => {
  try {
    let token = localStorage.getItem("token");
    let res = await fetchDataGET("enum/cancer-types", token);
    if (res && res.data && res.data[can - 1]) {
      return res.data[can - 1].name;
    } else {
      return `سرطان ${can}`;
    }
  } catch (error) {
    console.error("Error fetching cancer types:", error);
    return `سرطان ${can}`;
  }
};

export const relativeTypeEx = async (rel, rev) => {
  try {
    let token = localStorage.getItem("token");
    let res = await fetchDataGET("enum/relatives", token);
    if (res && res.data && res.data[rel - 1]) {
      return res.data[rel - 1].name;
    } else {
      return `خویشاوند ${rel}`;
    }
  } catch (error) {
    console.error("Error fetching relative types:", error);
    return `خویشاوند ${rel}`;
  }
};


export const EnumTaker = async (endP, theVal) => {
  try {
    let token = localStorage.getItem("token")
    let res = await fetchDataGET(`${endP}`, token)
    if (res.data) {
      const foundItem = res.data.find(d => d.name == theVal);
      if (foundItem) {
        return foundItem.id;
      }
    }
    return null; // Return null if no matching item is found
  } catch (error) {
    console.log(`Error fetching Enum ${endP} : ${error}`)
    return null;
  }
}


export const formTypeChecker = (forms, type) => {
  let istype = false;
  forms.forEach(f => {
    if (f.formType == type) {
      istype = true
    }
  });
  return istype
}


export const nullTracker = (compVal) => {
  let arr = ["نمیدانم", "نمی دانم", "نامعین", "اطلاع ندارم", "احتمال دارد اما دقیق اطلاع ندارم"]
  arr.forEach(a => {
    if (a == compVal) {
      return true
    }
  });
  return false
}


export const statusChecker = (sta) => {
  let stakey = Object.keys(formStatusLabels).find(key => formStatusLabels[key] === sta)
  return stakey
}

export const activeStats = (form_id, forms) => {
  let sta;
  forms.forEach(f => {
    if (f.id == form_id) {
      sta = f.status
    }
  });
  let stakey = Object.keys(formStatusLabels).find(key => formStatusLabels[key] === sta)
  console.log("wwwwwwwwwwwwwwwwwwwwwww : ", stakey, sta, form_id, forms)
  let resArr = [];
  if (stakey == 2) {
    resArr.push({ name: formStatusLabels[3], api: statusAPIs[3] })
    resArr.push({ name: formStatusLabels[5], api: statusAPIs[5] })
    resArr.push({ name: formStatusLabels[6], api: statusAPIs[6] })
  } else if (stakey == 3) {
    resArr.push({ name: formStatusLabels[4], api: statusAPIs[4] })
  }
  return resArr
}

export const dict_transformer = (arrOfDic) => {
  let newdict = {}
  // console.log("ARRRRRRRRRRRRs : ", arrOfDic)
  arrOfDic.forEach(ad => {
    newdict[ad.name] = ad.id
  });
  return newdict
}

// it would take an object and give you the key that the value of that in the dictionary is equal to the value given to the function
export const getKeyVal = (obj, Val) => {
  let foundedKey = Object.keys(obj).find(key => obj[key] === Val)
  return foundedKey
}

export const cancerDictRefiner = (obj, cancerPreData) => {
  let mask_obj = {}
  console.log("whyyyyyyyyyyyyyyyyyyy : ", obj, cancerPreData)
  if (cancerPreData.length > 0) {
    Object.keys(obj).forEach(oe => {
      cancerPreData.data.familyCancers.forEach(fc => {
        console.log("whyInnerrrrrrrrrrrrrrrrr : ", fc)
        let relFa = getKeyVal(obj, fc.relative)
        if (relFa == oe) {
          mask_obj[oe] = "بله"
        } else {
          mask_obj[oe] = "خیر"
        }
      });
    });
  } else {
    Object.keys(obj).forEach(oe => {
      mask_obj[oe] = "خیر"
    });
  }

  return mask_obj
}



export const backwardEnum = (APIPARTDATA, transformer, blackList) => {
  // console.log(transformer)
  let resDict = {}
  Object.keys(APIPARTDATA).forEach(APD => {
    console.log(APD)
    if (!blackList.includes(APD) && isNumber(APIPARTDATA[APD]) && getKeyVal(transformer, APIPARTDATA[APD])) {
      resDict[APD] = getKeyVal(transformer, APIPARTDATA[APD])
    }
  });
  return resDict
}

// this function would help us through sorts and searches for making API calls
export const endpointMaker = (sort1, sort2, searchD, order, prevendPoint, page, AdvanceOnes) => {
  // let endpoint = ""
  let prefix = ""
  let processDef = true
  console.log(sort1, page, AdvanceOnes)
  console.log(sort2)
  console.log(searchD)
  console.log(order)
  console.log(prevendPoint)

  if (AdvanceOnes.length != 0 || Object.keys(AdvanceOnes).length != 0) {
    Object.keys(AdvanceOnes).forEach(a => {
      if (AdvanceOnes[a] != "") {
        processDef = false
      }
    });
  }

  if (sort1 && sort1.length != 0) {
    prefix = prevendPoint.includes("?") ? "&" : "?"
    prevendPoint += `${prefix}sortBy=${sort1}`
  }
  if (sort2 && sort2.length != 0) {
    prefix = prevendPoint.includes("?") ? "&" : "?"
    prevendPoint += `${prefix}roleId=${sort2}`
  }
  if (searchD && searchD.length != 0) {
    prefix = prevendPoint.includes("?") ? "&" : "?"
    prevendPoint += `${prefix}search=${searchD}`
  }
  if (order && order.length != 0 && order != "انتخاب کنید") {
    prefix = prevendPoint.includes("?") ? "&" : "?"
    prevendPoint += `${prefix}sortOrder=${order}`
  }
  if (order.length == 0 && searchD.length == 0 && sort2.length == 0 && sort1.length == 0 && processDef) {
    prevendPoint += `?page=${page}&pageSize=10`
  }
  return prevendPoint
}


// export const nameEnumMap = async (elem, token) => {
//   const enumName = elem.current.getAttribute('data-enum');
//   if (enumName) {
//     try {
//       const res = await fetchDataGET(`enum/${enumName}`, token);
//       const match = res.data.find(r => r.name === elem.current.value);
//       if (match) {
//         return match.id;
//       }
//     } catch (err) {
//       console.warn(`Enum resolve failed: ${enumName}`, err);
//     }
//   }
// };