import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Download,
  FileText,
  Gem,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import {
  VENUES,
  PACKAGES,
  EVENT_TYPES,
  EVENT_PERIODS,
  calculateEstimate,
  findVenue,
  findPackage,
  formatDate,
  formatPeso,
} from "../data/eventData.js";

import "../styles/experience.css";

function saveTextFile(content, filename) {
  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function exportPlan(quote) {
  const venue = findVenue(quote.venueId);
  const packageItem = findPackage(quote.packageId);

  const period = EVENT_PERIODS.find(
    (item) => item.id === quote.period
  );

  const breakdown = calculateEstimate({
    venueId: quote.venueId,
    packageId: quote.packageId,
    guests: quote.guests,
    addonIds: quote.addonIds || [],
  });

  const details = [
    "YOUR MOMENT.",
    "FICTIONAL EVENT PROPOSAL — PORTFOLIO DEMO",
    "---------------------------------------------",
    "",
    `Reference: ${quote.id}`,
    `Event Alias: ${quote.alias}`,
    `Event Type: ${quote.eventType || "Not specified"}`,
    `Proposed Date: ${formatDate(quote.date)}`,
    `Preferred Period: ${period?.name || "Not specified"}`,
    `Venue: ${venue?.name || "Unknown"}`,
    `Catering Package: ${packageItem?.name || "Unknown"}`,
    `Guest Count: ${quote.guests}`,
    "",
    "SAMPLE MENU",
    `Starter: ${quote.menu?.starter || "Not selected"}`,
    `Main: ${quote.menu?.main || "Not selected"}`,
    `Dessert: ${quote.menu?.dessert || "Not selected"}`,
    "",
    "SAMPLE ESTIMATE",
    `Venue Fee: ${
      breakdown
        ? formatPeso(breakdown.venueTotal)
        : "Unavailable"
    }`,
    `Catering: ${
      breakdown
        ? formatPeso(breakdown.cateringTotal)
        : "Unavailable"
    }`,
    ...(
      breakdown?.addons.map(
        (item) =>
          `${item.name}: ${formatPeso(item.total)}`
      ) || []
    ),
    `SAVED ESTIMATED TOTAL: ${formatPeso(quote.total)}`,
    "",
    "This is not a reservation, invoice,",
    "payment request, or binding quotation.",
    "",
    "Website Concept Made by: Web Developer Devin Planas",
  ];

  const safeReference = quote.id.replace(
    /[^a-zA-Z0-9_-]/g,
    ""
  );

  saveTextFile(
    details.join("\r\n"),
    `your-moment-${safeReference}.txt`
  );
}

function csvCell(value) {
  let text = String(value ?? "");

  if (/^\s*[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function exportListCSV(quotes) {
  const headings = [
    "Reference",
    "Event Alias",
    "Event Type",
    "Venue",
    "Catering Package",
    "Guest Count",
    "Proposed Date",
    "Preferred Period",
    "Saved Sample Total",
  ];

  const rows = quotes.map((item) => [
    item.id,
    item.alias,
    item.eventType,
    findVenue(item.venueId)?.name || "",
    findPackage(item.packageId)?.name || "",
    item.guests,
    item.date,
    item.period,
    item.total,
  ]);

  const content =
    "\uFEFF" +
    [
      headings.map(csvCell).join(","),
      ...rows.map(
        (row) => row.map(csvCell).join(",")
      ),
    ].join("\r\n");

  const blob = new Blob([content], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download =
    "your-moment-demo-event-plans.csv";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export default function QuoteManagerPage({
  quotes = [],
  onDeleteQuote,
}) {
  const [search, setSearch] = useState("");
  const [venueId, setVenueId] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    const result = quotes.filter((quote) => {
      const venue = findVenue(quote.venueId);

      if (
        venueId !== "all" &&
        quote.venueId !== venueId
      ) {
        return false;
      }

      if (
        eventType !== "all" &&
        quote.eventType !== eventType
      ) {
        return false;
      }

      const text = [
        quote.id,
        quote.alias,
        quote.eventType,
        venue?.name,
        findPackage(quote.packageId)?.name,
      ]
        .join(" ")
        .toLowerCase();

      return !term || text.includes(term);
    });

    return result.sort((a, b) => {
      if (sortBy === "date-asc") {
        return a.date.localeCompare(b.date);
      }

      if (sortBy === "date-desc") {
        return b.date.localeCompare(a.date);
      }

      if (sortBy === "highest") {
        return b.total - a.total;
      }

      return String(b.createdAt || "").localeCompare(
        String(a.createdAt || "")
      );
    });
  }, [quotes, search, venueId, eventType, sortBy]);

  const average =
    quotes.length > 0
      ? quotes.reduce(
          (sum, item) => sum + item.total,
          0
        ) / quotes.length
      : 0;

  function clearFilters() {
    setSearch("");
    setVenueId("all");
    setEventType("all");
    setSortBy("newest");
  }

  return (
    <div className="yme-page">
      <section className="yme-page-hero">
        <div className="ym-container">
          <span className="ym-eyebrow is-light">
            YOUR MOMENT / SAVED EVENT PROPOSALS
          </span>

          <h1>
            Beautiful ideas,
            <br />
            <em>all in one place.</em>
          </h1>

          <p>
            Review and organize your browser-local
            fictional event plans, explore the
            details, or build another version.
          </p>
        </div>
      </section>

      <section className="yme-section ym-container">
        <div className="yme-plans-heading">
          <div>
            <span className="ym-eyebrow">
              YOUR EVENT PROPOSAL COLLECTION
            </span>

            <h2>
              Every plan <em>has a story.</em>
            </h2>
          </div>

          <Link
            to="/planner"
            className="ym-button"
          >
            Create a New Plan
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="yme-plan-statistics">
          <article>
            <FileText size={23} />
            <strong>{quotes.length}</strong>
            <span>Saved fictional plans</span>
          </article>

          <article>
            <Gem size={23} />
            <strong>
              {
                new Set(
                  quotes.map((item) => item.venueId)
                ).size
              }
            </strong>
            <span>Venue concepts selected</span>
          </article>

          <article>
            <Users size={23} />

            <strong>
              {formatPeso(average)}
            </strong>

            <span>
              Average saved sample estimate
            </span>
          </article>
        </div>

        <div className="yme-manager-panel">
          <div className="yme-manager-heading">
            <span className="ym-eyebrow">
              SEARCH AND ORGANIZE
            </span>

            <button
              type="button"
              className="yme-export-button"
              onClick={() =>
                exportListCSV(filtered)
              }
            >
              <Download size={17} />
              Export Filtered CSV
            </button>
          </div>

          <div className="yme-manager-filters">
            <label className="yme-search-field">
              <span>SEARCH EVENT PLANS</span>

              <div>
                <Search size={18} />

                <input
                  type="search"
                  value={search}
                  placeholder="Event alias, venue or reference..."
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>
            </label>

            <label>
              <span>VENUE</span>

              <select
                value={venueId}
                onChange={(event) =>
                  setVenueId(event.target.value)
                }
              >
                <option value="all">All venues</option>

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

            <label>
              <span>EVENT TYPE</span>

              <select
                value={eventType}
                onChange={(event) =>
                  setEventType(event.target.value)
                }
              >
                <option value="all">
                  All event types
                </option>

                {EVENT_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>SORT BY</span>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                <option value="newest">
                  Recently created
                </option>

                <option value="date-asc">
                  Event date: earliest
                </option>

                <option value="date-desc">
                  Event date: latest
                </option>

                <option value="highest">
                  Highest sample total
                </option>
              </select>
            </label>
          </div>

          <div className="yme-results-line">
            <span>
              Showing {filtered.length} of{" "}
              {quotes.length} saved demo plans
            </span>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
              <ArrowRight size={17} />
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="yme-empty">
              <CalendarDays size={34} />

              <h3>
                No matching event plans.
              </h3>

              <p>
                Create a new demo proposal
                or try different filters.
              </p>
            </div>
          ) : (
            <div className="yme-plan-list">
              {filtered.map((quote) => {
                const venue = findVenue(
                  quote.venueId
                );

                const packageItem = findPackage(
                  quote.packageId
                );

                const estimate = calculateEstimate({
                  venueId: quote.venueId,
                  packageId: quote.packageId,
                  guests: quote.guests,
                  addonIds: quote.addonIds || [],
                });

                const period = EVENT_PERIODS.find(
                  (item) =>
                    item.id === quote.period
                );

                return (
                  <article
                    className="yme-plan-card"
                    key={quote.id}
                  >
                    <div className="yme-plan-main">
                      <div className="yme-plan-image">
                        <img
                          src={venue?.image}
                          alt={`Illustrative ${venue?.name || "event"} venue`}
                          loading="lazy"
                        />
                      </div>

                      <div className="yme-plan-details">
                        <span className="ym-eyebrow">
                          FICTIONAL EVENT PROPOSAL
                        </span>

                        <h3>{quote.alias}</h3>

                        <p>
                          {venue?.name || "Sample Venue"}
                          {" · "}
                          {quote.eventType}
                        </p>

                        <div className="yme-plan-tags">
                          <span>
                            <CalendarDays size={16} />
                            {formatDate(quote.date)}
                          </span>

                          <span>
                            <Users size={16} />
                            {quote.guests} guests
                          </span>

                          <span>
                            <Clock3 size={16} />
                            {period?.name || "Event"}
                          </span>
                        </div>
                      </div>

                      <div className="yme-plan-value">
                        <small>
                          SAVED SAMPLE ESTIMATE
                        </small>

                        <strong>
                          {formatPeso(quote.total)}
                        </strong>
                      </div>
                    </div>

                    <details className="yme-plan-expansion">
                      <summary>
                        Review Full Event Details
                        <ArrowRight size={18} />
                      </summary>

                      <div className="yme-plan-expanded-content">
                        <div>
                          <span className="ym-eyebrow">
                            CATERING PREFERENCES
                          </span>

                          <h4>
                            {packageItem?.name ||
                              "Sample Package"}
                          </h4>

                          <div className="yme-detail-list">
                            <p>
                              <strong>Starter:</strong>{" "}
                              {quote.menu?.starter || "—"}
                            </p>

                            <p>
                              <strong>Main Course:</strong>{" "}
                              {quote.menu?.main || "—"}
                            </p>

                            <p>
                              <strong>Dessert:</strong>{" "}
                              {quote.menu?.dessert || "—"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <span className="ym-eyebrow">
                            ESTIMATE BREAKDOWN
                          </span>

                          {estimate ? (
                            <div className="yme-detail-list">
                              <p>
                                <span>Venue fee</span>
                                <strong>
                                  {formatPeso(
                                    estimate.venueTotal
                                  )}
                                </strong>
                              </p>

                              <p>
                                <span>Catering</span>
                                <strong>
                                  {formatPeso(
                                    estimate.cateringTotal
                                  )}
                                </strong>
                              </p>

                              {estimate.addons.map(
                                (addon) => (
                                  <p key={addon.id}>
                                    <span>
                                      {addon.name}
                                    </span>

                                    <strong>
                                      {formatPeso(
                                        addon.total
                                      )}
                                    </strong>
                                  </p>
                                )
                              )}
                            </div>
                          ) : (
                            <p>
                              Original calculation
                              unavailable.
                            </p>
                          )}

                          {estimate &&
                            estimate.total !==
                              quote.total && (
                              <p className="yme-reprice-note">
                                The saved total differs
                                from the current sample
                                pricing configuration.
                              </p>
                            )}
                        </div>
                      </div>
                    </details>

                    <div className="yme-plan-actions">
                      <Link
                        to={`/planner?clone=${encodeURIComponent(
                          quote.id
                        )}`}
                        className="yme-action-primary"
                      >
                        <Copy size={17} />
                        Make a Copy to Customize
                      </Link>

                      <button
                        type="button"
                        onClick={() => exportPlan(quote)}
                      >
                        <Download size={17} />
                        Download Summary
                      </button>

                      <button
                        type="button"
                        className="is-danger"
                        onClick={() =>
                          onDeleteQuote(quote.id)
                        }
                      >
                        <Trash2 size={17} />
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="yme-privacy-note">
          <ShieldCheck size={23} />

          <p>
            Saved plans are fictional and stored
            in this browser. Exported files are
            sample planning documents, not
            contracts, approved quotations,
            confirmed bookings, or invoices.
          </p>
        </div>
      </section>
    </div>
  );
}