import { useEffect, useState } from "react";
import { fetchDataGET } from "./utils/tools";
import NavBar from "./navBar";
import { useLocation } from "react-router-dom";
import "./SysLogs.css";
import "./client_forms.css";
import plusSign from './V2Form/plus.svg'
import leftSign from './V2Form/form_left.png'
import rightSign from './V2Form/form_right.png'
import prevSign from './V2Form/arrow_right.svg'
import homeSign from './V2Form/home.svg'
import panelSign from './V2Form/panelSign.svg'
import settingsSign from './V2Form/settings.svg'
import deleteSign from './V2Form/trashCan.svg'
import subSign from './V2Form/checkSub.svg'
import restoreSign from './V2Form/restore.svg'
import fileUplode from './V2Form/files.svg'
import waitSign from './V2Form/timer.png'
import checkFull from './V2Form/checkfull.png'

function SystemLogs() {
  const location = useLocation();
  const userPhone = location.state?.phone;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState(null);
  console.log(logs)

  useEffect(() => {
    let token = localStorage.getItem("token");
    const fetchEnumTest = async () => {
      let res = await fetchDataGET("admin/log/types", token)
      console.log(res)
    }
    fetchEnumTest()
  }, [])

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

  const toggleLogDetails = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const lineMaker = (total_page) => {
    let spans = []
    for (let i = 0; i < total_page; i++) {
      spans.push(i)
    }
    return spans
  };

  if (loading) {
    return (
      <div className="forms_page_holder">
        <NavBar account={userPhone} />

        <div className="help_bar_container">
          <div className="help_bar_parts_container">
            <div className="help_bar_part1">
              <img src={prevSign} alt="arrow_img" />
              <span onClick={() => window.history.back()}>خروج</span>
            </div>
            <h3 className="forms-title">لاگ‌های سیستم</h3>
            <div className="help_bar_part3">
            </div>
          </div>
        </div>

        <div className="forms-page-wrapper">
          <div className="forms-container">
            <div className="forms_tools">
              <div className="form_tool">
                <div className="form_search_bar">
                  <input type="text" className="form_search inp_question V2" placeholder="جستجو" />
                </div>
                <div className="sorter">
                  <select name="formSort" id="" className="select_optionsV2">
                    <option value="انتخاب کنید">انتخاب کنید</option>
                    <option value="جدید ترین">جدید ترین</option>
                    <option value="قدیمی ترین">قدیمی ترین</option>
                  </select>
                </div>
              </div>
            </div>

            <p className="loading text-center mt-10">در حال بارگذاری لاگ‌ها...</p>

            <div className="page_naver">
              <div className="total_pages">
                <span>تعداد صفحات 1</span>
              </div>
              <div className="page_line">
                <img src={rightSign} className="arrows" alt="rightSign" />
                <span className="page_num" style={{ background: "#eee" }}>1</span>
                <img src={leftSign} alt="leftSign" className="arrows" />
              </div>
            </div>

            <div className="btn_holder_next_prev aligner">
              <button className="btn_submit space-UD" disabled>صفحه ی قبلی</button>
              <button className="btn_submit space-UD" disabled>صفحه ی بعدی</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forms_page_holder">
      <NavBar account={userPhone} />
      <div className="forms-page-wrapper SL">
        <div className="forms-container SL">
          <div className="forms_tools">
            <div className="form_tool">
              <div className="form_search_bar">
                <input type="text" className="form_search inp_question V2" placeholder="جستجو" />
              </div>
              <div className="sorter">
                <select name="formSort" id="" className="select_optionsV2">
                  <option value="انتخاب کنید">انتخاب کنید</option>
                  <option value="جدید ترین">جدید ترین</option>
                  <option value="قدیمی ترین">قدیمی ترین</option>
                </select>
              </div>
            </div>
          </div>

          {logs.length === 0 ? (
            <p className="no-forms-text">هیچ لاگی یافت نشد.</p>
          ) : (
            <div className="logs-list">
              {logs.map((log) => (
                <div key={log.id} className="log-item form-row" onClick={() => toggleLogDetails(log.id)}>
                  <div className="log-header">
                    <div className="log-main-info">
                      <span className="log-action"><strong>اکشن:</strong> {log.action}</span>
                      <span className="log-time"><strong>زمان:</strong> {formatDate(log.createdAt)}</span>
                    </div>
                    {/* <div className="log-expand-icon">
                      {expandedLogId === log.id ? '▲' : '▼'}
                    </div> */}
                  </div>

                  {expandedLogId === log.id && (
                    <div className="log-expanded-details">
                      {log.actor?.phone && (
                        <div className="log-actor"><strong>اپراتور:</strong> {log.actor.phone}</div>
                      )}
                      {log.description && (
                        <div className="log-description"><strong>توضیحات:</strong> {log.description}</div>
                      )}
                      {log.details && (
                        <div className="log-extra"><strong>جزئیات:</strong> {log.details}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="page_naver">
            <div className="total_pages">
              <span>تعداد صفحات 1</span>
            </div>
            <div className="page_line">
              <img src={rightSign} className="arrows" alt="rightSign" />
              <span className="page_num" style={{ background: "#eee" }}>1</span>
              <img src={leftSign} alt="leftSign" className="arrows" />
            </div>
          </div>

          <div className="btn_holder_next_prev aligner">
            <button className="btn_submit space-UD" disabled>صفحه ی قبلی</button>
            <button className="btn_submit space-UD" disabled>صفحه ی بعدی</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemLogs;