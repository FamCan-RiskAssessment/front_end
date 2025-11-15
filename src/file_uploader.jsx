import { useState } from "react";

function FileUploader({ data, class_change1, class_change2, handleFileChange, relation }) {

    if (relation == undefined) {
        relation = true
    }
    // if(!relation){
    //     data_req = false
    // }
    return (
        <>
            <div className={`form_element ${class_change1} color_changer`} style={relation ? null : { display: "none" }}>
                <div className="total_file_uploader">
                    <label htmlFor="file_uploader">{data.fieldName}</label>
                    <input type="file" name={data.name} className={`file_uploader ${class_change2}`} accept="image/*" onChange={handleFileChange} />
                </div>
            </div>
        </>
    )
}
export default FileUploader