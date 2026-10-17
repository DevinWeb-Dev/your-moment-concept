
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/maison-insights.css";

const OPERATIONS_KEY = "your-moment:maison-operations:v1";
const SETTINGS_KEY = "your-moment:maison-insights-settings:v1";
const STAGES = ["New", "In review", "Tentative", "Confirmed", "Completed"];

const MENU = [
  ["overview", "Executive report", "01"],
  ["pipeline", "Pipeline analytics", "02"],
  ["forecast", "Revenue outlook", "03"],
  ["settings", "Studio settings", "04"],
  ["vault", "Data center", "05"],
];

const DEFAULT_SETTINGS = {
  studioName: "MAISON GALA",
  monthlyTarget: 250000,
  defaultRange: "all",
};

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}

function readOperations() {
  const raw = readJSON(OPERATIONS_KEY, {});
  return {
    stages:
      raw.stages && typeof raw.stages === "object" && !Array.isArray(raw.stages)
        ? raw.stages
        : {},
    notes:
      raw.notes && typeof raw.notes === "object" && !Array.isArray(raw.notes)
        ? raw.notes
        : {},
    holds: Array.isArray(raw.holds) ? raw.holds : [],
    tasks:
      raw.tasks && typeof raw.tasks === "object" && !Array.isArray(raw.tasks)
        ? raw.tasks
        : {},
  };
}

function readSettings() {
  const raw = readJSON(SETTINGS_KEY, {});
  return {
    studioName:
      typeof raw.studioName === "string"
        ? raw.studioName
        : DEFAULT_SETTINGS.studioName,
    monthlyTarget:
      Number.isFinite(Number(raw.monthlyTarget)) && Number(raw.monthlyTarget) >= 0
        ? Number(raw.monthlyTarget)
        : DEFAULT_SETTINGS.monthlyTarget,
    defaultRange:
      ["all", "month", "next90"].includes(raw.defaultRange)
        ? raw.defaultRange
        : DEFAULT_SETTINGS.defaultRange,
  };
}

function textValue(value) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (value && typeof value === "object") {
    return String(value.name || value.title || value.label || "");
  }
  return "";
}

function first(...values) {
  return values.map(textValue).find((x) => x.trim()) || "";
}

function dateKey(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function money(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function numeric(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, value) : null;
  }
  if (typeof value !== "string" || !value.trim()) return null;
  const amount = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount) ? Math.max(0, amount) : null;
}

function quoteArray(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== "object") return [];
  for (const key of ["quotes", "proposals", "records", "requests", "bookings"]) {
    if (Array.isArray(parsed[key])) return parsed[key];
  }
  return [];
}

function quoteLike(raw, key) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const form = raw.form || raw.details || raw.event || {};
  const fields = [
    "clientName", "customerName", "fullName", "eventDate",
    "eventType", "venueId", "packageId", "total",
    "estimatedTotal", "guestCount",
  ];
  const matches = fields.filter(
    (name) => raw[name] != null || form[name] != null
  ).length;
  return matches >= (
    /quote|proposal|booking|inquir|request/i.test(key) ? 2 : 3
  );
}

function scanSources() {
  const result = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || key === OPERATIONS_KEY || key === SETTINGS_KEY) continue;
      let value;
      try {
        value = JSON.parse(localStorage.getItem(key));
      } catch {
        continue;
      }
      const rows = quoteArray(value).filter((row) => quoteLike(row, key));
      if (rows.length) result.push({ key, rows });
    }
  } catch {
    // Browser storage unavailable
  }
  return result.sort((a, b) => b.rows.length - a.rows.length);
}

