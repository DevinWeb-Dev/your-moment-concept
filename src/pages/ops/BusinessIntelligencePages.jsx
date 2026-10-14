import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useOutletContext,
} from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  FileJson,
  Gem,
  Info,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";

import {
  VENUES,
  formatPeso,
} from "../../data/eventData.js";

import {
  DEFAULT_SETTINGS,
  downloadDemoBackup,
  getIntelligence,
  parseDemoBackup,
} from "../../data/intelligence.js";

import "../../styles/intelligence.css";

// ============================================
// SHARED UI
// ============================================

function PageHeading({
  eyebrow,
  title,
  accent,
  description,
  children,
}) {
  return (
    <header className="ymi-page-heading">
      <div>
        <span className="ymo-eyebrow">
          {eyebrow}
        </span>

        <h1>
          {title} <em>{accent}</em>
        </h1>

        <p>{description}</p>
      </div>

      {children}
    </header>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  explanation,
}) {
  return (
    <article className="ymi-metric">
      <span className="ymi-metric-icon">
        <Icon size={23} />
      </span>

      <strong>{value}</strong>
      <span>{label}</span>
      <p>{explanation}</p>
    </article>
  );
}

function BarRows({
  rows,
  nameKey = "name",
  empty = "No sample activity yet.",
}) {
  const max = Math.max(
    1,
    ...rows.map((item) => item.count)
  );

  if (!rows.some((item) => item.count)) {
    return <p className="ymi-muted">{empty}</p>;
  }

  return (
    <div className="ymi-bars">
      {rows.map((item) => (
        <div
          className="ymi-bar-row"
          key={
            item.id ||
            item.label ||
            item.key
          }
        >
          <div className="ymi-bar-heading">
            <strong>
              {item[nameKey] || item.label}
            </strong>

            <span>
              {item.count}{" "}
              {item.count === 1
                ? "plan"
                : "plans"}
            </span>
          </div>

          <div className="ymi-bar-track">
            <span
              style={{
                width: `${
                  (item.count / max) * 100
                }%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// PAGE 1 — REPORTS & TRENDS
// ============================================

export function ReportsPage() {
  const {
    quotes,
    operations,
  } = useOutletContext();

  const data = useMemo(
    () => getIntelligence(quotes, operations),
    [quotes, operations]
  );

  const maxMonth = Math.max(
    1,
    ...data.months.map(
      (month) => month.count
    )
  );

  return (
    <div className="ymi-page">
      <PageHeading
        eyebrow="BUSINESS INTELLIGENCE / DEMO REPORTS"
        title="Read the"
        accent="room."
        description="Explore sample demand patterns generated from fictional event-planning drafts in this browser. These figures are not bookings, sales, or revenue."
      >
        <Link
          className="ymo-secondary-button"
          to="/staff/desk"
        >
          Proposal Desk
          <ArrowUpRight size={17} />
        </Link>
      </PageHeading>

      <div className="ymi-metrics">
        <Metric
          icon={FileJson}
          label="Saved planning concepts"
          value={data.count}
          explanation="Browser-local fictional proposals"
        />

        <Metric
          icon={Gem}
          label="Combined sample estimates"
          value={formatPeso(data.sampleTotal)}
          explanation="Not actual or projected revenue"
        />

        <Metric
          icon={BarChart3}
          label="Average draft estimate"
          value={formatPeso(data.average)}
          explanation="Non-binding sample pricing"
        />

        <Metric
          icon={Users}
          label="Total proposed guest places"
          value={data.totalGuests.toLocaleString(
            "en-PH"
          )}
          explanation="Summed over every saved draft"
        />
      </div>

      <div className="ymi-report-grid">
        <section className="ymi-panel is-wide">
          <div className="ymi-panel-heading">
            <span className="ymo-eyebrow">
              PROPOSED EVENT DATE DISTRIBUTION
            </span>

            <h2>
              Six-month <em>outlook.</em>
            </h2>
          </div>

          <p className="ymi-muted">
            Counts use proposed event dates,
            not dates when the plans were created.
          </p>

          <div
            className="ymi-month-chart"
            role="img"
            aria-label="Sample proposals by proposed event month"
          >
            {data.months.map((month) => (
              <div
                className="ymi-month-item"
                key={month.key}
              >
                <strong>{month.count}</strong>

                <div className="ymi-month-track">
                  <span
                    style={{
                      height: `${
                        month.count
                          ? Math.max(
                              7,
                              (month.count /
                                maxMonth) * 100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <small>{month.label}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="ymi-panel">
          <div className="ymi-panel-heading">
            <span className="ymo-eyebrow">
              PROPOSAL STAGES
            </span>

            <h2>
              The concept <em>pipeline.</em>
            </h2>
          </div>

          <BarRows rows={data.stages} />
        </section>

        <section className="ymi-panel">
          <div className="ymi-panel-heading">
            <span className="ymo-eyebrow">
              SAMPLE EVENT TYPES
            </span>

            <h2>
              Occasions of <em>interest.</em>
            </h2>
          </div>

          <BarRows rows={data.eventTypes} />
        </section>

        <section className="ymi-panel">
          <div className="ymi-panel-heading">
            <span className="ymo-eyebrow">
              PACKAGE INTEREST
            </span>

            <h2>
              The catering <em>edit.</em>
            </h2>
          </div>

          <BarRows rows={data.packages} />
        </section>
      </div>

      <div className="ymi-disclaimer">
        <ShieldCheck size={22} />

        <p>
          Demo analytics only. Repeated copies of
          the same fictional event count as separate
          proposals. Saved estimate totals are not
          sales, confirmed bookings, or actual earnings.
        </p>
      </div>
    </div>
  );
}

// ============================================
// PAGE 2 — VENUE INSIGHTS
// ============================================

export function VenueInsightsPage() {
  const {
    quotes,
    operations,
  } = useOutletContext();

  const [venueId, setVenueId] = useState(
    VENUES[0].id
  );

  const data = useMemo(
    () => getIntelligence(quotes, operations),
    [quotes, operations]
  );

  const venue =
    VENUES.find(
      (item) => item.id === venueId
    ) || VENUES[0];

  const selected = data.venues.find(
    (item) => item.id === venue.id
  );

  const related = quotes.filter(
    (quote) => quote.venueId === venueId
  );

  const avgGuests = related.length
    ? Math.round(
        selected.guests / related.length
      )
    : 0;

  const max = Math.max(
    1,
    ...data.venues.map(
      (item) => item.count
    )
  );

  return (
    <div className="ymi-page">
      <PageHeading
        eyebrow="BUSINESS INTELLIGENCE / VENUE INSIGHTS"
        title="Understand each"
        accent="setting."
        description="Compare fictional venue interest, guest counts, and illustrative price totals from saved planning drafts."
      />

      <div className="ymi-venue-list">
        {data.venues.map((item) => (
          <button
            type="button"
            key={item.id}
            className={
              venueId === item.id
                ? "is-selected"
                : ""
            }
            aria-pressed={venueId === item.id}
            onClick={() =>
              setVenueId(item.id)
            }
          >
            <img
              src={item.image}
              alt=""
              loading="lazy"
            />

            <span>
              <small>{item.category}</small>
              <strong>{item.name}</strong>
              <small>
                {item.count} demo plans
              </small>
            </span>
          </button>
        ))}
      </div>

      <div className="ymi-venue-layout">
        <section className="ymi-venue-cover">
          <img
            src={venue.image}
            alt={`Editorial inspiration for ${venue.name}`}
          />

          <div>
            <span className="ymo-eyebrow">
              THE SELECTED VENUE
            </span>

            <h2>{venue.name}</h2>
            <p>{venue.tagline}</p>
          </div>
        </section>

        <div className="ymi-venue-facts">
          <article>
            <Gem size={21} />
            <span>Saved interest</span>
            <strong>{selected.count}</strong>
            <small>
              fictional proposals
            </small>
          </article>

          <article>
            <Users size={21} />
            <span>
              Average proposed group
            </span>
            <strong>{avgGuests}</strong>
            <small>
              guests per draft
            </small>
          </article>

          <article>
            <TrendingUp size={21} />
            <span>
              Combined sample estimates
            </span>
            <strong>
              {formatPeso(selected.amount)}
            </strong>
            <small>not actual sales</small>
          </article>

          <article>
            <CalendarDays size={21} />
            <span>
              Illustrative venue capacity
            </span>
            <strong>{venue.capacity}</strong>
            <small>
              maximum sample guests
            </small>
          </article>
        </div>
      </div>

      <section className="ymi-panel">
        <div className="ymi-panel-heading">
          <span className="ymo-eyebrow">
            FOUR VENUE CONCEPTS
          </span>

          <h2>
            Interest <em>comparison.</em>
          </h2>
        </div>

        <div className="ymi-bars">
          {data.venues.map((item) => (
            <div
              className="ymi-bar-row"
              key={item.id}
            >
              <div className="ymi-bar-heading">
                <strong>{item.name}</strong>

                <span>
                  {item.count} / {data.count} drafts
                </span>
              </div>

              <div className="ymi-bar-track">
                <span
                  style={{
                    width: `${
                      (item.count / max) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <Link
          to={`/venues/${venue.id}`}
          className="ymi-link"
        >
          Explore the public venue page
          <ArrowRight size={18} />
        </Link>
      </section>

      <div className="ymi-disclaimer">
        <Info size={22} />

        <p>
          These comparisons reflect only plans
          saved in your browser. They do not
          measure real customer demand, conversions,
          occupancy, or venue revenue.
        </p>
      </div>
    </div>
  );
}

// ============================================
// PAGE 3 — STUDIO SETTINGS
// ============================================

export function StudioSettingsPage() {
  const {
    settings,
    onSaveSettings,
  } = useOutletContext();

  const [draft, setDraft] = useState(settings);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const fields = [
    [
      "studioName",
      "WORKSPACE DISPLAY NAME",
      60,
    ],
    [
      "region",
      "FICTIONAL SERVICE REGION",
      100,
    ],
    [
      "descriptor",
      "STUDIO DESCRIPTOR",
      90,
    ],
  ];

  function submit(event) {
    event.preventDefault();

    const result = onSaveSettings(draft);

    if (!result.ok) {
      setError(result.error);
      setFeedback("");
      return;
    }

    setError("");
    setFeedback(
      "Demo settings saved locally in this browser."
    );
  }

  function update(key, value) {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));

    setFeedback("");
    setError("");
  }

  return (
    <div className="ymi-page">
      <PageHeading
        eyebrow="STUDIO OPERATIONS / WORKSPACE SETTINGS"
        title="Shape your"
        accent="workspace."
        description="Customize illustrative studio information shown in this operations workspace. This does not update real business records or public booking details."
      />

      <div className="ymi-settings-grid">
        <form
          className="ymi-panel ymi-settings-form"
          onSubmit={submit}
        >
          <div className="ymi-panel-heading">
            <span className="ymo-eyebrow">
              BROWSER-LOCAL BRAND PROFILE
            </span>

            <h2>
              Studio <em>identity.</em>
            </h2>
          </div>

          {fields.map(
            ([key, label, max]) => (
              <label
                className="ymi-field"
                key={key}
              >
                <span>{label}</span>

                <input
                  required
                  maxLength={max}
                  value={draft[key]}
                  onChange={(event) =>
                    update(
                      key,
                      event.target.value
                    )
                  }
                />
              </label>
            )
          )}

          <label className="ymi-field">
            <span>
              PLANNING CONTEXT / DEMO NOTICE
            </span>

            <textarea
              rows={5}
              required
              maxLength={350}
              value={draft.planningNote}
              onChange={(event) =>
                update(
                  "planningNote",
                  event.target.value
                )
              }
            />

            <small>
              {draft.planningNote.length}/350 characters
            </small>
          </label>

          {error && (
            <p
              className="ymi-error"
              role="alert"
            >
              {error}
            </p>
          )}

          {feedback && (
            <p
              className="ymi-success"
              role="status"
            >
              <CheckCircle2 size={18} />
              {feedback}
            </p>
          )}

          <div className="ymi-actions">
            <button
              className="ymo-primary-button"
              type="submit"
            >
              <Save size={17} />
              Save Demo Settings
            </button>

            <button
              type="button"
              className="ymo-secondary-button"
              onClick={() => {
                setDraft({
                  ...DEFAULT_SETTINGS,
                });

                setFeedback(
                  "Default values loaded. Click Save to apply them."
                );
              }}
            >
              <RotateCcw size={17} />
              Load Defaults
            </button>
          </div>
        </form>

        <aside className="ymi-settings-preview">
          <Sparkles size={29} />

          <span className="ymo-eyebrow">
            LIVE PREVIEW OF DRAFT
          </span>

          <h2>
            {draft.studioName || "Studio name"}
          </h2>

          <strong>{draft.descriptor}</strong>
          <p>{draft.region}</p>

          <div>{draft.planningNote}</div>

          <small>
            This preview is not a public
            website update.
          </small>
        </aside>
      </div>
    </div>
  );
}

// ============================================
// PAGE 4 — DATA & BACKUPS
// ============================================

export function DataCenterPage() {
  const {
    quotes,
    operations,
    settings,
    onRestoreBackup,
  } = useOutletContext();

  const [candidate, setCandidate] = useState(null);
  const [filename, setFilename] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const opCount = Object.keys(
    operations
  ).length;

  async function fileChanged(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    setCandidate(null);
    setAccepted(false);
    setError("");
    setNotice("");

    if (!file) return;

    if (file.size > 1_500_000) {
      setError(
        "Backup exceeds the 1.5 MB safety limit."
      );
      return;
    }

    try {
      const contents = await file.text();

      const validated =
        parseDemoBackup(contents);

      setCandidate(validated);
      setFilename(file.name);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Could not read the backup."
      );
    }
  }

  function restore() {
    if (!candidate || !accepted) {
      return;
    }

    if (
      !window.confirm(
        "Replace ALL current browser-local YOUR MOMENT proposals, operational progress, and settings with this backup? This cannot be undone unless you exported the current data."
      )
    ) {
      return;
    }

    const result = onRestoreBackup(
      candidate
    );

    if (result?.ok === false) {
      setError(result.error);
      return;
    }

    setCandidate(null);
    setAccepted(false);
    setError("");

    setNotice(
      "Demo backup restored. All dashboard pages now use the imported records."
    );
  }

  return (
    <div className="ymi-page">
      <PageHeading
        eyebrow="STUDIO OPERATIONS / DATA CENTER"
        title="Keep the"
        accent="details."
        description="Export and restore fictional proposals, operations checklists, and studio settings. Files remain on your device unless you choose to share them."
      />

      <div className="ymi-metrics is-three">
        <Metric
          icon={FileJson}
          label="Demo proposals"
          value={quotes.length}
          explanation="Saved in this browser"
        />

        <Metric
          icon={CheckCircle2}
          label="Operations records"
          value={opCount}
          explanation="Checklist, stages, and notes"
        />

        <Metric
          icon={Settings2}
          label="Studio settings"
          value="1"
          explanation="Local configuration profile"
        />
      </div>

      <div className="ymi-data-grid">
        <section className="ymi-panel ymi-data-panel">
          <Download size={28} />

          <span className="ymo-eyebrow">
            STEP 01 / SAVE A COPY
          </span>

          <h2>
            Export your <em>demo.</em>
          </h2>

          <p>
            Download a versioned JSON copy of
            the complete local portfolio data
            set. It includes proposals, their
            planning stages, preparation
            checklists, notes, and studio settings.
          </p>

          <button
            type="button"
            className="ymo-primary-button"
            onClick={() =>
              downloadDemoBackup({
                quotes,
                operations,
                settings,
              })
            }
          >
            <Download size={18} />
            Download JSON Backup
          </button>

          <small>
            Exporting does not delete or
            change anything.
          </small>
        </section>

        <section className="ymi-panel ymi-data-panel">
          <Upload size={28} />

          <span className="ymo-eyebrow">
            STEP 02 / RESTORE A COPY
          </span>

          <h2>
            Restore your <em>workspace.</em>
          </h2>

          <p>
            Select a YOUR MOMENT demo backup
            file. We check its version,
            records, sample venue IDs, and
            operations data before allowing
            a restore.
          </p>

          <label className="ymi-file-picker">
            <FileJson size={19} />

            <span>
              Choose JSON Backup
            </span>

            <input
              type="file"
              accept=".json,application/json"
              onChange={fileChanged}
            />
          </label>

          {candidate && (
            <div className="ymi-backup-preview">
              <strong>{filename}</strong>

              <span>
                {candidate.quotes.length} fictional
                proposals
              </span>

              <span>
                {
                  Object.keys(
                    candidate.operations
                  ).length
                }{" "}
                planning records
              </span>

              <label>
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) =>
                    setAccepted(
                      event.target.checked
                    )
                  }
                />

                <span>
                  I understand this will replace
                  my current browser-local
                  YOUR MOMENT data.
                </span>
              </label>

              <button
                type="button"
                className="ymo-primary-button"
                disabled={!accepted}
                onClick={restore}
              >
                <RotateCcw size={17} />
                Restore Selected Backup
              </button>
            </div>
          )}

          {error && (
            <p
              className="ymi-error"
              role="alert"
            >
              {error}
            </p>
          )}

          {notice && (
            <p
              className="ymi-success"
              role="status"
            >
              <CheckCircle2 size={18} />
              {notice}
            </p>
          )}
        </section>
      </div>

      <div className="ymi-disclaimer">
        <ShieldCheck size={22} />

        <p>
          Only import files you trust. Restoring
          replaces all current demo records in
          this browser; export your current data
          first. This is not a secure customer
          database or a cloud backup service.
        </p>
      </div>
    </div>
  );
}