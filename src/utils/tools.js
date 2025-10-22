import { APIURL } from "./config";

export const permExtractor = (perms, permCheck) => {
    return perms.some(p => p.name === permCheck);
  };

export const isNumber = (str) => str.trim() !== "" && !isNaN(str);


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

export const key_stage_matcher = (selectedKey , stage) => {
  let stageKeys = Object.keys(stage)
  let found = false
  stageKeys.forEach(sk => {
    if(sk == selectedKey){
        found = true
    }
  });
  return found
}
export const stageMatcher = (inStage , outStage) => {
  let senderDict = {}
  for(const key in Object.keys(inStage)){
    for(const key2 in Object.keys(outStage)){
      console.log("from the tools : " , key2)
      if(key == key2){
        senderDict[key] = inStage[key]
      }
    }
  }
  return senderDict
} 


export const fetchDataGET = async (endpoint , token_auth) => {
    const res = await fetch(`http://${APIURL}/${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json",
                 'Authorization': `Bearer ${token_auth}`},

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
    console.log("this is th data in the tools : " , data)
    return data;
  };



// const showMore = async (setPage) => {
//     setPage(p => p + 1)
//     let token = localStorage.getItem("token")
//     let data = await fetchDataGET(`admin/form?page=${page}&pageSize=20` , token)
//     let form_ids = form_ids_finder(data.data.data)
//     setFormInfos(form_ids) 
//   }