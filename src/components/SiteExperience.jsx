import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  ArrowUp,
  Gem,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import "../styles/final.css";

const INTRO_KEY =
  "your-moment-intro-shown-v1";

const PAGE_DESCRIPTIONS = {
  "/":
    "YOUR MOMENT. is a premium event venues and catering portfolio concept, featuring interactive event planning, elegant venue discovery, and sample quotations.",

  "/venues":
    "Explore four fictional premium event venues, sample capacities, beautiful settings, and illustrated venue prices.",

  "/packages":
    "Discover sample catering and celebration packages at YOUR MOMENT.",

  "/compare":
    "Compare catering packages and calculate example event costs by venue and guest count.",

  "/calendar":
    "Explore an interactive event-planning calendar with fictional venue concepts and proposed event dates.",

  "/menus":
    "Create and save fictional three-course catering menus in the YOUR MOMENT Menu Studio.",

  "/planner":
    "Build a fictional event plan with your preferred venue, catering package, menu, and estimated sample cost.",

  "/plans":
    "Review browser-local sample event proposals and illustrative quotation summaries.",

  "/gallery":
    "Explore the editorial event styling and celebration inspiration gallery of YOUR MOMENT.",
};

function reducedMotionEnabled() {
  if (
    typeof window === "undefined" ||
    !window.matchMedia
  ) {
    return false;
  }

  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}

function shouldShowIntro() {
  if (reducedMotionEnabled()) {
    return false;
  }

  try {
    return (
      sessionStorage.getItem(INTRO_KEY) !== "yes"
    );
  } catch {
    return true;
  }
}

function goToTop() {
  window.scrollTo({
    top: 0,

    behavior: reducedMotionEnabled()
      ? "instant"
      : "smooth",
  });
}

export default function SiteExperience() {
  const location = useLocation();

  const [showIntro, setShowIntro] = useState(
    shouldShowIntro
  );

  const [scrollProgress, setScrollProgress] =
    useState(0);

  const [showBackTop, setShowBackTop] =
    useState(false);

  // ==================================
  // PREMIUM BRAND INTRO
  // ==================================

  useEffect(() => {
    if (!showIntro) return;

    try {
      sessionStorage.setItem(
        INTRO_KEY,
        "yes"
      );
    } catch {
      // The intro still works without storage.
    }

    const timer = window.setTimeout(() => {
      setShowIntro(false);
    }, 1100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showIntro]);

  // ==================================
  // SCROLL INDICATOR
  // ==================================

  useEffect(() => {
    let frame = null;

    function updateScroll() {
      frame = null;

      const documentHeight =
        document.documentElement.scrollHeight;

      const availableDistance = Math.max(
        documentHeight - window.innerHeight,
        0
      );

      const scrollPosition = Math.max(
        window.scrollY,
        0
      );

      const percentage =
        availableDistance > 0
          ? Math.min(
              100,
              (scrollPosition / availableDistance) *
                100
            )
          : 0;

      setScrollProgress(percentage);

      setShowBackTop(
        scrollPosition > 500
      );
    }

    function scheduleScrollUpdate() {
      if (frame !== null) return;

      frame =
        window.requestAnimationFrame(
          updateScroll
        );
    }

    updateScroll();

    window.addEventListener(
      "scroll",
      scheduleScrollUpdate,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      scheduleScrollUpdate
    );

    return () => {
      window.removeEventListener(
        "scroll",
        scheduleScrollUpdate
      );

      window.removeEventListener(
        "resize",
        scheduleScrollUpdate
      );

      if (frame !== null) {
        window.cancelAnimationFrame(
          frame
        );
      }
    };
  }, [location.pathname]);

  // ==================================
  // PAGE-SPECIFIC DESCRIPTION
  // ==================================

  useEffect(() => {
    const metaDescription =
      document.querySelector(
        'meta[name="description"]'
      );

    if (!metaDescription) return;

    const description =
      location.pathname.startsWith(
        "/venues/"
      )
        ? "Explore a fictional YOUR MOMENT event venue with editorial inspiration, sample amenities, capacities, and a customizable event quotation."
        : PAGE_DESCRIPTIONS[
            location.pathname
          ] ||
          PAGE_DESCRIPTIONS["/"];

    metaDescription.setAttribute(
      "content",
      description
    );
  }, [location.pathname]);

  // ==================================
  // SUBTLE REVEAL ANIMATIONS
  // ==================================

  useEffect(() => {
    if (
      reducedMotionEnabled() ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add(
              "ym5-is-revealed"
            );

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -25px 0px",
        }
      );

    let frame = null;

    frame = window.requestAnimationFrame(
      () => {
        document
          .querySelectorAll(
            [
              ".ym-section-heading",
              ".ym-venue-card",
              ".ym-principle",
              ".ym-package-card",
              ".ym-gallery-item",
              ".ym-story-content",
              ".ym-feature-layout",
            ].join(",")
          )
          .forEach((element) => {
            observer.observe(element);
          });
      }
    );

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(
          frame
        );
      }

      observer.disconnect();
    };
  }, [location.pathname]);

  // ==================================
  // ACCESSIBLE MAIN-CONTENT SHORTCUT
  // ==================================

  function skipToContent() {
    const main = document.getElementById(
      "main-content"
    );

    if (!main) return;

    main.focus({
      preventScroll: false,
    });
  }

  return (
    <>
      <button
        type="button"
        className="ym5-skip"
        onClick={skipToContent}
      >
        Skip to main content
      </button>

      <div
        className="ym5-scroll-progress"
        aria-hidden="true"
      >
        <span
          style={{
            width: `${scrollProgress}%`,
          }}
        />
      </div>

      {showIntro && (
        <div
          className="ym5-intro"
          aria-hidden="true"
        >
          <div className="ym5-intro-orbit orbit-one" />
          <div className="ym5-intro-orbit orbit-two" />

          <div className="ym5-intro-content">
            <span className="ym5-intro-emblem">
              <Gem
                size={37}
                strokeWidth={1}
              />
            </span>

            <span className="ym5-intro-eyebrow">
              THE ART OF CELEBRATING
            </span>

            <h2>
              YOUR MOMENT<span>.</span>
            </h2>

            <p>
              Some moments deserve
              a beautiful setting.
            </p>

            <div className="ym5-loading-track">
              <span />
            </div>

            <small>
              VENUES · CATERING · CELEBRATIONS
            </small>
          </div>
        </div>
      )}

      <div className="ym5-demo-indicator">
        <ShieldCheck
          size={16}
          strokeWidth={1.6}
        />

        <span>
          PORTFOLIO CONCEPT · DEMO ONLY
        </span>
      </div>

      <button
        type="button"
        className={`ym5-back-to-top ${
          showBackTop
            ? "is-visible"
            : ""
        }`}
        aria-label="Back to top"
        tabIndex={
          showBackTop ? 0 : -1
        }
        onClick={goToTop}
      >
        <ArrowUp size={21} />
      </button>
    </>
  );
}