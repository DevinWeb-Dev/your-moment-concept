import {
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Gem,
  Maximize2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import {
  VENUES,
  findVenue,
  formatPeso,
} from "../data/eventData.js";

import "../styles/maison-venues.css";

/*
  FOUR DISTINCT EDITORIAL IDENTITIES

  These are fictional architectural
  concepts, not descriptions of
  operating event venues.
*/

const STORIES = {
  "the-glass-garden": {
    skin: "glass",
    serial: "CHAPTER I / THE GLASSHOUSE",
    lead:
      "Where the light becomes part of the celebration.",
    phrase:
      "A little closer to nature.",
    note:
      "Imagine soft daylight drifting across a beautiful reception, with foliage becoming part of the architecture rather than an afterthought.",
    chapters: [
      "Daylight as decoration",
      "A ceremony among the greens",
      "From garden vows to golden-hour tables",
    ],
    photoCaptions: [
      "The glasshouse atmosphere",
      "The gathering",
      "The finishing touches",
    ],
    mood:
      "DAYLIT / BOTANICAL / ROMANTIC",
  },

  "the-grand-hall": {
    skin: "ballroom",
    serial: "CHAPTER II / THE GRAND SALON",
    lead:
      "An entrance worth remembering.",
    phrase:
      "A grander kind of evening.",
    note:
      "Think dramatic entrances, sweeping table arrangements and the warm theatre of an evening that unfolds under a beautifully imagined glow.",
    chapters: [
      "The first grand entrance",
      "A setting made for a statement",
      "Every toast takes centre stage",
    ],
    photoCaptions: [
      "The banquet atmosphere",
      "The evening mood",
      "The finishing details",
    ],
    mood:
      "CINEMATIC / FORMAL / OPULENT",
  },

  "the-private-courtyard": {
    skin: "courtyard",
    serial: "CHAPTER III / THE HIDDEN COURT",
    lead:
      "Small in scale. Beautiful in feeling.",
    phrase:
      "For the people who matter most.",
    note:
      "A quietly romantic world where soft textures, close conversations and a generous sense of intimacy lead the story.",
    chapters: [
      "The beauty of a smaller gathering",
      "An atmosphere made personal",
      "Every place at the table matters",
    ],
    photoCaptions: [
      "The intimate setting",
      "A romantic pause",
      "A personal celebration",
    ],
    mood:
      "INTIMATE / WARM / PERSONAL",
  },

  "the-skyline-terrace": {
    skin: "skyline",
    serial: "CHAPTER IV / THE SKYLINE",
    lead:
      "Meet us where the evening begins.",
    phrase:
      "Above it all, together.",
    note:
      "Contemporary silhouettes, a dramatic changing sky and an easy movement from the first welcome to the last photograph.",
    chapters: [
      "An open-air point of view",
      "The glow of golden hour",
      "A celebration under the evening sky",
    ],
    photoCaptions: [
      "The terrace atmosphere",
      "The golden-hour edit",
      "The evening details",
    ],
    mood:
      "CONTEMPORARY / OPEN-AIR / DRAMATIC",
  },
};

/* FULLSCREEN IMAGE VIEWER */

function GalleryLightbox({
  venue,
  photos,
  index,
  onChange,
  onClose,
}) {
  const closeRef = useRef(null);

  useEffect(() => {
    const oldOverflow =
      document.body.style.overflow;

    const previousFocus =
      document.activeElement;

    document.body.style.overflow =
      "hidden";

    closeRef.current?.focus();

    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        onChange(
          (index + 1) % photos.length
        );
      }

      if (event.key === "ArrowLeft") {
        onChange(
          (index - 1 + photos.length) %
            photos.length
        );
      }
    };

    document.addEventListener(
      "keydown",
      handleKey
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKey
      );

      document.body.style.overflow =
        oldOverflow;

      if (
        previousFocus &&
        typeof previousFocus.focus === "function"
      ) {
        previousFocus.focus();
      }
    };
  }, [
    index,
    onChange,
    onClose,
    photos.length,
  ]);

  return createPortal(
    <div
      className="mgv-lightbox"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="mgv-lightbox-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${venue.name} editorial gallery`}
      >
        <div className="mgv-lightbox-top">
          <span>
            {venue.name} / IMAGE {index + 1}
            {" "}OF {photos.length}
          </span>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close photo gallery"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mgv-lightbox-stage">
          <button
            type="button"
            onClick={() =>
              onChange(
                (index - 1 + photos.length) %
                  photos.length
              )
            }
            aria-label="Previous image"
          >
            <ChevronLeft size={25} />
          </button>

          <img
            src={photos[index]}
            alt={`${venue.name}, editorial inspiration ${index + 1}`}
          />

          <button
            type="button"
            onClick={() =>
              onChange(
                (index + 1) %
                  photos.length
              )
            }
            aria-label="Next image"
          >
            <ChevronRight size={25} />
          </button>
        </div>

        <span className="mgv-lightbox-foot">
          ILLUSTRATIVE PORTFOLIO PHOTOGRAPHY ·
          USE ← → TO EXPLORE, ESC TO CLOSE
        </span>
      </div>
    </div>,
    document.body
  );
}