function normalise(raw, index, source, stages) {
  const form = raw.form || raw.details || raw.event || {};
  const client = raw.client || raw.customer || {};
  const identifier = first(
    raw.id, raw.quoteId, raw.reference, raw.quoteNumber, raw.createdAt
  ) || `row-${index}`;
  const rawAmount =
    raw.estimatedTotal ?? raw.grandTotal ?? raw.total ??
    raw.estimate ?? raw.amount ?? form.total;
  const id = `${source}:${identifier}`;

  return {
    id,
    client: first(
      raw.clientName, raw.customerName, raw.fullName,
      form.clientName, form.fullName, form.name, client.name
    ) || "Unnamed inquiry",
    type: first(
      raw.eventType, raw.occasion, form.eventType, form.occasion
    ) || "Private event",
    venue: first(
      raw.venueName, raw.venue, form.venueName,
      form.venue, form.venueId, raw.venueId
    ) || "Not selected",
    date: dateKey(
      raw.eventDate || raw.date || raw.bookingDate ||
      form.eventDate || form.date
    ),
    amount: numeric(rawAmount),
    stage: STAGES.includes(stages[id]) ? stages[id] : "New",
  };
}

function filterByRange(quotes, range) {
  if (range === "all") return quotes;
  const now = new Date();
  const start = dateKey(now);

  if (range === "month") {
    const prefix = start.slice(0, 7);
    return quotes.filter((q) => q.date.startsWith(prefix));
  }

  const later = new Date(
    now.getFullYear(), now.getMonth(), now.getDate() + 90
  );
  const end = dateKey(later);
  return quotes.filter(
    (q) => q.date && q.date >= start && q.date <= end
  );
}

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value) {
  let str = value == null ? "" : String(value);
  if (/^[\s]*[=+@-]/.test(str)) str = `'${str}`;
  return `"${str.replace(/"/g, '""')}"`;
}

function exportCSV(rows) {
  const fields = [
    "Client", "Event", "Event date", "Venue",
    "Workflow stage", "Estimated PHP",
  ];
  const lines = [
    fields,
    ...rows.map((q) => [
      q.client, q.type, q.date, q.venue,
      q.stage, q.amount ?? "",
    ]),
  ];
  download(
    `maison-gala-report-${dateKey(new Date())}.csv`,
    lines.map((line) => line.map(csvCell).join(",")).join("\r\n"),
    "text/csv;charset=utf-8"
  );
}

function percentage(a, b) {
  return b ? Math.round((a / b) * 100) : 0;
}

function shortDate(value) {
  if (!value) return "Unscheduled";
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-PH", {
        month: "short", day: "numeric", year: "numeric",
      });
}

function groupTop(rows, key) {
  const map = new Map();
  rows.forEach((q) => map.set(q[key], (map.get(q[key]) || 0) + 1));
  return [...map].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function makeMonths(quotes) {
  const today = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(
      today.getFullYear(), today.getMonth() + i, 1
    );
    const key =
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const matches = quotes.filter((q) => q.date.startsWith(key));
    return {
      key,
      label: d.toLocaleDateString("en-PH", {
        month: "short", year: "2-digit",
      }),
      count: matches.length,
      total: matches.reduce(
        (sum, q) => sum + (q.amount ?? 0), 0
      ),
      confirmed: matches
        .filter((q) => ["Confirmed", "Completed"].includes(q.stage))
        .reduce((sum, q) => sum + (q.amount ?? 0), 0),
    };
  });
}

function Metric({ label, value, caption, index }) {
  return (
    <article className="mi-metric">
      <span className="mi-overline">{index} / {label}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </article>
  );
}

