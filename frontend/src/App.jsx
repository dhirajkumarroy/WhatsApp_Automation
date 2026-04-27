import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Login from "./Login.jsx";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

const TOKEN_STORAGE_KEY = "sf_token";
const STATUS_FILTERS = ["all", "new", "contacted", "converted"];

const STATUS_STYLES = {
  new: "bg-amber-50 text-amber-800 ring-amber-200",
  contacted: "bg-sky-50 text-sky-800 ring-sky-200",
  converted: "bg-emerald-50 text-emerald-800 ring-emerald-200"
};

const INTENT_STYLES = {
  automation: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  hire: "bg-slate-100 text-slate-700 ring-slate-200"
};

function formatRelativeTime(value) {
  if (!value) return "Just now";

  const date = new Date(value);
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(value) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function sanitizePhone(phone = "") {
  return String(phone).replace(/\D/g, "");
}

function getLeadInitials(phone = "") {
  return String(phone).slice(-2) || "LD";
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeLead, setActiveLead] = useState(null);
  const [savingId, setSavingId] = useState("");
  const [toast, setToast] = useState("");

  const deferredSearch = useDeferredValue(search);

  const handleLogout = (message = "") => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken("");
    setLeads([]);
    setLoading(false);
    setRefreshing(false);
    setError(message);
    setSearch("");
    setStatusFilter("all");
    setActiveLead(null);
    setSavingId("");
    setToast("");
  };

  const handleLogin = (nextToken) => {
    setError("");
    setToken(nextToken);
  };

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (config.headers?.Authorization) {
        delete config.headers.Authorization;
      }

      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (err) => {
        if (err.response?.status === 401) {
          handleLogout("Your session expired. Please sign in again.");
        }

        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const fetchLeads = useCallback(async ({ silent = false } = {}) => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError("");

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get("/leads");
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      const status = err.response?.status;
      setError(
        status === 401
          ? "Your session expired. Please sign in again."
          : status
          ? `Backend request failed with status ${status}.`
          : "Could not connect to the backend. Make sure the API server is running on port 5000."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      setError("");
      setSavingId(id);
      await api.put(`/leads/${id}`, { status });

      setLeads((current) =>
        current.map((lead) =>
          lead._id === id ? { ...lead, status } : lead
        )
      );

      setActiveLead((current) =>
        current && current._id === id ? { ...current, status } : current
      );

      setToast(`Lead marked as ${status}.`);
    } catch (err) {
      console.error("Failed to update lead status:", err);
      const responseStatus = err.response?.status;
      setError(
        responseStatus === 401
          ? "Your session expired. Please sign in again."
          : responseStatus
          ? `Lead update failed with status ${responseStatus}.`
          : "Could not update the lead status."
      );
    } finally {
      setSavingId("");
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetchLeads();
  }, [fetchLeads, token]);

  const filteredLeads = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return [...leads]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .filter((lead) => {
        const matchesStatus =
          statusFilter === "all" || lead.status === statusFilter;

        if (!matchesStatus) return false;
        if (!query) return true;

        const haystack =
          `${lead.phone || ""} ${lead.message || ""} ${lead.intent || ""} ${lead.status || ""}`
            .toLowerCase();

        return haystack.includes(query);
      });
  }, [deferredSearch, leads, statusFilter]);

  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((lead) => lead.status === "new").length;
    const contactedCount = leads.filter(
      (lead) => lead.status === "contacted"
    ).length;
    const convertedCount = leads.filter(
      (lead) => lead.status === "converted"
    ).length;

    return {
      total,
      newCount,
      contactedCount,
      convertedCount,
      conversionRate: total
        ? Math.round((convertedCount / total) * 100)
        : 0
    };
  }, [leads]);

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#111827_58%,#172554_100%)] px-6 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_32%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                Lead Operations
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                ScaleForge Lead Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Review fresh WhatsApp enquiries, prioritize responses, and move
                promising conversations toward conversion without losing context.
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <button
                onClick={() => handleLogout()}
                className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 lg:self-end"
              >
                <LogoutIcon className="h-4 w-4" />
                Logout
              </button>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <QuickStat
                  label="New"
                  value={metrics.newCount}
                  tone="amber"
                />
                <QuickStat
                  label="Contacted"
                  value={metrics.contactedCount}
                  tone="sky"
                />
                <QuickStat
                  label="Converted"
                  value={metrics.convertedCount}
                  tone="emerald"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Leads"
            value={metrics.total}
            subtitle="All captured conversations"
            accent="slate"
            icon={<UsersIcon className="h-5 w-5" />}
          />
          <MetricCard
            title="Needs Attention"
            value={metrics.newCount}
            subtitle="Fresh enquiries waiting"
            accent="amber"
            icon={<SparkIcon className="h-5 w-5" />}
          />
          <MetricCard
            title="In Progress"
            value={metrics.contactedCount}
            subtitle="Already in follow-up"
            accent="sky"
            icon={<ChatIcon className="h-5 w-5" />}
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.conversionRate}%`}
            subtitle={`${metrics.convertedCount} leads converted`}
            accent="emerald"
            icon={<TrendIcon className="h-5 w-5" />}
          />
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_50px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Lead Pipeline
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search, filter, and update your incoming WhatsApp leads.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search phone, message, or intent"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white sm:w-80"
                  />
                </div>

                <button
                  onClick={() => fetchLeads({ silent: true })}
                  disabled={loading || refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <RefreshIcon
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "Refreshing" : "Refresh"}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                    statusFilter === filter
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-6 py-4">Lead</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Intent</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Received</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading &&
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-t border-slate-100">
                      <td className="px-6 py-5">
                        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="ml-auto h-9 w-36 animate-pulse rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))}

                {!loading && filteredLeads.length === 0 && (
                  <tr className="border-t border-slate-100">
                    <td className="px-6 py-16 text-center" colSpan="6">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                          <InboxIcon className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900">
                          No leads found
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Try adjusting your search or filter, or wait for new
                          WhatsApp enquiries to come in.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                      onClick={() => setActiveLead(lead)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                            {getLeadInitials(lead.phone)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {lead.phone}
                            </div>
                            <div className="text-xs text-slate-500">
                              {lead.name || "Unnamed lead"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="max-w-md truncate text-sm text-slate-600">
                          {lead.message || "No message provided"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <IntentBadge intent={lead.intent} />
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={lead.status} />
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatRelativeTime(lead.createdAt)}
                      </td>

                      <td
                        className="px-6 py-5"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateStatus(lead._id, "contacted")}
                            disabled={
                              savingId === lead._id ||
                              lead.status === "contacted" ||
                              lead.status === "converted"
                            }
                            className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingId === lead._id ? "Saving..." : "Contacted"}
                          </button>
                          <button
                            onClick={() => updateStatus(lead._id, "converted")}
                            disabled={
                              savingId === lead._id ||
                              lead.status === "converted"
                            }
                            className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingId === lead._id ? "Saving..." : "Converted"}
                          </button>
                          <a
                            href={`https://wa.me/${sanitizePhone(lead.phone)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredLeads.length} of {leads.length} leads
            </span>
            <span>Updated for live WhatsApp follow-up workflow</span>
          </div>
        </section>
      </div>

      {activeLead && (
        <LeadDrawer
          lead={activeLead}
          saving={savingId === activeLead._id}
          onClose={() => setActiveLead(null)}
          onStatusChange={updateStatus}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function QuickStat({ label, value, tone }) {
  const tones = {
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    sky: "border-sky-400/20 bg-sky-400/10 text-sky-100",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 backdrop-blur ${tones[tone]}`}
    >
      <div className="text-xs uppercase tracking-[0.16em] opacity-70">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, accent }) {
  const accents = {
    slate: "bg-slate-900 text-white shadow-slate-300/40",
    amber: "bg-amber-500 text-white shadow-amber-300/40",
    sky: "bg-sky-500 text-white shadow-sky-300/40",
    emerald: "bg-emerald-500 text-white shadow-emerald-300/40"
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div
          className={`rounded-2xl p-3 shadow-lg ${accents[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

function IntentBadge({ intent }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
        INTENT_STYLES[intent] || "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {intent || "general"}
    </span>
  );
}

function LeadDrawer({ lead, saving, onClose, onStatusChange }) {
  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Lead Details
            </div>
            <h3 className="mt-2 text-2xl font-black text-slate-900">
              {lead.phone}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Received {formatDate(lead.createdAt)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard label="Intent">
              <IntentBadge intent={lead.intent} />
            </InfoCard>
            <InfoCard label="Status">
              <StatusBadge status={lead.status} />
            </InfoCard>
          </div>

          <InfoCard label="Message">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {lead.message || "No message was provided by this lead."}
            </p>
          </InfoCard>

          <InfoCard label="Source">
            <p className="text-sm font-semibold capitalize text-slate-700">
              {lead.source || "Unknown"}
            </p>
          </InfoCard>
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => onStatusChange(lead._id, "contacted")}
              disabled={
                saving || lead.status === "contacted" || lead.status === "converted"
              }
              className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Mark Contacted"}
            </button>

            <button
              onClick={() => onStatusChange(lead._id, "converted")}
              disabled={saving || lead.status === "converted"}
              className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Mark Converted"}
            </button>

            <a
              href={`https://wa.me/${sanitizePhone(lead.phone)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open WhatsApp
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

function InfoCard({ label, children }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M4 4v5h5M20 20v-5h-5M19 9a7 7 0 00-12-3M5 15a7 7 0 0012 3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 12H9.75M15 9l3 3-3 3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M6 6l12 12M18 6L6 18"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87M10 7a4 4 0 110 8 4 4 0 010-8z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M3 17l6-6 4 4 7-8M14 7h6v6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InboxIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M3 13h4l2 3h6l2-3h4M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
