import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleCheck,
  Gem,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import {
  VENUES,
  PACKAGES,
  calculateEstimate,
  formatPeso,
} from "../data/eventData.js";

import "../styles/maison-celebrations.css";

export default function MaisonPackageComparison() {
  const [venueId, setVenueId] = useState(VENUES[0].id);

  const [selected, setSelected] = useState(
    PACKAGES.map((item) => item.id)
  );

  const [guestCount, setGuestCount] = useState(100);

  const venue =
    VENUES.find((item) => item.id === venueId) ||
    VENUES[0];

  const packages = PACKAGES.filter((item) =>
    selected.includes(item.id)
  );

  const minimum = Math.max(
    venue.minGuests,
    ...packages.map((item) => item.minimumGuests)
  );

  const guests = Math.min(
    venue.capacity,
    Math.max(
      minimum,
      Number(guestCount) || minimum
    )
  );

  const comparisons = useMemo(
    () =>
      packages.map((item) => ({
        ...item,
        estimate: calculateEstimate({
          venueId,
          packageId: item.id,
          guests,
        }),
      })),
    [selected, guests, venueId]
  );

  const features = [
    ...new Set(
      PACKAGES.flatMap((item) => item.highlights)
    ),
  ];

  function toggle(id) {
    setSelected((before) =>
      before.includes(id)
        ? before.length === 1
          ? before
          : before.filter((item) => item !== id)
        : [...before, id]
    );
  }

  return (
    <main className="m3 m3-compare">
      <section className="m3-compare-hero">
        <div className="m3-container">
          <span className="m3-overline m3-on-dark">
            THE DECISION ATELIER / EDITION NO. 03
          </span>

          <h1>
            Find the <em>perfect balance.</em>
          </h1>

          <p>
            A transparent, interactive comparison
            of three fictional catering editions—
            without hidden formulas or invented
            service inclusions.
          </p>

          <span
            className="m3-compare-sigil"
            aria-hidden="true"
          >
            ✧
          </span>
        </div>
      </section>

      <section className="m3-container m3-compare-layout">
        <div className="m3-compare-controls">
          <div className="m3-section-top">
            <SlidersHorizontal size={19} />
            <span>
              01 / SHAPE THE COMPARISON
            </span>
          </div>

          <label>
            YOUR SETTING

            <select
              value={venueId}
              onChange={(e) =>
                setVenueId(e.target.value)
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

          <label>
            NUMBER OF GUESTS
            <strong>{guests}</strong>

            <input
              type="range"
              min={minimum}
              max={venue.capacity}
              value={guests}
              onChange={(e) =>
                setGuestCount(Number(e.target.value))
              }
            />

            <small>
              {minimum}–{venue.capacity} guests
              for the selected editions
            </small>
          </label>

          <div className="m3-compare-toggle-label">
            THE EDITIONS / SELECT AT LEAST ONE
          </div>

          <div className="m3-compare-toggles">
            {PACKAGES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                aria-pressed={selected.includes(item.id)}
                className={
                  selected.includes(item.id)
                    ? "is-on"
                    : ""
                }
              >
                <span>
                  {selected.includes(item.id) ? (
                    <CircleCheck size={18} />
                  ) : (
                    <Gem size={18} />
                  )}
                </span>

                {item.name}
              </button>
            ))}
          </div>

          <p className="m3-tiny-note">
            Switch the venue or guest count
            to compare the sample totals
            instantly. Existing pricing data
            is preserved.
          </p>
        </div>

        <div className="m3-compare-results">
          <div className="m3-compare-results-header">
            <span className="m3-overline">
              02 / THE SIDE-BY-SIDE VIEW
            </span>

            <h2>
              Every detail,
              <em> considered.</em>
            </h2>
          </div>

          <div className="m3-compare-cards">
            {comparisons.map((item) => (
              <article
                className={
                  item.featured
                    ? "m3-comparison-card is-signature"
                    : "m3-comparison-card"
                }
                key={item.id}
              >
                <div className="m3-comparison-card-head">
                  <span>
                    EDITION 0
                    {PACKAGES.findIndex(
                      (pack) => pack.id === item.id
                    ) + 1}
                  </span>

                  <Gem size={21} />
                </div>

                <h3>{item.name}</h3>
                <p>{item.subtitle}</p>

                <span className="m3-comparison-rate">
                  {formatPeso(item.perGuest)} / GUEST
                </span>

                <div className="m3-comparison-total">
                  <span>
                    VENUE + CATERING
                  </span>

                  <strong>
                    {formatPeso(item.estimate?.total)}
                  </strong>

                  <small>
                    For {guests} guests · no extras
                  </small>
                </div>

                <Link
                  to={`/planner?${new URLSearchParams({
                    venue: venueId,
                    package: item.id,
                    guests: String(guests),
                  })}`}
                >
                  CHOOSE THIS EDITION
                  <ArrowUpRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="m3-feature-comparison m3-container">
        <div>
          <span className="m3-overline">
            03 / INCLUDED CONCEPT DETAILS
          </span>

          <h2>
            The little things
            <em> add up.</em>
          </h2>

          <p>
            Included descriptions follow
            the original package dataset exactly.
            An empty mark means the feature
            was not explicitly listed for that
            edition—not necessarily that
            a real caterer would exclude it.
          </p>
        </div>

        <div className="m3-feature-table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">
                  SAMPLE INCLUSION
                </th>

                {comparisons.map((item) => (
                  <th
                    scope="col"
                    key={item.id}
                  >
                    {item.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {features.map((feature) => (
                <tr key={feature}>
                  <th scope="row">
                    {feature}
                  </th>

                  {comparisons.map((item) => (
                    <td key={item.id}>
                      {item.highlights.includes(
                        feature
                      ) ? (
                        <Check
                          size={18}
                          aria-label="Listed in this edition"
                        />
                      ) : (
                        <span aria-label="Not listed in this edition">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="m3-compare-next m3-container">
        <div>
          <span className="m3-overline">
            THE NEXT STEP
          </span>

          <h2>
            Choose the edition.
            <br />
            <em>Make it yours.</em>
          </h2>
        </div>

        <Link
          className="m3-gold-cta"
          to="/menus"
        >
          EXPLORE THE DINING ATELIER
          <ArrowRight size={18} />
        </Link>
      </section>

      <p className="m3-disclaimer">
        <Users size={15} />
        Fictional sample prices and capacity
        values. This tool does not issue
        a binding quotation.
      </p>
    </main>
  );
}