import { useState, useEffect, useRef } from "react";

function FileUploader({ data, class_change1, class_change2, handleFileChange, relation }) {
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    if (relation == undefined) {
        relation = true
    }

    useEffect(() => {
        // Check if there's a preset file URL in the input element
        if (fileInputRef.current && fileInputRef.current.getAttribute('data-file-url')) {
            const presetUrl = fileInputRef.current.getAttribute('data-file-url');
            setImagePreview(presetUrl);
        }
    }, []);

    const handleFileChangeWithPreview = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Create a blob URL for the image
            const blobUrl = URL.createObjectURL(file);
            setImagePreview(blobUrl);

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
                        className={`file_uploader ${class_change2}`}
                        accept="image/*"
                        onChange={handleFileChangeWithPreview}
                    />

                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Preview" style={{ maxWidth: "200px", maxHeight: "200px", marginTop: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
export default FileUploader