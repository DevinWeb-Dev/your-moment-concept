import { useEffect, useMemo, useState } from "react";

import {
  Link,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Gem,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  IMAGES,
  VENUES,
  PACKAGES,
  ADDONS,
  MENU_OPTIONS,
  EVENT_TYPES,
  EVENT_PERIODS,
  findVenue,
  findPackage,
  formatPeso,
  dateAfter,
  localDateKey,
  calculateEstimate,
} from "./data/eventData.js";

// BATCH 2 — ADVANCED EVENT PLANNING

import EventCalendarPage from "./pages/EventCalendarPage.jsx";



import QuoteManagerPage from "./pages/QuoteManagerPage.jsx";

// BATCH 3 — EVENT OPERATIONS

import OperationsLayout from "./components/OperationsLayout.jsx";

import CommandCenterPage from "./pages/ops/CommandCenterPage.jsx";

import ProposalDeskPage from "./pages/ops/ProposalDeskPage.jsx";

import VenueSchedulePage from "./pages/ops/VenueSchedulePage.jsx";

import EventRunSheetPage from "./pages/ops/EventRunSheetPage.jsx";

import {
  OPERATIONS_KEY,
  PLAN_STAGES,
  PREPARATION_TASKS,
  loadOperations,
  getPlanOps,
} from "./data/eventOps.js";

// ==========================================
// BATCH 4 — BUSINESS INTELLIGENCE
// ==========================================

import {
  ReportsPage,
  VenueInsightsPage,
  StudioSettingsPage,
  DataCenterPage,
} from "./pages/ops/BusinessIntelligencePages.jsx";

import {
  SETTINGS_KEY,
  loadSettings,
  validateSettings,
} from "./data/intelligence.js";

// BATCH 5 — PREMIUM WEBSITE EXPERIENCE

import SiteExperience from "./components/SiteExperience.jsx";

import "./styles/site.css";
import MaisonStaffOperations from "./pages/MaisonStaffOperations.jsx";

import MaisonCelebrationPackages from "./pages/MaisonCelebrationPackages.jsx";

import MaisonPackageComparison from "./pages/MaisonPackageComparison.jsx";

import MaisonCateringAtelier from "./pages/MaisonCateringAtelier.jsx";

import MaisonEventPlanner from "./pages/MaisonEventPlanner.jsx";
import { MaisonHeader, MaisonFooter } from "./components/MaisonGalaChrome.jsx";
import MaisonGalaHome from "./pages/MaisonGalaHome.jsx";

const STORAGE_KEY = "your-moment-demo-quotes-v1";

function buildPlannerInitialForm(params, quotes) {
  const cloneId = params.get("clone");

  const clone =
    quotes.find(
      (item) => item.id === cloneId
    ) || null;

  const venue =
    findVenue(params.get("venue")) ||
    findVenue(clone?.venueId) ||
    VENUES[0];

  const packageItem =
    findPackage(params.get("package")) ||
    findPackage(clone?.packageId) ||
    PACKAGES[1];

  const minimumGuests = Math.max(
    venue.minGuests,
    packageItem.minimumGuests
  );

  const requestedCount = Number(
    params.get("guests") ??
      clone?.guests ??
      90
  );

  const guests = Math.min(
    venue.capacity,
    Math.max(
      minimumGuests,
      Number.isFinite(requestedCount)
        ? Math.round(requestedCount)
        : minimumGuests
    )
  );

  const requestedDate =
    params.get("date") ||
    clone?.date ||
    dateAfter(30);

  const dateObject = new Date(
    `${requestedDate}T12:00:00`
  );

  const validDate =
    typeof requestedDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) &&
    !Number.isNaN(dateObject.getTime()) &&
    localDateKey(dateObject) === requestedDate &&
    requestedDate >= dateAfter(1) &&
    requestedDate <= dateAfter(365);

  const date = validDate
    ? requestedDate
    : dateAfter(30);

  const requestedPeriod =
    params.get("period") ||
    clone?.period ||
    "evening";

  const period = EVENT_PERIODS.some(
    (item) => item.id === requestedPeriod
  )
    ? requestedPeriod
    : "evening";

  const eventType =
    EVENT_TYPES.includes(clone?.eventType)
      ? clone.eventType
      : EVENT_TYPES[0];

  const menu = {};

  for (const course of [
    "starter",
    "main",
    "dessert",
  ]) {
    const requestedDish =
      params.get(course) ||
      clone?.menu?.[course];

    menu[course] =
      MENU_OPTIONS[course].includes(requestedDish)
        ? requestedDish
        : MENU_OPTIONS[course][0];
  }

  const addonIds = Array.isArray(clone?.addonIds)
    ? [
        ...new Set(
          clone.addonIds.filter((id) =>
            ADDONS.some(
              (addon) => addon.id === id
            )
          )
        ),
      ]
    : [];

  return {
    venueId: venue.id,
    packageId: packageItem.id,
    eventType,
    guests,
    date,
    period,

    alias:
      typeof clone?.alias === "string"
        ? `${clone.alias} Copy`.slice(0, 50)
        : "",

    menu,
    addonIds,
  };
}

