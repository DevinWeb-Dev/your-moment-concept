import { useMemo, useState } from "react";

import {
  Link,
  useOutletContext,
} from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  Download,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  VENUES,
  EVENT_TYPES,
  findVenue,
  findPackage,
  formatDate,
  formatPeso,
} from "../../data/eventData.js";

import {
  PLAN_STAGES,
  exportOperationsCSV,
  getPlanOps,
  stageInfo,
  taskProgress,
} from "../../data/eventOps.js";

export default function ProposalDeskPage() {
  const {
    quotes,
    operations,
    onSetStage,
  } = useOutletContext();

  const [query, setQuery] = useState("");
  const [venueId, setVenueId] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [stage, setStage] = useState("all");
  const [sort, setSort] = useState("event-asc");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    const matches = quotes.filter((quote) => {
      const record = getPlanOps(
        operations,
        quote.id
      );

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

      if (
        stage !== "all" &&
        record.stage !== stage
      ) {
        return false;
      }

      const searchText = [
        quote.id,
        quote.alias,
        quote.eventType,
        findVenue(quote.venueId)?.name,
        findPackage(quote.packageId)?.name,
      ]
        .join(" ")
        .toLowerCase();

      return (
        !term ||
        searchText.includes(term)
      );
    });

    matches.sort((a, b) => {
      if (sort === "event-desc") {
        return String(b.date || "").localeCompare(
          String(a.date || "")
        );
      }

      if (sort === "created") {
        return String(b.createdAt || "").localeCompare(
          String(a.createdAt || "")
        );
      }

      if (sort === "total") {
        return b.total - a.total;
      }

      return String(a.date || "").localeCompare(
        String(b.date || "")
      );
    });

    return matches;
  }, [
    quotes,
    operations,
    query,
    venueId,
    eventType,
    stage,
    sort,
  ]);

  function resetFilters() {
    setQuery("");
    setVenueId("all");
    setEventType("all");
    setStage("all");
    setSort("event-asc");
  }

  const readyCount = quotes.filter(
    (quote) =>
      getPlanOps(
        operations,
        quote.id
      ).stage === "ready"
  ).length;

  const reviewCount = quotes.filter(
    (quote) =>
      getPlanOps(
        operations,
        quote.id
      ).stage === "reviewing"
  ).length;

  return (
    <div className="ymo-page">
      <div className="ymo-page-heading">
        <div>
          <span className="ymo-eyebrow">
            EVENT PROPOSALS / OPERATIONS
          </span>

          <h1>
            Behind every
            <br />
            <em>great occasion.</em>
          </h1>

          <p>
            Organize fictional event requests,
            review planning stages, and keep
            every sample proposal easy to find.
          </p>
        </div>

        <Link
          to="/planner"
          className="ymo-primary-button"
        >
          New Sample Proposal
          <ArrowUpRight size={18} />
        </Link>
      </div>

      <div className="ymo-summary-strip">
        <article>
          <ClipboardList size={23} />
          <strong>{quotes.length}</strong>
          <span>Total drafts</span>
        </article>

        <article>
          <Search size={23} />
          <strong>{reviewCount}</strong>
          <span>In review</span>
        </article>

        <article>
          <CalendarDays size={23} />
          <strong>{readyCount}</strong>
          <span>Concepts ready</span>
        </article>
      </div>

      <section className="ymo-panel">
        <div className="ymo-panel-heading">
          <div>
            <span className="ymo-eyebrow">
              THE PROPOSAL DESK
            </span>

            <h2>
              A clear <em>overview.</em>
            </h2>
          </div>

          <button
            type="button"
            className="ymo-secondary-button"
            onClick={() =>
              exportOperationsCSV(
                filtered,
                operations
              )
            }
          >
            <Download size={17} />
            Export Filtered CSV
          </button>
        </div>

        <div className="ymo-filter-grid">
          <label className="ymo-search">
            <span>SEARCH PROPOSALS</span>

            <div>
              <Search size={18} />

              <input
                type="search"
                value={query}
                placeholder="Alias, reference, venue..."
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
              />
            </div>
          </label>

          <label>
            <span>VENUE</span>

            <select
              value={venueId}
              onChange={(event) =>
                setVenueId(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Venues
              </option>

              {VENUES.map((venue) => (
                <option
                  key={venue.id}
                  value={venue.id}
                >
                  {venue.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>EVENT TYPE</span>

            <select
              value={eventType}
              onChange={(event) =>
                setEventType(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Events
              </option>

              {EVENT_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>PLANNING STAGE</span>

            <select
              value={stage}
              onChange={(event) =>
                setStage(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Stages
              </option>

              {PLAN_STAGES.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>SORT</span>

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value
                )
              }
            >
              <option value="event-asc">
                Event Date: Earliest
              </option>

              <option value="event-desc">
                Event Date: Latest
              </option>

              <option value="created">
                Recently Created
              </option>

              <option value="total">
                Highest Sample Total
              </option>
            </select>
          </label>
        </div>

        <div className="ymo-filter-results">
          <span>
            Showing {filtered.length} of{" "}
            {quotes.length} proposals
          </span>

          <button
            type="button"
            onClick={resetFilters}
          >
            Clear Filters
            <ArrowRight size={16} />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="ymo-empty">
            <ClipboardList size={32} />

            <h3>
              No matching event proposals.
            </h3>

            <p>
              Adjust the filters or create
              another fictional event concept.
            </p>

            <button
              type="button"
              className="ymo-secondary-button"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="ymo-desk-list">
            {filtered.map((quote) => {
              const venue =
                findVenue(quote.venueId);

              const packageItem =
                findPackage(quote.packageId);

              const record =
                getPlanOps(
                  operations,
                  quote.id
                );

              const progress =
                taskProgress(
                  operations,
                  quote.id
                );

              return (
                <article
                  className="ymo-desk-card"
                  key={quote.id}
                >
                  <div className="ymo-desk-card-main">
                    <div className="ymo-desk-image">
                      {venue?.image && (
                        <img
                          src={venue.image}
                          alt=""
                          loading="lazy"
                        />
                      )}
                    </div>

                    <div className="ymo-desk-details">
                      <span className="ymo-reference">
                        {quote.id}
                      </span>

                      <h3>
                        {quote.alias}
                      </h3>

                      <p>
                        {venue?.name ||
                          "Venue concept"}
                        {" · "}
                        {quote.eventType}
                      </p>

                      <div className="ymo-desk-meta">
                        <span>
                          <CalendarDays size={16} />
                          {formatDate(quote.date)}
                        </span>

                        <span>
                          <Users size={16} />
                          {quote.guests} guests
                        </span>

                        <span>
                          {packageItem?.name ||
                            "Catering concept"}
                        </span>
                      </div>
                    </div>

                    <div className="ymo-desk-value">
                      <small>
                        SAVED SAMPLE TOTAL
                      </small>

                      <strong>
                        {formatPeso(
                          quote.total
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="ymo-desk-progress">
                    <div>
                      <span>PREPARATION CHECKLIST</span>

                      <strong>
                        {progress.completed}/
                        {progress.total} complete
                      </strong>
                    </div>

                    <div className="ymo-progress-track">
                      <span
                        style={{
                          width: `${progress.percent}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="ymo-desk-footer">
                    <label className="ymo-stage-control">
                      <span>
                        INTERNAL PLANNING STAGE
                      </span>

                      <select
                        value={record.stage}
                        onChange={(event) =>
                          onSetStage(
                            quote.id,
                            event.target.value
                          )
                        }
                      >
                        {PLAN_STAGES.map(
                          (item) => (
                            <option
                              key={item.id}
                              value={item.id}
                            >
                              {item.label}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <Link
                      className="ymo-primary-button"
                      to={`/staff/run-sheet?plan=${encodeURIComponent(
                        quote.id
                      )}`}
                    >
                      Open Event Run Sheet
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="ymo-bottom-notice">
        <ShieldCheck size={23} />

        <div>
          <strong>
            A planning pipeline, not a sales pipeline.
          </strong>

          <p>
            Status changes organize fictional
            proposals within this browser.
            They never send a message to a real
            client or confirm an event reservation.
          </p>
        </div>
      </div>
    </div>
  );
}