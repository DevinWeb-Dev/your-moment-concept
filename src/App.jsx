import { useEffect, useMemo, useState } from "react";

import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Gem,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";

import {
  BRAND,
  IMAGES,
  VENUES,
  PACKAGES,
  ADDONS,
  MENU_OPTIONS,
  EVENT_TYPES,
  EVENT_PERIODS,
  PRINCIPLES,
  FAQS,
  findVenue,
  findPackage,
  formatPeso,
  formatDate,
  dateAfter,
  localDateKey,
  calculateEstimate,
} from "./data/eventData.js";

// BATCH 2 — ADVANCED EVENT PLANNING

import EventCalendarPage from "./pages/EventCalendarPage.jsx";

import PackageComparePage from "./pages/PackageComparePage.jsx";

import CateringMenuStudioPage from "./pages/CateringMenuStudioPage.jsx";

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

function BrandLogo() {
  return (
    <span className="ym-brand">
      <span className="ym-brand-mark">
        <Gem size={21} strokeWidth={1.3} />
      </span>

      <span>
        YOUR MOMENT<span>.</span>
      </span>
    </span>
  );
}

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Venues", to: "/venues" },
  { label: "Packages", to: "/packages" },
  { label: "Compare", to: "/compare" },
  { label: "Calendar", to: "/calendar" },
  { label: "Menus", to: "/menus" },
  { label: "My Plans", to: "/plans" },
  { label: "Gallery", to: "/gallery" },
];

function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      closeOnEscape
    );

    return () =>
      window.removeEventListener(
        "keydown",
        closeOnEscape
      );
  }, [menuOpen]);

  return (
    <>
      <div className="ym-announcement">
        <span>
          AN EDITORIAL EXPERIENCE IN CELEBRATIONS
        </span>

        <Link to="/planner">
          Start planning <ArrowUpRight size={13} />
        </Link>
      </div>

      <header className="ym-header">
        <div className="ym-container ym-header-inner">
          <Link to="/" aria-label="YOUR MOMENT home">
            <BrandLogo />
          </Link>

          <nav
            id="ym-navigation"
            className={`ym-nav ${
              menuOpen ? "is-open" : ""
            }`}
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  isActive ? "is-active" : ""
                }
              >
                {item.label}
              </NavLink>
            ))}

            <Link
              className="ym-mobile-cta"
              to="/planner"
            >
              Plan Your Event
              <ArrowUpRight size={18} />
            </Link>
          </nav>

          <div className="ym-header-actions">
            <Link
              className="ym-header-cta"
              to="/planner"
            >
              Plan Your Event
              <ArrowUpRight size={17} />
            </Link>

            <button
              type="button"
              className="ym-menu-toggle"
              aria-label={
                menuOpen ? "Close menu" : "Open menu"
              }
              aria-controls="ym-navigation"
              aria-expanded={menuOpen}
              onClick={() =>
                setMenuOpen((current) => !current)
              }
            >
              {menuOpen
                ? <X size={23} />
                : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="ym-footer">
      <div className="ym-container">
        <div className="ym-footer-grid">
          <div className="ym-footer-main">
            <span className="ym-eyebrow is-light">
              THE ART OF GETTING TOGETHER
            </span>

            <h2>
              Make room for
              <br />
              <em>the unforgettable.</em>
            </h2>

            <p>
              An elevated venue and catering website
              concept designed for life's meaningful
              celebrations.
            </p>

            <Link
              to="/planner"
              className="ym-button is-champagne"
            >
              Explore Event Planning
              <ArrowUpRight size={19} />
            </Link>
          </div>

          <div className="ym-footer-links">
            <strong>DISCOVER</strong>

            <Link to="/">Home</Link>
            <Link to="/venues">Our Venues</Link>
<Link to="/packages">Catering Packages</Link>
<Link to="/compare">Compare Packages</Link>
<Link to="/calendar">Event Calendar</Link>
<Link to="/menus">Catering Menu Studio</Link>
<Link to="/gallery">Event Gallery</Link>
<Link to="/planner">Event Planner</Link>
<Link to="/plans">Saved Event Plans</Link>
            <Link to="/staff">Operations Dashboard Demo</Link>
          </div>

          <div className="ym-footer-links">
            <strong>ABOUT THE CONCEPT</strong>

            <p>
              A fictional, Philippines-inspired event
              venue and catering portfolio website.
            </p>

            <p>
              No real venues, quotations,
              reservations, or payments.
            </p>
          </div>
        </div>

        <div className="ym-footer-bottom">
          <span>
            © {new Date().getFullYear()} YOUR MOMENT.
          </span>

          <span>{BRAND.developer}</span>
        </div>
      </div>
    </footer>
  );
}

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

