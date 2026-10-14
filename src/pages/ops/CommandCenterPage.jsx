import { useMemo } from "react";

import {
  Link,
  useOutletContext,
} from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  Gem,
  ListChecks,
  Sparkles,
  Users,
} from "lucide-react";

import {
  VENUES,
  formatDate,
  formatPeso,
} from "../../data/eventData.js";

import {
  PLAN_STAGES,
  getPlanOps,
  getUpcomingPlans,
  stageInfo,
  taskProgress,
  venueInterest,
} from "../../data/eventOps.js";

function Metric({
  icon: Icon,
  number,
  title,
  description,
  variant = "",
}) {
  return (
    <article className={`ymo-metric ${variant}`}>
      <span className="ymo-metric-icon">
        <Icon
          size={23}
          strokeWidth={1.5}
        />
      </span>

      <strong>{number}</strong>

      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

export default function CommandCenterPage() {
  const {
    quotes,
    operations,
  } = useOutletContext();

  const upcoming = useMemo(
    () => getUpcomingPlans(quotes),
    [quotes]
  );

  const venues = useMemo(
    () => venueInterest(quotes),
    [quotes]
  );

  const stageCounts = useMemo(
    () =>
      PLAN_STAGES.map((stage) => ({
        ...stage,
        count: quotes.filter(
          (quote) =>
            getPlanOps(
              operations,
              quote.id
            ).stage === stage.id
        ).length,
      })),
    [quotes, operations]
  );

  const activePlanningCount =
    quotes.filter((quote) => {
      const stage = getPlanOps(
        operations,
        quote.id
      ).stage;

      return stage !== "archived";
    }).length;

  const readyCount = quotes.filter(
    (quote) =>
      getPlanOps(operations, quote.id)
        .stage === "ready"
  ).length;

  const venueMaximum = Math.max(
    1,
    ...venues.map(
      (venue) => venue.count
    )
  );

  const periodLabel =
    new Date().toLocaleDateString(
      "en-PH",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );

  return (
    <div className="ymo-page">
      <div className="ymo-page-heading">
        <div>
          <span className="ymo-eyebrow">
            EVENT OPERATIONS / OVERVIEW
          </span>

          <h1>
            Every beautiful
            <br />
            <em>moment, organized.</em>
          </h1>

          <p>
            {periodLabel} — A clear view of
            this browser's fictional event
            planning activity.
          </p>
        </div>

        <Link
          to="/planner"
          className="ymo-primary-button"
        >
          Create a Demo Plan
          <ArrowUpRight size={18} />
        </Link>
      </div>

      <div className="ymo-metrics">
        <Metric
          icon={ClipboardList}
          number={quotes.length}
          title="Saved Proposals"
          description="Fictional concepts in this browser"
        />

        <Metric
          icon={ListChecks}
          number={activePlanningCount}
          title="Planning Workspace"
          description="Concepts not archived"
          variant="is-light"
        />

        <Metric
          icon={CalendarDays}
          number={upcoming.length}
          title="Upcoming Dates"
          description="Future proposed event dates"
          variant="is-sage"
        />

        <Metric
          icon={Sparkles}
          number={readyCount}
          title="Concepts Ready"
          description="Internally prepared demo plans"
          variant="is-gold"
        />
      </div>

      <div className="ymo-overview-grid">
        <section className="ymo-panel">
          <div className="ymo-panel-heading">
            <div>
              <span className="ymo-eyebrow">
                EVENT PIPELINE
              </span>

              <h2>
                The planning <em>journey.</em>
              </h2>
            </div>

            <Link
              to="/staff/desk"
              className="ymo-text-link"
            >
              Open Desk
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="ymo-stage-list">
            {stageCounts.map((stage) => {
              const percent =
                quotes.length > 0
                  ? (stage.count /
                      quotes.length) *
                    100
                  : 0;

              return (
                <div
                  key={stage.id}
                  className="ymo-stage-row"
                >
                  <div>
                    <strong>
                      {stage.label}
                    </strong>

                    <span>
                      {stage.count}
                    </span>
                  </div>

                  <div className="ymo-progress-track">
                    <span
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="ymo-panel-note">
            Internal demo stages only. They do
            not reflect actual client approvals
            or confirmed events.
          </p>
        </section>

        <section className="ymo-panel">
          <div className="ymo-panel-heading">
            <div>
              <span className="ymo-eyebrow">
                VENUE INTEREST
              </span>

              <h2>
                Popular <em>settings.</em>
              </h2>
            </div>
          </div>

          <div className="ymo-demand-list">
            {venues.map((venue, index) => (
              <div
                key={venue.id}
                className="ymo-demand-item"
              >
                <div className="ymo-demand-top">
                  <span>
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <div>
                    <strong>
                      {venue.name}
                    </strong>

                    <small>
                      {venue.category}
                    </small>
                  </div>

                  <b>{venue.count}</b>
                </div>

                <div className="ymo-progress-track">
                  <span
                    style={{
                      width: `${
                        (venue.count /
                          venueMaximum) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="ymo-panel ymo-upcoming-panel">
        <div className="ymo-panel-heading">
          <div>
            <span className="ymo-eyebrow">
              THE CALENDAR AHEAD
            </span>

            <h2>
              Upcoming <em>concepts.</em>
            </h2>
          </div>

          <Link
            to="/staff/schedule"
            className="ymo-text-link"
          >
            Weekly Schedule
            <ArrowRight size={17} />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="ymo-empty">
            <CalendarDays size={31} />

            <h3>No future demo plans yet.</h3>

            <p>
              Create an event proposal using
              the public planner to populate
              this operations workspace.
            </p>

            <Link
              to="/planner"
              className="ymo-secondary-button"
            >
              Open Event Planner
              <ArrowUpRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="ymo-upcoming-list">
            {upcoming.slice(0, 7).map(
              (quote) => {
                const venue =
                  VENUES.find(
                    (item) =>
                      item.id === quote.venueId
                  );

                const record = getPlanOps(
                  operations,
                  quote.id
                );

                const progress = taskProgress(
                  operations,
                  quote.id
                );

                return (
                  <article
                    key={quote.id}
                    className="ymo-upcoming-row"
                  >
                    <span className="ymo-row-icon">
                      <Gem size={22} />
                    </span>

                    <div className="ymo-row-main">
                      <strong>
                        {quote.alias}
                      </strong>

                      <small>
                        {venue?.name ||
                          "Venue concept"}
                        {" · "}
                        {quote.guests} guests
                      </small>
                    </div>

                    <div className="ymo-row-date">
                      <strong>
                        {formatDate(quote.date)}
                      </strong>

                      <small>
                        {progress.completed}/
                        {progress.total} tasks
                      </small>
                    </div>

                    <span
                      className={`ymo-status stage-${record.stage}`}
                    >
                      {
                        stageInfo(
                          record.stage
                        ).label
                      }
                    </span>

                    <Link
                      to={`/staff/run-sheet?plan=${encodeURIComponent(
                        quote.id
                      )}`}
                      className="ymo-row-arrow"
                      aria-label={`Open run sheet for ${quote.alias}`}
                    >
                      <ArrowUpRight
                        size={20}
                      />
                    </Link>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      <div className="ymo-bottom-notice">
        <ShieldNote />

        <div>
          <strong>
            Built for planning demonstrations.
          </strong>

          <p>
            No venue availability, confirmed
            reservations, actual guest counts,
            revenues, or completed events are
            represented by these figures.
          </p>
        </div>
      </div>
    </div>
  );
}

function ShieldNote() {
  return (
    <span className="ymo-notice-icon">
      <Users size={22} />
    </span>
  );
}