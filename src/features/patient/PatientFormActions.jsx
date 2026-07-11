import { Calculator, NotebookIcon, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import stateChangeSign from "../../V2Form/stateChange.svg";

export default function PatientFormActions({
    row,
    onModelInput,
    onStatusChange,
    showEdit = true,
    layout = "row",
}) {
    const navigate = useNavigate();

    const handleEdit = (e) => {
        e?.stopPropagation?.();
        const params = new URLSearchParams();
        if (row.status) {
            params.set("status", row.status);
        }
        if (row.name) {
            params.set("name", row.name);
        }
        if (row.operatorId != null) {
            params.set("operatorId", String(row.operatorId));
        }
        const qs = params.toString();
        window.open(
            `/DashBoard/patients/${row.id}${qs ? `?${qs}` : ""}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    const handleModelResults = (e) => {
        e.stopPropagation();
        navigate("/DashBoard/modelsResults", { state: { form: row } });
    };

    const handleModelInput = (e) => {
        e.stopPropagation();
        onModelInput?.(row.id);
    };

    const handleStatusChange = (e) => {
        e.stopPropagation();
        onStatusChange?.(row.id);
    };

    return (
        <div className={`patient_actions ${layout}`}>
            {showEdit && (
                <button
                    type="button"
                    className="patient_action_btn patient_action_btn--edit"
                    onClick={handleEdit}
                    title="ویرایش در تب جدید"
                >
                    <Pencil size={16} />
                    <span>ویرایش</span>
                </button>
            )}
            <button
                type="button"
                className="patient_action_btn"
                onClick={handleModelResults}
            >
                <NotebookIcon size={16} />
                <span>نتایج مدل‌ها</span>
            </button>
            <button
                type="button"
                className="patient_action_btn"
                onClick={handleModelInput}
            >
                <Calculator size={16} />
                <span>ورودی به مدل</span>
            </button>
            <button
                type="button"
                className="patient_action_btn"
                onClick={handleStatusChange}
            >
                <img src={stateChangeSign} alt="" />
                <span>تغییر وضعیت</span>
            </button>
        </div>
    );
}
