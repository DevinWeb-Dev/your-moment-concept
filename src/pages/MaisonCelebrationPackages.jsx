import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  Gem,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react";

import {
  VENUES,
  PACKAGES,
  IMAGES,
  calculateEstimate,
  formatPeso,
} from "../data/eventData.js";

import "../styles/maison-celebrations.css";

const chapter = {
  essential: {
    number: "I",
    mood: "THE GENTLE BEGINNING",
    image: IMAGES.flowers,
    adjective: "quiet elegance",
    className: "m3-essential",
  },
  signature: {
    number: "II",
    mood: "THE ART OF THE OCCASION",
    image: IMAGES.editorial,
    adjective: "beautiful balance",
    className: "m3-signature",
  },
  grand: {
    number: "III",
    mood: "THE MAGNIFICENT AFFAIR",
    image: IMAGES.dining,
    adjective: "grand theatre",
    className: "m3-grand",
  },
};

export default function MaisonCelebrationPackages() {
  const [venueId, setVenueId] = useState(VENUES[0].id);
  const [activeId, setActiveId] = useState("signature");
  const [guestCount, setGuestCount] = useState(100);

  const venue =
    VENUES.find((item) => item.id === venueId) ||
    VENUES[0];

  const currentPackage =
    PACKAGES.find((item) => item.id === activeId) ||
    PACKAGES[1];

  const minimum = Math.max(
    venue.minGuests,
    currentPackage.minimumGuests
  );

  const guests = Math.min(
    venue.capacity,
    Math.max(minimum, Number(guestCount) || minimum)
  );

  const estimate = useMemo(
    () =>
      calculateEstimate({
        venueId,
        packageId: activeId,
        guests,
      }),
    [venueId, activeId, guests]
  );

  const plannerLink =
    `/planner?${new URLSearchParams({
      venue: venueId,
      package: activeId,
      guests: String(guests),
    }).toString()}`;

  return (
    <main className="m3 m3-packages">
      <section className="m3-package-hero">
        <div className="m3-package-hero-copy">
          <span className="m3-overline m3-on-dark">
            THE MAISON / DINING EDITIONS / 03
          </span>

          <h1>
            Consider every <em>little wonder.</em>
          </h1>

          <p>
            Three beautifully imagined ways to host.
            Crafted as an editorial exploration of the
            dining, service and details that make a
            celebration feel like yours.
          </p>

          <a
            className="m3-inline m3-on-dark"
            href="#celebration-editions"
          >
            DISCOVER THE THREE EDITIONS
            <ArrowDownRight size={17} />
          </a>

          <span className="m3-hero-caption">
            CHAMPAGNE TOASTS · BEAUTIFUL TABLES ·
            PERSONAL STORIES
          </span>
        </div>

        <div className="m3-package-hero-art">
          <div
            className="m3-ring m3-ring-a"
            aria-hidden="true"
          />
          <div
            className="m3-ring m3-ring-b"
            aria-hidden="true"
          />

          <img
            src={IMAGES.dining}
            alt="An illustrative luxury catered event tablescape"
          />

          <span className="m3-photo-stamp">
            THE ART
            <br />
            OF FEASTING <Gem size={22} />
          </span>
        </div>
      </section>

      <section
        className="m3-intro m3-container"
        id="celebration-editions"
      >
        <span className="m3-overline">
          01 / THE CELEBRATION EDITS
        </span>

        <div>
          <h2>
            Three editions.
            <br />
            <em>Endless possibilities.</em>
          </h2>

          <p>
            Choose an edition below. Every price is
            a fictional catering example, shown
            separately from venue costs and optional
            extras.
          </p>
        </div>
      </section>

      <section
        className="m3-editions m3-container"
        aria-label="Catering packages"
      >
        {PACKAGES.map((item, index) => {
          const art = chapter[item.id];

          return (
            <article
              key={item.id}
              className={`m3-edition ${art.className} ${
                item.featured ? "is-featured" : ""
              }`}
            >
              <div className="m3-edition-image">
                <img
                  src={art.image}
                  alt={`${item.name} celebration moodboard`}
                  loading="lazy"
                />

                <span className="m3-edition-label">
                  EDITION {art.number} / {art.mood}
                </span>

                <span
                  className="m3-edition-roman"
                  aria-hidden="true"
                >
                  {art.number}
                </span>
              </div>

              <div className="m3-edition-copy">
                <span className="m3-overline">
                  0{index + 1} / {item.eyebrow}
                </span>

                <h3>
                  {item.name}
                  <i>.</i>
                </h3>

                <p>{item.description}</p>

                <div className="m3-edition-price">
                  <span>
                    ILLUSTRATIVE CATERING FROM
                  </span>

                  <strong>
                    {formatPeso(item.perGuest)}
                    <small> / guest*</small>
                  </strong>
                </div>

                <div className="m3-edition-inclusions">
                  {item.highlights.map((highlight) => (
                    <span key={highlight}>
                      <Check size={15} />
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="m3-edition-foot">
                  <span>
                    <Users size={16} />
                    From {item.minimumGuests} guests
                  </span>

                  <Link
                    to={`/planner?package=${item.id}`}
                  >
                    CURATE THIS EDITION
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="m3-quote-theatre">
        <div className="m3-quote-copy">
          <span className="m3-overline m3-on-dark">
            02 / THE FIRST ESTIMATE
          </span>

          <h2>
            A first sketch of <em>your occasion.</em>
          </h2>

          <p>
            Explore how a selected venue, catering
            edition and guest count work together.
            All figures are illustrative and calculated
            by the original YOUR MOMENT quotation engine.
          </p>

          <div
            className="m3-quote-art"
            aria-hidden="true"
          >
            ✳
          </div>
        </div>

        <div className="m3-quote-form">
          <span className="m3-overline">
            BUILD YOUR SAMPLE COMPOSITION
          </span>

          <label>
            01 / THE VENUE

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
            02 / THE CATERING EDITION

            <select
              value={activeId}
              onChange={(e) =>
                setActiveId(e.target.value)
              }
            >
              {PACKAGES.map((item) => (
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
            03 / THE GUESTS
            <strong>{guests}</strong>

            <input
              aria-label="Guest count"
              type="range"
              min={minimum}
              max={venue.capacity}
              value={guests}
              onChange={(e) =>
                setGuestCount(Number(e.target.value))
              }
            />

            <small>
              MIN {minimum} / MAX {venue.capacity}
            </small>
          </label>

          {estimate && (
            <div className="m3-cost">
              <span>
                VENUE
                <b>
                  {formatPeso(estimate.venueTotal)}
                </b>
              </span>

              <span>
                CATERING
                <b>
                  {formatPeso(estimate.cateringTotal)}
                </b>
              </span>

              <div>
                ILLUSTRATIVE TOTAL
                <strong>
                  {formatPeso(estimate.total)}
                </strong>
              </div>
            </div>
          )}

          <Link
            to={plannerLink}
            className="m3-gold-cta"
          >
            CONTINUE TO THE EVENT PLANNER
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      <section className="m3-dual-links m3-container">
        <Link to="/compare">
          <CircleDollarSign size={26} />

          <span>
            THE CONSIDERED CHOICE
            <strong>
              Compare all three editions
            </strong>
          </span>

          <ArrowUpRight size={22} />
        </Link>

        <Link to="/menus">
          <Utensils size={26} />

          <span>
            THE DINING ATELIER
            <strong>
              Compose a sample menu
            </strong>
          </span>

          <ArrowUpRight size={22} />
        </Link>
      </section>

      <p className="m3-disclaimer">
        <Sparkles size={15} />
        *Fictional portfolio demonstration.
        No real catering, quotations, availability
        or payments.
      </p>
    </main>
  );
}