function HomePage() {
  return (
    <>
      <section className="ym-hero">
        <div className="ym-container ym-hero-grid">
          <div className="ym-hero-copy">
            <span className="ym-eyebrow is-light">
              FOR THE MOMENTS THAT MATTER
            </span>

            <h1>
              Your day.
              <br />
              Your story.
              <br />
              <em>Your moment.</em>
            </h1>

            <p>
              Beautiful spaces, considered catering,
              and celebrations thoughtfully imagined
              around the people who matter most.
            </p>

            <div className="ym-hero-buttons">
              <Link
                to="/venues"
                className="ym-button is-champagne"
              >
                Explore Our Venues
                <ArrowUpRight size={19} />
              </Link>

              <Link
                to="/planner"
                className="ym-hero-link"
              >
                Plan a celebration
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="ym-hero-bottom-note">
              <Sparkles size={20} />

              <span>
                THE SETTING. THE DETAILS.
                <br />
                THE MEMORIES.
              </span>
            </div>
          </div>

          <div className="ym-hero-visual">
            <div className="ym-hero-main-image">
              <img
                src={IMAGES.hero}
                alt="Elegant event reception inspiration"
                fetchPriority="high"
              />
            </div>

            <div className="ym-hero-secondary-image">
              <img
                src={IMAGES.editorial}
                alt="Elegant decorated event dining tables"
              />
            </div>

            <div className="ym-hero-seal">
              <Gem size={26} strokeWidth={1.25} />
              <span>
                MADE FOR
                <br />
                BEAUTIFUL
                <br />
                OCCASIONS
              </span>
            </div>

            <span className="ym-hero-image-caption">
              YOUR MOMENT / THE CELEBRATION EDIT
            </span>
          </div>
        </div>
      </section>

      <div className="ym-marquee">
        <div className="ym-container ym-marquee-inner">
          <span>WEDDINGS</span>
          <i />
          <span>DEBUTS</span>
          <i />
          <span>PRIVATE EVENTS</span>
          <i />
          <span>CORPORATE OCCASIONS</span>
        </div>
      </div>

      <section className="ym-section ym-container">
        <SectionHeading
          eyebrow="OUR VENUE COLLECTION"
          title="A setting for"
          accent="every story."
          description="Discover carefully imagined spaces, each with its own atmosphere and a beautiful sense of occasion."
        />

        <div className="ym-venues-grid">
          {VENUES.slice(0, 3).map((venue) => (
            <VenueCard
              venue={venue}
              key={venue.id}
            />
          ))}
        </div>

        <div className="ym-centered-action">
          <Link
            to="/venues"
            className="ym-button is-outline"
          >
            Explore Every Venue
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      <section className="ym-story-split">
        <div className="ym-story-image">
          <img
            src={IMAGES.dining}
            alt="Elegantly arranged catering table concept"
            loading="lazy"
          />

          <div className="ym-story-image-label">
            <UtensilsCrossed size={19} />
            THE ART OF DINING
          </div>
        </div>

        <div className="ym-story-content">
          <span className="ym-eyebrow">
            CATERING WITH INTENTION
          </span>

          <h2>
            A celebration
            <br />
            is made in
            <br />
            <em>the details.</em>
          </h2>

          <p>
            From thoughtfully planned menus to
            beautifully arranged tables, the dining
            experience deserves as much attention
            as the setting itself.
          </p>

          <div className="ym-story-features">
            <span>
              <Check size={18} />
              Thoughtfully curated sample menus
            </span>

            <span>
              <Check size={18} />
              Flexible catering packages
            </span>

            <span>
              <Check size={18} />
              Transparent sample estimates
            </span>
          </div>

          <Link
            to="/packages"
            className="ym-text-link"
          >
            Discover Catering Packages
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>

      <section className="ym-section ym-container">
        <SectionHeading
          eyebrow="THE YOUR MOMENT APPROACH"
          title="Beauty lives"
          accent="in every detail."
          description="A thoughtful planning experience begins with clarity, flexibility, and a setting that feels right."
        />

        <div className="ym-principles-grid">
          {PRINCIPLES.map((item) => (
            <article
              className="ym-principle"
              key={item.number}
            >
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ym-feature-banner">
        <div className="ym-container ym-feature-layout">
          <div>
            <span className="ym-eyebrow is-light">
              CREATE YOUR CELEBRATION
            </span>

            <h2>
              Beautiful plans
              <br />
              begin <em>somewhere.</em>
            </h2>

            <p>
              Choose a venue, estimate your guest
              count, explore the catering menu,
              and build an illustrative quotation.
            </p>

            <Link
              to="/planner"
              className="ym-button is-champagne"
            >
              Open the Event Planner
              <ArrowUpRight size={19} />
            </Link>
          </div>

          <div className="ym-feature-image">
            <img
              src={IMAGES.flowers}
              alt="Elegant floral event styling"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="ym-section ym-container">
        <SectionHeading
          eyebrow="GOOD TO KNOW"
          title="Every question"
          accent="deserves an answer."
        />

        <div className="ym-faq">
          {FAQS.map((item, index) => (
            <details key={item.question}>
              <summary>
                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <strong>{item.question}</strong>

                <span className="ym-faq-symbol">+</span>
              </summary>

              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

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
  return (
    <div className="ym-page">
      <section className="ym-page-hero">
        <div className="ym-container ym-page-hero-grid">
          <div>
            <span className="ym-eyebrow">
              CATERING / THE EXPERIENCE EDIT
            </span>

            <h1>
              Every course,
              <br />
              <em>a little celebration.</em>
            </h1>

            <p>
              Discover thoughtfully structured
              sample catering packages designed
              for different celebrations and budgets.
            </p>
          </div>

          <img
            src={IMAGES.editorial}
            alt="Premium catering table styling inspiration"
          />
        </div>
      </section>

      <section className="ym-section ym-container">
        <SectionHeading
          eyebrow="THREE WAYS TO CELEBRATE"
          title="Beautifully"
          accent="considered packages."
          description="Compare illustrative inclusions and per-guest rates, then customize the details in our event planner."
        />

        <div className="ym-packages-grid">
          {PACKAGES.map((item) => (
            <article
              key={item.id}
              className={`ym-package-card ${
                item.featured ? "is-featured" : ""
              }`}
            >
              <div className="ym-package-top">
                <span>{item.number} / 03</span>

                {item.featured && (
                  <span>FEATURED CONCEPT</span>
                )}
              </div>

              <span className="ym-eyebrow">
                {item.eyebrow}
              </span>

              <h3>{item.name}</h3>

              <p>{item.subtitle}</p>

              <div className="ym-package-price">
                <strong>
                  {formatPeso(item.perGuest)}
                </strong>

                <span>per guest*</span>
              </div>

              <div className="ym-package-description">
                {item.description}
              </div>

              <div className="ym-package-inclusions">
                {item.highlights.map((feature) => (
                  <span key={feature}>
                    <Check size={17} />
                    {feature}
                  </span>
                ))}
              </div>

              <div className="ym-package-foot">
                <small>
                  From {item.minimumGuests} guests
                </small>

                <Link
                  to={`/planner?package=${item.id}`}
                  className="ym-button"
                >
                  Customize This Package
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="ym-centered-action">
  <Link
    to="/compare"
    className="ym-button is-outline"
  >
    Compare All Catering Packages
    <ArrowUpRight size={18} />
  </Link>
</div>

        <p className="ym-disclaimer">
          *Illustrative catering cost only.
          Venue fees and optional add-ons are
          calculated separately in the planner.
        </p>
      </section>

      <section className="ym-menu-showcase">
        <div className="ym-container ym-menu-showcase-grid">
          <div>
            <span className="ym-eyebrow is-light">
              CURATED DINING CONCEPTS
            </span>

            <h2>
              A menu shaped
              <br />
              around <em>the occasion.</em>
            </h2>

            <p>
              Choose an illustrative starter,
              main course and dessert in our
              interactive event planner.
            </p>

            <Link
              to="/planner"
              className="ym-button is-champagne"
            >
              Build a Sample Menu
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <img
            src={IMAGES.dining}
            alt="Formal event dining inspiration"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
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

function PlannerPage({
  quotes,
  onCreateQuote,
  onDeleteQuote,
}) {
  const [params] = useSearchParams();

  const searchKey = params.toString();

  const [form, setForm] = useState(() =>
    buildPlannerInitialForm(params, quotes)
  );

  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // Apply venue, package, guest, date, catering menu and clone links.
  // Existing form edits remain untouched unless the URL search changes.
  useEffect(() => {
    const updatedParams = new URLSearchParams(searchKey);
    setForm(buildPlannerInitialForm(updatedParams, quotes));
    setError("");
    setConfirmation(null);
    // Intentionally driven by the URL, not by quote-storage updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  const venue = findVenue(form.venueId);
  const packageItem = findPackage(form.packageId);

  const minimumGuests = Math.max(
    venue.minGuests,
    packageItem.minimumGuests
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

  function update(key, value) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
    setConfirmation(null);
  }

  function changeVenueOrPackage(key, value) {
    setForm((previous) => {
      const nextVenue = findVenue(
        key === "venueId" ? value : previous.venueId
      );

      const nextPackage = findPackage(
        key === "packageId" ? value : previous.packageId
      );

      const minimum = Math.max(
        nextVenue.minGuests,
        nextPackage.minimumGuests
      );

      const nextGuests = Math.min(
        nextVenue.capacity,
        Math.max(
          minimum,
          Number(previous.guests) || minimum
        )
      );

      return {
        ...previous,
        [key]: value,
        guests: nextGuests,
      };
    });

    setError("");
    setConfirmation(null);
  }

  function updateMenu(course, value) {
    setForm((previous) => ({
      ...previous,
      menu: {
        ...previous.menu,
        [course]: value,
      },
    }));

    setError("");
    setConfirmation(null);
  }

  function toggleAddon(id) {
    setForm((previous) => ({
      ...previous,

      addonIds: previous.addonIds.includes(id)
        ? previous.addonIds.filter(
            (item) => item !== id
          )
        : [...previous.addonIds, id],
    }));

    setError("");
    setConfirmation(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const result = onCreateQuote(form);

    if (!result.ok) {
      setError(result.error);
      setConfirmation(null);
      return;
    }

    setConfirmation(result);
    setError("");

    setForm((previous) => ({
      ...previous,
      alias: "",
    }));
  }

  return (
    <div className="ym-page">
      <section className="ym-planner-hero">
        <div className="ym-container">
          <span className="ym-eyebrow is-light">
            THE EVENT PLANNING EXPERIENCE
          </span>

          <h1>
            Every great event
            <br />
            begins with <em>a vision.</em>
          </h1>

          <p>
            Explore your venue, customize an
            illustrative catering menu, and see
            your event estimate update as you plan.
          </p>
        </div>
      </section>

      <section className="ym-section ym-container">
        <form
          className="ym-planner-grid"
          onSubmit={handleSubmit}
        >
          <div className="ym-planner-steps">
            <section className="ym-planner-panel">
              <div className="ym-step-heading">
                <span>01</span>

                <div>
                  <span className="ym-eyebrow">
                    YOUR CELEBRATION
                  </span>

                  <h2>
                    Tell us about
                    <br />
                    <em>your moment.</em>
                  </h2>
                </div>
              </div>

              <div className="ym-form-grid">
                <label className="ym-field">
                  <span>EVENT TYPE</span>

                  <select
                    value={form.eventType}
                    onChange={(event) =>
                      update(
                        "eventType",
                        event.target.value
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

                <label className="ym-field">
                  <span>NUMBER OF GUESTS</span>

                  <input
                    type="number"
                    min={minimumGuests}
                    max={venue.capacity}
                    step="1"
                    required
                    value={form.guests}
                    onChange={(event) =>
                      update(
                        "guests",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="ym-field">
                  <span>PROPOSED EVENT DATE</span>

                  <input
                    type="date"
                    required
                    min={dateAfter(1)}
                    max={dateAfter(365)}
                    value={form.date}
                    onChange={(event) =>
                      update(
                        "date",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="ym-field">
                  <span>EVENT TIME PERIOD</span>

                  <select
                    value={form.period}
                    onChange={(event) =>
                      update(
                        "period",
                        event.target.value
                      )
                    }
                  >
                    {EVENT_PERIODS.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name} — {item.time}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="ym-field-note">
                Your selected date is a planning
                preference only. No actual venue
                availability is checked.
              </p>
            </section>

            <section className="ym-planner-panel">
              <div className="ym-step-heading">
                <span>02</span>

                <div>
                  <span className="ym-eyebrow">
                    THE PERFECT SETTING
                  </span>

                  <h2>
                    Choose your
                    <br />
                    <em>event space.</em>
                  </h2>
                </div>
              </div>

              <div className="ym-venue-picker">
                {VENUES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={
                      form.venueId === item.id
                    }
                    className={`ym-venue-choice ${
                      form.venueId === item.id
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      changeVenueOrPackage(
                        "venueId",
                        item.id
                      )
                    }
                  >
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                    />

                    <span>
                      <small>{item.category}</small>
                      <strong>{item.name}</strong>
                      <small>
                        Up to {item.capacity} guests
                      </small>
                    </span>

                    <span className="ym-choice-indicator">
                      {form.venueId === item.id ? (
                        <Check size={17} />
                      ) : (
                        <ArrowRight size={17} />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="ym-planner-panel">
              <div className="ym-step-heading">
                <span>03</span>

                <div>
                  <span className="ym-eyebrow">
                    CATERING EXPERIENCE
                  </span>

                  <h2>
                    Select your
                    <br />
                    <em>package.</em>
                  </h2>
                </div>
              </div>

              <div className="ym-package-picker">
                {PACKAGES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={
                      form.packageId === item.id
                    }
                    className={`ym-package-choice ${
                      form.packageId === item.id
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      changeVenueOrPackage(
                        "packageId",
                        item.id
                      )
                    }
                  >
                    <div>
                      <strong>{item.name}</strong>

                      <small>
                        From {item.minimumGuests} guests
                      </small>
                    </div>

                    <span>
                      {formatPeso(item.perGuest)}
                      <small>/ guest</small>
                    </span>
                  </button>
                ))}
              </div>

              <p className="ym-field-note">
                Selected package includes a sample
                three-course dining experience.
              </p>
            </section>

            <section className="ym-planner-panel">
              <div className="ym-step-heading">
                <span>04</span>

                <div>
                  <span className="ym-eyebrow">
                    THE CATERING MENU
                  </span>

                  <h2>
                    Curate your
                    <br />
                    <em>dining experience.</em>
                  </h2>
                </div>
              </div>

              <div className="ym-menu-fields">
                {Object.entries(MENU_OPTIONS).map(
                  ([course, options]) => (
                    <label
                      className="ym-field"
                      key={course}
                    >
                      <span>
                        {course.toUpperCase()} SELECTION
                      </span>

                      <select
                        value={form.menu[course]}
                        onChange={(event) =>
                          updateMenu(
                            course,
                            event.target.value
                          )
                        }
                      >
                        {options.map((item) => (
                          <option key={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                  )
                )}
              </div>

              <div className="ym-menu-notice">
                <UtensilsCrossed size={20} />

                <p>
                  These choices are conceptual
                  preferences. Allergies, dietary
                  requirements, and actual menu
                  availability would need to be
                  verified with a real caterer.
                </p>
              </div>
            </section>

            <section className="ym-planner-panel">
              <div className="ym-step-heading">
                <span>05</span>

                <div>
                  <span className="ym-eyebrow">
                    THE FINISHING TOUCHES
                  </span>

                  <h2>
                    Make it
                    <br />
                    <em>your own.</em>
                  </h2>
                </div>
              </div>

              <div className="ym-addon-list">
                {ADDONS.map((addon) => (
                  <label
                    className="ym-addon-choice"
                    key={addon.id}
                  >
                    <input
                      type="checkbox"
                      checked={form.addonIds.includes(
                        addon.id
                      )}
                      onChange={() =>
                        toggleAddon(addon.id)
                      }
                    />

                    <span>
                      <strong>{addon.name}</strong>

                      <small>
                        {addon.description}
                      </small>
                    </span>

                    <b>
                      +{formatPeso(addon.price)}
                      <small>
                        {addon.unit === "perGuest"
                          ? " / guest"
                          : " flat"}
                      </small>
                    </b>
                  </label>
                ))}
              </div>
            </section>

            <section className="ym-planner-panel">
              <div className="ym-step-heading">
                <span>06</span>

                <div>
                  <span className="ym-eyebrow">
                    SAVE YOUR EVENT CONCEPT
                  </span>

                  <h2>
                    Give your plan
                    <br />
                    <em>a name.</em>
                  </h2>
                </div>
              </div>

              <label className="ym-field">
                <span>FICTIONAL NAME OR EVENT ALIAS</span>

                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={50}
                  placeholder="e.g. Our Dream Celebration"
                  value={form.alias}
                  onChange={(event) =>
                    update(
                      "alias",
                      event.target.value
                    )
                  }
                />
              </label>

              <p className="ym-field-note">
                Use a fictional alias. Do not enter
                personal contact details,
                identification, or real customer data.
              </p>
            </section>
          </div>

          <aside className="ym-planner-sidebar">
            <div className="ym-quote-card">
              <div className="ym-quote-photo">
                <img
                  src={venue.image}
                  alt={`Illustrative event venue: ${venue.name}`}
                />

                <span>YOUR EVENT PREVIEW</span>
              </div>

              <div className="ym-quote-content">
                <span className="ym-eyebrow">
                  YOUR CUSTOMIZED CELEBRATION
                </span>

                <h2>
                  The details
                  <br />
                  <em>come together.</em>
                </h2>

                <div className="ym-quote-summary">
                  <div>
                    <Gem size={18} />

                    <span>
                      <small>Selected venue</small>
                      <strong>{venue.name}</strong>
                    </span>
                  </div>

                  <div>
                    <Users size={18} />

                    <span>
                      <small>Guest count</small>
                      <strong>{form.guests} guests</strong>
                    </span>
                  </div>

                  <div>
                    <CalendarDays size={18} />

                    <span>
                      <small>Proposed date</small>
                      <strong>
                        {formatDate(form.date)}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <UtensilsCrossed size={18} />

                    <span>
                      <small>Catering package</small>
                      <strong>{packageItem.name}</strong>
                    </span>
                  </div>
                </div>

                <div className="ym-estimate">
                  <span className="ym-eyebrow">
                    ILLUSTRATIVE COST BREAKDOWN
                  </span>

                  {estimate ? (
                    <>
                      <div>
                        <span>Venue fee</span>
                        <strong>
                          {formatPeso(
                            estimate.venueTotal
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Catering × {estimate.guests}
                        </span>

                        <strong>
                          {formatPeso(
                            estimate.cateringTotal
                          )}
                        </strong>
                      </div>

                      {estimate.addons.map((addon) => (
                        <div key={addon.id}>
                          <span>{addon.name}</span>

                          <strong>
                            {formatPeso(addon.total)}
                          </strong>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="ym-estimate-error">
                      Enter a valid guest count between{" "}
                      {minimumGuests} and{" "}
                      {venue.capacity}.
                    </p>
                  )}
                </div>

                <div className="ym-estimate-total">
                  <span>ESTIMATED SAMPLE TOTAL</span>

                  <strong>
                    {estimate
                      ? formatPeso(estimate.total)
                      : "—"}
                  </strong>

                  <small>
                    Non-binding demo calculation.
                    Taxes, logistics, and other
                    real-world charges are not modeled.
                  </small>
                </div>

                {error && (
                  <div
                    className="ym-form-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="ym-button ym-save-quote"
                  disabled={!estimate}
                >
                  Save Demo Event Plan
                  <ArrowUpRight size={19} />
                </button>

                <div className="ym-quote-note">
                  <ShieldCheck size={19} />

                  <p>
                    This does not request a real
                    reservation, reserve an event
                    date, or process payment.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </form>

        {confirmation && (
          <div
            className="ym-confirmation"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={36} />

            <span className="ym-eyebrow">
              YOUR DEMO PLAN IS SAVED
            </span>

            <h2>
              A beautiful
              <br />
              <em>beginning.</em>
            </h2>

            <p>
              Reference:{" "}
              <strong>{confirmation.id}</strong>
            </p>

            <p>
              Estimated illustrative amount:{" "}
              <strong>
                {formatPeso(confirmation.total)}
              </strong>
            </p>

            <p>
              This is a local event-planning draft,
              not a booking confirmation.
            </p>
          </div>
        )}

        <section className="ym-saved-plans">
          <SectionHeading
            eyebrow="YOUR SAVED CONCEPTS"
            title="Every idea has"
            accent="a beginning."
            description="Event plans created in this browser appear here. You can review or delete them at any time."
          />

          {quotes.length === 0 ? (
            <div className="ym-empty-state">
              <CalendarDays size={33} />

              <h3>No event plans saved yet.</h3>

              <p>
                Build your first fictional
                event quotation using the
                planner above.
              </p>
            </div>
          ) : (
            <div className="ym-saved-grid">
              {quotes.map((quote) => (
                <article
                  className="ym-saved-card"
                  key={quote.id}
                >
                  <div className="ym-saved-top">
                    <span>{quote.id}</span>

                    <button
                      type="button"
                      aria-label={`Delete ${quote.id}`}
                      onClick={() =>
                        onDeleteQuote(quote.id)
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <span className="ym-eyebrow">
                    SAVED EVENT CONCEPT
                  </span>

                  <h3>{quote.alias}</h3>

                  <p>
                    {findVenue(quote.venueId)?.name ||
                      "Sample venue"}
                  </p>

                  <div className="ym-saved-facts">
                    <span>
                      <CalendarDays size={16} />
                      {formatDate(quote.date)}
                    </span>

                    <span>
                      <Users size={16} />
                      {quote.guests} guests
                    </span>
                  </div>

                  <div className="ym-saved-total">
                    <span>Sample estimate</span>

                    <strong>
                      {formatPeso(quote.total)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
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
            element={<PackageComparePage />}
          />

          <Route
            path="menus"
            element={<CateringMenuStudioPage />}
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
            element={
              <OperationsLayout
                quotes={quotes}
                operations={operations}
                settings={settings}
                onSetStage={setPlanStage}
                onToggleTask={togglePlanTask}
                onSaveNote={savePlanNote}
                onResetTasks={resetPlanTasks}
                onSaveSettings={saveStudioSettings}
                onRestoreBackup={restoreDemoBackup}
              />
            }
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