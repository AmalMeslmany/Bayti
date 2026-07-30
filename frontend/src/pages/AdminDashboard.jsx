import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  deleteAdminProperty,
  deleteAdminUser,
  deleteContactMessage,
  dismissReport,
  fetchAdminProperties,
  fetchAdminSummary,
  fetchAdminUsers,
  fetchContactMessages,
  fetchReports,
  setAdminPropertyVisibility,
  updateAdminUser,
  updateContactMessage,
} from "../api/admin";
import { useAuth } from "../context/useAuth";
import "./Dashboard.css";
import "./AdminDashboard.css";

const tabs = ["properties", "users", "messages", "reports"];

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function AdminDashboard() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("properties");
  const [summary, setSummary] = useState(null);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ search: "", owner: "", city: "", status: "" });
  const [userSearch, setUserSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const stats = useMemo(() => summary?.stats || {}, [summary]);

  async function loadAdminData() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [summaryData, propertyData, userData, messageData, reportData] =
        await Promise.all([
          fetchAdminSummary(token),
          fetchAdminProperties(token, filters),
          fetchAdminUsers(token, userSearch),
          fetchContactMessages(token),
          fetchReports(token),
        ]);

      setSummary(summaryData);
      setProperties(propertyData);
      setUsers(userData);
      setMessages(messageData);
      setReports(reportData);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(loadAdminData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function refreshProperties() {
    setProperties(await fetchAdminProperties(token, filters));
    setSummary(await fetchAdminSummary(token));
  }

  async function handlePropertyVisibility(propertyId, isHidden) {
    await setAdminPropertyVisibility(token, propertyId, isHidden);
    await refreshProperties();
  }

  async function handlePropertyDelete(propertyId) {
    if (!window.confirm(t("admin.confirmDeleteProperty"))) return;
    await deleteAdminProperty(token, propertyId);
    await refreshProperties();
  }

  async function handleUserUpdate(userId, body) {
    await updateAdminUser(token, userId, body);
    setUsers(await fetchAdminUsers(token, userSearch));
    setSummary(await fetchAdminSummary(token));
  }

  async function handleUserDelete(userId) {
    if (!window.confirm(t("admin.confirmDeleteUser"))) return;
    await deleteAdminUser(token, userId);
    setUsers(await fetchAdminUsers(token, userSearch));
    setSummary(await fetchAdminSummary(token));
  }

  async function handleMessageRead(messageId, isRead) {
    await updateContactMessage(token, messageId, isRead);
    setMessages(await fetchContactMessages(token));
  }

  async function handleMessageDelete(messageId) {
    if (!window.confirm(t("admin.confirmDeleteMessage"))) return;
    await deleteContactMessage(token, messageId);
    setMessages(await fetchContactMessages(token));
    setSummary(await fetchAdminSummary(token));
  }

  async function handleDismissReport(reportId) {
    await dismissReport(token, reportId);
    setReports(await fetchReports(token));
  }

  async function handleReportHide(propertyId) {
    if (!propertyId) return;
    await setAdminPropertyVisibility(token, propertyId, true);
    setReports(await fetchReports(token));
    await refreshProperties();
  }

  return (
    <main className="dashboard-page admin-page">
      <section className="dashboard-welcome">
        <p className="dashboard-eyebrow">{t("admin.eyebrow")}</p>
        <h1>{t("admin.title")}</h1>
        <p>{t("admin.subtitle")}</p>
      </section>

      {errorMessage ? <p className="dashboard-empty">{errorMessage}</p> : null}

      <section className="dashboard-summary admin-summary">
        {[
          ["totalUsers", t("admin.totalUsers")],
          ["totalProperties", t("admin.totalProperties")],
          ["totalFavorites", t("admin.totalFavorites")],
          ["totalContactMessages", t("admin.totalContactMessages")],
          ["hiddenProperties", t("admin.hiddenProperties")],
          ["activeProperties", t("admin.activeProperties")],
        ].map(([key, label]) => (
          <article className="dashboard-summary-card" key={key}>
            <span>{label}</span>
            <strong>{stats[key] ?? 0}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-section admin-latest">
        <div>
          <h2>{t("admin.latestUsers")}</h2>
          {(summary?.latestUsers || []).map((user) => (
            <p key={user._id}>{user.firstName} {user.lastName} - {user.email}</p>
          ))}
        </div>
        <div>
          <h2>{t("admin.latestProperties")}</h2>
          {(summary?.latestProperties || []).map((property) => (
            <p key={property.id}>{property.title} - {property.location}</p>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab ? "admin-tab-active" : ""}
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {t(`admin.tabs.${tab}`)}
            </button>
          ))}
        </div>

        {isLoading ? <p className="dashboard-empty">{t("admin.loading")}</p> : null}

        {!isLoading && activeTab === "properties" ? (
          <div className="admin-panel">
            <div className="admin-filters">
              <input placeholder={t("admin.searchProperties")} value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
              <input placeholder={t("admin.ownerNameOrEmail")} value={filters.owner} onChange={(event) => setFilters({ ...filters, owner: event.target.value })} />
              <input placeholder={t("admin.city")} value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })} />
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option value="">{t("admin.allStatuses")}</option>
                <option value="active">{t("admin.active")}</option>
                <option value="hidden">{t("admin.hidden")}</option>
              </select>
              <button type="button" onClick={refreshProperties}>{t("admin.apply")}</button>
            </div>
            <div className="admin-table">
              {properties.map((property) => (
                <article className="admin-row" key={property.id}>
                  <div>
                    <strong>{property.title}</strong>
                    <span>
                      {property.location} - {property.owner?.firstName} {property.owner?.lastName}
                      {property.owner?.email ? ` - ${property.owner.email}` : ""}
                    </span>
                    <span>{t("admin.created")}: {formatDate(property.createdAt)} | {t("admin.updated")}: {formatDate(property.updatedAt)}</span>
                  </div>
                  <div className="admin-actions">
                    <Link to={`/properties/${property.id}`}>{t("admin.view")}</Link>
                    <Link to={`/properties/${property.id}/edit`}>{t("admin.edit")}</Link>
                    <button type="button" onClick={() => handlePropertyVisibility(property.id, !property.isHidden)}>
                      {property.isHidden ? t("admin.unhide") : t("admin.hide")}
                    </button>
                    <button type="button" onClick={() => handlePropertyDelete(property.id)}>{t("admin.delete")}</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {!isLoading && activeTab === "users" ? (
          <div className="admin-panel">
            <div className="admin-filters">
              <input placeholder={t("admin.searchUsers")} value={userSearch} onChange={(event) => setUserSearch(event.target.value)} />
              <button type="button" onClick={async () => setUsers(await fetchAdminUsers(token, userSearch))}>{t("admin.apply")}</button>
            </div>
            {users.map((user) => (
              <article className="admin-row" key={user._id}>
                <div>
                  <strong>{user.firstName} {user.lastName}</strong>
                  <span>{user.email} - {user.role} - {formatDate(user.createdAt)}</span>
                  <span>{t("admin.propertyCount")}: {user.propertyCount}</span>
                </div>
                <div className="admin-actions">
                  <button type="button" onClick={() => handleUserUpdate(user._id, { role: user.role === "admin" ? "user" : "admin" })}>
                    {user.role === "admin" ? t("admin.removeAdmin") : t("admin.makeAdmin")}
                  </button>
                  <button type="button" onClick={() => handleUserUpdate(user._id, { isDisabled: !user.isDisabled })}>
                    {user.isDisabled ? t("admin.enable") : t("admin.disable")}
                  </button>
                  <button type="button" onClick={() => handleUserDelete(user._id)}>{t("admin.delete")}</button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!isLoading && activeTab === "messages" ? (
          <div className="admin-panel">
            {messages.map((message) => (
              <article className="admin-row" key={message._id}>
                <div>
                  <strong>{message.name} - {message.email}</strong>
                  <span>{message.subject} - {formatDate(message.createdAt)}</span>
                  <p>{message.message}</p>
                </div>
                <div className="admin-actions">
                  <button type="button" onClick={() => handleMessageRead(message._id, !message.isRead)}>
                    {message.isRead ? t("admin.markUnread") : t("admin.markRead")}
                  </button>
                  <button type="button" onClick={() => handleMessageDelete(message._id)}>{t("admin.delete")}</button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!isLoading && activeTab === "reports" ? (
          <div className="admin-panel">
            {reports.map((report) => (
              <article className="admin-row" key={report._id}>
                <div>
                  <strong>{report.reason} - {report.property?.title || t("admin.deletedProperty")}</strong>
                  <span>{report.status} - {formatDate(report.createdAt)}</span>
                  <p>{report.details}</p>
                </div>
                <div className="admin-actions">
                  <button type="button" onClick={() => handleDismissReport(report._id)}>{t("admin.dismiss")}</button>
                  <button type="button" onClick={() => handleReportHide(report.property?._id)}>{t("admin.hideProperty")}</button>
                  {report.property?._id ? (
                    <button type="button" onClick={() => handlePropertyDelete(report.property._id)}>{t("admin.deleteProperty")}</button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default AdminDashboard;
