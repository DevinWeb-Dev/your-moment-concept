
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/maison-operations.css";
import MaisonClientExperience from "./MaisonClientExperience.jsx";
import MaisonInsightsCenter from "./MaisonInsightsCenter.jsx";

const STORE_KEY = "your-moment:maison-operations:v1";
const STAGES = ["New", "In review", "Tentative", "Confirmed", "Completed"];
const TABS = [
  ["overview", "Command center", "01"],
  ["proposals", "Proposal desk", "02"],
  ["schedule", "Venue schedule", "03"],
  ["runsheet", "Run of show", "04"],
  ["insights", "Reports & Data Center", "05"],
  ["experience", "Client Experience", "06"],
  ["original", "Classic workspace", "↗"],
];
const EMPTY_STORE = { stages: {}, notes: {}, holds: [], tasks: {} };

function getStore() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (!data || typeof data !== "object") return EMPTY_STORE;
    return {
      stages: data.stages && typeof data.stages === "object" ? data.stages : {},
      notes: data.notes && typeof data.notes === "object" ? data.notes : {},
      holds: Array.isArray(data.holds) ? data.holds : [],
      tasks: data.tasks && typeof data.tasks === "object" ? data.tasks : {},
    };
  } catch {
    return EMPTY_STORE;
  }
}

function useOfficeStore() {
  const [store, setStore] = useState(getStore);
  function update(updater) {
    setStore((previous) => {
      const next = updater(previous);
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        /* private mode */
      }
      return next;
    });
  }
  useEffect(() => {
    const sync = (event) => {
      if (event.key === STORE_KEY) setStore(getStore());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return [store, update];
}

function textValue(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object") return String(value.name || value.title || value.label || "");
  return "";
}

function first(...values) {
  return values.map(textValue).find((item) => item.trim()) || "";
}

function dateKey(value) {
  if (!value) return "";
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
}

function prettyDate(value) {
  if (!value) return "Date not assigned";
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function peso(value) {
  const numeric = typeof value === "number"
    ? value
    : Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) && value !== "" && value != null
    ? new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
      }).format(numeric)
    : "No estimate";
}

function extractArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of ["quotes", "proposals", "records", "requests", "bookings"]) {
    if (Array.isArray(value[key])) return value[key];
  }
  return [];
}

function looksLikeQuote(record, storageKey) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return false;
  const form = record.form || record.details || record.event || {};
  const names = [
    "clientName", "customerName", "fullName", "eventDate",
    "eventType", "venueId", "packageId", "total",
    "estimatedTotal", "guestCount",
  ];
  const hits = names.filter(
    (key) => record[key] != null || form[key] != null
  ).length;
  return hits >= (/quote|proposal|booking|inquir|request/i.test(storageKey) ? 2 : 3);
}

function scanQuoteSources() {
  try {
    const sources = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || key === STORE_KEY) continue;
      let parsed;
      try {
        parsed = JSON.parse(localStorage.getItem(key));
      } catch {
        continue;
      }
      const all = extractArray(parsed);
      const matching = all.filter((item) => looksLikeQuote(item, key));
      if (matching.length) {
        sources.push({ key, count: matching.length, entries: matching });
      }
    }
    return sources.sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

function normaliseQuote(raw, index, sourceKey) {
  const form = raw.form || raw.details || raw.event || {};
  const client = raw.client || raw.customer || {};
  const identifier = first(
    raw.id, raw.quoteId, raw.reference, raw.quoteNumber, raw.createdAt
  ) || `row-${index}`;
  const amount = raw.estimatedTotal ?? raw.grandTotal ?? raw.total
    ?? raw.estimate ?? raw.amount ?? form.total;
  return {
    id: `${sourceKey}:${identifier}`,
    ref: first(raw.reference, raw.quoteNumber, raw.id) || `#${index + 1}`,
    name: first(
      raw.clientName, raw.customerName, raw.fullName,
      form.clientName, form.fullName, form.name, client.name
    ) || "Unnamed inquiry",
    type: first(raw.eventType, raw.occasion, form.eventType, form.occasion) || "Private event",
    date: dateKey(raw.eventDate || raw.date || raw.bookingDate || form.eventDate || form.date),
    venue: first(
      raw.venueName, raw.venue, form.venueName,
      form.venue, form.venueId, raw.venueId
    ) || "Venue to be decided",
    guests: first(raw.guestCount, raw.guests, form.guestCount, form.guests) || "—",
    amount,
  };
}

