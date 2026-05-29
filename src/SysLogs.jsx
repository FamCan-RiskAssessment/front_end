import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { fetchDataGET } from "./utils/tools";
import NavBar from "./navBar";
import { useLocation, useNavigate } from "react-router-dom";
import "./SysLogs.css";
import "./client_forms.css";
import leftSign from "./V2Form/form_left.png";
import rightSign from "./V2Form/form_right.png";

const PAGE_SIZE = 15;
const EXPORT_PAGE_SIZE = 200;

const EMPTY_FILTERS = {
  search: "",
  sortBy: "",
  sortOrder: "desc",
  action: "",
  actorId: "",
  dateFrom: "",
  dateTo: "",
};

function formatUser(user) {
  if (!user) return "—";
  const fullName = [user.name, user.lastName].filter(Boolean).join(" ").trim();
  if (fullName && user.phone) return `${fullName} (${user.phone})`;
  return user.phone || String(user.id);
}

function buildLogEndpoint(filters, currentPage, pageSize) {
  const params = new URLSearchParams();
  params.set("page", String(currentPage));
  params.set("pageSize", String(pageSize));
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  if (filters.action) params.set("action", filters.action);
  if (filters.actorId) params.set("actorId", filters.actorId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  return `admin/log?${params.toString()}`;
}

function logToExportRow(log) {
  return {
    شناسه: log.id,
    "نوع عملیات": log.action,
    "کاربر (اکتور)": formatUser(log.actor),
    "شناسه اکتور": log.actor?.id ?? "",
    هدف: formatUser(log.target),
    "شناسه هدف": log.target?.id ?? "",
    منبع: log.resource ?? "",
    "شناسه منبع": log.resourceId ?? "",
    جزئیات: log.details ?? "",
    تاریخ: log.createdAt ?? "",
  };
}

function SystemLogs() {
  const location = useLocation();
  const navigate = useNavigate();
  const userPhone = location.state?.phone;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagiPrev, setPagiPrev] = useState(false);
  const [pagiNext, setPagiNext] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [actionTypes, setActionTypes] = useState([]);

  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    const perms = JSON.parse(localStorage.getItem("pagesOneCango") || "[]");
    const denied = roles.some((r) => r.name === "مراجعه کننده") || !perms.includes("/DashBoard/systemLog");
    if (denied) {
      navigate("/error_page", { state: { error_type: 403 } });
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loadActionTypes = async () => {
      try {
        const res = await fetchDataGET("admin/log/types", token);
        setActionTypes(res.data || []);
      } catch (error) {
        console.error("Failed to fetch action types:", error);
      }
    };
    loadActionTypes();
  }, []);

  const fetchLogsPage = useCallback(async (currentPage, filters, pageSize = PAGE_SIZE) => {
    const token = localStorage.getItem("token");
    const endpoint = buildLogEndpoint(filters, currentPage, pageSize);
    const res = await fetchDataGET(endpoint, token);
    return {
      logs: res.data?.data || [],
      pagination: res.data?.pagination,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const { logs: pageLogs, pagination } = await fetchLogsPage(page, appliedFilters);
        if (cancelled) return;
        setLogs(pageLogs);
        setPagiNext(pagination?.hasNextPage ?? false);
        setPagiPrev(pagination?.hasPrevPage ?? false);
        setPageCount(pagination?.totalPages ?? 0);
        setTotalItems(pagination?.totalItems ?? 0);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch logs:", error);
          setLogs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page, appliedFilters, fetchLogsPage]);

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters({ ...draftFilters });
  };

  const resetFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const toggleLogDetails = (logId) => {
    setExpandedLogId((prev) => (prev === logId ? null : logId));
  };

  const lineMaker = (totalPages) => Array.from({ length: totalPages }, (_, i) => i);

  const exportToXlsx = async () => {
    setExporting(true);
    try {
      const allLogs = [];
      let currentPage = 1;
      let hasNext = true;

      while (hasNext) {
        const { logs: pageLogs, pagination } = await fetchLogsPage(
          currentPage,
          appliedFilters,
          EXPORT_PAGE_SIZE
        );
        allLogs.push(...pageLogs);
        hasNext = pagination?.hasNextPage ?? false;
        currentPage += 1;
      }

      if (allLogs.length === 0) {
        alert("لاگی برای خروجی وجود ندارد.");
        return;
      }

      const rows = allLogs.map(logToExportRow);
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "لاگ‌ها");
      const stamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `system-logs-${stamp}.xlsx`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("خروجی گرفتن با خطا مواجه شد.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="forms_page_holder">
      <NavBar account={userPhone} />
      <div className="forms-page-wrapper SL">
        <div className="forms-container SL">
          <div className="pageTitle log-page-header">
            <h2>گزارش فعالیت کاربران</h2>
            <button
              type="button"
              className="btn_question refined btn_export_logs"
              onClick={exportToXlsx}
              disabled={loading || exporting || totalItems === 0}
            >
              {exporting ? "در حال آماده‌سازی..." : "خروجی Excel"}
            </button>
          </div>

          <div className="log_filters">
            <div className="advanced_filters">
              <h4>فیلترها</h4>
              <div className="Filterholder">
                <div className="filter_row">
                  <div className="filter_group">
                    <label>جستجو (جزئیات / منبع):</label>
                    <input
                      type="text"
                      placeholder="جستجو..."
                      value={draftFilters.search}
                      onChange={(e) => setDraftFilters({ ...draftFilters, search: e.target.value })}
                    />
                  </div>
                  <div className="filter_group">
                    <label>مرتب‌سازی:</label>
                    <select
                      value={draftFilters.sortBy}
                      onChange={(e) => setDraftFilters({ ...draftFilters, sortBy: e.target.value })}
                    >
                      <option value="">پیش‌فرض (جدیدترین)</option>
                      <option value="id">شناسه</option>
                      <option value="created_at">تاریخ</option>
                      <option value="action">نوع عملیات</option>
                    </select>
                  </div>
                  <div className="filter_group">
                    <label>ترتیب:</label>
                    <select
                      value={draftFilters.sortOrder}
                      onChange={(e) => setDraftFilters({ ...draftFilters, sortOrder: e.target.value })}
                    >
                      <option value="desc">نزولی</option>
                      <option value="asc">صعودی</option>
                    </select>
                  </div>
                </div>

                <div className="filter_row">
                  <div className="filter_group">
                    <label>نوع عملیات:</label>
                    <select
                      value={draftFilters.action}
                      onChange={(e) => setDraftFilters({ ...draftFilters, action: e.target.value })}
                    >
                      <option value="">همه</option>
                      {actionTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter_group">
                    <label>شناسه کاربر (اکتور):</label>
                    <input
                      type="number"
                      placeholder="actorId"
                      value={draftFilters.actorId}
                      onChange={(e) => setDraftFilters({ ...draftFilters, actorId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="filter_row">
                  <div className="filter_group">
                    <label>تاریخ از (YYYY-MM-DD):</label>
                    <input
                      type="text"
                      placeholder="2025-01-01"
                      value={draftFilters.dateFrom}
                      onChange={(e) => setDraftFilters({ ...draftFilters, dateFrom: e.target.value })}
                    />
                  </div>
                  <div className="filter_group">
                    <label>تاریخ تا (YYYY-MM-DD):</label>
                    <input
                      type="text"
                      placeholder="2025-12-31"
                      value={draftFilters.dateTo}
                      onChange={(e) => setDraftFilters({ ...draftFilters, dateTo: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="log_filter_actions">
                <button type="button" className="btn_reset_filters" onClick={resetFilters}>
                  ریست فیلترها
                </button>
                <button type="button" className="btn_question refined" onClick={applyFilters}>
                  اعمال فیلترها
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="loading text-center mt-10">در حال بارگذاری لاگ‌ها...</p>
          ) : logs.length === 0 ? (
            <p className="no-forms-text">هیچ لاگی یافت نشد.</p>
          ) : (
            <>
              <p className="logs-summary">
                نمایش {logs.length} مورد از {totalItems} لاگ
              </p>
              <div className="logs-table-wrapper">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>شناسه</th>
                      <th>عملیات</th>
                      <th>کاربر</th>
                      <th>هدف</th>
                      <th>منبع</th>
                      <th>تاریخ</th>
                      <th>جزئیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className={expandedLogId === log.id ? "log-row-expanded" : ""}
                        onClick={() => toggleLogDetails(log.id)}
                      >
                        <td>{log.id}</td>
                        <td>{log.action}</td>
                        <td>{formatUser(log.actor)}</td>
                        <td>{formatUser(log.target)}</td>
                        <td>
                          {log.resource || "—"}
                          {log.resourceId ? ` (#${log.resourceId})` : ""}
                        </td>
                        <td>{log.createdAt}</td>
                        <td className="log-details-cell" title={log.details}>
                          {expandedLogId === log.id ? log.details : (log.details?.slice(0, 80) || "—")}
                          {(log.details?.length ?? 0) > 80 && expandedLogId !== log.id ? "…" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="page_naver">
            <div className="total_pages">
              <span>تعداد صفحات {pageCount}</span>
            </div>
            <div className="page_line">
              <img
                src={rightSign}
                className="arrows"
                alt="صفحه قبل"
                onClick={() => pagiPrev && setPage((p) => Math.max(1, p - 1))}
              />
              {lineMaker(pageCount).map((p) => (
                <span
                  key={p}
                  className="page_num"
                  style={page === p + 1 ? { background: "#eee" } : null}
                  onClick={() => setPage(p + 1)}
                >
                  {p + 1}
                </span>
              ))}
              <img
                src={leftSign}
                alt="صفحه بعد"
                className="arrows"
                onClick={() => pagiNext && setPage((p) => Math.min(pageCount, p + 1))}
              />
            </div>
          </div>

          <div className="btn_holder_next_prev aligner">
            <button
              type="button"
              className="btn_submit space-UD"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagiPrev || loading}
            >
              صفحه قبلی
            </button>
            <button
              type="button"
              className="btn_submit space-UD"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={!pagiNext || loading}
            >
              صفحه بعدی
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemLogs;
