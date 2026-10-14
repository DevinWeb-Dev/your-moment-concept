import { useMemo, useState } from "react";

import {
  Link,
  useOutletContext,
} from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gem,
  ShieldCheck,
} from "lucide-react";

import {
  VENUES,
  EVENT_PERIODS,
  formatDate,
} from "../../data/eventData.js";

import {
  addDays,
  getPlanOps,
  mondayOf,
  shortDate,
  stageInfo,
  todayKey,
  weekdayName,
} from "../../data/eventOps.js";

export default function VenueSchedulePage() {
  const {
    quotes,
    operations,
  } = useOutletContext();

  const [venueId, setVenueId] = useState(
    VENUES[0].id
  );

  const [weekStart, setWeekStart] = useState(
    () => mondayOf(todayKey())
  );

  const venue = VENUES.find(
    (item) => item.id === venueId
  );

  const days = useMemo(
    () =>
      Array.from(
        { length: 7 },
        (_, index) =>
          addDays(weekStart, index)
      ),
    [weekStart]
  );

  const weekEnd = days[6];

  const weekPlans = useMemo(
    () =>
      quotes.filter((quote) => {
        const record = getPlanOps(
          operations,
          quote.id
        );

        return (
          quote.venueId === venueId &&
          typeof quote.date === "string" &&
          quote.date >= weekStart &&
          quote.date <= weekEnd &&
          record.stage !== "archived"
        );
      }),
    [
      quotes,
      operations,
      venueId,
      weekStart,
      weekEnd,
    ]
  );

  const plansBySlot = useMemo(() => {
    const map = new Map();

    for (const quote of weekPlans) {
      const key = `${quote.date}|${quote.period}`;

      map.set(
        key,
        [
          ...(map.get(key) || []),
          quote,
        ]
      );
    }

    return map;
  }, [weekPlans]);

  const uniqueDates = new Set(
    weekPlans.map(
      (item) => item.date
    )
  ).size;

  function navigateWeek(offset) {
    setWeekStart((current) =>
      addDays(
        current,
        offset * 7
      )
    );
  }

  function jumpToDate(event) {
    if (!event.target.value) return;

    setWeekStart(
      mondayOf(
        event.target.value
      )
    );
  }

  return (
    <div className="ymo-page">
      <div className="ymo-page-heading">
        <div>
          <span className="ymo-eyebrow">
            VENUE OPERATIONS / WEEKLY VIEW
          </span>

          <h1>
            A week of
            <br />
            <em>possibilities.</em>
          </h1>

          <p>
            View proposed event concepts by
            venue and event period in a
            structured weekly planning board.
          </p>
        </div>

        <Link
          to="/calendar"
          className="ymo-primary-button"
        >
          Public Event Calendar
          <ArrowRight size={18} />
        </Link>
      </div>

      <section className="ymo-panel">
        <div className="ymo-panel-heading">
          <div>
            <span className="ymo-eyebrow">
              SELECTED VENUE
            </span>

            <h2>
              Weekly <em>planner.</em>
            </h2>
          </div>
        </div>

        <div className="ymo-schedule-toolbar">
          <label>
            <span>VIEW VENUE</span>

            <select
              value={venueId}
              onChange={(event) =>
                setVenueId(
                  event.target.value
                )
              }
            >
              {VENUES.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="ymo-week-controls">
            <button
              type="button"
              aria-label="Previous week"
              onClick={() =>
                navigateWeek(-1)
              }
            >
              <ChevronLeft size={21} />
            </button>

            <div>
              <small>SELECTED WEEK</small>

              <strong>
                {shortDate(weekStart)} –{" "}
                {shortDate(weekEnd)}
              </strong>
            </div>

            <button
              type="button"
              aria-label="Next week"
              onClick={() =>
                navigateWeek(1)
              }
            >
              <ChevronRight size={21} />
            </button>
          </div>

          <div className="ymo-week-jump">
            <label>
              <span>JUMP TO DATE</span>

              <input
                type="date"
                value={weekStart}
                onChange={jumpToDate}
              />
            </label>

            <button
              type="button"
              onClick={() =>
                setWeekStart(
                  mondayOf(todayKey())
                )
              }
            >
              This Week
            </button>
          </div>
        </div>

        <div className="ymo-schedule-meta">
          <span>
            <Gem size={17} />
            {venue?.name}
          </span>

          <span>
            <CalendarDays size={17} />
            {weekPlans.length} active planning concepts
          </span>

          <span>
            <Clock3 size={17} />
            {uniqueDates} distinct selected dates
          </span>
        </div>

        <div
          className="ymo-schedule-scroll"
          role="region"
          aria-label="Scrollable weekly event planning schedule"
          tabIndex={0}
        >
          <table className="ymo-schedule-table">
            <thead>
              <tr>
                <th scope="col">
                  EVENT PERIOD
                </th>

                {days.map((day) => (
                  <th
                    key={day}
                    scope="col"
                    className={
                      day === todayKey()
                        ? "is-today"
                        : ""
                    }
                  >
                    <span>
                      {weekdayName(day)}
                    </span>

                    <strong>
                      {shortDate(day)}
                    </strong>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {EVENT_PERIODS.map(
                (period) => (
                  <tr key={period.id}>
                    <th scope="row">
                      <strong>
                        {period.name}
                      </strong>

                      <small>
                        {period.time}
                      </small>
                    </th>

                    {days.map((day) => {
                      const plans =
                        plansBySlot.get(
                          `${day}|${period.id}`
                        ) || [];

                      return (
                        <td
                          key={`${day}-${period.id}`}
                          className={
                            plans.length
                              ? "has-plans"
                              : ""
                          }
                        >
                          {plans.length === 0 ? (
                            <span className="ymo-empty-slot">
                              No plans
                            </span>
                          ) : (
                            <div className="ymo-slot-plans">
                              <span className="ymo-slot-count">
                                {plans.length}{" "}
                                {plans.length === 1
                                  ? "CONCEPT"
                                  : "CONCEPTS"}
                              </span>

                              {plans.map(
                                (quote) => (
                                  <Link
                                    key={quote.id}
                                    to={`/staff/run-sheet?plan=${encodeURIComponent(
                                      quote.id
                                    )}`}
                                    className="ymo-slot-plan"
                                  >
                                    <strong>
                                      {quote.alias}
                                    </strong>

                                    <small>
                                      {
                                        stageInfo(
                                          getPlanOps(
                                            operations,
                                            quote.id
                                          ).stage
                                        ).label
                                      }
                                    </small>
                                  </Link>
                                )
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <p className="ymo-panel-note">
          Multiple saved concepts may share
          the same venue, date, and period.
          This board does not enforce inventory
          or real reservation conflicts.
        </p>
      </section>

      <section className="ymo-panel ymo-week-agenda">
        <div className="ymo-panel-heading">
          <div>
            <span className="ymo-eyebrow">
              THE WEEK AT A GLANCE
            </span>

            <h2>
              Proposed <em>occasions.</em>
            </h2>
          </div>

          <span className="ymo-panel-label">
            {weekPlans.length} SAMPLE PLANS
          </span>
        </div>

        {weekPlans.length === 0 ? (
          <div className="ymo-empty">
            <CalendarDays size={32} />

            <h3>
              No plans for this venue and week.
            </h3>

            <p>
              Choose another week or venue,
              or create a new fictional
              event proposal.
            </p>
          </div>
        ) : (
          <div className="ymo-agenda-list">
            {[...weekPlans]
              .sort((a, b) =>
                `${a.date}|${a.period}`.localeCompare(
                  `${b.date}|${b.period}`
                )
              )
              .map((quote) => (
                <article
                  key={quote.id}
                  className="ymo-agenda-row"
                >
                  <span className="ymo-row-icon">
                    <CalendarDays size={20} />
                  </span>

                  <div>
                    <strong>{quote.alias}</strong>

                    <small>
                      {quote.eventType}
                    </small>
                  </div>

                  <div className="ymo-agenda-date">
                    <strong>
                      {formatDate(quote.date)}
                    </strong>

                    <small>
                      {EVENT_PERIODS.find(
                        (item) =>
                          item.id === quote.period
                      )?.name || "Event period"}
                    </small>
                  </div>

                  <Link
                    to={`/staff/run-sheet?plan=${encodeURIComponent(
                      quote.id
                    )}`}
                    className="ymo-text-link"
                  >
                    Run Sheet
                    <ArrowRight size={17} />
                  </Link>
                </article>
              ))}
          </div>
        )}
      </section>

      <div className="ymo-bottom-notice">
        <ShieldCheck size={22} />

        <div>
          <strong>
            Not a confirmed availability calendar.
          </strong>

          <p>
            These dates and time periods are
            selected by fictional proposals.
            Actual scheduling would require
            venue inventory, booking approvals,
            and server-side conflict management.
          </p>
        </div>
      </div>
    </div>
  );
}