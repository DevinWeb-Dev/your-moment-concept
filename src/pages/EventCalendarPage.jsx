import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gem,
  Info,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  VENUES,
  EVENT_PERIODS,
  dateAfter,
  formatDate,
  formatPeso,
  localDateKey,
} from "../data/eventData.js";

import "../styles/experience.css";

function makeCalendar(year, month) {
  const first = new Date(year, month, 1, 12);
  const offset = first.getDay();

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      year,
      month,
      index - offset + 1,
      12
    );

    return {
      key: localDateKey(date),
      day: date.getDate(),
      currentMonth: date.getMonth() === month,
    };
  });
}

export default function EventCalendarPage({
  quotes = [],
}) {
  const [venueId, setVenueId] = useState(
    VENUES[0].id
  );

  const [selectedDate, setSelectedDate] = useState(
    () => dateAfter(14)
  );

  const [period, setPeriod] = useState("evening");

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = new Date(
      `${dateAfter(14)}T12:00:00`
    );

    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  });

  const venue = VENUES.find(
    (item) => item.id === venueId
  );

  const minDate = dateAfter(1);
  const maxDate = dateAfter(365);

  const minObject = new Date(`${minDate}T12:00:00`);
  const maxObject = new Date(`${maxDate}T12:00:00`);

  const minMonth =
    minObject.getFullYear() * 12 +
    minObject.getMonth();

  const maxMonth =
    maxObject.getFullYear() * 12 +
    maxObject.getMonth();

  const currentMonth =
    visibleMonth.year * 12 +
    visibleMonth.month;

  const monthDays = useMemo(
    () =>
      makeCalendar(
        visibleMonth.year,
        visibleMonth.month
      ),
    [visibleMonth.year, visibleMonth.month]
  );

  const monthLabel = new Date(
    visibleMonth.year,
    visibleMonth.month,
    1
  ).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  const venuePlans = useMemo(
    () =>
      quotes.filter(
        (item) => item.venueId === venueId
      ),
    [quotes, venueId]
  );

  const countsByDate = useMemo(() => {
    const result = new Map();

    for (const plan of venuePlans) {
      result.set(
        plan.date,
        (result.get(plan.date) || 0) + 1
      );
    }

    return result;
  }, [venuePlans]);

  const selectedPlans = useMemo(
    () =>
      venuePlans.filter(
        (item) => item.date === selectedDate
      ),
    [venuePlans, selectedDate]
  );

  const periodCounts = useMemo(() => {
    const result = {};

    EVENT_PERIODS.forEach((item) => {
      result[item.id] = selectedPlans.filter(
        (plan) => plan.period === item.id
      ).length;
    });

    return result;
  }, [selectedPlans]);

  const plannerSearch = new URLSearchParams({
    venue: venueId,
    date: selectedDate,
    period,
  }).toString();

  function changeMonth(offset) {
    const date = new Date(
      visibleMonth.year,
      visibleMonth.month + offset,
      1
    );

    const nextMonth =
      date.getFullYear() * 12 +
      date.getMonth();

    if (
      nextMonth < minMonth ||
      nextMonth > maxMonth
    ) {
      return;
    }

    setVisibleMonth({
      year: date.getFullYear(),
      month: date.getMonth(),
    });
  }

  function selectDay(key) {
    setSelectedDate(key);
  }

  return (
    <div className="yme-page">
      <section className="yme-page-hero">
        <div className="ym-container">
          <span className="ym-eyebrow is-light">
            YOUR MOMENT / THE EVENT CALENDAR
          </span>

          <h1>
            Every moment
            <br />
            begins with <em>a date.</em>
          </h1>

          <p>
            Explore a date for your celebration,
            select your preferred venue, and continue
            building a fictional event proposal.
          </p>
        </div>
      </section>

      <section className="yme-section ym-container">
        <div className="yme-calendar-layout">
          <div className="yme-calendar-main">
            <div className="yme-section-title">
              <span className="ym-eyebrow">
                01 / SELECT YOUR EVENT SETTING
              </span>

              <h2>
                Choose your <em>venue.</em>
              </h2>
            </div>

            <div
              className="yme-venue-selector"
              role="group"
              aria-label="Choose a sample venue"
            >
              {VENUES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={venueId === item.id}
                  className={
                    venueId === item.id
                      ? "is-active"
                      : ""
                  }
                  onClick={() => setVenueId(item.id)}
                >
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                  />

                  <span>
                    <small>{item.category}</small>

                    <strong>{item.name}</strong>
                  </span>

                  {venueId === item.id && (
                    <Check size={18} />
                  )}
                </button>
              ))}
            </div>

            <div className="yme-calendar-card">
              <div className="yme-calendar-top">
                <div>
                  <span className="ym-eyebrow">
                    02 / SELECT YOUR PREFERRED DATE
                  </span>

                  <h2>{monthLabel}</h2>
                </div>

                <div className="yme-month-controls">
                  <button
                    type="button"
                    aria-label="Previous month"
                    disabled={currentMonth <= minMonth}
                    onClick={() => changeMonth(-1)}
                  >
                    <ChevronLeft size={21} />
                  </button>

                  <button
                    type="button"
                    aria-label="Next month"
                    disabled={currentMonth >= maxMonth}
                    onClick={() => changeMonth(1)}
                  >
                    <ChevronRight size={21} />
                  </button>
                </div>
              </div>

              <div className="yme-weekdays">
                {[
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div
                className="yme-calendar-grid"
                role="group"
                aria-label="Choose a proposed event date"
              >
                {monthDays.map((day) => {
                  const enabled =
                    day.currentMonth &&
                    day.key >= minDate &&
                    day.key <= maxDate;

                  const count =
                    countsByDate.get(day.key) || 0;

                  const selected =
                    selectedDate === day.key;

                  return (
                    <button
                      type="button"
                      key={day.key}
                      disabled={!enabled}
                      aria-pressed={selected}
                      aria-label={`${formatDate(day.key)}${
                        count
                          ? `, ${count} saved demo plans`
                          : ""
                      }`}
                      className={[
                        "yme-calendar-day",
                        selected ? "is-selected" : "",
                        !day.currentMonth
                          ? "is-outside"
                          : "",
                      ].join(" ")}
                      onClick={() =>
                        selectDay(day.key)
                      }
                    >
                      <strong>{day.day}</strong>

                      {enabled && count > 0 ? (
                        <small>{count} plan</small>
                      ) : enabled ? (
                        <span
                          className="yme-calendar-dot"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="yme-calendar-legend">
                <span>
                  <i className="is-open" />
                  Selectable date
                </span>

                <span>
                  <i className="is-selected" />
                  Selected
                </span>

                <span>
                  <i className="is-plan" />
                  Contains local sample plans
                </span>
              </div>
            </div>

            <div className="yme-period-card">
              <span className="ym-eyebrow">
                03 / SELECT EVENT PERIOD
              </span>

              <h2>
                Your preferred <em>time.</em>
              </h2>

              <div className="yme-period-grid">
                {EVENT_PERIODS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={period === item.id}
                    className={
                      period === item.id
                        ? "is-active"
                        : ""
                    }
                    onClick={() => setPeriod(item.id)}
                  >
                    <Clock3 size={21} />

                    <strong>{item.name}</strong>

                    <span>{item.time}</span>

                    <small>
                      {periodCounts[item.id] || 0}{" "}
                      saved demo plans
                    </small>
                  </button>
                ))}
              </div>

              <div className="yme-notice">
                <Info size={21} />

                <p>
                  All future dates are selectable
                  within the demo planning window.
                  Existing sample plans do not
                  represent confirmed reservations
                  or actual venue availability.
                </p>
              </div>
            </div>
          </div>

          <aside className="yme-calendar-sidebar">
            <div className="yme-event-preview">
              <div className="yme-preview-image">
                <img
                  src={venue.image}
                  alt={`Illustrative ${venue.name} venue`}
                />
              </div>

              <div className="yme-preview-content">
                <span className="ym-eyebrow">
                  YOUR PROPOSED EVENT
                </span>

                <h2>
                  A day to
                  <br />
                  <em>remember.</em>
                </h2>

                <div className="yme-preview-detail">
                  <Gem size={19} />

                  <span>
                    <small>Selected setting</small>
                    <strong>{venue.name}</strong>
                  </span>
                </div>

                <div className="yme-preview-detail">
                  <CalendarDays size={19} />

                  <span>
                    <small>Proposed date</small>
                    <strong>
                      {formatDate(selectedDate)}
                    </strong>
                  </span>
                </div>

                <div className="yme-preview-detail">
                  <Clock3 size={19} />

                  <span>
                    <small>Preferred period</small>
                    <strong>
                      {
                        EVENT_PERIODS.find(
                          (item) => item.id === period
                        )?.name
                      }
                    </strong>
                  </span>
                </div>

                <div className="yme-preview-detail">
                  <Users size={19} />

                  <span>
                    <small>Illustrative capacity</small>
                    <strong>
                      Up to {venue.capacity} guests
                    </strong>
                  </span>
                </div>

                <div className="yme-preview-price">
                  <span>Sample venue rate from</span>

                  <strong>
                    {formatPeso(venue.baseRate)}
                  </strong>
                </div>

                <Link
                  to={`/planner?${plannerSearch}`}
                  className="ym-button yme-full-button"
                >
                  Continue Event Planning
                  <ArrowUpRight size={18} />
                </Link>

                <div className="yme-preview-disclaimer">
                  <ShieldCheck size={18} />

                  <p>
                    Planning preferences only.
                    No booking is submitted or
                    confirmed.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="yme-bottom-link">
          <Link
            to="/plans"
            className="ym-text-link"
          >
            View Your Saved Demo Event Plans
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}