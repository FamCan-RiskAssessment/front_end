import {useState} from "react";
import './V2Form/login_pageV3.css'
import {APIURL} from "./utils/config";
import {useNavigate} from "react-router-dom";

import {useToast} from "./toaster";
import {fetchDataGETNoError} from "./utils/tools";
import {UserCircle2Icon} from "lucide-react";

function AdminLogin() {
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [Err, setError] = useState('')
    const navigate = useNavigate();
    const {addToast} = useToast()
    const form_submitted = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${APIURL}/auth/admin/login`, {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    "phone": phone,
                    "password": password
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                addToast({
                    title: "لطفا دوباره تلاش کنید",
                    type: 'error',
                    duration: 4000
                })
            }
            if (res.ok) {
                addToast({
                    title: 'خوش آمدید',
                    type: 'success',
                    duration: 4000
                })
                localStorage.setItem("token", data.data.access_token);
                localStorage.setItem("number", phone);
                localStorage.setItem("permissions", JSON.stringify(data.data.permissions));
                localStorage.setItem("roles", JSON.stringify(data.data.roles));

                const userAuthed = await fetchDataGETNoError("admin/profile", data.data.access_token);
                if (userAuthed.status === 404) {
                    navigate("/residentEnter");
                } else {
                    navigate("/DashBoard");
                }
            }
        } catch (err) {
            setError(err.message)
            setTimeout(() => {
                setError('')
            }, 3000)
        }
    }

    const adminLoginNav = () => {
        navigate("/adminLogin")
    }


    return (
        <>
            <div className="login_container">
                <div className="middles">
                    <div className="middle_form">
                        <h3 className="login_title clear_title">
                            سامانه ی ریسک سنجی و تشخیص سرطان
                        </h3>
                        <div className="form_card">
                            <UserCircle2Icon color="#cf4776" size={128}/>
                            <h3 className="login_title">صفحه ورود اعضا</h3>
                            <form onSubmit={(e) => form_submitted(e)} className="login_form">
                                <div className="inp">
                                    <label htmlFor="telephone">تلفن</label>
                                    <input data-clarity-mask="true" type="text" name="telephone" id="telephone"
                                           placeholder="مثال: 09123456789" value={phone}
                                           onChange={(e) => setPhone(e.target.value)}/>
                                </div>
                                <div className="inp">
                                    <label htmlFor="telephone">رمز ورود</label>
                                    <input data-clarity-mask="true" type="password" name="password" id="password"
                                           placeholder="xxxxxx" value={password}
                                           onChange={(e) => setPassword(e.target.value)}/>
                                </div>
                                <button className="btn_login">ورود</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="call-holder">
                <button className="support_call">تماس با پشتیبانی</button>
            </div>
            <div className="admin_enter" style={{display: "none"}}>
                <button className="support_call2" onClick={adminLoginNav}>ورود اعضا</button>
            </div>
            <p className="copy_right">
                انجمن سرطان های ارثی و فامیلی فم کن
            </p>
        </>
    )
}

export default AdminLogin


