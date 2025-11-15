import { useEffect, useState } from "react";
import { fetchDataGET } from "./utils/tools";
import NavBar from "./navBar";
import { useLocation } from "react-router-dom";
import "./SysLogs.css"; // We'll define styles below

function SystemLogs() {
  const location = useLocation();
  const userPhone = location.state?.phone;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(logs)
  useEffect(() => {
    let token = localStorage.getItem("token");
    const fetchEnumTest = async () => {
      let res = await fetchDataGET("admin/log/types" , token)
      console.log(res)
    }
    fetchEnumTest()
  } , [])
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetchDataGET("admin/log", token); // ✅ Replace with your actual endpoint

        if (res.status === 200) {
          // Extract the array of logs from res.data.data
          setLogs(res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Helper to format date (optional but nice)
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  if (loading) {
    return (
      <>
        <NavBar account={userPhone} />
        <div className="logs-container">
          <p className="loading">در حال بارگذاری لاگ‌ها...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar account={userPhone} />
      <div className="logs-container">
        <h2 className="logs-title">لاگ‌های سیستم</h2>

        {logs.length === 0 ? (
          <p className="no-logs">هیچ لاگی یافت نشد.</p>
        ) : (
          <ul className="logs-list">
            {logs.map((log) => (
              <li key={log.id} className="log-item">
                <div className="log-header">
                  <span className="log-action">{log.action}</span>
                  <span className="log-time">{formatDate(log.createdAt)}</span>
                </div>
                <div className="log-details">
                  {log.actor?.phone && (
                    <span className="log-actor">اپراتور: {log.actor.phone}</span>
                  )}
                  {log.details && (
                    <span className="log-extra">جزئیات: {log.details}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default SystemLogs;