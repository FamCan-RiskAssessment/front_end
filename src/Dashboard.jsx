import { useEffect, useState } from "react";
import RoleChanger from "./role_giver";
import NavBar from "./navBar";
import "./DashBoard.css"
import formT from "./assets/from_transfer.svg"
import { useLocation, useNavigate } from "react-router-dom";
import { permExtractor, fetchDataGET, permissionCategoryComparer } from "./utils/tools"
import { listOfcategs, listDashBoardUrls } from "./utils/config";
import homeSign from './V2Form/home.svg'
import timeSign from './V2Form/time.svg'
import tool_pinkSign from './V2Form/pink_tool.svg'
import tool_greenSign from './V2Form/green_tool.svg'
import exitSign from './V2Form/exit.svg'


function DashBoard() {
    const location = useLocation();
    const [perms, setPerms] = useState([])
    const [passedUrls, setPassedUrls] = useState([])
    const permissions = location.state?.permissions;
    const [userPhone, setUserPhone] = useState("")
    let role = JSON.parse(localStorage.getItem("roles"))
    useEffect(() => {
        // let checkPerms = JSON.parse(localStorage.getItem("permissions"))
        role.forEach(r => {
            if (r.name == "مراجعه کننده") {
                navigate("/error_page", { state: { error_type: 401 } })
            }
        });
    }, [])
    useEffect(() => {
        let passedUrlsRaw = permissionCategoryComparer(perms, listOfcategs, listDashBoardUrls)
        localStorage.setItem("pagesOneCango", JSON.stringify(passedUrlsRaw))
        setPassedUrls(passedUrlsRaw)
    }, [perms])

    // useEffect(() => {
    //     const loadUser = async () =>{
    //         let token = localStorage.getItem("token")
    //         let phone = localStorage.getItem("number")
    //         let data = await fetchDataGET("admin/users" , token)
    //         let users = data.data.data
    //         users.forEach(async u => {
    //             if(u.phone == phone){
    //                 let permsRaw = await fetchDataGET(`admin/users/${u.id}/roles` , token)
    //                 // console.log(permsRaw.data[0].permissions)
    //                 setPerms(permsRaw.data[0].permissions)
    //                 setUserPhone(u.phone)
    //             }
    //         });
    //     }
    //     loadUser()
    // } , [])


    useEffect(() => {
        let permissions = JSON.parse(localStorage.getItem("permissions"))
        let phone = localStorage.getItem("number")
        setUserPhone(phone)
        setPerms(permissions)
    }, [])

    const navigate = useNavigate();
    const tool_chooser = () => {
        navigate("/DashBoard/RandP", { state: { phone: userPhone } })
    }
    const tool_chooser2 = () => {
        navigate("/DashBoard/roleMaker", { state: { phone: userPhone } })
    }
    const tool_chooser3 = () => {
        navigate("/DashBoard/patients", { state: { phone: userPhone } })
    }
    const tool_chooser4 = () => {
        navigate("/DashBoard/usersTree", { state: { phone: userPhone } })
    }
    const tool_chooser5 = () => {
        navigate("/DashBoard/passChange", { state: { phone: userPhone } })
    }
    const tool_chooser6 = () => {
        navigate("/DashBoard/supervisorForms", { state: { phone: userPhone } })
    }
    const tool_chooser7 = () => {
        navigate("/DashBoard/systemLog", { state: { phone: userPhone } })
    }
    const tool_chooser8 = () => {
        navigate("/DashBoard/modelsResults", { state: { phone: userPhone } })
    }

    return (
        <>
            <div className="forms_page_holder">
                <NavBar account={userPhone}></NavBar>
                {/* <div
                    className="help_bar_container"
                >
                    <div className="top-layer">
                        <div className="help_bar_parts_container">
                            <div className="help_bar_part1">
                                <h3>
                                    <img src={timeSign} alt="time_sign" />
                                </h3>
                            </div>
                            <h3 className="forms-title">ابزار های مدیریت کاربران</h3>
                            <div className="help_bar_part3">
                                <button className="btn-view-form top align_items" onClick={() => navigate("/Dashboard")}>
                                    <span>صفحه ی اصلی</span>
                                    <img src={homeSign} alt="home" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bottom-layer">
                        <div className="help_bar_parts_container">
                            <div className="help_bar_part1">
                                <span>خوش آمدید</span>
                                <span>نام</span>
                                <span>شماره</span>
                                <span>نقش</span>
                            </div>
                            <div className="help_bar_part3 dash">
                                <button className="dash_exit_btn">
                                    <img src={exitSign} alt="exit_sign" />
                                    <span onClick={() => navigate("/")}>خروج</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div> */}
                <div className="forms-page-wrapper dash">
                    <div className="forms-container dash">
                        <div className="connector">
                            <div className="tool_title">
                                <span>
                                    <img src={tool_greenSign} alt="tool_picker_green" />
                                </span>
                                <h2>مدیریت کاربران و نقش‌ها</h2>
                            </div>
                            <div className="user-management">
                                <div className="tool_list">
                                    <ul>
                                        {passedUrls.includes("/DashBoard/roleMaker") && (
                                            <li className="tool" onClick={() => tool_chooser2()}>
                                                <span>
                                                    <img src={tool_pinkSign} alt="tool_picker_pink" />
                                                </span>
                                                <span>
                                                    ساخت، حذف و مدیریت نقش
                                                </span>
                                            </li>
                                        )}
                                        {passedUrls.includes("/DashBoard/RandP") && (
                                            <li className="tool" onClick={() => tool_chooser()}>
                                                <span>
                                                    <img src={tool_pinkSign} alt="tool_picker_pink" />
                                                </span>
                                                <span>
                                                    تغییر دسترسی افراد
                                                </span>
                                            </li>
                                        )}

                                        {/* <li className="tool" onClick={() => tool_chooser4()}>
                                            <span>
                                                <img src={tool_pinkSign} alt="tool_picker_pink" />
                                            </span>
                                            <span>
                                                مدیریت کاربران
                                            </span>
                                        </li> */}
                                        {passedUrls.includes("/DashBoard/patients") && (
                                            <li className="tool" onClick={() => tool_chooser3()}>
                                                <span>
                                                    <img src={tool_pinkSign} alt="tool_picker_pink" />
                                                </span>
                                                <span>
                                                    کاربران ثبت‌نام شده
                                                </span>
                                            </li>
                                        )}
                                        {/* <li className="tool" onClick={() => tool_chooser5()}>
                                            <span>
                                                <img src={tool_pinkSign} alt="tool_picker_pink" />
                                            </span>
                                            <span>
                                                تغییر رمز
                                            </span>
                                        </li> */}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="connector">
                            <div className="tool_title journs">
                                <span>
                                    <img src={tool_greenSign} alt="tool_picker_green" />
                                </span>
                                <h2>گزارش‌ها و فرم‌ها</h2>
                            </div>
                            <div className="form-management">
                                <div className="tool_list">
                                    <ul>
                                        {/* {passedUrls.includes("/DashBoard/modelsResults") && ( */}
                                        <li className="tool" onClick={() => tool_chooser8()}>
                                            <span>
                                                <img src={tool_pinkSign} alt="tool_picker_pink" />
                                            </span>
                                            <span>
                                                نتایج مدل‌ها
                                            </span>
                                        </li>
                                        {/* )} */}
                                        {passedUrls.includes("/DashBoard/supervisorForms") && (
                                            <li className="tool" onClick={() => tool_chooser6()}>
                                                <span>
                                                    <img src={tool_pinkSign} alt="tool_picker_pink" />
                                                </span>
                                                <span>
                                                    ارجاع فرم
                                                </span>
                                            </li>
                                        )}
                                        {passedUrls.includes("/DashBoard/systemLog") && (
                                            <li className="tool" onClick={() => tool_chooser7()}>
                                                <span>
                                                    <img src={tool_pinkSign} alt="tool_picker_pink" />
                                                </span>
                                                <span>
                                                    گزارش سیستم
                                                </span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/* <div className="wrapper">
                <div className="title-holder">
                    <h1>ابزارها</h1>
                    <p className="subtitle">مدیریت نقش‌ها و کاربران</p>
                </div>
                <div className="tool_holder">
                    {(permExtractor(perms, "دسترسی کامل") || permExtractor(perms, "ویرایش نقش")) && (
                        <div className="tool_card_holder">
                            <div className="tool_card" onClick={tool_chooser}>
                                <div className="tool_image around_image role"></div>
                                <div className="tool_name">
                                    <span>تغییر نقش</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {(permExtractor(perms, "دسترسی کامل") || permExtractor(perms, "ایجاد نقش")) && (
                        <div className="tool_card_holder">
                            <div className="tool_card" onClick={tool_chooser2}>
                                <div className="tool_image around_image create"></div>
                                <div className="tool_name">
                                    <span>ساخت نقش</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {(permExtractor(perms, "دسترسی کامل") || permExtractor(perms, "مشاهده بیماران")) && (
                        <div className="tool_card_holder">
                            <div className="tool_card" onClick={tool_chooser3}>
                                <div className="tool_image around_image patients"></div>
                                <div className="tool_name">
                                    <span>کاربران ثبت‌نام شده</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {(permExtractor(perms, "دسترسی کامل") || role[0].name == "اپراتور" || role[0].name == "مدیر") && (
                        <div className="tool_card_holder">
                            <div className="tool_card" onClick={tool_chooser8}>
                                <div className="tool_image around_image formtrans"></div>
                                <div className="tool_name">
                                    <span>نتایج مدل ها</span>
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="tool_card_holder">
                        <div className="tool_card" onClick={tool_chooser4}>
                            <div className="tool_image around_image manager"></div>
                            <div className="tool_name">
                                <span>مدیریت کاربران</span>
                            </div>
                        </div>
                    </div>
                    {(permExtractor(perms, "دسترسی کامل") || permExtractor(perms, "تنظیم پسورد")) && (
                        <div className="tool_card_holder">
                            <div className="tool_card" onClick={tool_chooser5}>
                                <div className="tool_image around_image changePass"></div>
                                <div className="tool_name">
                                    <span>تغییر رمز</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {(permExtractor(perms, "دسترسی کامل") || role[0].name == "مدیر") && (
                        <div className="tool_card_holder">
                            <div className="tool_card" onClick={tool_chooser6}>
                                <div className="tool_image around_image formtrans"></div>
                                <div className="tool_name">
                                    <span>ارجاع فرم</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {(permExtractor(perms, "دسترسی کامل") || role[0].name == "مدیر") && (
                        <div className="tool_card_holder">
                            <div className="tool_card" onClick={tool_chooser7}>
                                <div className="tool_image around_image formtrans"></div>
                                <div className="tool_name">
                                    <span>گزارش سیستم</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div> */}

        </>
    )
}

export default DashBoard