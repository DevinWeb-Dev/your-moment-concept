import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarHeart,
  Gem,
  Menu,
  Sparkles,
  X,
} from "lucide-react";

import { BRAND } from "../data/eventData.js";

import "../styles/maison-gala.css";

const links = [
  ["The story", "/"],
  ["Venues", "/venues"],
  ["Celebration edits", "/packages"],
  ["Compare", "/compare"],
  ["Calendar", "/calendar"],
  ["Menus", "/menus"],
  ["Gallery", "/gallery"],
  ["My plans", "/plans"],
];

function Wordmark({ light = false }) {
  return (
    <span className={`mg-wordmark ${light ? "is-light" : ""}`}>
      <span className="mg-wordmark-glyph" aria-hidden="true">
        <Gem size={23} strokeWidth={1.25} />
      </span>

      <span className="mg-wordmark-text">
        YOUR <span>MOMENT</span><i>.</i>
        <small>THE ART OF THE OCCASION</small>
      </span>
    </span>
  );
}

function FloatingActions() {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="mg-floating-actions"
      aria-label="Quick shortcuts"
    >
      <Link className="mg-float-ops" to="/staff">
        <span className="mg-float-icon">
          <Sparkles size={17} />
        </span>

        <span>
          <b>OPERATIONS DEMO</b>
          <small>Explore the studio</small>
        </span>

        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>

      <Link className="mg-float-plan" to="/planner">
        <CalendarHeart size={18} aria-hidden="true" />
        <span>PLAN A MOMENT</span>
        <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </div>,
    document.body
  );
}

export function MaisonHeader() {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 22);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () =>
      window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const [menuPath, setMenuPath] = useState(
    location.pathname
  );

  const showMenu =
    isOpen && menuPath === location.pathname;

  const toggle = () => {
    setMenuPath(location.pathname);
    setIsOpen(!showMenu);
  };

  const close = () => setIsOpen(false);

  return (
    <>
      <div className="mg-announcement">
        <span>
          MAISON GALA / AN IMAGINED WORLD OF CELEBRATION
        </span>

        <Link to="/planner">
          BEGIN YOUR STORY
          <ArrowUpRight size={13} />
        </Link>
      </div>

      <header
        className={`mg-header ${
          scrolled ? "has-scrolled" : ""
        }`}
      >
        <div className="mg-header-inner">
          <Link
            to="/"
            onClick={close}
            aria-label="YOUR MOMENT homepage"
          >
            <Wordmark />
          </Link>

          <nav
            id="mg-main-nav"
            className={`mg-navigation ${
              showMenu ? "is-open" : ""
            }`}
            aria-label="Primary navigation"
          >
            {links.map(([label, path], index) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={close}
                className={({ isActive }) =>
                  isActive ? "is-active" : ""
                }
              >
                <span className="mg-nav-index">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {label}
              </NavLink>
            ))}

            <Link
              to="/planner"
              className="mg-mobile-plan"
              onClick={close}
            >
              Create a celebration
              <ArrowUpRight size={17} />
            </Link>
          </nav>

          <div className="mg-header-end">
            <Link
              className="mg-header-cta"
              to="/planner"
            >
              CURATE AN EVENT
              <span>
                <ArrowUpRight size={17} />
              </span>
            </Link>

            <button
              className="mg-menu-toggle"
              type="button"
              aria-expanded={showMenu}
              aria-controls="mg-main-nav"
              aria-label={
                showMenu
                  ? "Close navigation"
                  : "Open navigation"
              }
              onClick={toggle}
            >
              {showMenu ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>
        </div>
      </header>

      <FloatingActions />
    </>
  );
}

export function MaisonFooter() {
  return (
    <footer className="mg-footer">
      <div
        className="mg-footer-halo"
        aria-hidden="true"
      />

      <div className="mg-footer-inner">
        <div className="mg-footer-prelude">
          <span className="mg-kicker mg-kicker-light">
            THE FINAL TOAST / THE FIRST STEP
          </span>

          <span>
            EST. IN IMAGINATION — MADE FOR YOUR STORY
          </span>
        </div>

        <div className="mg-footer-feature">
          <h2>
            Life deserves{" "}
            <em>a little grandeur.</em>
          </h2>

          <Link
            to="/planner"
            className="mg-footer-biglink"
            aria-label="Start planning your event"
          >
            <ArrowUpRight
              size={38}
              strokeWidth={1.2}
            />
          </Link>
        </div>

        <div className="mg-footer-links">
          <div className="mg-footer-about">
            <Wordmark light />

            <p>
              A fictional, Philippines-inspired
              event venue and catering portfolio.
              A place to imagine possibilities—not
              a real venue booking service.
            </p>

            <Link
              to="/gallery"
              className="mg-footer-underlink"
            >
              THE CELEBRATION JOURNAL
              <ArrowRight size={15} />
            </Link>
          </div>

          <div>
            <strong>THE COLLECTION</strong>

            <Link to="/venues">The venues</Link>
            <Link to="/packages">Catering edits</Link>
            <Link to="/compare">Compare packages</Link>
            <Link to="/menus">Menu studio</Link>
            <Link to="/gallery">The gallery</Link>
          </div>

          <div>
            <strong>PLAN & EXPLORE</strong>

            <Link to="/planner">Event planner</Link>
            <Link to="/calendar">Event calendar</Link>
            <Link to="/plans">Saved proposals</Link>
            <Link to="/staff">Operations demo</Link>
          </div>
        </div>

        <div className="mg-footer-bottom">
          <span>
            © {new Date().getFullYear()} YOUR MOMENT.
            {" / "}CONCEPT ONLY
          </span>

          <span>{BRAND.developer}</span>

          <Link to="/">
            BACK TO THE BEGINNING
            <ArrowDownRight size={14} />
          </Link>
        </div>
      </div>
    </footer>
  );
}