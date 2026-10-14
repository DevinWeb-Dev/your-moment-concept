import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Gem,
  Info,
  SlidersHorizontal,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import {
  VENUES,
  PACKAGES,
  calculateEstimate,
  formatPeso,
} from "../data/eventData.js";

import "../styles/experience.css";

export default function PackageComparePage() {
  const [venueId, setVenueId] = useState(
    VENUES[0].id
  );

  const [guestCount, setGuestCount] = useState(100);

  const [selectedIds, setSelectedIds] = useState(
    PACKAGES.map((item) => item.id)
  );

  const venue = VENUES.find(
    (item) => item.id === venueId
  );

  const selectedPackages = useMemo(
    () =>
      PACKAGES.filter((item) =>
        selectedIds.includes(item.id)
      ),
    [selectedIds]
  );

  const minimum = Math.max(
    venue.minGuests,
    ...selectedPackages.map(
      (item) => item.minimumGuests
    )
  );

  const guests = Math.min(
    venue.capacity,
    Math.max(minimum, Number(guestCount) || minimum)
  );

  const comparisons = useMemo(
    () =>
      selectedPackages.map((item) => ({
        ...item,

        estimate: calculateEstimate({
          venueId,
          packageId: item.id,
          guests,
          addonIds: [],
        }),
      })),
    [selectedPackages, venueId, guests]
  );

  const features = [
    ...new Set(
      selectedPackages.flatMap(
        (item) => item.highlights
      )
    ),
  ];

  function changeVenue(id) {
    const nextVenue = VENUES.find(
      (item) => item.id === id
    );

    if (!nextVenue) return;

    const nextMinimum = Math.max(
      nextVenue.minGuests,
      ...selectedPackages.map(
        (item) => item.minimumGuests
      )
    );

    setVenueId(id);

    setGuestCount((previous) =>
      Math.min(
        nextVenue.capacity,
        Math.max(
          nextMinimum,
          Number(previous) || nextMinimum
        )
      )
    );
  }

  function togglePackage(id) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        if (current.length === 1) return current;

        return current.filter(
          (item) => item !== id
        );
      }

      return [...current, id];
    });
  }

  return (
    <div className="yme-page">
      <section className="yme-page-hero">
        <div className="ym-container">
          <span className="ym-eyebrow is-light">
            THE CATERING PACKAGE COMPARISON
          </span>

          <h1>
            Find the right
            <br />
            <em>celebration experience.</em>
          </h1>

          <p>
            Compare sample package inclusions,
            adjust the guest count, and explore
            how each option changes your estimate.
          </p>
        </div>
      </section>

      <section className="yme-section ym-container">
        <div className="yme-section-title">
          <span className="ym-eyebrow">
            THE PLANNING DETAILS
          </span>

          <h2>
            Your event, <em>your choices.</em>
          </h2>
        </div>

        <div className="yme-compare-controls">
          <label className="yme-control-field">
            <span>SELECT THE VENUE</span>

            <select
              value={venueId}
              onChange={(event) =>
                changeVenue(event.target.value)
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

          <div className="yme-guests-control">
            <div>
              <span>ESTIMATED NUMBER OF GUESTS</span>

              <strong>
                <Users size={19} />
                {guests} guests
              </strong>
            </div>

            <input
              type="range"
              min={minimum}
              max={venue.capacity}
              step="1"
              value={guests}
              aria-label="Adjust guest count"
              onChange={(event) =>
                setGuestCount(
                  Number(event.target.value)
                )
              }
            />

            <div className="yme-range-labels">
              <span>{minimum} minimum</span>
              <span>{venue.capacity} maximum</span>
            </div>
          </div>
        </div>

        <div className="yme-package-visibility">
          <div>
            <SlidersHorizontal size={20} />

            <strong>
              Choose packages to compare
            </strong>
          </div>

          <div>
            {PACKAGES.map((item) => {
              const selected =
                selectedIds.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    togglePackage(item.id)
                  }
                  className={
                    selected ? "is-active" : ""
                  }
                >
                  {selected && <Check size={15} />}
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="yme-comparison-grid"
          style={{
            "--yme-cols": comparisons.length,
          }}
        >
          {comparisons.map((item) => (
            <article
              key={item.id}
              className={`yme-comparison-card ${
                item.featured ? "is-featured" : ""
              }`}
            >
              <div className="yme-comparison-card-top">
                <span>{item.number} / 03</span>

                {item.featured && (
                  <span>SIGNATURE EXPERIENCE</span>
                )}
              </div>

              <span className="ym-eyebrow">
                {item.eyebrow}
              </span>

              <h3>{item.name}</h3>

              <p>{item.description}</p>

              <div className="yme-comparison-price">
                <span>Sample catering per guest</span>

                <strong>
                  {formatPeso(item.perGuest)}
                </strong>
              </div>

              <div className="yme-comparison-breakdown">
                <div>
                  <span>Venue fee</span>

                  <strong>
                    {formatPeso(
                      item.estimate?.venueTotal
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Catering × {guests}
                  </span>

                  <strong>
                    {formatPeso(
                      item.estimate?.cateringTotal
                    )}
                  </strong>
                </div>
              </div>

              <div className="yme-comparison-total">
                <span>ESTIMATED SAMPLE TOTAL</span>

                <strong>
                  {formatPeso(
                    item.estimate?.total
                  )}
                </strong>
              </div>

              <Link
                className="ym-button"
                to={`/planner?${new URLSearchParams({
                  venue: venueId,
                  package: item.id,
                  guests: String(guests),
                }).toString()}`}
              >
                Customize This Option
                <ArrowUpRight size={18} />
              </Link>
            </article>
          ))}
        </div>

        <section className="yme-features-panel">
          <div className="yme-section-title">
            <span className="ym-eyebrow">
              AN IN-DEPTH COMPARISON
            </span>

            <h2>
              Every inclusion <em>matters.</em>
            </h2>
          </div>

          <div
            className="yme-table-scroll"
            role="region"
            aria-label="Scrollable catering package features comparison"
            tabIndex={0}
          >
            <table className="yme-features-table">
              <thead>
                <tr>
                  <th scope="col">
                    SAMPLE INCLUSIONS
                  </th>

                  {selectedPackages.map((item) => (
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

                    {selectedPackages.map((item) => (
                      <td key={item.id}>
                        {item.highlights.includes(
                          feature
                        ) ? (
                          <span
                            className="yme-feature-yes"
                            aria-label="Included"
                          >
                            <CheckCircle2 size={21} />
                          </span>
                        ) : (
                          <span
                            className="yme-feature-no"
                            aria-label="Not listed"
                          >
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

          <p className="yme-table-note">
            <Info size={17} />
            These are illustrative package descriptions,
            not confirmed supplier deliverables.
            Add-ons are calculated separately in
            the event planner.
          </p>
        </section>

        <div className="yme-next-experience">
          <div>
            <span className="ym-eyebrow is-light">
              THE NEXT BEAUTIFUL DETAIL
            </span>

            <h2>
              Now, let's talk
              <br />
              <em>about the menu.</em>
            </h2>

            <p>
              Explore sample starters, main courses,
              and desserts in the Catering Menu Studio.
            </p>
          </div>

          <Link
            to="/menus"
            className="ym-button is-champagne"
          >
            Open Catering Menu Studio
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}