function loadQuotes() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.venueId === "string" &&
        typeof item.packageId === "string" &&
        typeof item.total === "number"
    );
  } catch {
    return [];
  }
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const titles = {
  "/": "Home",
  "/venues": "Our Venues",
  "/packages": "Catering Packages",
  "/compare": "Compare Event Packages",
  "/calendar": "Event Calendar",
  "/menus": "Catering Menu Studio",
  "/plans": "Saved Event Plans",
      "/gallery": "Event Gallery",
      "/planner": "Plan Your Event",
      "/staff": "Event Command Center",
      "/staff/desk": "Proposal Desk",
      "/staff/schedule": "Weekly Venue Schedule",
      "/staff/run-sheet": "Event Run Sheet",
      "/staff/reports": "Reports & Trends",
"/staff/insights": "Venue Insights",
"/staff/settings": "Studio Settings",
"/staff/data": "Data & Backups",
    };

    const title = pathname.startsWith("/venues/")
      ? "Venue Details"
      : titles[pathname] || "Page";

    document.title = `${title} | YOUR MOMENT.`;
  }, [pathname]);

  return null;
}

// MAISON GALA BATCH 1 / PUBLIC SHELL
function Header() { return <MaisonHeader />; }
function Footer() { return <MaisonFooter />; }

function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
}) {
  return (
    <div className="ym-section-heading">
      <div>
        <span className="ym-eyebrow">{eyebrow}</span>

        <h2>
          {title}
          <br />
          <em>{accent}</em>
        </h2>
      </div>

      {description && <p>{description}</p>}
    </div>
  );
}

function VenueCard({ venue }) {
  return (
    <article className="ym-venue-card">
      <Link
        to={`/venues/${venue.id}`}
        className="ym-venue-photo"
        aria-label={`View ${venue.name}`}
      >
        <img
          src={venue.image}
          alt={`Illustrative event setting for ${venue.name}`}
          loading="lazy"
        />

        <span className="ym-photo-number">
          {venue.number} / 04
        </span>

        <span className="ym-photo-arrow">
          <ArrowUpRight size={22} />
        </span>
      </Link>

      <div className="ym-venue-card-body">
        <span className="ym-eyebrow">
          {venue.label}
        </span>

        <h3>{venue.name}</h3>
        <p>{venue.tagline}</p>

        <div className="ym-venue-meta">
          <span>
            <Users size={17} />
            Up to {venue.capacity} guests
          </span>

          <strong>
            From {formatPeso(venue.baseRate)}*
          </strong>
        </div>

        <Link
          to={`/venues/${venue.id}`}
          className="ym-text-link"
        >
          Discover the venue
          <ArrowRight size={18} />
        </Link>
      </div>
    </article>
  );
}

// MAISON GALA BATCH 1 / NEW HOMEPAGE
function HomePage() { return <MaisonGalaHome />; }

function VenuesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [guests, setGuests] = useState("all");

  const categories = [
    "All",
    "Garden",
    "Ballroom",
    "Courtyard",
    "Rooftop",
  ];

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return VENUES.filter((venue) => {
      const matchesSearch =
        !term ||
        [
          venue.name,
          venue.tagline,
          venue.description,
          venue.category,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesCategory =
        category === "All" ||
        category === venue.category;

      const matchesCapacity =
        guests === "all" ||
        venue.capacity >= Number(guests);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCapacity
      );
    });
  }, [query, category, guests]);

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setGuests("all");
  }

  return (
    <div className="ym-page">
      <section className="ym-page-hero">
        <div className="ym-container ym-page-hero-grid">
          <div>
            <span className="ym-eyebrow">
              THE VENUE COLLECTION
            </span>

            <h1>
              Find the place
              <br />
              for <em>your story.</em>
            </h1>

            <p>
              From intimate celebrations to
              unforgettable grand occasions,
              explore our fictional collection
              of beautiful event settings.
            </p>
          </div>

          <img
            src={IMAGES.wedding}
            alt="Romantic wedding venue inspiration"
          />
        </div>
      </section>

      <section className="ym-section ym-container">
        <div className="ym-catalog-heading">
          <div>
            <span className="ym-eyebrow">
              ALL FOUR VENUE CONCEPTS
            </span>

            <h2>
              Your perfect <em>setting.</em>
            </h2>
          </div>

          <label className="ym-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search venues..."
              aria-label="Search venues"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
            />
          </label>
        </div>

        <div className="ym-venue-filters">
          <div
            className="ym-filter-buttons"
            role="group"
            aria-label="Venue type"
          >
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                className={
                  category === item ? "is-active" : ""
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>
            ))}
          </div>

          <label className="ym-capacity-filter">
            <Users size={17} />

            <select
              aria-label="Minimum guest capacity"
              value={guests}
              onChange={(event) =>
                setGuests(event.target.value)
              }
            >
              <option value="all">
                Any capacity
              </option>

              <option value="100">
                100+ guests
              </option>

              <option value="200">
                200+ guests
              </option>

              <option value="300">
                300+ guests
              </option>
            </select>
          </label>
        </div>

        <div className="ym-results-count">
          {filtered.length} sample venues found
        </div>

        {filtered.length === 0 ? (
          <div className="ym-empty-state">
            <Search size={32} />
            <h3>No matching venues.</h3>

            <p>
              Try a different category, guest count,
              or keyword.
            </p>

            <button
              type="button"
              className="ym-button"
              onClick={clearFilters}
            >
              Clear Filters
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <div className="ym-venues-grid is-catalog">
            {filtered.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
              />
            ))}
          </div>
        )}

        <p className="ym-disclaimer">
          *All venue capacities, rates and
          features are fictional portfolio examples.
        </p>
      </section>
    </div>
  );
}

