import { useNavigate } from "react-router-dom";
import "./attentionPage.css";

export default function AttentionPage() {
    const navigate = useNavigate();

    const handleContinue = () => {
        navigate("/login"); // Navigate to the main page or wherever you want to redirect
    };

    return (
        <div className="attention-container">
            <div className="attention-card">
                <div className="attention-content">
                    <h2 className="attention-title">توجه</h2>
                    <p className="attention-message">
                        افرادی که خود یا خانواده درجه اول ایشان عضو پرسنل نیروهای مسلح هستند مشمول این ریسک سنجی نمیباشند
                    </p>
                </div>
                <button className="continue-btn" onClick={handleContinue}>
                    ادامه
                </button>
            </div>
        </div>
    );
}