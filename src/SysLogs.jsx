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
  const [page, setPage] = useState(1);
  const [pagiPrev, setPagiPrev] = useState(false);
  const [pagiNext, setPagiNext] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [filtersApplied, setFiltersApplied] = useState(false);

  // State for advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    search: '',
    sortBy: '',
    action: '',
    actor: '',
    dateFrom: '',
    dateTo: ''
  });
  console.log(logs)

  useEffect(() => {
    let token = localStorage.getItem("token");
    const fetchEnumTest = async () => {
      let res = await fetchDataGET("admin/log/types", token)
      console.log(res)
    }
    fetchEnumTest()
  }, [])

  // Function to build endpoint based on filters
  const buildEndpoint = (currentPage, filters) => {
    let endpoint = 'admin/log';

    // Build query parameters
    const queryParams = [];

    // Add pagination
    queryParams.push(`page=${currentPage}`);
    queryParams.push('pageSize=10'); // Keep pageSize consistent

    // Add sorting and search filters
    if (filters.sortBy) queryParams.push(`sortBy=${filters.sortBy}`);
    if (filters.search) queryParams.push(`search=${filters.search}`);
    if (filters.action) queryParams.push(`action=${filters.action}`);
    if (filters.actor) queryParams.push(`actor=${filters.actor}`);
    if (filters.dateFrom) queryParams.push(`dateFrom=${filters.dateFrom}`);
    if (filters.dateTo) queryParams.push(`dateTo=${filters.dateTo}`);

    // Join query parameters with '&'
    const queryString = queryParams.join('&');
    return `admin/log?${queryString}`;
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        // Build endpoint with filters
        const endpoint = buildEndpoint(page, advancedFilters);
        const res = await fetchDataGET(endpoint, token); // ✅ Replace with your actual endpoint

        if (res.status === 200) {
          // Extract the array of logs from res.data.data
          setLogs(res.data.data || []);
          setPagiNext(res.data.pagination.hasNextPage);
          setPagiPrev(res.data.pagination.hasPrevPage);
          setPageCount(res.data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
        setFiltersApplied(false); // Reset filter applied state after loading
      }
    };

    if (filtersApplied) { // Only fetch when filters are explicitly applied
      setLoading(true);
      fetchLogs();
    }
  }, [filtersApplied]); // Only run when filtersApplied changes

  // Effect for initial load and pagination
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        // Build endpoint with filters
        const endpoint = buildEndpoint(page, advancedFilters);
        const res = await fetchDataGET(endpoint, token); // ✅ Replace with your actual endpoint

        if (res.status === 200) {
          // Extract the array of logs from res.data.data
          setLogs(res.data.data || []);
          setPagiNext(res.data.pagination.hasNextPage);
          setPagiPrev(res.data.pagination.hasPrevPage);
          setPageCount(res.data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only run this effect for initial load and pagination (not when filters are applied)
    if (!filtersApplied) {
      setLoading(true);
      fetchLogs();
    }
  }, [page]); // Don't include filtersApplied here to avoid infinite loop

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

  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    setFiltersApplied(true); // Trigger the useEffect to fetch data with new filters
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
          {/* Advanced Filters Section */}
          <div className="log_filters">
            <div className="advanced_filters">
              <h4>فیلترهای پیشرفته</h4>

              <div className="filter_row">
                <div className="filter_group">
                  <label>جستجو:</label>
                  <input
                    type="text"
                    placeholder="جستجو..."
                    value={advancedFilters.search}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, search: e.target.value })}
                  />
                </div>

                <div className="filter_group">
                  <label>مرتب سازی بر اساس:</label>
                  <select
                    value={advancedFilters.sortBy}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, sortBy: e.target.value })}
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="id">شناسه</option>
                    <option value="createdAt">تاریخ ایجاد</option>
                    <option value="action">اکشن</option>
                  </select>
                </div>
              </div>

              <div className="filter_row">
                <div className="filter_group">
                  <label>اکشن (ID):</label>
                  <input
                    type="number"
                    placeholder="شناسه اکشن"
                    value={advancedFilters.action}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, action: e.target.value })}
                  />
                </div>

                <div className="filter_group">
                  <label>اکتور (ID):</label>
                  <input
                    type="number"
                    placeholder="شناسه اکتور"
                    value={advancedFilters.actor}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, actor: e.target.value })}
                  />
                </div>
              </div>

              <div className="filter_row">
                <div className="filter_group">
                  <label>تاریخ از:</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={advancedFilters.dateFrom}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateFrom: e.target.value })}
                  />
                </div>

                <div className="filter_group">
                  <label>تاریخ تا:</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={advancedFilters.dateTo}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateTo: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                <button
                  className="btn_reset_filters"
                  onClick={() => {
                    setAdvancedFilters({
                      search: '',
                      sortBy: '',
                      action: '',
                      actor: '',
                      dateFrom: '',
                      dateTo: ''
                    })
                    setFiltersApplied(p => !p)
                  }}
                >
                  ریست فیلترها
                </button>

                <button
                  className="btn_question refined"
                  onClick={applyFilters}
                >
                  اعمال فیلترها
                </button>
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
                      <span className="log-time"><strong>زمان:</strong> شمسی : {formatDate(log.createdAt)} , میلادی : {log.createdAt}</span>
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
              <span>تعداد صفحات {pageCount}</span>
            </div>
            <div className="page_line">
              <img src={rightSign} className="arrows" alt="rightSign" onClick={() => setPage(a => Math.max(1, a - 1))} />
              {lineMaker(pageCount).map((p, index) => {
                return (
                  <span className="page_num" style={page == p + 1 ? { background: "#eee", } : null} onClick={() => setPage(p + 1)}>
                    {p + 1}
                  </span>
                )
              })}
              <img src={leftSign} alt="leftSign" className="arrows" onClick={() => setPage(a => Math.min(pageCount, a + 1))} />
            </div>
          </div>

          <div className="btn_holder_next_prev aligner">
            <button className="btn_submit space-UD" onClick={() => setPage(a => Math.max(1, a - 1))} disabled={!pagiPrev}>صفحه ی قبلی</button>
            <button className="btn_submit space-UD" onClick={() => setPage(a => Math.min(pageCount, a + 1))} disabled={!pagiNext}>صفحه ی بعدی</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemLogs;