import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Gem,
  MoveUpRight,
  Sparkles,
  Utensils,
  Users,
} from "lucide-react";

import {
  BRAND,
  IMAGES,
  VENUES,
  PACKAGES,
  FAQS,
  calculateEstimate,
  formatPeso,
} from "../data/eventData.js";

import "../styles/maison-gala.css";

function useReveal() {
  useEffect(() => {
    const nodes = [
      ...document.querySelectorAll("[data-mg-reveal]"),
    ];

    if (!nodes.length) return;

    if (
      !window.IntersectionObserver ||
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          entry.target.classList.add("mg-in-view");
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    for (const node of nodes) {
      node.classList.add("mg-await-view");
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, []);
}

function Eyebrow({ children, pale = false }) {
  return (
    <span
      className={`mg-kicker ${
        pale ? "mg-kicker-light" : ""
      }`}
    >
      {children}
    </span>
  );
}

function VenueFolio({ venue, index }) {
  return (
    <article
      className={`mg-folio mg-folio-${index + 1}`}
      data-mg-reveal
    >
      <Link
        className="mg-folio-image"
        to={`/venues/${venue.id}`}
        aria-label={`Explore ${venue.name}`}
      >
        <img
          src={venue.image}
          alt={`Illustrative setting for ${venue.name}`}
          loading="lazy"
        />

        <span className="mg-folio-number">
          NO. {venue.number} / 04
        </span>

        <span className="mg-folio-corner">
          <MoveUpRight
            size={24}
            strokeWidth={1.25}
          />
        </span>
      </Link>

      <div className="mg-folio-info">
        <div>
          <small>{venue.label}</small>
          <h3>{venue.name}</h3>
        </div>

        <p>{venue.tagline}</p>

        <span>
          <Users size={15} />
          UP TO {venue.capacity} GUESTS
        </span>
      </div>
    </article>
  );
}

function PlanningAtelier() {
  const [venueId, setVenueId] = useState(
    VENUES[0].id
  );

  const [guests, setGuests] = useState(100);

  const venue =
    VENUES.find((item) => item.id === venueId) ||
    VENUES[0];

  const minGuests = Math.max(
    venue.minGuests,
    PACKAGES[1].minimumGuests
  );

  const safeGuests = Math.min(
    venue.capacity,
    Math.max(minGuests, guests)
  );

  const estimate = useMemo(
    () =>
      calculateEstimate({
        venueId,
        packageId: "signature",
        guests: safeGuests,
      }),
    [venueId, safeGuests]
  );

  const plannerUrl =
    `/planner?venue=${encodeURIComponent(venueId)}` +
    `&package=signature&guests=${safeGuests}`;

  return (
    <section
      className="mg-planning"
      id="celebration-atelier"
    >
      <div
        className="mg-planning-copy"
        data-mg-reveal
      >
        <Eyebrow pale>
          04 / THE CELEBRATION ATELIER
        </Eyebrow>

        <h2>
          Imagine it.
          <br />
          <em>Shape it.</em>
          <br />
          Make it yours.
        </h2>

        <p>
          A little first look at your day.
          Choose the setting and the size
          of your gathering, then continue
          to the full event planner.
        </p>

        <span
          className="mg-planning-ornament"
          aria-hidden="true"
        >
          ✳
        </span>
      </div>

      <div
        className="mg-planning-form"
        data-mg-reveal
      >
        <div className="mg-planning-topline">
          <span>
            YOUR EVENT / THE FIRST SKETCH
          </span>

          <Sparkles size={20} />
        </div>

        <label className="mg-planning-select">
          <span>01 — YOUR SETTING</span>

          <select
            value={venueId}
            onChange={(event) => {
              const next = VENUES.find(
                (item) =>
                  item.id === event.target.value
              );

              if (!next) return;

              setVenueId(next.id);

              setGuests((current) =>
                Math.min(
                  next.capacity,
                  Math.max(
                    next.minGuests,
                    PACKAGES[1].minimumGuests,
                    current
                  )
                )
              );
            }}
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

        <label className="mg-planning-range">
          <span>
            02 — YOUR PEOPLE
            <strong>{safeGuests} GUESTS</strong>
          </span>

          <input
            type="range"
            min={minGuests}
            max={venue.capacity}
            step={1}
            value={safeGuests}
            onChange={(event) =>
              setGuests(Number(event.target.value))
            }
          />

          <small>
            <span>{minGuests} MINIMUM</span>
            <span>{venue.capacity} CAPACITY</span>
          </small>
        </label>

        <div className="mg-planning-quote">
          <div>
            <small>
              ILLUSTRATIVE STARTING ESTIMATE
            </small>

            <strong>
              {estimate
                ? formatPeso(estimate.total)
                : "—"}
            </strong>
          </div>

          <span>
            Venue + Signature sample catering
            package. No reservation or final
            quotation is created.
          </span>
        </div>

        <Link
          to={plannerUrl}
          className="mg-primary mg-planning-submit"
        >
          BUILD MY SAMPLE PLAN
          <ArrowUpRight size={20} />
        </Link>
      </div>
    </section>
  );
}

export default function MaisonGalaHome() {
  useReveal();

  return (
    <main className="mg-home">
      {/* HERO */}

      <section className="mg-hero">
        <div
          className="mg-hero-grain"
          aria-hidden="true"
        />

        <div className="mg-hero-inner">
          <div className="mg-hero-copy">
            <Eyebrow pale>
              MAISON GALA — THE SCULPTED
              CELEBRATION EDIT
            </Eyebrow>

            <h1>
              Some moments
              <br />
              deserve to be
              <br />
              <em>extraordinary.</em>
            </h1>

            <p>
              Venues with a sense of theatre.
              Catering with a point of view.
              Celebrations composed around
              your most meaningful people.
            </p>

            <div className="mg-hero-actions">
              <Link
                to="/venues"
                className="mg-primary"
              >
                DISCOVER THE VENUES
                <ArrowUpRight size={20} />
              </Link>

              <Link
                to="/planner"
                className="mg-text-button"
              >
                CREATE YOUR MOMENT
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mg-hero-foot">
              <span>THE ART OF HOSTING</span>
              <span>01 / 06</span>
              <ArrowDown size={17} />
            </div>
          </div>

          <div className="mg-hero-stage">
            <span
              className="mg-stage-ring mg-stage-ring-one"
              aria-hidden="true"
            />

            <span
              className="mg-stage-ring mg-stage-ring-two"
              aria-hidden="true"
            />

            <div className="mg-hero-arch">
              <img
                src={IMAGES.hero}
                alt="Romantic event venue with elegant architectural styling"
                fetchPriority="high"
              />
            </div>

            <div className="mg-stage-polaroid">
              <img
                src={IMAGES.editorial}
                alt="Celebration dining styling inspiration"
              />

              <span>
                AN AFFAIR TO REMEMBER / VOL. 01
              </span>
            </div>

            <div
              className="mg-stage-seal"
              aria-label="The art of the occasion"
            >
              <Gem
                size={24}
                strokeWidth={1.2}
              />

              <span>
                THE ART
                <br />
                OF THE
                <br />
                OCCASION
              </span>
            </div>

            <div className="mg-hero-stage-note">
              A CELEBRATION MADE PERSONAL
              <ArrowUpRight size={15} />
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED CELEBRATION RIBBON */}

      <div
        className="mg-ribbon"
        aria-label="Wedding receptions, debuts, intimate gatherings, corporate galas"
      >
        <div
          className="mg-ribbon-track"
          aria-hidden="true"
        >
          {[0, 1].map((i) => (
            <span key={i}>
              WEDDINGS <i>✧</i>
              DEBUTS <i>✧</i>
              INTIMATE AFFAIRS <i>✧</i>
              CORPORATE GALAS <i>✧</i>
              CELEBRATIONS <i>✧</i>
            </span>
          ))}
        </div>
      </div>

      {/* EDITORIAL PROLOGUE */}

      <section
        className="mg-prologue mg-wrap"
        data-mg-reveal
      >
        <div className="mg-prologue-code">
          <Eyebrow>
            01 / A NOTE FROM THE MAISON
          </Eyebrow>

          <span>
            BEAUTY IS IN THE WAY WE GATHER.
          </span>
        </div>

        <h2>
          Not just an event.
          <br />
          <em>A feeling that stays.</em>
        </h2>

        <div className="mg-prologue-bottom">
          <p>
            Every story deserves its own
            setting. Explore four imagined
            venues, beautifully considered
            catering, and a planning experience
            that makes the details feel effortless.
          </p>

          <span
            className="mg-prologue-mark"
            aria-hidden="true"
          >
            ✳
          </span>
        </div>
      </section>

      {/* ASYMMETRIC VENUE COLLECTION */}

      <section
        className="mg-venues-section"
        id="venues"
      >
        <div className="mg-wrap">
          <div
            className="mg-section-head"
            data-mg-reveal
          >
            <div>
              <Eyebrow>
                02 / THE VENUE COLLECTION
              </Eyebrow>

              <h2>
                Places with
                <br />
                <em>a point of view.</em>
              </h2>
            </div>

            <div>
              <p>
                Four distinct atmospheres,
                one beautiful question: how
                do you want your celebration
                to feel?
              </p>

              <Link
                to="/venues"
                className="mg-inline-link"
              >
                VIEW ALL VENUES
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          <div className="mg-folios">
            {VENUES.map((venue, index) => (
              <VenueFolio
                venue={venue}
                index={index}
                key={venue.id}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CATERING EDITORIAL */}

      <section
        className="mg-dining"
        data-mg-reveal
      >
        <div className="mg-dining-photo">
          <img
            src={IMAGES.dining}
            loading="lazy"
            alt="Fine dining tablescape for a special occasion"
          />

          <span className="mg-dining-photo-label">
            THE TABLE / ACT TWO
          </span>
        </div>

        <div className="mg-dining-copy">
          <Eyebrow>
            03 / CATERING AS AN EXPERIENCE
          </Eyebrow>

          <h2>
            The table
            <br />
            is where
            <br />
            <em>magic happens.</em>
          </h2>

          <p>
            From your first toast to the final
            course, explore thoughtful menu
            concepts and elegant presentation
            designed for memorable gatherings.
          </p>

          <div className="mg-dining-points">
            <span>
              <Utensils size={19} />
              Curated sample courses
            </span>

            <span>
              <Check size={19} />
              Three catering edits to explore
            </span>

            <span>
              <Sparkles size={19} />
              A menu studio made for you
            </span>
          </div>

          <div className="mg-dining-links">
            <Link
              className="mg-primary mg-primary-dark"
              to="/menus"
            >
              CREATE A SAMPLE MENU
              <ArrowUpRight size={18} />
            </Link>

            <Link
              to="/packages"
              className="mg-inline-link"
            >
              SEE THE PACKAGES
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PLANNER */}

      <PlanningAtelier />

      {/* CATERING PACKAGE FOLIOS */}

      <section
        className="mg-packages-section mg-wrap"
        data-mg-reveal
      >
        <div className="mg-section-head">
          <div>
            <Eyebrow>
              05 / THE CELEBRATION EDITS
            </Eyebrow>

            <h2>
              Considered from
              <br />
              <em>first to final toast.</em>
            </h2>
          </div>

          <div>
            <p>
              Three flexible sample catering
              concepts—from quiet elegance
              to full-scale grandeur.
            </p>

            <Link
              to="/compare"
              className="mg-inline-link"
            >
              COMPARE THE COLLECTION
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>

        <div className="mg-package-grid">
          {PACKAGES.map((item, index) => (
            <Link
              to={`/planner?package=${item.id}`}
              className={`mg-package ${
                item.featured ? "is-featured" : ""
              }`}
              key={item.id}
            >
              <span className="mg-package-index">
                0{index + 1} / THE EDIT
                <Gem size={18} />
              </span>

              <h3>{item.name}</h3>
              <p>{item.subtitle}</p>

              <div>
                <small>
                  FROM {formatPeso(item.perGuest)}
                  {" / "}GUEST*
                </small>

                <ArrowUpRight size={22} />
              </div>
            </Link>
          ))}
        </div>

        <p className="mg-fineprint">
          *Illustrative per-guest catering
          amounts only. Venue rates and
          other choices are separate.
        </p>
      </section>

      {/* THE CLOSING CURTAIN */}

      <section className="mg-curtain">
        <span
          className="mg-curtain-orbit"
          aria-hidden="true"
        />

        <div className="mg-curtain-photo">
          <img
            src={IMAGES.flowers}
            alt="Soft floral celebration styling"
            loading="lazy"
          />
        </div>

        <div
          className="mg-curtain-content"
          data-mg-reveal
        >
          <Eyebrow pale>
            06 / THE NEXT CHAPTER
          </Eyebrow>

          <h2>
            Your people.
            <br />
            <em>Your kind of magic.</em>
          </h2>

          <p>
            Every wonderful occasion begins
            with a beautiful possibility.
          </p>

          <Link
            to="/planner"
            className="mg-primary"
          >
            START YOUR CELEBRATION
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </section>

      {/* FAQ */}

      <section
        className="mg-faq mg-wrap"
        data-mg-reveal
      >
        <div>
          <Eyebrow>
            THE SMALL PRINT / CLEAR BY DESIGN
          </Eyebrow>

          <h2>
            Good questions.
            <br />
            <em>Thoughtful answers.</em>
          </h2>
        </div>

        <div className="mg-faq-list">
          {FAQS.map((item, index) => (
            <details key={item.question}>
              <summary>
                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <strong>{item.question}</strong>
                <b>+</b>
              </summary>

              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mg-concept-notice">
        <CalendarDays size={16} />
        {BRAND.name} is a fictional portfolio
        concept. No real venues, live reservations,
        confirmed catering, or payments.
      </p>
    </main>
  );
}