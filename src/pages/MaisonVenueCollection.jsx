import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Gem,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

import {
  VENUES,
  formatPeso,
} from "../data/eventData.js";

import "../styles/maison-venues.css";

const CATEGORIES = [
  "All",
  ...new Set(VENUES.map((venue) => venue.category)),
];

const CAPACITIES = [0, 100, 200, 300, 400];

const THEMES = {
  "the-glass-garden": {
    key: "garden",
    line: "A love letter to daylight",
    motif: "I",
  },
  "the-grand-hall": {
    key: "hall",
    line: "The theatre of a grand entrance",
    motif: "II",
  },
  "the-private-courtyard": {
    key: "courtyard",
    line: "A world that feels entirely yours",
    motif: "III",
  },
  "the-skyline-terrace": {
    key: "terrace",
    line: "Where the evening opens up",
    motif: "IV",
  },
};

function VenueEditorialCard({ venue, index }) {
  const theme =
    THEMES[venue.id] ||
    THEMES["the-glass-garden"];

  return (
    <article
      className={`mgv-venue-card mgv-venue-card--${theme.key}`}
    >
      <Link
        className="mgv-card-art"
        to={`/venues/${venue.id}`}
        aria-label={`Explore ${venue.name}`}
      >
        <img
          src={venue.image}
          alt={`Illustrative event atmosphere for ${venue.name}`}
          loading="lazy"
        />

        <span className="mgv-card-index">
          {venue.number} / FOUR SETTINGS
        </span>

        <span
          className="mgv-card-glass"
          aria-hidden="true"
        >
          {theme.motif}
        </span>

        <span className="mgv-card-arrow">
          <ArrowUpRight size={22} />
        </span>
      </Link>

      <div className="mgv-card-copy">
        <span className="mgv-eyebrow">
          {venue.label}
        </span>

        <h3>{venue.name}</h3>

        <p>{theme.line}.</p>

        <div className="mgv-card-bottom">
          <span>
            <Users size={15} />
            {venue.minGuests}–{venue.capacity} guests
          </span>

          <strong>
            From {formatPeso(venue.baseRate)}*
          </strong>
        </div>

        <Link
          className="mgv-text-link"
          to={`/venues/${venue.id}`}
        >
          ENTER THE DOSSIER
          <ArrowUpRight size={17} />
        </Link>
      </div>

      <span
        className="mgv-card-counter"
        aria-hidden="true"
      >
        0{index + 1}
      </span>
    </article>
  );
}

