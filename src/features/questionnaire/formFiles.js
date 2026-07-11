/**
 * Shared file-upload plumbing for the questionnaire pages. Both the Bahar
 * and Navid questionnaires keep uploads in a FormData ref plus a per-field
 * tracking map; these handlers were byte-identical in the two forks.
 */
export function makeFormFileHandlers(formDataRef, fileArraysRef) {
    const fillingFormData = (fieldName, file) => {
        formDataRef.current.append(fieldName, file);

        // Also track in our separate file arrays structure
        if (!fileArraysRef.current[fieldName]) {
            fileArraysRef.current[fieldName] = [];
        }
        fileArraysRef.current[fieldName].push(file);
    };

    // Allow FileUploader components to remove the last file from the shared formData
    const removeLastFileFromFormData = (fieldName) => {
        const fieldFiles = fileArraysRef.current[fieldName] || [];

        if (fieldFiles.length > 0) {
            // Remove the last file from our tracking array
            fieldFiles.pop();

            // Rebuild the formData by getting all values for each field
            const newFormData = new FormData();
            const fieldsMap = new Map(); // To collect values by field name

            // Collect all values by field name
            for (let [key, value] of formDataRef.current.entries()) {
                if (!fieldsMap.has(key)) {
                    fieldsMap.set(key, []);
                }
                fieldsMap.get(key).push(value);
            }

            // Rebuild the formData, removing the last value for the specified field
            for (let [fieldNameKey, valuesArray] of fieldsMap) {
                if (fieldNameKey === fieldName && valuesArray.length > 0) {
                    // For the target field, add all values except the last one
                    for (let i = 0; i < valuesArray.length - 1; i++) {
                        newFormData.append(fieldNameKey, valuesArray[i]);
                    }
                } else {
                    // For other fields, add all values
                    for (let value of valuesArray) {
                        newFormData.append(fieldNameKey, value);
                    }
                }
            }

            // Update the ref
            formDataRef.current = newFormData;
        }
    };

    return { fillingFormData, removeLastFileFromFormData };
}