/* INDIVIDUAL VENUE EXPERIENCE */

function VenueDossierContent({ venueId }) {
  const venue = findVenue(venueId);
  const story = STORIES[venueId];

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!venue || !story) {
    return (
      <main className="mgv mgv-unknown">
        <span className="mgv-eyebrow">
          THE VENUE ARCHIVE
        </span>

        <h1>
          This chapter isn't in our collection.
        </h1>

        <Link to="/venues">
          RETURN TO THE VENUES
          <ArrowRight size={18} />
        </Link>
      </main>
    );
  }

  const photos =
    venue.gallery?.length
      ? venue.gallery
      : [venue.image];

  const selected = Math.min(
    active,
    photos.length - 1
  );

  const others = VENUES.filter(
    (item) => item.id !== venue.id
  ).slice(0, 2);

  const prev = () => {
    setActive(
      (current) =>
        (current - 1 + photos.length) %
        photos.length
    );
  };

  const next = () => {
    setActive(
      (current) =>
        (current + 1) %
        photos.length
    );
  };

  return (
    <main
      className={`mgv mgv-dossier mgv-dossier--${story.skin}`}
    >
      {/* BREADCRUMBS */}

      <div className="mgv-crumb mgv-wrap">
        <Link to="/">THE MAISON</Link>
        <span>/</span>
        <Link to="/venues">VENUE ARCHIVE</Link>
        <span>/</span>
        <strong>{venue.name}</strong>
      </div>

      {/* VENUE-SPECIFIC CINEMATIC HERO */}

      <section className="mgv-dossier-hero">
        <div className="mgv-dossier-copy">
          <span className="mgv-eyebrow mgv-eyebrow--gold">
            {story.serial}
          </span>

          <span
            className="mgv-dossier-number"
            aria-hidden="true"
          >
            {venue.number}
          </span>

          <h1>
            {venue.name}<em>.</em>
          </h1>

          <p className="mgv-dossier-lead">
            {story.lead}
          </p>

          <p className="mgv-dossier-description">
            {venue.description}
          </p>

          <div className="mgv-dossier-facts">
            <div>
              <Users size={18} />

              <span>
                GUESTS / SAMPLE
              </span>

              <strong>
                {venue.minGuests}–{venue.capacity}
              </strong>
            </div>

            <div>
              <Gem size={18} />

              <span>
                VENUE RATE FROM*
              </span>

              <strong>
                {formatPeso(venue.baseRate)}
              </strong>
            </div>
          </div>

          <div className="mgv-dossier-actions">
            <Link
              className="mgv-cta"
              to={`/planner?venue=${encodeURIComponent(
                venue.id
              )}`}
            >
              BUILD A SAMPLE EVENT
              <ArrowUpRight size={18} />
            </Link>

            <a href="#mgv-visual-story">
              DISCOVER THE ATMOSPHERE
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="mgv-dossier-art">
          <span
            className="mgv-dossier-ring"
            aria-hidden="true"
          />

          <div className="mgv-dossier-hero-image">
            <img
              src={venue.image}
              alt={`Editorial venue inspiration: ${venue.name}`}
              fetchPriority="high"
            />
          </div>

          <span className="mgv-dossier-stamp">
            A PLACE FOR
            <br />
            YOUR STORY
            <br />
            <b>✳</b>
          </span>

          <span className="mgv-dossier-image-label">
            {story.mood}
          </span>
        </div>
      </section>

      <div
        className="mgv-story-ticker"
        aria-hidden="true"
      >
        <span>
          {story.mood} ✦ {story.mood}
          {" "}✦ {story.mood} ✦
        </span>
      </div>

      {/* CONCEPT STORY */}

      <section
        className="mgv-dossier-story mgv-wrap"
        id="mgv-visual-story"
      >
        <div className="mgv-story-head">
          <span className="mgv-eyebrow">
            01 / THE CHARACTER OF A PLACE
          </span>

          <h2>
            {story.phrase
              .split(" ")
              .slice(0, -1)
              .join(" ")}
            {" "}
            <em>
              {story.phrase
                .split(" ")
                .at(-1)}
            </em>
          </h2>
        </div>

        <div className="mgv-story-body">
          <span
            className="mgv-story-asterisk"
            aria-hidden="true"
          >
            ✳
          </span>

          <p>{story.note}</p>

          <div className="mgv-story-tags">
            {venue.idealFor.map((item) => (
              <span key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE PHOTO GALLERY */}

      <section className="mgv-gallery-section">
        <div className="mgv-wrap">
          <div className="mgv-section-heading">
            <div>
              <span className="mgv-eyebrow">
                02 / THE VISUAL DOSSIER
              </span>

              <h2>
                A closer <em>look.</em>
              </h2>
            </div>

            <p>
              Three cinematic impressions
              of an imagined venue.
              Select a photograph to explore
              it in full-screen.
            </p>
          </div>

          <div className="mgv-gallery-stage">
            <button
              type="button"
              className="mgv-gallery-main"
              onClick={() =>
                setLightbox(true)
              }
              aria-label={`Enlarge ${venue.name} photo ${
                selected + 1
              }`}
            >
              <img
                key={`${venue.id}-${selected}`}
                src={photos[selected]}
                alt={`${venue.name} visual inspiration ${
                  selected + 1
                }`}
              />

              <span>
                <Maximize2 size={17} />
                VIEW IMAGE {selected + 1}
                {" / "}
                {photos.length}
              </span>
            </button>

            <div className="mgv-gallery-side">
              <span className="mgv-gallery-index">
                THE GALLERY /{" "}
                {String(
                  selected + 1
                ).padStart(2, "0")}
              </span>

              <h3>
                {story.photoCaptions[selected] ||
                  "The atmosphere"}
                <em>.</em>
              </h3>

              <p>
                Illustrative inspiration
                photography, not an actual
                property tour or verified
                event setup.
              </p>

              <div className="mgv-gallery-controls">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous gallery image"
                >
                  <ChevronLeft size={21} />
                </button>

                <button
                  type="button"
                  onClick={next}
                  aria-label="Next gallery image"
                >
                  <ChevronRight size={21} />
                </button>
              </div>

              <div className="mgv-gallery-thumbs">
                {photos.map((src, index) => (
                  <button
                    key={`${venue.id}-thumb-${index}`}
                    type="button"
                    className={
                      selected === index
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      setActive(index)
                    }
                    aria-label={`Show gallery image ${
                      index + 1
                    }`}
                    aria-pressed={
                      selected === index
                    }
                  >
                    <img
                      src={src}
                      loading="lazy"
                      alt=""
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ORIGINAL VENUE FEATURES */}

      <section className="mgv-experience mgv-wrap">
        <div className="mgv-experience-intro">
          <span className="mgv-eyebrow">
            03 / WHAT THE CONCEPT ENVISIONS
          </span>

          <h2>
            The art of
            <em> every detail.</em>
          </h2>

          <p>{venue.description}</p>
        </div>

        <div className="mgv-experience-items">
          {venue.features.map(
            (feature, index) => (
              <article key={feature}>
                <span>
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </span>

                <strong>{feature}</strong>
                <Check size={19} />
              </article>
            )
          )}
        </div>
      </section>

      {/* EDITORIAL CHAPTERS */}

      <section className="mgv-chapters mgv-wrap">
        <span className="mgv-eyebrow">
          04 / THREE MOMENTS TO IMAGINE
        </span>

        <div className="mgv-chapter-grid">
          {story.chapters.map(
            (chapter, index) => (
              <div key={chapter}>
                <span>
                  ACT 0{index + 1}
                </span>

                <b aria-hidden="true">
                  ✧
                </b>

                <h3>{chapter}</h3>
              </div>
            )
          )}
        </div>
      </section>

      {/* EVENT PLANNER HANDOFF */}

      <section className="mgv-dossier-plan">
        <div className="mgv-dossier-plan-image">
          <img
            src={photos[1] || venue.image}
            alt={`Celebration moodboard for ${venue.name}`}
            loading="lazy"
          />
        </div>

        <div>
          <span className="mgv-eyebrow mgv-eyebrow--gold">
            05 / COMPOSE YOUR CELEBRATION
          </span>

          <h2>
            Make this moment
            <em> your own.</em>
          </h2>

          <p>
            Begin with {venue.name}.
            Your selected setting will
            carry into the original YOUR
            MOMENT planner, where you can
            explore catering, guest counts
            and a sample estimate.
          </p>

          <Link
            to={`/planner?venue=${encodeURIComponent(
              venue.id
            )}`}
            className="mgv-cta"
          >
            CURATE A SAMPLE EVENT
            <ArrowUpRight size={19} />
          </Link>

          <span className="mgv-dossier-footnote">
            <ShieldCheck size={16} />
            Concept only · Nothing is
            reserved or confirmed.
          </span>
        </div>
      </section>

      {/* RELATED VENUES */}

      <section className="mgv-related mgv-wrap">
        <div className="mgv-section-heading">
          <div>
            <span className="mgv-eyebrow">
              06 / THE REST OF THE MAISON
            </span>

            <h2>
              Another place,
              <em> another story.</em>
            </h2>
          </div>

          <Link
            className="mgv-text-link"
            to="/venues"
          >
            ALL FOUR VENUES
            <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="mgv-related-grid">
          {others.map((item) => (
            <Link
              key={item.id}
              to={`/venues/${item.id}`}
              className="mgv-related-card"
            >
              <div>
                <img
                  src={item.image}
                  alt={`${item.name} portfolio inspiration`}
                  loading="lazy"
                />

                <span>
                  <ArrowUpRight size={20} />
                </span>
              </div>

              <p>{item.label}</p>
              <h3>{item.name}</h3>

              <small>
                UP TO {item.capacity} GUESTS
                {" · "}SAMPLE CONCEPT
              </small>
            </Link>
          ))}
        </div>
      </section>

      <p className="mgv-disclosure">
        *All images, capacities, venue fees
        and features are illustrative.
        YOUR MOMENT is a fictional event
        venue and catering portfolio—not
        a real reservation platform.
      </p>

      {lightbox && (
        <GalleryLightbox
          venue={venue}
          photos={photos}
          index={selected}
          onChange={setActive}
          onClose={() =>
            setLightbox(false)
          }
        />
      )}
    </main>
  );
}

/*
  KEYED WRAPPER:
  Changing from one venue to another
  resets its gallery without synchronously
  calling setState inside an effect.
*/

export default function MaisonVenueDossier() {
  const { venueId } = useParams();

  return (
    <VenueDossierContent
      key={venueId}
      venueId={venueId}
    />
  );
}