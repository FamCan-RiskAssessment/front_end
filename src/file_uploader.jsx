import { useState, useEffect, useRef } from "react";

function FileUploader({ data, class_change1, class_change2, handleFileChange, relation }) {
    const [imagePreview, setImagePreview] = useState([]);
    const [orgI, setOrgI] = useState([])
    const fileInputRef = useRef(null);

    if (relation == undefined) {
        relation = true
    }

    useEffect(() => {
        // Check if there's a preset file URL in the input element
        if (fileInputRef.current && fileInputRef.current.getAttribute('data-file-url')) {
            const presetUrl = fileInputRef.current.getAttribute('data-file-url');
            try {
                const urlsArray = JSON.parse(presetUrl);
                if (Array.isArray(urlsArray)) {
                    setImagePreview(urlsArray);
                } else {
                    setImagePreview([urlsArray]);
                }
            } catch {
                // Handle if it's a single URL string
                setImagePreview([presetUrl]);
            }
        }
    }, []);

    const handleFileChangeWithPreview = (e) => {
        const files = e.target.files; // Get all selected files

        if (files && files.length > 0) {
            const newPreviews = [];
            const newFiles = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Create a blob URL for the image
                const blobUrl = URL.createObjectURL(file);
                newPreviews.push(blobUrl);
                newFiles.push(file);
            }

            setImagePreview(prev => [...prev, ...newPreviews]);
            setOrgI(prev => [...prev, ...newFiles]);

            // Call the original handleFileChange function if provided
            if (handleFileChange) {
                handleFileChange(e);
            }
        }
    };

    return (
        <>
            <div className={`form_element ${class_change1} color_changer`} style={relation ? null : { display: "none" }}>
                <div className="total_file_uploader">
                    <label htmlFor="file_uploader">{data.fieldName}</label>
                    <input
                        type="file"
                        name={data.name}
                        ref={fileInputRef}
                        data_toSend={JSON.stringify(orgI)}
                        className={`file_uploader ${class_change2}`}
                        accept="image/*"
                        onChange={handleFileChangeWithPreview}
                        multiple  // Add this to allow multiple file selection
                    />
                    <div className="image_holder_fileUploader">
                        {imagePreview.map((I, index) => {
                            return (
                                <div key={index} className="image-preview">
                                    <img src={I} alt={`Preview ${index}`} style={{ maxWidth: "200px", maxHeight: "200px", marginTop: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}
export default FileUploader