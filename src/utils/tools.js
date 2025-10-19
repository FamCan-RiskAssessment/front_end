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
  
    return data;
  };