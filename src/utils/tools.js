import { APIURL } from "./config";

export const permExtractor = (perms, permCheck) => {
    return perms.some(p => p.name === permCheck);
  };



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