function Empty({ title, children }) {
  return (
    <div className="mi-empty">
      <div className="mi-empty-mark">✳</div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function Header({ index, kicker, title, italic, description }) {
  return (
    <header className="mi-section-heading">
      <span className="mi-overline">{index} / {kicker}</span>
      <h2>{title} <em>{italic}</em></h2>
      <p>{description}</p>
    </header>
  );
}

function Overview({ quotes, allQuotes, goal, changeTab }) {
  const priced = quotes.filter((q) => q.amount != null);
  const pipeline = priced.reduce(
    (sum, q) => sum + q.amount, 0
  );
  const confirmed = priced
    .filter((q) => ["Confirmed", "Completed"].includes(q.stage))
    .reduce((sum, q) => sum + q.amount, 0);
  const upcoming = quotes
    .filter((q) => q.date && q.date >= dateKey(new Date()))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const confirmedCount = quotes.filter(
    (q) => ["Confirmed", "Completed"].includes(q.stage)
  ).length;

  const month = dateKey(new Date()).slice(0, 7);
  const thisMonth = allQuotes
    .filter(
      (q) =>
        q.date.startsWith(month) &&
        ["Confirmed", "Completed"].includes(q.stage)
    )
    .reduce((sum, q) => sum + (q.amount ?? 0), 0);

  return (
    <div className="mi-stack">
      <div className="mi-hero">
        <div>
          <span className="mi-overline">
            Maison intelligence / internal edition
          </span>
          <h2>Numbers with <em>intention.</em></h2>
          <p>
            Turn each inquiry into a clearer picture of your event
            pipeline, production calendar and potential value.
          </p>
          <button onClick={() => changeTab("pipeline")}>
            Explore the pipeline <span>↗</span>
          </button>
        </div>
        <div className="mi-hero-seal">
          <span>MAISON<br />GALA</span>
          <b>✦</b>
        </div>
      </div>

      <div className="mi-metrics">
        <Metric
          index="01" label="Proposals" value={quotes.length}
          caption="In this report's date filter"
        />
        <Metric
          index="02" label="Pipeline estimate" value={money(pipeline)}
          caption={`${priced.length} proposals include an amount`}
        />
        <Metric
          index="03" label="Marked confirmed" value={confirmedCount}
          caption="Internal status, not a paid booking"
        />
        <Metric
          index="04" label="Confirmed value" value={money(confirmed)}
          caption="Not collected revenue"
        />
      </div>

      <div className="mi-two-cols">
        <article className="mi-surface">
          <div className="mi-card-heading">
            <div>
              <span className="mi-overline">01 / Event diary</span>
              <h3>Dates on the horizon.</h3>
            </div>
            <button onClick={() => changeTab("forecast")}>
              View outlook ↗
            </button>
          </div>
          {upcoming.length ? upcoming.map((q) => (
            <div className="mi-event-row" key={q.id}>
              <span className="mi-date-chip">
                {q.date.slice(8)}
                <small>
                  {new Date(`${q.date}T12:00:00`).toLocaleDateString(
                    "en-PH", { month: "short" }
                  )}
                </small>
              </span>
              <div>
                <strong>{q.client}</strong>
                <small>{q.type} · {q.venue}</small>
              </div>
              <span className="mi-pill">{q.stage}</span>
            </div>
          )) : (
            <Empty title="No dated upcoming events">
              Your eligible proposals will appear here.
            </Empty>
          )}
        </article>

        <article className="mi-feature">
          <span className="mi-overline">02 / Monthly aspiration</span>
          <div
            className="mi-target-ring"
            style={{
              "--progress": `${Math.min(100, percentage(thisMonth, goal))}%`,
            }}
          >
            <span>{percentage(thisMonth, goal)}<small>%</small></span>
          </div>
          <h3>Progress toward the goal</h3>
          <p>
            {money(thisMonth)} of a {money(goal)} monthly target
            in internally confirmed/completed proposal estimates.
            This is not actual sales income.
          </p>
          <button onClick={() => changeTab("settings")}>
            Adjust target ↗
          </button>
        </article>
      </div>
    </div>
  );
}

function Pipeline({ quotes }) {
  const stages = STAGES.map((name) => ({
    name,
    count: quotes.filter((q) => q.stage === name).length,
  }));
  const max = Math.max(1, ...stages.map((x) => x.count));
  const types = groupTop(quotes, "type");
  const venues = groupTop(quotes, "venue");

  return (
    <div className="mi-stack">
      <Header
        index="02"
        kicker="Workflow intelligence"
        title="Pipeline"
        italic="analytics."
        description="Understand what stage every proposal has reached. All statuses are taken from Batch 4's internal annotations."
      />
      <div className="mi-two-cols">
        <article className="mi-surface">
          <div className="mi-card-heading">
            <div>
              <span className="mi-overline">Proposal stages</span>
              <h3>The decision journey.</h3>
            </div>
          </div>
          {stages.map(({ name, count }) => (
            <div className="mi-bar-row" key={name}>
              <div><span>{name}</span><strong>{count}</strong></div>
              <div className="mi-bar-track">
                <span
                  style={{ width: `${percentage(count, max)}%` }}
                />
              </div>
            </div>
          ))}
          <p className="mi-caption">
            {quotes.length
              ? `${percentage(
                  stages[3].count + stages[4].count,
                  quotes.length
                )}% marked confirmed or completed.`
              : "No proposals detected for this date range."}
            {" "}Statuses do not verify deposits or bookings.
          </p>
        </article>

        <article className="mi-surface">
          <span className="mi-overline">Event demand</span>
          <h3>Most requested occasions.</h3>
          {types.length ? types.map(([name, count], i) => (
            <div className="mi-ranking" key={name}>
              <span>0{i + 1}</span><strong>{name}</strong><em>{count}</em>
            </div>
          )) : (
            <Empty title="No occasion data">
              Create event quotes to populate demand trends.
            </Empty>
          )}
          <div className="mi-inner-divider" />
          <span className="mi-overline">Venue interest</span>
          <h3>Popular venues.</h3>
          {venues.length ? venues.map(([name, count], i) => (
            <div className="mi-ranking" key={name}>
              <span>0{i + 1}</span><strong>{name}</strong><em>{count}</em>
            </div>
          )) : (
            <p className="mi-caption">No venues recorded.</p>
          )}
        </article>
      </div>
    </div>
  );
}

function Forecast({ quotes, goal }) {
  const months = makeMonths(quotes);
  const max = Math.max(1, ...months.map((m) => m.total));
  const total = months.reduce((a, b) => a + b.total, 0);
  const confirmed = months.reduce(
    (a, b) => a + b.confirmed, 0
  );

  return (
    <div className="mi-stack">
      <Header
        index="03"
        kicker="Six-month planning horizon"
        title="Revenue"
        italic="outlook."
        description="Estimated proposal value grouped by event month. Future estimates are not payments, invoices, or accounting revenue."
      />
      <div className="mi-metrics mi-metrics--three">
        <Metric
          index="01" label="Six-month opportunity"
          value={money(total)}
          caption="All priced proposals in horizon"
        />
        <Metric
          index="02" label="Confirmed-stage estimates"
          value={money(confirmed)}
          caption="Internal workflow label only"
        />
        <Metric
          index="03" label="Monthly target"
          value={money(goal)}
          caption="Editable in studio settings"
        />
      </div>

      <article className="mi-surface">
        <div className="mi-card-heading">
          <div>
            <span className="mi-overline">Forecast composition</span>
            <h3>The next six months.</h3>
          </div>
          <span className="mi-legend">
            ■ Full estimate &nbsp; ◇ Marked confirmed
          </span>
        </div>
        <div className="mi-chart">
          {months.map((m) => (
            <div className="mi-chart-column" key={m.key}>
              <div className="mi-chart-values">
                <strong>{money(m.total)}</strong>
                <small>
                  {m.count} event{m.count === 1 ? "" : "s"}
                </small>
              </div>
              <div className="mi-chart-track">
                <div
                  className="mi-chart-total"
                  style={{
                    height: `${m.total
                      ? Math.max(3, percentage(m.total, max))
                      : 0}%`,
                  }}
                >
                  <div
                    className="mi-chart-confirmed"
                    style={{
                      height: `${percentage(
                        m.confirmed, m.total
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <span className="mi-chart-label">{m.label}</span>
            </div>
          ))}
        </div>
        <p className="mi-caption">
          The darker segment shows value marked Confirmed or
          Completed, not received payments. Missing quote amounts
          count as zero for charting; undated quotes are excluded.
        </p>
      </article>
    </div>
  );
}

function Settings({ settings, setSettings, setRange, setNotice }) {
  function save(e) {
    e.preventDefault();
    const cleaned = {
      studioName:
        settings.studioName.trim().slice(0, 80) ||
        DEFAULT_SETTINGS.studioName,
      monthlyTarget: Math.max(
        0, Number(settings.monthlyTarget) || 0
      ),
      defaultRange: settings.defaultRange,
    };
    try {
      localStorage.setItem(
        SETTINGS_KEY, JSON.stringify(cleaned)
      );
      setSettings(cleaned);
      setRange(cleaned.defaultRange);
      setNotice("Studio settings saved to this browser.");
    } catch {
      setNotice(
        "Browser storage is unavailable. Settings were not saved."
      );
    }
  }

  return (
    <div className="mi-stack">
      <Header
        index="04"
        kicker="Workspace preferences"
        title="Studio"
        italic="settings."
        description="Keep the analytics workspace tailored to your team. These preferences do not edit event proposals or the original staff dashboard."
      />
      <form className="mi-settings-card" onSubmit={save}>
        <div className="mi-settings-intro">
          <span className="mi-overline">Identity & targets</span>
          <h3>Make it yours.</h3>
          <p>Preferences are stored on this device only.</p>
        </div>
        <div className="mi-form-fields">
          <label>
            <span>Studio name</span>
            <input
              maxLength="80"
              value={settings.studioName}
              onChange={(e) => setSettings({
                ...settings,
                studioName: e.target.value,
              })}
              required
            />
          </label>
          <label>
            <span>Monthly target (PHP)</span>
            <input
              type="number"
              min="0"
              max="999999999"
              step="1000"
              value={settings.monthlyTarget}
              onChange={(e) => setSettings({
                ...settings,
                monthlyTarget: e.target.value,
              })}
              required
            />
          </label>
          <label>
            <span>Default report period</span>
            <select
              value={settings.defaultRange}
              onChange={(e) => setSettings({
                ...settings,
                defaultRange: e.target.value,
              })}
            >
              <option value="all">All proposals</option>
              <option value="month">This event month</option>
              <option value="next90">Next 90 days</option>
            </select>
          </label>
          <button className="mi-primary" type="submit">
            Save studio preferences <span>↗</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function Vault({
  quotes, allQuotes, ops, settings,
  refresh, setNotice, fileRef,
}) {
  const notesCount = Object.keys(ops.notes).length;
  const taskCount = Object.values(ops.tasks).reduce(
    (sum, row) => sum + (Array.isArray(row) ? row.length : 0), 0
  );

  function backup() {
    const payload = {
      schema: "maison-gala-operations-backup-v1",
      exportedAt: new Date().toISOString(),
      settings,
      operations: ops,
    };
    download(
      `maison-gala-operations-backup-${dateKey(new Date())}.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
    setNotice(
      "Operations and settings backup generated. Quotes are not included."
    );
  }

  async function restore(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 2_000_000) {
      setNotice(
        "Backup rejected: maximum supported size is 2 MB."
      );
      return;
    }
    try {
      const data = JSON.parse(await file.text());
      if (
        data.schema !== "maison-gala-operations-backup-v1" ||
        !data.operations ||
        typeof data.operations !== "object" ||
        Array.isArray(data.operations) ||
        !data.settings ||
        typeof data.settings !== "object" ||
        Array.isArray(data.settings) ||
        !data.operations.stages ||
        typeof data.operations.stages !== "object" ||
        Array.isArray(data.operations.stages) ||
        !data.operations.notes ||
        typeof data.operations.notes !== "object" ||
        Array.isArray(data.operations.notes) ||
        !Array.isArray(data.operations.holds) ||
        !data.operations.tasks ||
        typeof data.operations.tasks !== "object" ||
        Array.isArray(data.operations.tasks) ||
        typeof data.settings.studioName !== "string" ||
        !["all", "month", "next90"].includes(
          data.settings.defaultRange
        ) ||
        !Number.isFinite(Number(data.settings.monthlyTarget)) ||
        Number(data.settings.monthlyTarget) < 0 ||
        data.operations.holds.length > 1000 ||
        Object.keys(data.operations.tasks).length > 1000
      ) {
        throw Error("Unsupported or invalid backup structure.");
      }

      if (!window.confirm(
        "Replace this browser's Batch 4 notes, holds, tasks and Batch 5 settings from the backup? Existing quotations will NOT be changed."
      )) return;

      const cleanedSettings = {
        studioName: data.settings.studioName.slice(0, 80),
        monthlyTarget: Math.min(
          Number(data.settings.monthlyTarget), 999999999
        ),
        defaultRange: data.settings.defaultRange,
      };

      // Only Batch 4 operations and Batch 5 settings are written.
      localStorage.setItem(
        OPERATIONS_KEY, JSON.stringify(data.operations)
      );
      localStorage.setItem(
        SETTINGS_KEY, JSON.stringify(cleanedSettings)
      );
      refresh();
      setNotice(
        "Backup restored. Operations and settings refreshed."
      );
    } catch (error) {
      setNotice(
        `Unable to restore backup: ${error.message}`
      );
    }
  }

  return (
    <div className="mi-stack">
      <Header
        index="05"
        kicker="Exports & recoverability"
        title="Data"
        italic="center."
        description="Download reports or back up your internal operations. Original quotation storage is never written to by this module."
      />
      <div className="mi-vault-grid">
        <article className="mi-vault-card">
          <span className="mi-vault-icon">↗</span>
          <span className="mi-overline">01 / Spreadsheet export</span>
          <h3>Proposal report.</h3>
          <p>
            Export the currently filtered proposal rows as a CSV
            that opens in Excel or Google Sheets.
          </p>
          <div className="mi-vault-meta">
            {quotes.length} filtered records
          </div>
          <button
            className="mi-primary"
            disabled={!quotes.length}
            onClick={() => exportCSV(quotes)}
          >
            Export CSV <span>↗</span>
          </button>
        </article>

        <article className="mi-vault-card">
          <span className="mi-vault-icon">↓</span>
          <span className="mi-overline">02 / Operations backup</span>
          <h3>Preserve the details.</h3>
          <p>
            Save Batch 4 notes, venue holds, task lists and
            Batch 5 preferences as JSON. Quotations are not included.
          </p>
          <div className="mi-vault-meta">
            {notesCount} notes · {ops.holds.length} holds · {taskCount} tasks
          </div>
          <button className="mi-primary" onClick={backup}>
            Export backup <span>↓</span>
          </button>
        </article>

        <article className="mi-vault-card">
          <span className="mi-vault-icon">↺</span>
          <span className="mi-overline">03 / Restore backup</span>
          <h3>Return to a version.</h3>
          <p>
            Restore a previously exported operations backup.
            This replaces the browser's current annotations and
            settings, not quotations.
          </p>
          <div className="mi-vault-meta">
            {allQuotes.length} quote records remain read-only
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="mi-visually-hidden"
            aria-label="Choose operations backup"
            onChange={restore}
          />
          <button
            className="mi-secondary"
            onClick={() => fileRef.current?.click()}
          >
            Choose JSON backup <span>↺</span>
          </button>
        </article>
      </div>
      <div className="mi-warning">
        <strong>Local-browser prototype.</strong> Storage and client
        information are not securely synchronized across devices.
        Backups may contain private event details. Keep them protected;
        do not publish an unprotected staff route.
      </div>
    </div>
  );
}

export default function MaisonInsightsCenter({ embedded = false }) {
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState("overview");
  const [ops, setOps] = useState(readOperations);
  const [settings, setSettings] = useState(readSettings);
  const [range, setRange] = useState(
    () => readSettings().defaultRange
  );
  const [source, setSource] = useState("");
  const [notice, setNotice] = useState("");
  const fileRef = useRef(null);

  function refresh() {
    setOps(readOperations());
    setSettings(readSettings());
    setTick((i) => i + 1);
  }

  useEffect(() => {
    const listener = () => refresh();
    window.addEventListener("focus", listener);
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener("focus", listener);
      window.removeEventListener("storage", listener);
    };
  }, []);

  const sources = useMemo(() => scanSources(), [tick]);

  const activeSource = sources.some((x) => x.key === source)
    ? source
    : sources[0]?.key || "";

  const allQuotes = useMemo(
    () =>
      (sources.find((x) => x.key === activeSource)?.rows || [])
        .map((raw, i) => normalise(
          raw, i, activeSource, ops.stages
        )),
    [sources, activeSource, ops.stages]
  );

  const quotes = useMemo(
    () => filterByRange(allQuotes, range),
    [allQuotes, range]
  );

  const selected = MENU.find(([key]) => key === tab);
  const unscheduled = allQuotes.filter((q) => !q.date).length;

  return (
    <div className={embedded ? "mi-root mi-root--embedded" : "mi-root"}>
      <div className="mi-shell">
        <aside className="mi-sidebar">
          <Link to="/staff" className="mi-brand">
            <span className="mi-brand-icon">M✦G</span>
            <span>
              <strong>{settings.studioName || "MAISON GALA"}</strong>
              <small>INTELLIGENCE STUDIO</small>
            </span>
          </Link>
          <span className="mi-sidebar-label">
            INSIGHTS / NAVIGATION
          </span>
          <nav aria-label="Insight sections" className="mi-menu">
            {MENU.map(([key, label, number]) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  setNotice("");
                }}
                className={tab === key ? "is-active" : ""}
              >
                <span>{number}</span>{label}<b>↗</b>
              </button>
            ))}
          </nav>
          <div className="mi-sidebar-bottom">
            <span>THE ART OF INTELLIGENCE</span>
            <p>Considered numbers.<br />Better decisions.</p>
            <Link to="/staff">← Back to staff operations</Link>
            <Link to="/">← Back to website</Link>
          </div>
        </aside>

        <div className="mi-main">
          <div className="mi-topbar">
            <span>
              MAISON GALA <i>/</i> {selected?.[1].toUpperCase()}
            </span>
            <span className="mi-topbar-tag">
              LOCAL DATA · NOT ACCOUNTING
            </span>
          </div>

          <main className="mi-content">
            <div className="mi-controls">
              <div>
                <span className="mi-overline">
                  Source / refresh
                </span>
                <select
                  aria-label="Select quote source"
                  value={activeSource}
                  onChange={(e) => setSource(e.target.value)}
                  disabled={!sources.length}
                >
                  {sources.length
                    ? sources.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.key} ({s.rows.length})
                        </option>
                      ))
                    : <option value="">
                        No quote records detected
                      </option>}
                </select>
              </div>
              <div>
                <span className="mi-overline">Report period</span>
                <select
                  aria-label="Report period"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                >
                  <option value="all">All proposals</option>
                  <option value="month">This event month</option>
                  <option value="next90">Next 90 days</option>
                </select>
              </div>
              <button className="mi-refresh" onClick={refresh}>
                ↻ Refresh data
              </button>
            </div>

            {notice && (
              <div role="status" className="mi-notice">
                {notice}
                <button
                  onClick={() => setNotice("")}
                  aria-label="Dismiss notice"
                >
                  ×
                </button>
              </div>
            )}

            {!sources.length &&
              tab !== "settings" &&
              tab !== "vault" && (
                <div className="mi-info">
                  No compatible saved quote array was found in this
                  browser. The charts will remain empty until the
                  existing quotation app saves records.{" "}
                  <Link to="/planner">Open planner ↗</Link>
                </div>
              )}

            {unscheduled > 0 &&
              ["overview", "forecast"].includes(tab) && (
                <div className="mi-info">
                  {unscheduled} proposal
                  {unscheduled === 1 ? " has" : "s have"} no event date.
                  Date-filtered reports and forecast charts may exclude them.
                </div>
              )}

            {tab === "overview" && (
              <Overview
                quotes={quotes}
                allQuotes={allQuotes}
                goal={Number(settings.monthlyTarget) || 0}
                changeTab={setTab}
              />
            )}
            {tab === "pipeline" && (
              <Pipeline quotes={quotes} />
            )}
            {tab === "forecast" && (
              <Forecast
                quotes={quotes}
                goal={Number(settings.monthlyTarget) || 0}
              />
            )}
            {tab === "settings" && (
              <Settings
                settings={settings}
                setSettings={setSettings}
                setRange={setRange}
                setNotice={setNotice}
              />
            )}
            {tab === "vault" && (
              <Vault
                quotes={quotes}
                allQuotes={allQuotes}
                ops={ops}
                settings={settings}
                refresh={refresh}
                setNotice={setNotice}
                fileRef={fileRef}
              />
            )}

            <footer className="mi-footer">
              MAISON GALA / OPERATIONS INTELLIGENCE
              <span>
                Read-only proposals · Separate workspace settings ·
                Browser-local storage
              </span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
