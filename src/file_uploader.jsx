import { useState, useEffect, useRef } from "react";

function FileUploader({ data, class_change1, class_change2, handleFileChange, relation, fillingFormData, removeLastFileFromFormData }) {
    const [imagePreview, setImagePreview] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]); // Store the actual file objects
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
                newFiles.push(file); // Store the actual File object

                // Add file directly to formData using the passed function
                if (fillingFormData) {
                    fillingFormData(data.name, file);
                }
            }

            setImagePreview(prev => [...prev, ...newPreviews]);
            setSelectedFiles(prev => [...prev, ...newFiles]); // Add to existing files

            // Call the original handleFileChange function if provided
            if (handleFileChange) {
                handleFileChange(e);
            }
        }
    };

    const handleDeleteLastImage = () => {
        if (imagePreview.length > 0) {
            // Get the last preview URL and revoke it to free memory
            const lastPreviewUrl = imagePreview[imagePreview.length - 1];
            URL.revokeObjectURL(lastPreviewUrl);

            // Remove the last file from formData if remove function is available
            if (removeLastFileFromFormData && selectedFiles.length > 0) {
                removeLastFileFromFormData(data.name);
            }

            // Remove the last preview and file
            setImagePreview(prev => prev.slice(0, -1));
            setSelectedFiles(prev => prev.slice(0, -1));
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
                        onChange={(e) => {
                            handleFileChangeWithPreview(e)
                            console.log(e)
                        }}
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
                    {imagePreview.length > 0 && (
                        <button
                            type="button"
                            className="btn_question"
                            onClick={handleDeleteLastImage}
                            style={{ marginTop: "10px", alignSelf: "flex-start" }}
                        >
                            حذف
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}
export default FileUploader