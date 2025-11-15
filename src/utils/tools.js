import { APIURL } from "./config";
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


export const fetchDataPOST = async (endpoint, token_auth, bodyData) => {
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
  if (!res.ok) throw new Error(data.message || "POST request failed");
  console.log("this is the data in the tools: ", data);
  return data;
};


export const fetchDataPOSTImg = async (endpoint, token_auth, bodyData) => {
  const formData = new FormData();

  // Append all fields
  for (const key in bodyData) {
    if (bodyData[key] !== null && bodyData[key] !== undefined) {
      formData.append(key, bodyData[key]);
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