import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChefHat,
  Gem,
  Heart,
  Save,
  Trash2,
  Utensils,
} from "lucide-react";

import {
  IMAGES,
  MENU_OPTIONS,
  PACKAGES,
} from "../data/eventData.js";

import "../styles/maison-celebrations.css";

const STORAGE_KEY =
  "your-moment-demo-menu-presets-v1";

const COURSES = [
  {
    id: "starter",
    chapter: "I",
    eyebrow: "THE FIRST IMPRESSION",
    title: "The Prelude",
    photo: IMAGES.flowers,
    description: "A graceful opening to the evening.",
  },
  {
    id: "main",
    chapter: "II",
    eyebrow: "THE HEART OF THE FEAST",
    title: "The Main Affair",
    photo: IMAGES.dining,
    description:
      "Where beautiful conversation meets the table.",
  },
  {
    id: "dessert",
    chapter: "III",
    eyebrow: "THE FINAL SWEET NOTE",
    title: "The Encore",
    photo: IMAGES.editorial,
    description:
      "One final reason to stay a little longer.",
  },
];

const defaultMenu = () =>
  Object.fromEntries(
    COURSES.map(({ id }) => [
      id,
      MENU_OPTIONS[id][0],
    ])
  );

function readMenus() {
  try {
    const items = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(items)) return [];

    return items
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.title === "string" &&
          item.title.length <= 60 &&
          PACKAGES.some(
            (pack) => pack.id === item.packageId
          ) &&
          item.menu &&
          COURSES.every(({ id }) =>
            MENU_OPTIONS[id].includes(
              item.menu[id]
            )
          )
      )
      .slice(0, 12);
  } catch {
    return [];
  }
}

