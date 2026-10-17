import { useMemo, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Gem,
  Heart,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Utensils,
} from "lucide-react";

import {
  ADDONS,
  EVENT_PERIODS,
  EVENT_TYPES,
  MENU_OPTIONS,
  PACKAGES,
  VENUES,
  calculateEstimate,
  dateAfter,
  findPackage,
  findVenue,
  formatDate,
  formatPeso,
} from "../data/eventData.js";

import "../styles/maison-celebrations.css";

const chapters = [
  "THE OCCASION",
  "THE SETTING",
  "THE CATERING",
  "THE MENU",
  "THE DETAILS",
  "THE SIGNATURE",
];

const byId = (records, id) =>
  records.find((item) => item.id === id) ||
  records[0];

function PlannerSession({
  params,
  quotes,
  onCreateQuote,
  onDeleteQuote,
  buildInitial,
}) {
  const [form, setForm] = useState(
    () => buildInitial(params, quotes)
  );

  const [error, setError] = useState("");
  const [confirmation, setConfirmation] =
    useState(null);
  const [activeStep, setActiveStep] =
    useState(0);

  const venue = byId(VENUES, form.venueId);
  const pack = byId(PACKAGES, form.packageId);

  const minimum = Math.max(
    venue.minGuests,
    pack.minimumGuests
  );

  const estimate = useMemo(
    () =>
      calculateEstimate({
        venueId: form.venueId,
        packageId: form.packageId,
        guests: form.guests,
        addonIds: form.addonIds,
      }),
    [
      form.venueId,
      form.packageId,
      form.guests,
      form.addonIds,
    ]
  );

  const edit = (key, value) => {
    setForm((before) => ({
      ...before,
      [key]: value,
    }));

    setError("");
    setConfirmation(null);
  };

  const choose = (key, id) => {
    setForm((before) => {
      const nextVenue =
        findVenue(
          key === "venueId"
            ? id
            : before.venueId
        ) || VENUES[0];

      const nextPackage =
        findPackage(
          key === "packageId"
            ? id
            : before.packageId
        ) || PACKAGES[0];

      const nextMin = Math.max(
        nextVenue.minGuests,
        nextPackage.minimumGuests
      );

      return {
        ...before,
        [key]: id,
        guests: Math.min(
          nextVenue.capacity,
          Math.max(
            nextMin,
            Number(before.guests) || nextMin
          )
        ),
      };
    });

    setError("");
    setConfirmation(null);
  };

  const chooseMenu = (course, value) => {
    setForm((before) => ({
      ...before,
      menu: {
        ...before.menu,
        [course]: value,
      },
    }));

    setError("");
    setConfirmation(null);
  };

  const chooseAddon = (id) => {
    setForm((before) => ({
      ...before,
      addonIds: before.addonIds.includes(id)
        ? before.addonIds.filter(
            (item) => item !== id
          )
        : [...before.addonIds, id],
    }));

    setError("");
    setConfirmation(null);
  };

  const submit = (event) => {
    event.preventDefault();

    const result = onCreateQuote(form);

    if (!result.ok) {
      setError(result.error);
      setConfirmation(null);
      return;
    }

    setConfirmation(result);
    setError("");

    setForm((before) => ({
      ...before,
      alias: "",
    }));
  };

  return (
    <main className="m3 m3-planner">
      <section className="m3-planner-hero">
        <div className="m3-container">
          <span className="m3-overline m3-on-dark">
            THE MAISON / YOUR EVENT DESIGN
            JOURNEY / 06 ACTS
          </span>

          <h1>
            Every celebration
            <em> begins with a vision.</em>
          </h1>

          <p>
            Compose the occasion, the setting,
            the table, and the finishing touches.
            Your non-binding estimate updates
            live as you design.
          </p>

          <div className="m3-planner-progress">
            {chapters.map((chapter, i) => (
              <a
                href={`#act-${i + 1}`}
                onClick={() =>
                  setActiveStep(i)
                }
                key={chapter}
                className={
                  activeStep === i
                    ? "is-active"
                    : ""
                }
              >
                <b>0{i + 1}</b>
                <span>{chapter}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="m3-container m3-planner-layout">
        <form
          className="m3-planner-sequence"
          onSubmit={submit}
        >
          {/* ACT 1 */}

          <section className="m3-act" id="act-1">
            <div className="m3-act-heading">
              <span>01 / AN OCCASION</span>

              <h2>
                Tell us <em>your story.</em>
              </h2>

              <p>
                Choose how you wish this
                fictional celebration to unfold.
              </p>
            </div>

            <div className="m3-fields">
              <label>
                TYPE OF CELEBRATION

                <select
                  value={form.eventType}
                  onChange={(e) =>
                    edit(
                      "eventType",
                      e.target.value
                    )
                  }
                >
                  {EVENT_TYPES.map((item) => (
                    <option key={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                YOUR GUEST COUNT

                <input
                  required
                  type="number"
                  min={minimum}
                  max={venue.capacity}
                  step="1"
                  value={form.guests}
                  onChange={(e) =>
                    edit("guests", e.target.value)
                  }
                />
              </label>

              <label>
                ILLUSTRATIVE EVENT DATE

                <input
                  required
                  type="date"
                  min={dateAfter(1)}
                  max={dateAfter(365)}
                  value={form.date}
                  onChange={(e) =>
                    edit("date", e.target.value)
                  }
                />
              </label>

              <label>
                TIME OF DAY

                <select
                  value={form.period}
                  onChange={(e) =>
                    edit("period", e.target.value)
                  }
                >
                  {EVENT_PERIODS.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name} / {item.time}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="m3-act-note">
              <CalendarDays size={17} />
              Dates are planning preferences.
              There is no live venue availability
              or reservation.
            </p>
          </section>

          {/* ACT 2 */}

          <section className="m3-act" id="act-2">
            <div className="m3-act-heading">
              <span>
                02 / THE PERFECT SETTING
              </span>

              <h2>
                Find your <em>somewhere.</em>
              </h2>

              <p>
                Four fictional venues. One space
                that suits your vision.
              </p>
            </div>

            <div className="m3-venue-selector">
              {VENUES.map((item) => (
                <button
                  className={
                    form.venueId === item.id
                      ? "is-selected"
                      : ""
                  }
                  type="button"
                  aria-pressed={
                    form.venueId === item.id
                  }
                  key={item.id}
                  onClick={() =>
                    choose("venueId", item.id)
                  }
                >
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                  />

                  <span>
                    <small>
                      {item.category} / UP TO{" "}
                      {item.capacity}
                    </small>

                    <strong>
                      {item.name}
                    </strong>

                    <small>
                      VENUE FROM{" "}
                      {formatPeso(item.baseRate)}
                    </small>
                  </span>

                  <span className="m3-choice-check">
                    {form.venueId === item.id ? (
                      <Check size={19} />
                    ) : (
                      <ArrowUpRight size={19} />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ACT 3 */}

          <section className="m3-act" id="act-3">
            <div className="m3-act-heading">
              <span>
                03 / THE CATERING EDIT
              </span>

              <h2>
                Make a <em>statement.</em>
              </h2>

              <p>
                Each sample catering option
                is priced per guest; the venue
                is separate.
              </p>
            </div>

            <div className="m3-package-selector">
              {PACKAGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    choose(
                      "packageId",
                      item.id
                    )
                  }
                  aria-pressed={
                    form.packageId === item.id
                  }
                  className={
                    form.packageId === item.id
                      ? "is-selected"
                      : ""
                  }
                >
                  <span>
                    EDITION {item.number}
                    {item.featured
                      ? " ✧ FEATURED"
                      : ""}
                  </span>

                  <strong>
                    {item.name}
                  </strong>

                  <p>{item.subtitle}</p>

                  <div>
                    {formatPeso(item.perGuest)}
                    <small> / GUEST</small>
                    <Check size={18} />
                  </div>
                </button>
              ))}
            </div>

            <Link
              className="m3-text-link"
              to="/compare"
            >
              EXPLORE THE FULL EDITION COMPARISON
              <ArrowUpRight size={17} />
            </Link>
          </section>

          {/* ACT 4 */}

          <section className="m3-act" id="act-4">
            <div className="m3-act-heading">
              <span>
                04 / A BEAUTIFUL TABLE
              </span>

              <h2>
                The dining <em>notes.</em>
              </h2>

              <p>
                Choose one fictional dish
                from each original menu course.
              </p>
            </div>

            <div className="m3-fields">
              {Object.entries(
                MENU_OPTIONS
              ).map(([course, choices]) => (
                <label key={course}>
                  {course.toUpperCase()} COURSE

                  <select
                    value={
                      form.menu[course]
                    }
                    onChange={(e) =>
                      chooseMenu(
                        course,
                        e.target.value
                      )
                    }
                  >
                    {choices.map((dish) => (
                      <option
                        key={dish}
                        value={dish}
                      >
                        {dish}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <p className="m3-act-note">
              <Utensils size={17} />
              Menus do not verify dietary,
              allergy, ingredient or
              production suitability.
            </p>

            <Link
              className="m3-text-link"
              to="/menus"
            >
              EXPLORE THE DINING ATELIER
              <ArrowRight size={17} />
            </Link>
          </section>

          {/* ACT 5 */}

          <section className="m3-act" id="act-5">
            <div className="m3-act-heading">
              <span>
                05 / THE FINAL FLOURISH
              </span>

              <h2>
                It's in the <em>details.</em>
              </h2>

              <p>
                Optional additions,
                calculated exactly as in the
                original quotation engine.
              </p>
            </div>

            <div className="m3-addon-selector">
              {ADDONS.map((item) => (
                <label
                  key={item.id}
                  className={
                    form.addonIds.includes(
                      item.id
                    )
                      ? "is-selected"
                      : ""
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      form.addonIds.includes(
                        item.id
                      )
                    }
                    onChange={() =>
                      chooseAddon(item.id)
                    }
                  />

                  <span>
                    <strong>
                      {item.name}
                    </strong>

                    <small>
                      {item.description}
                    </small>
                  </span>

                  <b>
                    +{formatPeso(item.price)}
                    <small>
                      {item.unit === "perGuest"
                        ? "/ GUEST"
                        : "/ FIXED"}
                    </small>
                  </b>
                </label>
              ))}
            </div>
          </section>

          {/* ACT 6 */}

          <section className="m3-act" id="act-6">
            <div className="m3-act-heading">
              <span>
                06 / SIGN YOUR STUDY
              </span>

              <h2>
                Give it <em>a name.</em>
              </h2>

              <p>
                Use a fictional alias only;
                no phone number, contact details
                or private customer information.
              </p>
            </div>

            <label className="m3-alias-label">
              YOUR EVENT ALIAS

              <input
                required
                minLength={2}
                maxLength={50}
                placeholder="e.g. A Night to Remember"
                value={form.alias}
                onChange={(e) =>
                  edit("alias", e.target.value)
                }
              />
            </label>

            <p className="m3-act-note">
              <ShieldCheck size={17} />
              Saving creates a browser-local
              portfolio record—not a venue
              request, real booking, or payment.
            </p>

            {error && (
              <div
                className="m3-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="m3-gold-cta m3-save"
              disabled={!estimate}
            >
              SAVE MY SAMPLE CELEBRATION
              <ArrowUpRight size={19} />
            </button>
          </section>
        </form>

        {/* LIVE QUOTATION SIDEBAR */}

        <aside className="m3-plan-aside">
          <div className="m3-live-preview">
            <div className="m3-preview-image">
              <img
                src={venue.image}
                alt={`Illustrative event setting: ${venue.name}`}
              />

              <span>
                LIVE EVENT STUDY / NO. 01
              </span>
            </div>

            <div className="m3-preview-content">
              <span className="m3-overline">
                YOUR CELEBRATION AT A GLANCE
              </span>

              <h2>
                It's coming
                <em> together.</em>
              </h2>

              <div className="m3-preview-facts">
                <div>
                  <Gem size={16} />
                  <span>{venue.name}</span>
                </div>

                <div>
                  <Users size={16} />
                  <span>
                    {form.guests} GUESTS
                  </span>
                </div>

                <div>
                  <CalendarDays size={16} />
                  <span>
                    {formatDate(form.date)}
                  </span>
                </div>

                <div>
                  <Clock3 size={16} />
                  <span>
                    {
                      EVENT_PERIODS.find(
                        (item) =>
                          item.id === form.period
                      )?.name
                    }
                  </span>
                </div>

                <div>
                  <Utensils size={16} />
                  <span>{pack.name}</span>
                </div>
              </div>

              <span className="m3-overline">
                ILLUSTRATIVE PRICE COMPOSITION
              </span>

              {estimate ? (
                <>
                  <div className="m3-preview-prices">
                    <div>
                      VENUE FEE
                      <strong>
                        {formatPeso(
                          estimate.venueTotal
                        )}
                      </strong>
                    </div>

                    <div>
                      CATERING /{" "}
                      {estimate.guests}
                      <strong>
                        {formatPeso(
                          estimate.cateringTotal
                        )}
                      </strong>
                    </div>

                    {estimate.addons.map(
                      (item) => (
                        <div key={item.id}>
                          {item.name.toUpperCase()}

                          <strong>
                            {formatPeso(
                              item.total
                            )}
                          </strong>
                        </div>
                      )
                    )}
                  </div>

                  <div className="m3-preview-total">
                    <span>
                      YOUR SAMPLE TOTAL
                    </span>

                    <strong>
                      {formatPeso(
                        estimate.total
                      )}
                    </strong>
                  </div>
                </>
              ) : (
                <div className="m3-error">
                  Guest count must be an integer
                  between {minimum} and{" "}
                  {venue.capacity}.
                </div>
              )}

              <p className="m3-tiny-note">
                Non-binding estimate. No real
                taxes, supplier fees, permits
                or logistics modeled.
              </p>

              <a
                href="#act-6"
                className="m3-text-link"
              >
                FINALIZE YOUR EVENT STUDY
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* SAVE CONFIRMATION */}

      {confirmation && (
        <section
          className="m3-success m3-container"
          aria-live="polite"
          role="status"
        >
          <CheckCircle2 size={38} />

          <span className="m3-overline">
            SAVED TO THIS BROWSER
          </span>

          <h2>
            A beautiful <em>beginning.</em>
          </h2>

          <p>
            Your fictional plan was saved
            as <strong>{confirmation.id}</strong>,
            with an illustrative total of{" "}
            <strong>
              {formatPeso(
                confirmation.total
              )}
            </strong>.
          </p>

          <p>
            This is not a booking confirmation.
          </p>

          <Link
            className="m3-gold-cta"
            to="/plans"
          >
            VIEW SAVED PROPOSALS
            <ArrowUpRight size={18} />
          </Link>
        </section>
      )}

      {/* EXISTING SAVED PROPOSALS */}

      <section className="m3-planner-saved m3-container">
        <div>
          <span className="m3-overline">
            THE EVENT LIBRARY
          </span>

          <h2>
            Your saved <em>stories.</em>
          </h2>

          <p>
            Browser-local event sketches.
            Open a proposal to revise it,
            or remove it when you're finished.
          </p>
        </div>

        <div>
          {quotes.length === 0 ? (
            <p className="m3-empty-plans">
              <Heart size={24} />
              No sample event studies
              saved yet.
            </p>
          ) : (
            quotes.slice(0, 4).map((quote) => (
              <article key={quote.id}>
                <div>
                  <small>
                    {quote.id}
                    {" / "}
                    {formatDate(quote.date)}
                  </small>

                  <h3>{quote.alias}</h3>

                  <p>
                    {
                      findVenue(
                        quote.venueId
                      )?.name || "Demo venue"
                    }
                    {" · "}
                    {quote.guests} guests
                  </p>

                  <strong>
                    {formatPeso(
                      quote.total
                    )}
                  </strong>
                </div>

                <div>
                  <Link
                    to={`/planner?clone=${encodeURIComponent(
                      quote.id
                    )}`}
                    aria-label={`Clone ${quote.alias}`}
                  >
                    <ArrowUpRight size={18} />
                    CLONE
                  </Link>

                  <button
                    type="button"
                    aria-label={`Delete ${quote.alias}`}
                    onClick={() =>
                      onDeleteQuote(quote.id)
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))
          )}

          <Link
            className="m3-text-link"
            to="/plans"
          >
            OPEN THE FULL PROPOSAL LIBRARY
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <p className="m3-disclaimer">
        <Sparkles size={15} />
        YOUR MOMENT is a fictional design
        portfolio. All plans remain local
        to your browser; no live
        reservations or transactions.
      </p>
    </main>
  );
}

export default function MaisonEventPlanner(props) {
  const [params] = useSearchParams();

  return (
    <PlannerSession
      {...props}
      params={params}
      key={params.toString()}
    />
  );
}