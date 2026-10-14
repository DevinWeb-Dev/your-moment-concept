import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChefHat,
  Heart,
  Leaf,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";

import {
  IMAGES,
  MENU_OPTIONS,
  PACKAGES,
} from "../data/eventData.js";

import "../styles/experience.css";

const MENU_STORAGE_KEY =
  "your-moment-demo-menu-presets-v1";

const COURSES = [
  {
    key: "starter",
    number: "01",
    title: "To begin",
    subtitle: "A thoughtful first impression.",
  },
  {
    key: "main",
    number: "02",
    title: "The main event",
    subtitle: "The heart of the dining experience.",
  },
  {
    key: "dessert",
    number: "03",
    title: "A sweet ending",
    subtitle: "Finish on a memorable note.",
  },
];

function defaultMenu() {
  return {
    starter: MENU_OPTIONS.starter[0],
    main: MENU_OPTIONS.main[0],
    dessert: MENU_OPTIONS.dessert[0],
  };
}

function readSavedMenus() {
  try {
    const value = JSON.parse(
      localStorage.getItem(MENU_STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(value)) return [];

    return value
      .filter((item) => {
        return (
          item &&
          typeof item.id === "string" &&
          typeof item.title === "string" &&
          item.title.length <= 60 &&
          PACKAGES.some(
            (pack) => pack.id === item.packageId
          ) &&
          item.menu &&
          COURSES.every((course) =>
            MENU_OPTIONS[course.key].includes(
              item.menu[course.key]
            )
          )
        );
      })
      .slice(0, 12);
  } catch {
    return [];
  }
}

export default function CateringMenuStudioPage() {
  const [menu, setMenu] = useState(defaultMenu);

  const [packageId, setPackageId] = useState(
    "signature"
  );

  const [title, setTitle] = useState("");
  const [savedMenus, setSavedMenus] = useState(
    readSavedMenus
  );

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(
        MENU_STORAGE_KEY,
        JSON.stringify(savedMenus)
      );
    } catch {
      console.warn(
        "Demo menu favorites could not be saved."
      );
    }
  }, [savedMenus]);

  const selectedPackage = PACKAGES.find(
    (item) => item.id === packageId
  );

  const plannerSearch = new URLSearchParams({
    package: packageId,
    starter: menu.starter,
    main: menu.main,
    dessert: menu.dessert,
  }).toString();

  function chooseDish(course, value) {
    setMenu((current) => ({
      ...current,
      [course]: value,
    }));

    setNotice("");
    setError("");
  }

  function saveMenu(event) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (
      cleanTitle.length < 2 ||
      cleanTitle.length > 60
    ) {
      setError(
        "Enter a fictional menu name between 2 and 60 characters."
      );

      return;
    }

    const preset = {
      id:
        "YMM-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random()
          .toString(36)
          .slice(2, 6),

      title: cleanTitle,
      menu: { ...menu },
      packageId,
    };

    setSavedMenus((current) => [
      preset,
      ...current,
    ].slice(0, 12));

    setTitle("");
    setError("");

    setNotice(
      "Your sample catering menu has been saved in this browser."
    );
  }

  function useSavedMenu(preset) {
    setMenu({ ...preset.menu });
    setPackageId(preset.packageId);
    setTitle(preset.title);

    setNotice(
      "Sample menu loaded into the editor."
    );

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function deleteMenu(id) {
    if (
      !window.confirm(
        "Delete this saved browser-local menu?"
      )
    ) {
      return;
    }

    setSavedMenus((current) =>
      current.filter((item) => item.id !== id)
    );

    setNotice("Sample menu deleted.");
  }

  return (
    <div className="yme-page">
      <section className="yme-page-hero">
        <div className="ym-container">
          <span className="ym-eyebrow is-light">
            YOUR MOMENT / THE CATERING MENU STUDIO
          </span>

          <h1>
            A menu made
            <br />
            for <em>the occasion.</em>
          </h1>

          <p>
            Curate an illustrative three-course
            dining experience, save menu ideas,
            and incorporate them into your
            event-planning concept.
          </p>
        </div>
      </section>

      <section className="yme-section ym-container">
        <div className="yme-menu-layout">
          <div className="yme-menu-editor">
            <div className="yme-section-title">
              <span className="ym-eyebrow">
                THE DINING EXPERIENCE
              </span>

              <h2>
                Thoughtfully <em>curated.</em>
              </h2>
            </div>

            <div className="yme-menu-package">
              <span className="ym-eyebrow">
                CHOOSE THE CATERING CONCEPT
              </span>

              <div className="yme-package-chips">
                {PACKAGES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={
                      packageId === item.id
                    }
                    className={
                      packageId === item.id
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      setPackageId(item.id)
                    }
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              <p>
                {selectedPackage.description}
              </p>
            </div>

            {COURSES.map((course) => (
              <section
                key={course.key}
                className="yme-course-card"
              >
                <div className="yme-course-heading">
                  <span>{course.number}</span>

                  <div>
                    <span className="ym-eyebrow">
                      {course.key.toUpperCase()} COURSE
                    </span>

                    <h3>{course.title}</h3>

                    <p>{course.subtitle}</p>
                  </div>
                </div>

                <div
                  className="yme-dish-options"
                  role="group"
                  aria-label={`Choose ${course.key}`}
                >
                  {MENU_OPTIONS[course.key].map(
                    (dish) => (
                      <button
                        type="button"
                        key={dish}
                        aria-pressed={
                          menu[course.key] === dish
                        }
                        className={
                          menu[course.key] === dish
                            ? "is-selected"
                            : ""
                        }
                        onClick={() =>
                          chooseDish(
                            course.key,
                            dish
                          )
                        }
                      >
                        <span>
                          <UtensilsCrossed size={18} />
                          {dish}
                        </span>

                        <span className="yme-dish-check">
                          {menu[course.key] === dish && (
                            <Check size={17} />
                          )}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </section>
            ))}

            <form
              className="yme-menu-save"
              onSubmit={saveMenu}
            >
              <div>
                <span className="ym-eyebrow">
                  KEEP THE INSPIRATION
                </span>

                <h3>
                  Save this <em>menu concept.</em>
                </h3>

                <p>
                  Name your fictional menu and save
                  up to 12 favorites in this browser.
                </p>
              </div>

              <label>
                <span>YOUR SAMPLE MENU NAME</span>

                <input
                  type="text"
                  placeholder="e.g. A Garden Wedding Dinner"
                  minLength={2}
                  maxLength={60}
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  required
                />
              </label>

              {error && (
                <div
                  className="yme-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {notice && (
                <div
                  className="yme-success"
                  role="status"
                >
                  <Check size={18} />
                  {notice}
                </div>
              )}

              <button
                type="submit"
                className="ym-button"
              >
                <Save size={18} />
                Save Menu Idea
              </button>
            </form>
          </div>

          <aside className="yme-menu-sidebar">
            <div className="yme-menu-preview">
              <img
                src={IMAGES.dining}
                alt="Illustrative fine dining table setting"
                loading="lazy"
              />

              <div className="yme-menu-preview-content">
                <span className="ym-eyebrow">
                  YOUR MENU / LIVE PREVIEW
                </span>

                <GemHeading />

                <h2>
                  A celebration
                  <br />
                  <em>of good taste.</em>
                </h2>

                <span className="yme-preview-package">
                  {selectedPackage.name}
                </span>

                {COURSES.map((course) => (
                  <div
                    className="yme-preview-course"
                    key={course.key}
                  >
                    <span>
                      {course.key.toUpperCase()}
                    </span>

                    <strong>
                      {menu[course.key]}
                    </strong>
                  </div>
                ))}

                <Link
                  to={`/planner?${plannerSearch}`}
                  className="ym-button yme-full-button"
                >
                  Use This Menu in Planner
                  <ArrowUpRight size={18} />
                </Link>

                <p className="yme-menu-fineprint">
                  Menu preferences are illustrative.
                  Food allergies, ingredient sourcing,
                  dietary requirements, and actual
                  catering availability require
                  direct professional verification.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section className="yme-saved-menus">
          <div className="yme-section-title">
            <span className="ym-eyebrow">
              YOUR BROWSER-LOCAL FAVORITES
            </span>

            <h2>
              Ideas worth <em>keeping.</em>
            </h2>
          </div>

          {savedMenus.length === 0 ? (
            <div className="yme-empty">
              <Heart size={30} />

              <h3>No menu favorites yet.</h3>

              <p>
                Choose your courses and save
                your first fictional menu idea.
              </p>
            </div>
          ) : (
            <div className="yme-saved-menu-grid">
              {savedMenus.map((preset) => (
                <article
                  key={preset.id}
                  className="yme-saved-menu-card"
                >
                  <div className="yme-saved-menu-top">
                    <Leaf size={24} />

                    <button
                      type="button"
                      aria-label={`Delete ${preset.title}`}
                      onClick={() =>
                        deleteMenu(preset.id)
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <span className="ym-eyebrow">
                    SAVED MENU CONCEPT
                  </span>

                  <h3>{preset.title}</h3>

                  <p>
                    {
                      PACKAGES.find(
                        (item) =>
                          item.id === preset.packageId
                      )?.name
                    }
                  </p>

                  <div className="yme-saved-menu-dishes">
                    <span>{preset.menu.starter}</span>
                    <span>{preset.menu.main}</span>
                    <span>{preset.menu.dessert}</span>
                  </div>

                  <button
                    type="button"
                    className="yme-load-menu"
                    onClick={() =>
                      useSavedMenu(preset)
                    }
                  >
                    Load into Menu Studio
                    <ArrowRight size={17} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="yme-privacy-note">
          <ShieldCheck size={22} />

          <p>
            This is a fictional dining design
            experience and not a meal-ordering
            platform. Use it for layout and
            interaction demonstrations only.
          </p>
        </div>
      </section>
    </div>
  );
}

function GemHeading() {
  return (
    <div className="yme-menu-symbol">
      <Sparkles
        size={27}
        strokeWidth={1.3}
      />
    </div>
  );
}