function VenueDetailsPage() {
  const { venueId } = useParams();

  const venue = findVenue(venueId);

  if (!venue) {
    return <NotFoundPage />;
  }

  const related = VENUES.filter(
    (item) => item.id !== venue.id
  ).slice(0, 2);

  return (
    <div className="ym-page">
      <section className="ym-details-hero">
        <div className="ym-container">
          <div className="ym-breadcrumbs">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <Link to="/venues">Venues</Link>
            <ChevronRight size={14} />
            <strong>{venue.name}</strong>
          </div>

          <div className="ym-details-grid">
            <div className="ym-details-copy">
              <span className="ym-eyebrow">
                {venue.label}
              </span>

              <h1>
                {venue.name}
                <em>.</em>
              </h1>

              <p>{venue.description}</p>

              <div className="ym-details-facts">
                <div>
                  <Users size={23} />

                  <span>
                    <small>Illustrative capacity</small>
                    <strong>
                      {venue.minGuests}–{venue.capacity} guests
                    </strong>
                  </span>
                </div>

                <div>
                  <Gem size={23} />

                  <span>
                    <small>Sample venue fee from</small>
                    <strong>
                      {formatPeso(venue.baseRate)}
                    </strong>
                  </span>
                </div>
              </div>

              <Link
                to={`/planner?venue=${venue.id}`}
                className="ym-button"
              >
                Build Your Event Estimate
                <ArrowUpRight size={19} />
              </Link>
            </div>

            <div className="ym-details-cover">
              <img
                src={venue.image}
                alt={`Illustrative ${venue.name} event venue`}
              />

              <span>
                YOUR MOMENT / VENUE {venue.number}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="ym-section ym-container">
        <div className="ym-details-information">
          <div>
            <span className="ym-eyebrow">
              THE EXPERIENCE
            </span>

            <h2>
              A space made
              <br />
              for <em>togetherness.</em>
            </h2>

            <p>{venue.description}</p>

            <h3>Beautifully suited for</h3>

            <div className="ym-tag-list">
              {venue.idealFor.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <aside className="ym-details-panel">
            <span className="ym-eyebrow">
              THE VENUE OVERVIEW
            </span>

            <h3>
              Every thoughtful
              <br />
              <em>detail.</em>
            </h3>

            {venue.features.map((item) => (
              <div
                key={item}
                className="ym-detail-feature"
              >
                <Check size={17} />
                {item}
              </div>
            ))}

            <div className="ym-details-notice">
              <ShieldCheck size={22} />

              <p>
                Venue specifications are
                illustrations, not verified
                facilities or real availability.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="ym-container ym-details-gallery">
        {venue.gallery.map((image, index) => (
          <div key={`${venue.id}-${index}`}>
            <img
              src={image}
              alt={`${venue.name} editorial inspiration ${index + 1}`}
              loading="lazy"
            />
          </div>
        ))}
      </section>

      <section className="ym-section ym-container">
        <SectionHeading
          eyebrow="MORE PLACES TO CELEBRATE"
          title="Discover another"
          accent="beautiful setting."
        />

        <div className="ym-venues-grid is-related">
          {related.map((item) => (
            <VenueCard key={item.id} venue={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PackagesPage() {
  return <MaisonCelebrationPackages />;
}

function GalleryPage() {
  const photos = [
    {
      src: IMAGES.hero,
      title: "A Grand Beginning",
      type: "THE SETTING",
    },
    {
      src: IMAGES.editorial,
      title: "Thoughtful Dining",
      type: "THE TABLE",
    },
    {
      src: IMAGES.flowers,
      title: "A Romantic Detail",
      type: "THE FLOWERS",
    },
    {
      src: IMAGES.dining,
      title: "An Evening Together",
      type: "THE CELEBRATION",
    },
    {
      src: IMAGES.wedding,
      title: "For Every Beautiful Moment",
      type: "THE EXPERIENCE",
    },
  ];

  return (
    <div className="ym-page">
      <section className="ym-gallery-hero">
        <div className="ym-container">
          <span className="ym-eyebrow">
            THE EDITORIAL JOURNAL
          </span>

          <h1>
            The art of
            <br />
            <em>celebrating beautifully.</em>
          </h1>

          <p>
            An editorial gallery of visual
            inspiration, materials, arrangements
            and beautifully imagined celebrations.
          </p>
        </div>
      </section>

      <section className="ym-section ym-container">
        <div className="ym-gallery-grid">
          {photos.map((photo, index) => (
            <figure
              key={photo.title}
              className={`ym-gallery-item item-${index + 1}`}
            >
              <img
                src={photo.src}
                alt={`Event concept editorial: ${photo.title}`}
                loading="lazy"
              />

              <figcaption>
                <span>{photo.type}</span>
                <strong>{photo.title}</strong>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="ym-gallery-disclaimer">
          <ShieldCheck size={24} />

          <p>
            <strong>Editorial reference images only.</strong>{" "}
            These photographs are used as
            presentation inspiration and do not
            show actual YOUR MOMENT venues,
            employees, clients, or completed events.
          </p>
        </div>
      </section>
    </div>
  );
}

function PlannerPage(props) {
  return (
    <MaisonEventPlanner
      {...props}
      buildInitial={buildPlannerInitialForm}
    />
  );
}

function NotFoundPage() {
  return (
    <section className="ym-container ym-not-found">
      <span className="ym-eyebrow">
        PAGE NOT FOUND
      </span>

      <h1>
        The celebration
        <br />
        continues <em>here.</em>
      </h1>

      <Link
        to="/"
        className="ym-button"
      >
        <ArrowLeft size={18} />
        Return to Home
      </Link>
    </section>
  );
}

export default function App() {
  const location = useLocation();

  const isStaffRoute =
    location.pathname === "/staff" ||
    location.pathname.startsWith("/staff/");

  // ==========================================
  // REACT STATE — BATCHES 1–4
  // ==========================================

  // BATCH 1 — SAVED EVENT PROPOSALS
  const [quotes, setQuotes] = useState(
    loadQuotes
  );

  // BATCH 3 — OPERATIONS STATE
  const [operations, setOperations] = useState(
    loadOperations
  );

  // BATCH 4 — STUDIO SETTINGS
  const [settings, setSettings] = useState(
    loadSettings
  );

  // ==========================================
  // LOCAL STORAGE PERSISTENCE
  // ==========================================

  // SAVE EVENT PROPOSALS
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(quotes)
      );
    } catch (error) {
      console.warn(
        "YOUR MOMENT demo storage unavailable:",
        error
      );
    }
  }, [quotes]);

  // SAVE STAFF PLANNING DETAILS
  useEffect(() => {
    try {
      localStorage.setItem(
        OPERATIONS_KEY,
        JSON.stringify(operations)
      );
    } catch (error) {
      console.warn(
        "YOUR MOMENT operations storage unavailable:",
        error
      );
    }
  }, [operations]);

  // SAVE STUDIO SETTINGS
  useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.warn(
        "YOUR MOMENT settings storage unavailable:",
        error
      );
    }
  }, [settings]);

  // ==========================================
  // BATCH 1 — CREATE EVENT PROPOSAL
  // ==========================================

  function createQuote(form) {
    const estimate = calculateEstimate({
      venueId: form.venueId,
      packageId: form.packageId,
      guests: form.guests,
      addonIds: form.addonIds,
    });

    if (!estimate) {
      return {
        ok: false,
        error:
          "Please select a valid venue, package, and guest count.",
      };
    }

    const alias =
      typeof form.alias === "string"
        ? form.alias.trim()
        : "";

    if (
      alias.length < 2 ||
      alias.length > 50
    ) {
      return {
        ok: false,
        error:
          "Enter a fictional event name between 2 and 50 characters.",
      };
    }

    const date = new Date(
      `${form.date}T12:00:00`
    );

    const validDate =
      typeof form.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(form.date) &&
      !Number.isNaN(date.getTime()) &&
      localDateKey(date) === form.date &&
      form.date >= dateAfter(1) &&
      form.date <= dateAfter(365);

    if (!validDate) {
      return {
        ok: false,
        error:
          "Please choose a proposed date within the next 365 days.",
      };
    }

    if (
      !EVENT_TYPES.includes(form.eventType) ||
      !EVENT_PERIODS.some(
        (item) => item.id === form.period
      )
    ) {
      return {
        ok: false,
        error:
          "Please choose a valid event type and time period.",
      };
    }

    const menuValid = Object.entries(
      MENU_OPTIONS
    ).every(([course, choices]) =>
      choices.includes(
        form.menu?.[course]
      )
    );

    if (!menuValid) {
      return {
        ok: false,
        error:
          "Please choose valid catering menu preferences.",
      };
    }

    if (
      !Array.isArray(form.addonIds) ||
      form.addonIds.some(
        (id) =>
          !ADDONS.some(
            (addon) => addon.id === id
          )
      )
    ) {
      return {
        ok: false,
        error:
          "An optional event add-on selection is invalid.",
      };
    }

    // CREATE A UNIQUE DEMO REFERENCE
    const id =
      "YMO-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase();

    const quote = {
      id,
      alias,

      venueId: form.venueId,
      packageId: form.packageId,

      eventType: form.eventType,

      guests: estimate.guests,

      date: form.date,
      period: form.period,

      menu: {
        ...form.menu,
      },

      addonIds: [
        ...form.addonIds,
      ],

      total: estimate.total,

      createdAt: new Date().toISOString(),
    };

    setQuotes((current) =>
      [quote, ...current].slice(0, 30)
    );

    return {
      ok: true,
      id,
      total: estimate.total,
    };
  }

  // ==========================================
  // BATCH 1 — DELETE EVENT PROPOSAL
  // ==========================================

  function deleteQuote(id) {
    if (
      !window.confirm(
        "Delete this browser-local demo event plan?"
      )
    ) {
      return;
    }

    setQuotes((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );

    // REMOVE THE PROPOSAL'S STAFF OPERATIONS
    setOperations((current) => {
      if (
        !Object.prototype.hasOwnProperty.call(
          current,
          id
        )
      ) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[id];

      return next;
    });
  }

  // ==========================================
  // BATCH 3 — STAFF OPERATIONS ACTIONS
  // ==========================================

  function updatePlanOperation(
    planId,
    updater
  ) {
    if (
      !quotes.some(
        (quote) => quote.id === planId
      )
    ) {
      return;
    }

    setOperations((current) => {
      const existing = getPlanOps(
        current,
        planId
      );

      const updated = updater(existing);

      return {
        ...current,
        [planId]: updated,
      };
    });
  }

  // UPDATE PROPOSAL STAGE
  function setPlanStage(
    planId,
    nextStage
  ) {
    if (
      !PLAN_STAGES.some(
        (item) => item.id === nextStage
      )
    ) {
      return;
    }

    updatePlanOperation(
      planId,
      (record) => ({
        ...record,
        stage: nextStage,
      })
    );
  }

  // UPDATE CHECKLIST TASK
  function togglePlanTask(
    planId,
    taskId
  ) {
    if (
      !PREPARATION_TASKS.some(
        (task) => task.id === taskId
      )
    ) {
      return;
    }

    updatePlanOperation(
      planId,
      (record) => {
        const completedTasks =
          record.completedTasks.includes(
            taskId
          )
            ? record.completedTasks.filter(
                (id) => id !== taskId
              )
            : [
                ...record.completedTasks,
                taskId,
              ];

        return {
          ...record,
          completedTasks,
        };
      }
    );
  }

  // SAVE PLANNING NOTES
  function savePlanNote(
    planId,
    note
  ) {
    if (
      typeof note !== "string" ||
      note.length > 500
    ) {
      return;
    }

    updatePlanOperation(
      planId,
      (record) => ({
        ...record,
        note,
      })
    );
  }

  // RESET EVENT CHECKLIST
  function resetPlanTasks(planId) {
    updatePlanOperation(
      planId,
      (record) => ({
        ...record,
        completedTasks: [],
      })
    );
  }

  // ==========================================
  // BATCH 4 — STUDIO SETTINGS
  // ==========================================

  function saveStudioSettings(
    nextSettings
  ) {
    try {
      const validated = validateSettings(
        nextSettings
      );

      setSettings(validated);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Invalid demo settings.",
      };
    }
  }

  // ==========================================
  // BATCH 4 — RESTORE DEMO BACKUP
  // ==========================================

  // Backup is validated in DataCenterPage
  // before the user can confirm restoration.

  function restoreDemoBackup(payload) {
    if (
      !payload ||
      !Array.isArray(payload.quotes) ||
      !payload.operations ||
      !payload.settings
    ) {
      return {
        ok: false,
        error: "Invalid backup data.",
      };
    }

    try {
      const validSettings =
        validateSettings(
          payload.settings
        );

      // REPLACE ALL THREE SHARED STATE SLICES
      setQuotes(payload.quotes);

      setOperations(
        payload.operations
      );

      setSettings(
        validSettings
      );

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Could not restore data.",
      };
    }
  }

  // ==========================================
  // MAIN APP ROUTES
  // ==========================================

  return (
    <div className="ym-app">
      <ScrollToTop />

      {/* HIDE PUBLIC HEADER IN STAFF PAGES */}
      {!isStaffRoute && <Header />}

      <div
  id="main-content"
  tabIndex={-1}
>
        <Routes>
          {/* ==================================
              BATCH 1 — PUBLIC WEBSITE
              ================================== */}

          <Route
            index
            element={<HomePage />}
          />

          <Route
            path="venues"
            element={<VenuesPage />}
          />

          <Route
            path="venues/:venueId"
            element={<VenueDetailsPage />}
          />

          <Route
            path="packages"
            element={<PackagesPage />}
          />

          <Route
            path="gallery"
            element={<GalleryPage />}
          />

          <Route
            path="planner"
            element={
              <PlannerPage
                quotes={quotes}
                onCreateQuote={createQuote}
                onDeleteQuote={deleteQuote}
              />
            }
          />

          {/* ==================================
              BATCH 2 — ADVANCED EXPERIENCES
              ================================== */}

          <Route
            path="calendar"
            element={
              <EventCalendarPage
                quotes={quotes}
              />
            }
          />

          <Route
            path="compare"
            element={<MaisonPackageComparison />}
          />

          <Route
            path="menus"
            element={<MaisonCateringAtelier />}
          />

          <Route
            path="plans"
            element={
              <QuoteManagerPage
                quotes={quotes}
                onDeleteQuote={deleteQuote}
              />
            }
          />

          {/* ==================================
              BATCH 3–4 — EVENT OPERATIONS
              ================================== */}

          <Route
            path="staff"
            element={<MaisonStaffOperations legacy={<OperationsLayout
                quotes={quotes}
                operations={operations}
                settings={settings}
                onSetStage={setPlanStage}
                onToggleTask={togglePlanTask}
                onSaveNote={savePlanNote}
                onResetTasks={resetPlanTasks}
                onSaveSettings={saveStudioSettings}
                onRestoreBackup={restoreDemoBackup}
              />} />}
          >
            {/* BATCH 3 */}

            <Route
              index
              element={<CommandCenterPage />}
            />

            <Route
              path="desk"
              element={<ProposalDeskPage />}
            />

            <Route
              path="schedule"
              element={<VenueSchedulePage />}
            />

            <Route
              path="run-sheet"
              element={<EventRunSheetPage />}
            />

            {/* BATCH 4 */}

            <Route
              path="reports"
              element={<ReportsPage />}
            />

            <Route
              path="insights"
              element={<VenueInsightsPage />}
            />

            <Route
              path="settings"
              element={<StudioSettingsPage />}
            />

            <Route
              path="data"
              element={<DataCenterPage />}
            />
          </Route>

          {/* FALLBACK PAGE */}

          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </div>

      {/* HIDE PUBLIC FOOTER IN STAFF PAGES */}
      {!isStaffRoute && <Footer />}
      {!isStaffRoute && <SiteExperience />}
    </div>
  );
}