export default function MaisonVenueCollection() {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("All");
  const [minimum, setMinimum] = useState(0);
  const [sort, setSort] = useState("curated");
  const [focusId, setFocusId] =
    useState(VENUES[0].id);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    const results = VENUES.filter(
      (venue) =>
        (category === "All" ||
          venue.category === category) &&
        venue.capacity >= minimum &&
        (!needle ||
          [
            venue.name,
            venue.tagline,
            venue.description,
            venue.category,
          ]
            .join(" ")
            .toLowerCase()
            .includes(needle))
    );

    if (sort === "capacity") {
      return [...results].sort(
        (a, b) => b.capacity - a.capacity
      );
    }

    if (sort === "rate") {
      return [...results].sort(
        (a, b) => a.baseRate - b.baseRate
      );
    }

    return results;
  }, [category, minimum, search, sort]);

  const focus =
    VENUES.find((venue) => venue.id === focusId) ||
    VENUES[0];

  const reset = () => {
    setSearch("");
    setCategory("All");
    setMinimum(0);
    setSort("curated");
  };

  return (
    <main className="mgv mgv-collection">
      {/* CINEMATIC ARCHIVE HERO */}

      <section className="mgv-index-hero">
        <div className="mgv-index-heading">
          <span className="mgv-eyebrow mgv-eyebrow--gold">
            THE MAISON GALA ARCHIVE / VOLUME 02
          </span>

          <h1>
            Spaces for <em>everything</em>{" "}
            that matters.
          </h1>

          <p>
            Four fictional event settings.
            Four completely different atmospheres.
            Discover the space that feels like
            the beginning of your story.
          </p>

          <a
            href="#mgv-collection"
            className="mgv-hero-scroll"
          >
            EXPLORE THE FOUR SETTINGS
            <ArrowDownRight size={18} />
          </a>
        </div>

        <div
          className="mgv-index-art"
          aria-hidden="true"
        >
          <div className="mgv-index-halo" />

          <img src={focus.image} alt="" />

          <span>
            THE EDITORIAL
            <br />
            COLLECTION — 04
          </span>

          <b>IV</b>
        </div>
      </section>

      {/* COLLECTION INTRO */}

      <section
        className="mgv-collection-intro mgv-wrap"
        id="mgv-collection"
      >
        <div>
          <span className="mgv-eyebrow">
            01 / DISCOVER THE COLLECTION
          </span>

          <h2>
            Choose a place.
            <br />
            <em>Find your feeling.</em>
          </h2>
        </div>

        <p>
          From glasshouse romance to dramatic
          ballroom glamour, every imagined
          venue has its own architecture,
          pace, and point of view.
        </p>
      </section>

      {/* SEARCH AND FILTERS */}

      <section
        className="mgv-filter-area mgv-wrap"
        aria-label="Venue filters"
      >
        <div className="mgv-filter-top">
          <span>
            <SlidersHorizontal size={17} />
            CURATE YOUR VENUE EDIT
          </span>

          <span>
            {filtered.length} OF {VENUES.length}
            {" "}SETTINGS
          </span>
        </div>

        <div className="mgv-filters">
          <label className="mgv-search">
            <span>SEARCH THE ARCHIVE</span>

            <span className="mgv-input-with-icon">
              <Search size={16} />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="A mood, a venue, a detail…"
              />
            </span>
          </label>

          <label>
            <span>SETTING TYPE</span>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item === "All"
                    ? "All atmospheres"
                    : item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>MINIMUM CAPACITY</span>

            <select
              value={minimum}
              onChange={(event) =>
                setMinimum(Number(event.target.value))
              }
            >
              {CAPACITIES.map((n) => (
                <option key={n} value={n}>
                  {n
                    ? `${n}+ guests`
                    : "Any group size"}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>ORDER BY</span>

            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
            >
              <option value="curated">
                Curated order
              </option>

              <option value="capacity">
                Largest capacity
              </option>

              <option value="rate">
                Lowest sample base rate
              </option>
            </select>
          </label>
        </div>
      </section>

      {/* FOUR DIFFERENT VENUE CARDS */}

      {filtered.length ? (
        <section
          className="mgv-venue-grid mgv-wrap"
          aria-label="Venue collection"
        >
          {filtered.map((venue, index) => (
            <VenueEditorialCard
              key={venue.id}
              venue={venue}
              index={index}
            />
          ))}
        </section>
      ) : (
        <div className="mgv-empty mgv-wrap">
          <Gem size={34} />

          <h3>No settings in this edit.</h3>

          <p>
            Try a smaller guest count or a
            different venue category.
          </p>

          <button type="button" onClick={reset}>
            RESET FILTERS
            <X size={16} />
          </button>
        </div>
      )}

      {/* INTERACTIVE GUEST CAPACITY COMPARISON */}

      <section className="mgv-compare mgv-wrap">
        <div className="mgv-compare-intro">
          <span className="mgv-eyebrow">
            02 / THE SCALE OF A CELEBRATION
          </span>

          <h2>
            Room for <em>your people.</em>
          </h2>

          <p>
            Compare illustrative venue capacities.
            Select a setting to reveal its
            sample numbers and create a
            starting estimate.
          </p>
        </div>

        <div className="mgv-compare-board">
          <div className="mgv-compare-bars">
            {VENUES.map((venue) => (
              <button
                key={venue.id}
                type="button"
                className={`mgv-capacity-row ${
                  focus.id === venue.id
                    ? "is-selected"
                    : ""
                }`}
                onClick={() =>
                  setFocusId(venue.id)
                }
                aria-pressed={focus.id === venue.id}
              >
                <span>{venue.name}</span>

                <span className="mgv-capacity-track">
                  <i
                    style={{
                      width: `${
                        (venue.capacity / 450) * 100
                      }%`,
                    }}
                  />
                </span>

                <b>{venue.capacity}</b>
              </button>
            ))}
          </div>

          <div className="mgv-compare-highlight">
            <small>THE SELECTED SETTING</small>

            <h3>{focus.name}</h3>

            <div>
              <span>ILLUSTRATIVE CAPACITY</span>
              <strong>
                {focus.minGuests}–{focus.capacity}
              </strong>
            </div>

            <div>
              <span>SAMPLE VENUE RATE FROM</span>
              <strong>
                {formatPeso(focus.baseRate)}
              </strong>
            </div>

            <Link
              to={`/planner?venue=${encodeURIComponent(
                focus.id
              )}`}
            >
              EXPLORE AN ESTIMATE
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* CLOSING SECTION */}

      <section className="mgv-closing">
        <div
          className="mgv-closing-ring"
          aria-hidden="true"
        />

        <span className="mgv-eyebrow mgv-eyebrow--gold">
          03 / THE NEXT CHAPTER
        </span>

        <h2>
          Every beautiful story
          <br />
          starts <em>somewhere.</em>
        </h2>

        <Link to="/planner">
          BEGIN YOUR EVENT STUDY
          <ArrowUpRight size={19} />
        </Link>

        <p>
          <Check size={15} />
          Portfolio-only concept · No live
          venue bookings or verified availability.
        </p>
      </section>

      <p className="mgv-disclosure">
        *Venues, prices, guest capacities,
        photos and inclusions are illustrative
        concept information—not real
        operating properties.
      </p>
    </main>
  );
}