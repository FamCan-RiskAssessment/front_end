import {useState} from "react";
import './LoginPage.css'
import {useNavigate} from "react-router-dom";

import {useToast} from "../../components/ui/Toast";
import {fetchDataGETNoError} from "../../utils/tools";
import {adminLogin} from "../../api/auth";
import { persistDashboardAccess } from "../../utils/permissions";
import { useAuthStore } from "../../stores/authStore";
import {UserCircle2Icon} from "lucide-react";

function AdminLogin() {
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [Err, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    const {addToast} = useToast()

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        try {
            const res = await adminLogin(phone, password)
            const data = await res.json()
            if (!res.ok) {
                addToast({
                    title: "لطفا دوباره تلاش کنید",
                    type: 'error',
                    duration: 4000
                })
                return;
            }

            addToast({
                title: 'خوش آمدید',
                type: 'success',
                duration: 4000
            })
            useAuthStore.getState().setSession({
                token: data.data.access_token,
                number: phone,
                permissions: data.data.permissions,
                roles: data.data.roles,
            });
            persistDashboardAccess(data.data.permissions);

            const userAuthed = await fetchDataGETNoError("admin/profile", data.data.access_token);
            if (userAuthed.status === 404) {
                navigate("/residentEnter");
            } else {
                navigate("/DashBoard");
            }
        } catch (err) {
            setError(err.message)
            setTimeout(() => {
                setError('')
            }, 3000)
        } finally {
            setIsLoading(false);
        }
    }

    const handleFormKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
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
                            <form onSubmit={handleLogin} className="login_form">
                                <div className="inp">
                                    <label htmlFor="telephone">تلفن</label>
                                    <input data-clarity-mask="true" type="tel" name="telephone" id="telephone"
                                           placeholder="مثال: 09123456789" value={phone}
                                           inputMode="tel"
                                           autoComplete="tel"
                                           disabled={isLoading}
                                           onChange={(e) => setPhone(e.target.value)}
                                           onKeyDown={handleFormKeyDown}/>
                                </div>
                                <div className="inp">
                                    <label htmlFor="password">رمز ورود</label>
                                    <input data-clarity-mask="true" type="password" name="password" id="password"
                                           placeholder="xxxxxx" value={password}
                                           autoComplete="current-password"
                                           disabled={isLoading}
                                           onChange={(e) => setPassword(e.target.value)}
                                           onKeyDown={handleFormKeyDown}/>
                                </div>
                                <button type="submit" className="btn_login" disabled={isLoading}>
                                    {isLoading && <span className="btn_login_spinner" aria-hidden="true" />}
                                    {isLoading ? 'در حال ورود...' : 'ورود'}
                                </button>
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


