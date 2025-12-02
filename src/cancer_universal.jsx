import { useState, useEffect, useCallback, useRef } from "react";
import InputBox from "./input_box";
import Options from "./option";
import Radio from "./radio";
import { isNumber, fetchDataGET, fetchDataDELETE } from "./utils/tools";

function CancerField({
    data_req,
    data_Inp1,
    data_Options,
    data_Radio,
    data_Inp2,
    relation: propRelation = true,
    Enum,
    canArrFunc,
    canArr = [],
    senderFunc,
    famrel,
    preData,
    showTab,
}) {
    // =============== STATE ===============
    const [cancerArray, setCancerArray] = useState([]);
    const [relData, setRelData] = useState("");
    const [inp1, setInp1] = useState("");
    const [inp2, setInp2] = useState("");
    const [opt, setOpt] = useState("");
    const [rad, setRad] = useState("");
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]); // Object URL for preview
    const [imageFiles, setImageFiles] = useState([]); // Raw File
    const [isFilled, setIsFilled] = useState(false)
    const [forceIsReq, setForceIsReq] = useState(true)
    console.log(inp1, inp2, opt, rad)

    // =============== REFS ===============
    const typeRef = useRef(null);
    const canUniRef = useRef(null)
    // =============== EFFECTS ===============
    if (famrel == "مادر") {
        console.log("we have found what we wanted ! :  ", famrel, preData)
    }
    // change because it is needed :
    useEffect(() => {
        if (preData != null) {
            data_req = false
        }
    }, [data_req])

    // useEffect(() => {
    //     c
    // })

    const RelationFinder = (famrel) => {
        if (famrel !== undefined && typeof famrel == "string") {
            return (
                <InputBox
                    data_req={"false"}
                    data={data_Inp1}
                    valueSetter={setInp1}
                    value={inp1}
                />
            )
        } else if (famrel !== undefined && famrel.length == 2) {
            return (
                <Options
                    data_req={"false"}
                    data={data_Inp1}
                    valueSetter={setInp1}
                    Enum={Enum}
                    value={inp1}
                    colRef={typeRef}
                />
            )
        }
    }




    // 1. Sync famrel → relData
    // useEffect(() => {
    //     if (famrel != null) setRelData(famrel);
    // }, [famrel]);

    // 2. Load preData cancers — only when preData changes
    useEffect(() => {
        if (preData?.data?.cancers) {
            // Handle self cancers
            const selfCanLoad = async () => {
                let token = localStorage.getItem("token")
                let canType = await fetchDataGET("enum/cancer-types", token)

                const loadedSelf = preData.data.cancers.map((can) => ({
                    id: can.id,
                    relation: can.relative, // adjust if you have relation in data
                    cancerType: canType.data[can.cancerType - 1].name,
                    cancerAge: can.cancerAge,
                    status: can.lifeStatus, // or infer from context
                    image: can.pictures, // full URL (string)
                }));
                setCancerArray(loadedSelf);
            }
            selfCanLoad()
        } else if (preData?.data?.familyCancers) {
            // Handle family cancers - filter by the current family relation
            // Move the async logic outside the filter
            const processFamilyCancers = async () => {
                let token = localStorage.getItem("token")
                let rel = await fetchDataGET("enum/relatives", token)
                let canType = await fetchDataGET("enum/cancer-types", token)
                // Filter family cancers based on the relation
                const filteredFamilyCancers = preData.data.familyCancers.filter((familyMember) => {
                    const relationName = rel.data[familyMember.relative - 1]?.name;
                    // console.log("ooooooooooooooooooooooooooo : ", relationName === famrel, famrel, relationName)
                    if (typeof famrel == "string") {
                        return relationName === famrel;
                    } else if (famrel.length == 2) {
                        return famrel.includes(relationName)
                    }
                });

                console.log("I am in here , : ", filteredFamilyCancers, preData, famrel)
                return { filteredFamilyCancers, relData: rel.data, Can: canType.data };
            };

            // Execute the async function and update state accordingly
            const processAndSetData = async () => {
                try {
                    const { filteredFamilyCancers, relData, Can } = await processFamilyCancers();
                    if (filteredFamilyCancers.length > 0) {
                        // Map each family member's cancers into the format expected by the UI
                        const familyCancerRows = [];

                        filteredFamilyCancers.forEach((familyMember) => {
                            familyMember.cancers.forEach((cancer) => {
                                familyCancerRows.push({
                                    id: cancer.id,
                                    relation: relData[familyMember.relative - 1].name,
                                    cancerType: Can[cancer.cancerType - 1].name,
                                    cancerAge: cancer.cancerAge,
                                    status: familyMember.lifeStatus, // lifeStatus is at the family member level
                                    image: cancer.pictures, // picture is at the family level
                                });
                            });
                        });

                        setCancerArray(familyCancerRows);
                        setIsFilled(true)
                    } else {
                        // If no matching family relation is found, set empty array
                        setCancerArray([]);
                        setIsFilled(false)
                    }
                } catch (error) {
                    console.error("Error processing family cancers:", error);
                    setCancerArray([]); // Set empty array in case of error
                    setIsFilled(false)
                }
            };

            processAndSetData();
        }
    }, [preData, famrel]); // ✅ dependency included

    // 3. Cleanup image preview URLs
    useEffect(() => {
        return () => {
            if (imagePreviewUrls && Array.isArray(imagePreviewUrls)) {
                imagePreviewUrls.forEach(ipu => {
                    URL.revokeObjectURL(ipu);
                });
            }
        };
    }, [imagePreviewUrls]);

    // =============== HANDLERS ===============

    const handleInp1Change = useCallback((val) => setInp1(val), []);
    const handleInp2Change = useCallback((val) => setInp2(val), []);
    const handleOptChange = useCallback((val) => setOpt(val), []);
    const handleRadChange = useCallback((val) => {
        setRad(val === "فوت شده" ? 0 : 1);
    }, []);

    const handleFileChange = useCallback((e) => {
        const files = e.target.files; // Get all selected files
        if (!files || files.length === 0) return;

        // Process all selected files
        const newPreviewUrls = [];
        const newFiles = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const url = URL.createObjectURL(file);
            newPreviewUrls.push(url);
            newFiles.push(file);
        }

        // Update state with all new files and preview URLs
        setImagePreviewUrls(prev => [...(prev || []), ...newPreviewUrls]);
        setImageFiles(prev => [...(prev || []), ...newFiles]);
    }, []);

    const handleAddRow = useCallback(async () => {
        // Validate required fields (skip if field is null)
        console.log("what is the inp1 : ", inp1)
        const hasInp1 = !data_Inp1 || inp1.trim() !== "";
        const hasInp2 = !data_Inp2 || inp2.trim() !== "";
        const hasOpt = !data_Options || opt !== "";
        const hasRad = !data_Radio || rad !== "";

        if (!hasInp1 || !hasInp2 || !hasOpt || !hasRad) {
            alert("لطفاً فیلدهای الزامی را پر کنید.");
            return;
        }

        // Prepare new row - Create new URLs for the table display that won't be affected by form reset
        let imageDisplayUrls = [];
        if (imageFiles && imageFiles.length > 0) {
            imageFiles.forEach(IF => {
                const singleImageDisplayUrl = URL.createObjectURL(IF);
                imageDisplayUrls.push(singleImageDisplayUrl);
            });
        }

        const newRow = {
            relation: typeof famrel == "string" && famrel != "write" ? famrel : inp1,
            cancerType: opt,
            cancerAge: inp2,
            status: rad,
            image: imageDisplayUrls.length > 0 ? imageDisplayUrls : null,
            // Store the actual file to be used by senderFunc and to keep track of it
            imageFile: imageFiles && imageFiles.length > 0 ? imageFiles : null,
        };

        // Update UI table
        setCancerArray((prev) => [...prev, newRow]);

        // Call external sender
        if (senderFunc) {
            senderFunc(newRow.relation, inp2, opt, rad, imageFiles);
        }

        // Resolve enum & update canArr
        if (canArrFunc && typeRef.current) {
            const enumName = typeRef.current.getAttribute("data-enum");
            if (enumName) {
                try {
                    const token = localStorage.getItem("token");
                    const res = await fetchDataGET(`enum/${enumName}`, token);
                    const match = res.data.find((r) => r.name === typeRef.current.value);

                    if (match) {
                        const payload = {
                            cancerAge: isNumber(inp2) ? parseInt(inp2, 10) : null,
                            cancerType: match.id,
                        };
                        canArrFunc([...canArr, payload]);
                    }
                } catch (err) {
                    console.warn(`Failed to resolve enum: ${enumName}`, err);
                }
            }
        }
        // Reset form fields
        setInp1("");
        console.log("////////////////////////////////////////////////////////")
        setInp2("");
        setOpt("");
        setRad("");

        // Reset file input visually
        const fileInput = document.getElementById("file_uploader");
        if (fileInput) {
            fileInput.value = "";
        }

        // Reset all radio buttons within canUniRef
        if (canUniRef.current) {
            const radioButtons = canUniRef.current.querySelectorAll('input[type="radio"]');
            console.log(radioButtons)
            radioButtons.forEach(radio => {
                radio.checked = false;
            });
        }

        // Clean up the preview URL but keep the imageDisplayUrl in the table item
        if (imagePreviewUrls) {
            imagePreviewUrls.forEach(ipu => {
                URL.revokeObjectURL(ipu);
            });
        }
        setImageFiles(null);
        setImagePreviewUrls(null);
    }, [
        data_Inp1,
        data_Inp2,
        data_Options,
        data_Radio,
        inp1,
        inp2,
        opt,
        rad,
        relData,
        imageFiles,
        imagePreviewUrls,
        senderFunc,
        canArrFunc,
        canArr,
        canUniRef,
    ]);

    const handleDeleteRow = useCallback((index, id) => {
        setCancerArray((prev) => prev.filter((_, i) => i !== index));
        let token = localStorage.getItem("token")
        let form_id = localStorage.getItem("form_id")
        let delRow = fetchDataDELETE(`admin/form/${form_id}/cancer/${id}`)
        if (delRow.status == 200) {
            addToast({
                title: "سرطان مورد نظر حذف شد",
                type: 'success',
                duration: 4000
            })
        }
        // Note: You may want to also sync deletion with canArr/sender via callback
    }, []);

    // =============== RENDER ===============
    const shouldRender = propRelation;
    console.log("I am doing my job what else !", famrel, shouldRender, isFilled)
    if (!shouldRender && !isFilled) {
        return null;
    }

    return (
        <div className="cancer_element">
            <div className="cancer_title">
                <p>در جدول نام، نوع یا انواع سرطان و سن ابتلا را درج کنید</p>
            </div>

            <div className="jadval_and_form">
                {/* Form */}
                <div className="total_cancer_holder" ref={canUniRef}>
                    {data_Inp1 && RelationFinder(famrel)}
                    {data_Options && (
                        <Options
                            data_req={"false"}
                            data={data_Options}
                            valueSetter={handleOptChange}
                            Enum={Enum}
                            value={opt}
                            colRef={typeRef}
                        />
                    )}
                    {data_Inp2 && (
                        <InputBox
                            data_req={"false"}
                            data={data_Inp2}
                            valueSetter={handleInp2Change}
                            value={inp2}
                        // limit={3}
                        />
                    )}
                    {data_Radio && (
                        <Radio
                            data_req={"false"}
                            data={data_Radio}
                            valueSetter={handleRadChange}
                            value={rad}
                        />
                    )}

                    <div className="tah_holder">
                        <div className="form_element">
                            <div className="total_file_uploader">
                                <label htmlFor="file_uploader">لطفا عکسی بارگذاری کنید</label>
                                <input
                                    id="file_uploader"
                                    type="file"
                                    className="file_uploader"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                // value={imageFile}
                                />
                                {(imagePreviewUrls || []).map((ipu, index) => {
                                    return (
                                        < div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                                            <img
                                                src={ipu}
                                                alt="پیش‌نمایش"
                                                style={{
                                                    maxWidth: "100px",
                                                    maxHeight: "100px",
                                                    borderRadius: "4px",
                                                    border: "1px solid #ddd",
                                                }}
                                            />
                                        </div>
                                    )
                                })

                                }
                            </div>
                        </div>

                        <button
                            type="button"
                            className="btn_question jadval_adder"
                            onClick={handleAddRow}
                        >
                            اضافه
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="table_holder" style={showTab !== undefined && showTab == false ? { display: "none" } : null}>
                    <table border="0.5" cellSpacing="0" cellPadding="8">
                        <thead className="sar_jadval">
                            <tr>
                                {data_Inp1 && <th>ارتباط</th>}
                                {data_Options && <th>سرطان</th>}
                                {data_Inp2 && <th>سن</th>}
                                {data_Radio && <th>در قید حیات</th>}
                                <th>تصویر</th>
                                <th>عمل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(cancerArray || []).map((row, index) => (
                                <tr key={index}>
                                    {data_Inp1 && <td>{row.relation}</td>}
                                    {data_Options && <td>{row.cancerType}</td>}
                                    {data_Inp2 && <td>{row.cancerAge}</td>}
                                    {data_Radio && (
                                        <td>{row.status === 0 ? "فوت شده" : "زنده"}</td>
                                    )}
                                    <td>
                                        {row.image && Array.isArray(row.image) ? (
                                            // Handle multiple images in a container
                                            <div className="multiple-images-container">
                                                {row.image.map((img, imgIndex) => (
                                                    <img
                                                        key={imgIndex}
                                                        src={img}
                                                        alt={`تصویر ${imgIndex + 1}`}
                                                        onError={(e) => {
                                                            e.target.style.display = "none";
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : row.image ? (
                                            // Handle single image
                                            <img
                                                src={row.image}
                                                alt="تصویر"
                                                style={{
                                                    maxWidth: "80px",
                                                    maxHeight: "80px",
                                                    borderRadius: "2px",
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                }}
                                            />
                                        ) : null}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn_question"
                                            onClick={() => handleDeleteRow(index, row.id)}
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}

export default CancerField;