export default function MaisonCateringAtelier() {
  const [menu, setMenu] = useState(defaultMenu);
  const [packageId, setPackageId] =
    useState("signature");
  const [name, setName] = useState("");
  const [presets, setPresets] = useState(readMenus);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const pack =
    PACKAGES.find(
      (item) => item.id === packageId
    ) || PACKAGES[1];

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(presets)
      );
    } catch {
      console.warn(
        "Demo menu presets could not be stored."
      );
    }
  }, [presets]);

  function choose(course, dish) {
    setMenu((before) => ({
      ...before,
      [course]: dish,
    }));

    setNotice("");
    setError("");
  }

  function savePreset(event) {
    event.preventDefault();

    const title = name.trim();

    if (
      title.length < 2 ||
      title.length > 60
    ) {
      setError(
        "Enter a fictional menu title of 2–60 characters."
      );
      return;
    }

    const preset = {
      id: `YMM-${Date.now()
        .toString(36)
        .toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`,
      title,
      packageId,
      menu: { ...menu },
    };

    setPresets((before) =>
      [preset, ...before].slice(0, 12)
    );

    setName("");
    setError("");
    setNotice(
      "Your menu study has been saved in this browser."
    );
  }

  function restore(preset) {
    setMenu({ ...preset.menu });
    setPackageId(preset.packageId);
    setName(preset.title);

    setError("");
    setNotice(
      "Saved menu study loaded into the editor."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function remove(id) {
    if (
      !window.confirm(
        "Remove this browser-local sample menu?"
      )
    ) {
      return;
    }

    setPresets((before) =>
      before.filter(
        (item) => item.id !== id
      )
    );

    setNotice("Sample menu removed.");
  }

  const plannerLink =
    `/planner?${new URLSearchParams({
      package: packageId,
      starter: menu.starter,
      main: menu.main,
      dessert: menu.dessert,
    })}`;

  return (
    <main className="m3 m3-menu">
      <section className="m3-menu-hero">
        <div className="m3-menu-hero-copy">
          <span className="m3-overline m3-on-dark">
            THE MAISON / GASTRONOMY NOTES / 04
          </span>

          <h1>
            What a beautiful{" "}
            <em>taste of forever.</em>
          </h1>

          <p>
            The table holds the stories.
            Compose a fictional three-course
            menu from the original YOUR MOMENT
            sample choices, then carry your
            selections into the Event Planner.
          </p>

          <a
            href="#menu-editor"
            className="m3-inline m3-on-dark"
          >
            ENTER THE DINING ATELIER
            <ArrowRight size={17} />
          </a>
        </div>

        <div className="m3-menu-hero-art">
          <img
            src={IMAGES.dining}
            alt="Illustrative elegant event dining table"
          />

          <div className="m3-menu-seal">
            <Utensils size={23} />
            LA TABLE / MAISON GALA
          </div>
        </div>
      </section>

      <section
        className="m3-container m3-menu-intro"
        id="menu-editor"
      >
        <div>
          <span className="m3-overline">
            01 / THE MENU EDITOR
          </span>

          <h2>
            Three chapters.
            <br />
            <em>One unforgettable table.</em>
          </h2>
        </div>

        <div>
          <span className="m3-overline">
            SELECT A CATERING EDITION
          </span>

          <div className="m3-menu-package-pills">
            {PACKAGES.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={
                  item.id === packageId
                }
                className={
                  item.id === packageId
                    ? "is-selected"
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

          <p>{pack.description}</p>
        </div>
      </section>

      <section className="m3-menu-columns m3-container">
        <div className="m3-menu-course-list">
          {COURSES.map((course) => (
            <article
              className="m3-course"
              key={course.id}
            >
              <div className="m3-course-photo">
                <img
                  src={course.photo}
                  loading="lazy"
                  alt={`Illustrative ${course.title} atmosphere`}
                />

                <span>
                  ACT {course.chapter}
                </span>
              </div>

              <div className="m3-course-copy">
                <span className="m3-overline">
                  {course.eyebrow}
                </span>

                <h3>
                  {course.title}
                  <i>.</i>
                </h3>

                <p>{course.description}</p>

                <fieldset>
                  <legend>
                    CHOOSE YOUR SAMPLE{" "}
                    {course.id.toUpperCase()}
                  </legend>

                  {MENU_OPTIONS[
                    course.id
                  ].map((dish, index) => (
                    <label
                      key={dish}
                      className={
                        menu[course.id] === dish
                          ? "is-picked"
                          : ""
                      }
                    >
                      <input
                        type="radio"
                        name={`menu-${course.id}`}
                        value={dish}
                        checked={
                          menu[course.id] === dish
                        }
                        onChange={() =>
                          choose(course.id, dish)
                        }
                      />

                      <span>0{index + 1}</span>
                      <strong>{dish}</strong>
                      <Check size={17} />
                    </label>
                  ))}
                </fieldset>
              </div>
            </article>
          ))}
        </div>

        <aside className="m3-menu-preview">
          <span className="m3-overline">
            YOUR PERSONAL TABLE STUDY
          </span>

          <div className="m3-menu-preview-crest">
            <Gem size={30} />

            <span>
              MAISON GALA
              <br />
              THE DINING NOTES
            </span>
          </div>

          <h2>
            Tonight's <em>menu.</em>
          </h2>

          <p>
            {pack.name} / a three-course
            demonstration.
          </p>

          {COURSES.map((course) => (
            <div
              className="m3-menu-preview-course"
              key={course.id}
            >
              <span>
                {course.title.toUpperCase()}
                {" / "}
                {course.chapter}
              </span>

              <strong>
                {menu[course.id]}
              </strong>
            </div>
          ))}

          <Link
            className="m3-gold-cta"
            to={plannerLink}
          >
            TAKE THIS MENU TO YOUR PLAN
            <ArrowUpRight size={18} />
          </Link>

          <p className="m3-tiny-note">
            Selections describe a fictional
            menu study. Ingredient suitability,
            allergies and availability are
            not verified.
          </p>
        </aside>
      </section>

      <section className="m3-menu-library m3-container">
        <div>
          <span className="m3-overline">
            02 / THE PRIVATE RECIPE BOOK
          </span>

          <h2>
            Save a feeling.
            <br />
            <em>Return to it later.</em>
          </h2>

          <p>
            Store up to 12 fictional menu
            studies inside this browser only.
            No accounts or customer data
            are collected.
          </p>

          <form onSubmit={savePreset}>
            <label>
              NAME YOUR MENU STUDY

              <input
                required
                minLength={2}
                maxLength={60}
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. Our Evening Under the Stars"
              />
            </label>

            <button type="submit">
              <Save size={18} />
              SAVE THIS MENU STUDY
            </button>
          </form>

          {error && (
            <p className="m3-error" role="alert">
              {error}
            </p>
          )}

          {notice && (
            <p className="m3-notice" role="status">
              {notice}
            </p>
          )}
        </div>

        <div className="m3-saved-menus">
          <span className="m3-overline">
            SAVED STUDIES /{" "}
            {String(
              presets.length
            ).padStart(2, "0")}
          </span>

          {presets.length === 0 ? (
            <div className="m3-empty">
              <Heart size={30} />

              <p>
                Nothing saved yet.
                Compose your first
                three-course menu
                on the left.
              </p>
            </div>
          ) : (
            presets.map((item) => (
              <article key={item.id}>
                <div>
                  <small>
                    {
                      PACKAGES.find(
                        (pack) =>
                          pack.id === item.packageId
                      )?.name
                    }
                  </small>

                  <h3>{item.title}</h3>

                  <p>
                    {item.menu.starter}
                    {" / "}
                    {item.menu.main}
                    {" / "}
                    {item.menu.dessert}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      restore(item)
                    }
                    aria-label={`Load ${item.title}`}
                  >
                    <ArrowUpRight size={18} />
                    LOAD
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      remove(item.id)
                    }
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <p className="m3-disclaimer">
        <ChefHat size={15} />
        Sample menu only. No live kitchen,
        catering order, allergy verification
        or payment processing.
      </p>
    </main>
  );
}