function todayKey() {
  return dateKey(new Date());
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function initials(name) {
  return name.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase() || "MG";
}

function Empty({ title, children }) {
  return (
    <div className="mo-empty">
      <span className="mo-empty__symbol">✳</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function Stat({ eyebrow, value, detail, symbol }) {
  return (
    <article className="mo-stat">
      <span className="mo-stat__symbol">{symbol}</span>
      <span className="mo-eyebrow">{eyebrow}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function Overview({ quotes, store, setView }) {
  const upcoming = quotes
    .filter((q) => q.date && q.date >= todayKey())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);
  const confirmed = quotes.filter(
    (q) => store.stages[q.id] === "Confirmed"
  ).length;
  const pending = quotes.filter(
    (q) => !["Confirmed", "Completed"].includes(store.stages[q.id] || "New")
  ).length;
  const openTasks = Object.values(store.tasks)
    .flat()
    .filter((t) => !t.done).length;

  return (
    <div className="mo-panel-stack">
      <div className="mo-intro">
        <div>
          <span className="mo-eyebrow">The operational edit / 2026</span>
          <h2>Beautiful events.<br /><em>Quietly orchestrated.</em></h2>
          <p>One intentional place to review proposals, protect venue dates and choreograph the finer details.</p>
          <button className="mo-button" onClick={() => setView("proposals")}>
            Enter proposal desk <span>↗</span>
          </button>
        </div>
        <div className="mo-intro__orbit">
          <span>MAISON<br />GALA</span>
          <i>✦</i>
        </div>
      </div>

      <section className="mo-stats" aria-label="Operations summary">
        <Stat eyebrow="Connected proposals" value={quotes.length} detail="Read from existing local records" symbol="01" />
        <Stat eyebrow="Awaiting a decision" value={pending} detail="Based on internal stages" symbol="02" />
        <Stat eyebrow="Marked confirmed" value={confirmed} detail="Operations annotations only" symbol="03" />
        <Stat eyebrow="Open run-sheet steps" value={openTasks} detail="Across your saved events" symbol="04" />
      </section>

      <div className="mo-overview-grid">
        <article className="mo-surface">
          <div className="mo-section-head">
            <div>
              <span className="mo-eyebrow">01 / In the diary</span>
              <h3>Upcoming occasions</h3>
            </div>
            <button className="mo-text-button" onClick={() => setView("schedule")}>
              Open calendar ↗
            </button>
          </div>
          {upcoming.length ? upcoming.map((q) => (
            <div className="mo-upcoming" key={q.id}>
              <div className="mo-date-tile">
                <strong>{q.date.slice(8)}</strong>
                <span>
                  {new Date(`${q.date}T12:00:00`).toLocaleDateString("en-PH", { month: "short" })}
                </span>
              </div>
              <div>
                <strong>{q.name}</strong>
                <small>{q.type} · {q.venue}</small>
              </div>
              <span className="mo-stage">{store.stages[q.id] || "New"}</span>
            </div>
          )) : (
            <Empty title="Nothing on the diary yet">
              Dated proposals will appear here once they exist in your existing quote records.
            </Empty>
          )}
        </article>

        <article className="mo-editorial">
          <span className="mo-eyebrow">02 / The atelier method</span>
          <div className="mo-editorial__flower">✺</div>
          <h3>Every detail has a moment.</h3>
          <p>Build a confident flow from first inquiry to the final cue. Notes, venue holds and run sheets stay saved in this browser.</p>
          <button className="mo-button mo-button--light" onClick={() => setView("runsheet")}>
            Compose a run sheet ↗
          </button>
        </article>
      </div>
    </div>
  );
}

function Proposals({ quotes, store, update }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("");

  const filtered = quotes.filter((q) => {
    const label = `${q.name} ${q.type} ${q.venue} ${q.ref}`.toLowerCase();
    return label.includes(search.toLowerCase())
      && (filter === "All" || (store.stages[q.id] || "New") === filter);
  });
  const selected = filtered.find((q) => q.id === selectedId) || filtered[0];
  const setStage = (id, stage) => update((s) => ({
    ...s,
    stages: { ...s.stages, [id]: stage },
  }));
  const setNote = (id, note) => update((s) => ({
    ...s,
    notes: { ...s.notes, [id]: note },
  }));

  return (
    <section className="mo-panel-stack">
      <div className="mo-page-head">
        <div>
          <span className="mo-eyebrow">02 / Clients & conversations</span>
          <h2>Proposal <em>desk.</em></h2>
          <p>Read your existing inquiries. Track internal stages and working notes without rewriting the quotation database.</p>
        </div>
        <Link className="mo-button" to="/planner">New inquiry ↗</Link>
      </div>

      <div className="mo-toolbar">
        <input
          type="search"
          aria-label="Find proposals"
          placeholder="Search client, venue or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Filter proposals" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {["All", ...STAGES].map((x) => <option key={x}>{x}</option>)}
        </select>
        <span>{filtered.length} records</span>
      </div>

      {!filtered.length ? (
        <Empty title="No proposals to display">
          Create a quote in the event planner or change your active quote source above.
        </Empty>
      ) : (
        <div className="mo-proposal-grid">
          <div className="mo-proposal-list">
            {filtered.map((q) => (
              <button
                className={`mo-proposal-item ${selected?.id === q.id ? "is-active" : ""}`}
                key={q.id}
                onClick={() => setSelectedId(q.id)}
              >
                <span className="mo-avatar">{initials(q.name)}</span>
                <span className="mo-proposal-item__copy">
                  <strong>{q.name}</strong>
                  <small>{q.type} · {prettyDate(q.date)}</small>
                </span>
                <span className="mo-proposal-item__arrow">↗</span>
              </button>
            ))}
          </div>

          <article className="mo-proposal-detail">
            <div className="mo-detail-top">
              <span className="mo-eyebrow">Client dossier / {selected.ref}</span>
              <span className="mo-foil">✧</span>
            </div>
            <h3>{selected.name}</h3>
            <p>{selected.type}</p>
            <div className="mo-detail-facts">
              <div><span>Celebration date</span><strong>{prettyDate(selected.date)}</strong></div>
              <div><span>Preferred venue</span><strong>{selected.venue}</strong></div>
              <div><span>Guest estimate</span><strong>{selected.guests}</strong></div>
              <div><span>Quote estimate</span><strong>{peso(selected.amount)}</strong></div>
            </div>
            <label className="mo-field">
              <span>Internal workflow stage</span>
              <select
                value={store.stages[selected.id] || "New"}
                onChange={(e) => setStage(selected.id, e.target.value)}
              >
                {STAGES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="mo-field">
              <span>Private production note</span>
              <textarea
                rows="4"
                placeholder="Client preferences, creative direction, special details..."
                value={store.notes[selected.id] || ""}
                onChange={(e) => setNote(selected.id, e.target.value)}
              />
            </label>
            <small className="mo-footnote">
              Notes and stages are saved separately in this browser. Original quote data remains unchanged.
            </small>
          </article>
        </div>
      )}
    </section>
  );
}

function Schedule({ quotes, store, update }) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [form, setForm] = useState({
    date: todayKey(), venue: "", name: "", time: "",
  });
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();

  const events = [
    ...quotes.filter((q) => q.date).map((q) => ({
      id: q.id, date: q.date, venue: q.venue,
      name: q.name, time: "", kind: "quote",
    })),
    ...store.holds.map((h) => ({ ...h, kind: "hold" })),
  ];

  const conflicts = new Set();
  events.forEach((a) => {
    if (!a.venue || a.venue === "Venue to be decided") return;
    if (events.some(
      (b) => b.id !== a.id
        && b.date === a.date
        && b.venue.trim().toLowerCase() === a.venue.trim().toLowerCase()
    )) {
      conflicts.add(`${a.date}:${a.venue.trim().toLowerCase()}`);
    }
  });

  const monthLabel = month.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
  const cells = Array.from(
    { length: Math.ceil((firstOffset + dayCount) / 7) * 7 },
    (_, i) => {
      const day = i - firstOffset + 1;
      return day > 0 && day <= dayCount
        ? dateKey(new Date(year, monthIndex, day))
        : null;
    }
  );

  function addHold(e) {
    e.preventDefault();
    if (!form.date || !form.name.trim() || !form.venue.trim()) return;
    update((s) => ({
      ...s,
      holds: [
        ...s.holds,
        {
          ...form,
          id: newId(),
          name: form.name.trim(),
          venue: form.venue.trim(),
        },
      ],
    }));
    setMonth(new Date(`${form.date}T12:00:00`));
    setForm((s) => ({ ...s, name: "", time: "" }));
  }

  const monthEvents = events
    .filter((e) => e.date.startsWith(`${year}-${String(monthIndex + 1).padStart(2, "0")}`))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section className="mo-panel-stack">
      <div className="mo-page-head">
        <div>
          <span className="mo-eyebrow">03 / Time & place</span>
          <h2>Venue <em>schedule.</em></h2>
          <p>See dated proposals beside your internal venue holds. Duplicate venue/date entries are flagged for review, not assumed to be conflicts.</p>
        </div>
        <Link className="mo-text-button" to="/calendar">
          Open original calendar ↗
        </Link>
      </div>

      <div className="mo-calendar-layout">
        <article className="mo-surface mo-calendar">
          <div className="mo-calendar-head">
            <h3>{monthLabel}</h3>
            <div>
              <button aria-label="Previous month" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}>←</button>
              <button aria-label="Next month" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}>→</button>
            </div>
          </div>
          <div className="mo-calendar-grid">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
              (d) => <span className="mo-weekday" key={d}>{d}</span>
            )}
            {cells.map((day, i) => (
              <div
                className={`mo-day ${day === todayKey() ? "is-today" : ""} ${!day ? "is-blank" : ""}`}
                key={i}
              >
                {day && (
                  <>
                    <strong>{Number(day.slice(8))}</strong>
                    {events.filter((e) => e.date === day).slice(0, 3).map((e) => (
                      <div
                        title={`${e.venue}: ${e.name}`}
                        className={`mo-event ${e.kind === "hold" ? "is-hold" : ""} ${conflicts.has(`${day}:${e.venue.trim().toLowerCase()}`) ? "has-conflict" : ""}`}
                        key={e.id}
                      >
                        {e.name}
                      </div>
                    ))}
                    {events.filter((e) => e.date === day).length > 3 && <small>+ more</small>}
                  </>
                )}
              </div>
            ))}
          </div>
        </article>

        <aside className="mo-schedule-side">
          <div className="mo-surface">
            <span className="mo-eyebrow">Save a private hold</span>
            <h3>Reserve a moment.</h3>
            <form onSubmit={addHold} className="mo-form">
              <label className="mo-field">
                <span>Date</span>
                <input
                  required type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <label className="mo-field">
                <span>Venue name</span>
                <input
                  required maxLength="100" placeholder="Grand ballroom"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                />
              </label>
              <label className="mo-field">
                <span>Hold reference</span>
                <input
                  required maxLength="100" placeholder="Client consultation"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="mo-field">
                <span>Time (optional)</span>
                <input
                  type="time" value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </label>
              <button className="mo-button" type="submit">
                Save venue hold <span>+</span>
              </button>
            </form>
          </div>

          <div className="mo-surface">
            <span className="mo-eyebrow">This month / agenda</span>
            <h3>Dates in focus</h3>
            {monthEvents.length ? (
              <div className="mo-agenda">
                {monthEvents.map((e) => (
                  <div className="mo-agenda-item" key={e.id}>
                    <div>
                      <strong>{prettyDate(e.date)}</strong>
                      <small>
                        {e.name} · {e.venue}{e.time ? ` · ${e.time}` : ""}
                      </small>
                      {conflicts.has(`${e.date}:${e.venue.trim().toLowerCase()}`) && (
                        <em>Check same-date venue overlap</em>
                      )}
                    </div>
                    {e.kind === "hold" && (
                      <button
                        aria-label={`Remove hold ${e.name}`}
                        onClick={() => update((s) => ({
                          ...s,
                          holds: s.holds.filter((h) => h.id !== e.id),
                        }))}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mo-muted">No events in this month.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

const TEMPLATES = [
  ["08:00", "Supplier arrival & load-in"],
  ["10:00", "Venue styling check"],
  ["12:00", "Team briefing"],
  ["15:00", "Guest welcome"],
  ["16:00", "Main program"],
  ["19:00", "Final walkthrough"],
];

function RunSheet({ quotes, store, update }) {
  const [eventId, setEventId] = useState("general");
  const [form, setForm] = useState({
    time: "09:00", title: "", owner: "",
  });
  const tasks = Array.isArray(store.tasks[eventId]) ? store.tasks[eventId] : [];
  const ordered = [...tasks].sort((a, b) => a.time.localeCompare(b.time));

  function save(next) {
    update((s) => ({
      ...s,
      tasks: { ...s.tasks, [eventId]: next },
    }));
  }

  function addTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    save([
      ...tasks,
      { ...form, id: newId(), done: false, title: form.title.trim() },
    ]);
    setForm((s) => ({ ...s, title: "", owner: "" }));
  }

  function addTemplate() {
    if (tasks.length && !window.confirm(
      "Add an editable sample timeline to the existing run sheet?"
    )) return;
    save([
      ...tasks,
      ...TEMPLATES.map(([time, title]) => ({
        time, title, owner: "", id: newId(), done: false,
      })),
    ]);
  }

  return (
    <section className="mo-panel-stack">
      <div className="mo-page-head">
        <div>
          <span className="mo-eyebrow">04 / The day, composed</span>
          <h2>Run of <em>show.</em></h2>
          <p>Build a live production checklist for each proposal. Timings below are editable planning cues, not confirmed schedules.</p>
        </div>
        <button className="mo-text-button" onClick={addTemplate}>
          Add sample timeline +
        </button>
      </div>

      <div className="mo-runsheet-layout">
        <article className="mo-surface">
          <div className="mo-section-head">
            <div>
              <span className="mo-eyebrow">A considered sequence</span>
              <h3>Production timeline</h3>
            </div>
            <span className="mo-stage">
              {tasks.filter((t) => t.done).length} / {tasks.length} done
            </span>
          </div>

          <label className="mo-field">
            <span>Working event</span>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            >
              <option value="general">General production sheet</option>
              {quotes.map((q) => (
                <option value={q.id} key={q.id}>
                  {q.name} — {prettyDate(q.date)}
                </option>
              ))}
            </select>
          </label>

          <div className="mo-timeline">
            {ordered.length ? ordered.map((t) => (
              <div className={`mo-task ${t.done ? "is-done" : ""}`} key={t.id}>
                <input
                  type="checkbox"
                  checked={!!t.done}
                  aria-label={`Complete ${t.title}`}
                  onChange={(e) => save(tasks.map((x) =>
                    x.id === t.id ? { ...x, done: e.target.checked } : x
                  ))}
                />
                <span className="mo-task__time">{t.time}</span>
                <div>
                  <strong>{t.title}</strong>
                  <small>{t.owner || "Unassigned"}</small>
                </div>
                <button
                  aria-label={`Delete ${t.title}`}
                  onClick={() => save(tasks.filter((x) => x.id !== t.id))}
                >
                  ×
                </button>
              </div>
            )) : (
              <Empty title="A blank page, ready for your vision">
                Add your first cue or generate an editable sample timeline.
              </Empty>
            )}
          </div>
        </article>

        <aside className="mo-surface mo-compose">
          <span className="mo-eyebrow">New production cue</span>
          <h3>Plan the next detail.</h3>
          <form className="mo-form" onSubmit={addTask}>
            <label className="mo-field">
              <span>Call time</span>
              <input
                type="time" required value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </label>
            <label className="mo-field">
              <span>Action or milestone</span>
              <input
                required maxLength="140"
                placeholder="Sound and lighting check"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label className="mo-field">
              <span>Person responsible (optional)</span>
              <input
                maxLength="100" placeholder="Production team"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              />
            </label>
            <button type="submit" className="mo-button">
              Add to timeline <span>+</span>
            </button>
          </form>
          <p className="mo-footnote">
            Your run sheet is stored locally. It does not overwrite the original event proposal.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default function MaisonStaffOperations({ legacy = null }) {
  const [view, setView] = useState("overview");
  const [store, update] = useOfficeStore();
  const [sources, setSources] = useState(scanQuoteSources);
  const [sourceKey, setSourceKey] = useState(
    () => scanQuoteSources()[0]?.key || ""
  );

  useEffect(() => {
    const refresh = () => setSources(scanQuoteSources());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const activeKey = sources.some((s) => s.key === sourceKey)
    ? sourceKey
    : (sources[0]?.key || "");

  const quotes = useMemo(
    () => (sources.find((s) => s.key === activeKey)?.entries || [])
      .map((raw, i) => normaliseQuote(raw, i, activeKey)),
    [sources, activeKey]
  );

  const selectedTab = TABS.find(([key]) => key === view);

  return (
    <div className="mo-root">
      <div className="mo-layout">
        <aside className="mo-sidebar">
          <div className="mo-brand">
            <span className="mo-brand__seal">
              M<span>✦</span>G
            </span>
            <div>
              <strong>MAISON GALA</strong>
              <small>PRIVATE OPERATIONS</small>
            </div>
          </div>

          <div className="mo-side-label">The studio / navigation</div>

          <nav className="mo-nav" aria-label="Operations sections">
            {TABS.map(([key, name, number]) => (
              <button
                key={key}
                className={view === key ? "is-current" : ""}
                onClick={() => setView(key)}
              >
                <span className="mo-nav__number">{number}</span>
                <span>{name}</span>
                <span className="mo-nav__arrow">↗</span>
              </button>
            ))}
          </nav>

          <div className="mo-side-bottom">
            <span>THE ART OF GATHERING</span>
            <p>Crafted with care.<br />Managed with intention.</p>
            <Link to="/">← Return to website</Link>
          </div>
        </aside>

        <main className="mo-main">
          <div className="mo-topbar">
            <div className="mo-breadcrumb">
              OPERATIONS <span>/</span> {selectedTab?.[1].toUpperCase()}
            </div>
            <div className="mo-topbar__right">
              <span className="mo-live-dot" />
              PRIVATE WORKSPACE
              <span className="mo-topbar__date">
                {prettyDate(todayKey())}
              </span>
            </div>
          </div>

          <div className="mo-workarea">
            {view !== "original" && view !== "insights" && view !== "experience" && (
              <div className="mo-source">
                <div>
                  <span className="mo-eyebrow">Data connection · Read only</span>
                  <small>
                    {sources.length
                      ? "Using your locally saved inquiries"
                      : "No existing quote source detected"}
                  </small>
                </div>

                {sources.length ? (
                  <select
                    aria-label="Quotation storage source"
                    value={activeKey}
                    onChange={(e) => setSourceKey(e.target.value)}
                  >
                    {sources.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.key} ({s.count})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Link to="/planner">Create an inquiry ↗</Link>
                )}
                <button
                  onClick={() => setSources(scanQuoteSources())}
                  title="Refresh saved quotes"
                >
                  ↻ Refresh
                </button>
              </div>
            )}

            {view === "overview" && (
              <Overview quotes={quotes} store={store} setView={setView} />
            )}
            {view === "proposals" && (
              <Proposals quotes={quotes} store={store} update={update} />
            )}
            {view === "schedule" && (
              <Schedule quotes={quotes} store={store} update={update} />
            )}
            {view === "runsheet" && (
              <RunSheet quotes={quotes} store={store} update={update} />
            )}
            {view === "insights" && <MaisonInsightsCenter embedded />}{view === "experience" && <MaisonClientExperience />}
            {view === "original" && (
              <section className="mo-panel-stack">
                <div className="mo-page-head">
                  <div>
                    <span className="mo-eyebrow">
                      Your original tools / preserved
                    </span>
                    <h2>Classic <em>workspace.</em></h2>
                    <p>
                      The existing staff interface is rendered below,
                      with its original callbacks and quotation tools intact.
                    </p>
                  </div>
                </div>
                <div className="mo-legacy">
                  {legacy || (
                    <Empty title="No legacy interface provided">
                      The original staff component was not passed to this workspace.
                    </Empty>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
