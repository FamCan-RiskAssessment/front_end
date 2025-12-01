import { useEffect, useState } from "react";
import RoleChanger from "./role_giver";
import NavBar from "./navBar";
import "./DashBoard.css"
import formT from "./assets/from_transfer.svg"
import { useLocation, useNavigate } from "react-router-dom";
import { permExtractor, fetchDataGET } from "./utils/tools"

function DashBoard() {
    const location = useLocation();
    const [perms, setPerms] = useState([])
    const permissions = location.state?.permissions;
    const [userPhone, setUserPhone] = useState("")
    let role = JSON.parse(localStorage.getItem("roles"))
    useEffect(() => {
        let checkPerms = JSON.parse(localStorage.getItem("permissions"))
        if (checkPerms.length <= 1) {
            navigate("/error_page", { state: { error_type: 401 } })
        }
    }, [])

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
            <NavBar account={userPhone}></NavBar>
            <div className="wrapper">
                <div className="title-holder">
                    <h1>ابزارها</h1>
                    <p className="subtitle">مدیریت نقش‌ها و بیماران</p>
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
                                    <span>بیماران ثبت‌نام شده</span>
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
            </div>

        </>
    )
}

export default DashBoard