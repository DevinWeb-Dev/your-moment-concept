import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  ClipboardList,
  Database,
  Gem,
  LayoutDashboard,
  ListChecks,
  Menu,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

import "../styles/operations.css";
import "../styles/intelligence.css";

const LINKS = [
  {
    label: "Command Center",
    path: "/staff",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Proposal Desk",
    path: "/staff/desk",
    icon: ClipboardList,
  },
  {
    label: "Venue Schedule",
    path: "/staff/schedule",
    icon: CalendarRange,
  },
  {
    label: "Event Run Sheet",
    path: "/staff/run-sheet",
    icon: ListChecks,
  },
  {
    label: "Reports & Trends",
    path: "/staff/reports",
    icon: BarChart3,
  },
  {
    label: "Venue Insights",
    path: "/staff/insights",
    icon: TrendingUp,
  },
  {
    label: "Studio Settings",
    path: "/staff/settings",
    icon: Settings2,
  },
  {
    label: "Data & Backups",
    path: "/staff/data",
    icon: Database,
  },
];

const TITLES = {
  "/staff": "Event Command Center",
  "/staff/desk": "Proposal Desk",
  "/staff/schedule": "Weekly Venue Schedule",
  "/staff/run-sheet": "Event Run Sheet",
  "/staff/reports": "Reports & Trends",
  "/staff/insights": "Venue Insights",
  "/staff/settings": "Studio Settings",
  "/staff/data": "Data & Backups",
};

export default function OperationsLayout({
  quotes = [],
  operations = {},
  settings,
  onSetStage,
  onToggleTask,
  onSaveNote,
  onResetTasks,
  onSaveSettings,
  onRestoreBackup,
}) {
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKey(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      onKey
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKey
      );
    };
  }, [menuOpen]);

  return (
    <div className="ymo-app">
      <aside
        id="ymo-sidebar"
        className={`ymo-sidebar ${
          menuOpen ? "is-open" : ""
        }`}
        aria-label="Event operations navigation"
      >
        <div>
          <Link
            to="/staff"
            className="ymo-sidebar-brand"
          >
            <span className="ymo-brand-icon">
              <Gem
                size={23}
                strokeWidth={1.3}
              />
            </span>

            <span>
              <strong>YOUR MOMENT.</strong>
              <small>EVENT OPERATIONS</small>
            </span>
          </Link>

          <div className="ymo-sidebar-divider" />

          <span className="ymo-sidebar-label">
            YOUR WORKSPACE
          </span>

          <nav className="ymo-sidebar-nav">
            {LINKS.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className={({ isActive }) =>
                    `ymo-sidebar-link ${
                      isActive ? "is-active" : ""
                    }`
                  }
                >
                  <Icon
                    size={19}
                    strokeWidth={1.7}
                  />

                  <span>{item.label}</span>

                  <ArrowUpRight
                    className="ymo-sidebar-arrow"
                    size={15}
                  />
                </NavLink>
              );
            })}
          </nav>

          <div className="ymo-sidebar-summary">
            <span className="ymo-sidebar-label">
              CURRENT WORKSPACE
            </span>

            <strong>
              {quotes.length}
            </strong>

            <p>
              Browser-local fictional
              event proposals
            </p>
          </div>
        </div>

        <div className="ymo-sidebar-bottom">
          <div className="ymo-sidebar-notice">
            <ShieldCheck size={23} />

            <strong>
              Demo Operations
            </strong>

            <p>
              Internal planning concept.
              No confirmed venues or
              real customer information.
            </p>
          </div>

          <Link
            to="/"
            className="ymo-return-link"
          >
            <ArrowLeft size={17} />
            Public Website
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="ymo-backdrop"
          aria-label="Close operations menu"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <div className="ymo-workspace">
        <header className="ymo-topbar">
          <div className="ymo-topbar-left">
            <button
              type="button"
              className="ymo-menu-toggle"
              aria-controls="ymo-sidebar"
              aria-expanded={menuOpen}
              aria-label={
                menuOpen
                  ? "Close operations menu"
                  : "Open operations menu"
              }
              onClick={() =>
                setMenuOpen((value) => !value)
              }
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

            <span className="ymo-topbar-icon">
              <Sparkles size={21} />
            </span>

            <div>
              <small>
                {settings?.studioName ||
                  "YOUR MOMENT."}
                {" / OPERATIONS"}
              </small>

              <h2>
                {TITLES[location.pathname] ||
                  "Event Operations"}
              </h2>
            </div>
          </div>

          <div className="ymo-topbar-right">
            <span className="ymo-local-indicator">
              <i />
              LOCAL DEMO
            </span>

            <Link
              to="/planner"
              className="ymo-topbar-action"
            >
              Open Event Planner
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </header>

        <main className="ymo-main">
          <div className="ymo-content">
            <div className="ymo-context">
              <span>
                <ShieldCheck size={15} />
                Fictional planning workspace
              </span>

              <span>
                {quotes.length} saved{" "}
                {quotes.length === 1
                  ? "concept"
                  : "concepts"}
              </span>
            </div>

            <Outlet
              context={{
                quotes,
                operations,
                settings,
                onSetStage,
                onToggleTask,
                onSaveNote,
                onResetTasks,
                onSaveSettings,
                onRestoreBackup,
              }}
            />
          </div>
        </main>

        <footer className="ymo-footer">
          <span>
            © {new Date().getFullYear()} YOUR MOMENT.
          </span>

          <span>
            Website Concept Made by:
            Web Developer Devin Planas
          </span>
        </footer>
      </div>
    </div>
  );
}