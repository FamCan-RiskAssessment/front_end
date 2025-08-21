import { useState } from "react";

function FileUploader({data , class_change1 , class_change2 , handleFileChange}){
    return(
        <>
            <div className={`form_element ${class_change1} color_changer`}>
                <div className="total_file_uploader">
                <label htmlFor="file_uploader">{data.fieldName}</label>
                <input type="file" className={`file_uploader ${class_change2}`} accept="image/*" onChange={handleFileChange} />
                </div>
            </div>
        </>
    )
}
export default FileUploader