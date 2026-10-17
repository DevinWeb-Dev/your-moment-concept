import { useEffect, useMemo, useState } from "react";
import "../styles/maison-client-experience.css";

const STORAGE_KEY = "your-moment:maison-client-experience:v1";

const PHASES = [
  "Inquiry",
  "Planning",
  "Design approval",
  "Final preparations",
  "Event ready",
];

const SECTIONS = [
  ["studio", "Event studio"],
  ["timeline", "Program & updates"],
  ["guests", "RSVP register"],
];

function localDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function plusDays(days) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return localDate(d);
}

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sampleEvent() {
  return {
    id: "maison-demo",
    title: "An Evening in Bloom",
    hosts: "The Sample Family",
    subtitle: "An intimate celebration of meaningful moments",
    date: plusDays(60),
    time: "17:30",
    venue: "The Garden Pavilion (sample)",
    location: "Sample location · Philippines",
    dress: "Garden formal · warm neutrals",
    welcome:
      "An evening gathered around the people and moments that matter most. We cannot wait to celebrate with you.",
    deadline: plusDays(45),
    phase: 1,
    capacity: 80,
    schedule: [
      {
        id: "s1",
        time: "17:30",
        title: "Welcome reception",
        detail: "A little music and a warm hello",
      },
      {
        id: "s2",
        time: "18:30",
        title: "Celebration begins",
        detail: "The opening moment",
      },
      {
        id: "s3",
        time: "19:30",
        title: "Dinner & conversations",
        detail: "An evening at the table",
      },
      {
        id: "s4",
        time: "21:00",
        title: "Music under the stars",
        detail: "Stay awhile",
      },
    ],
    updates: [
      {
        id: "u1",
        date: localDate(new Date()),
        title: "Preparations underway",
        detail:
          "Our celebration is taking shape. More details to come.",
      },
    ],
  };
}

function loadData() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "null"
    );

    if (
      saved &&
      Array.isArray(saved.events) &&
      saved.events.length &&
      saved.rsvps &&
      typeof saved.rsvps === "object" &&
      !Array.isArray(saved.rsvps)
    ) {
      return {
        events: saved.events,
        rsvps: saved.rsvps,
        selectedId: saved.events.some(
          (e) => e.id === saved.selectedId
        )
          ? saved.selectedId
          : saved.events[0].id,
      };
    }
  } catch {
    // No saved browser state.
  }

  return {
    events: [sampleEvent()],
    rsvps: {},
    selectedId: "maison-demo",
  };
}

function readableDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return "Date to be announced";
  }

  const d = new Date(`${value}T12:00:00`);

  return Number.isNaN(d.getTime())
    ? "Date to be announced"
    : d.toLocaleDateString("en-PH", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
}

function daysRemaining(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return null;
  }

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12
  );

  return Math.ceil(
    (new Date(`${value}T12:00:00`) - today) / 86400000
  );
}

function csvSafe(value) {
  let cell = String(value ?? "");

  if (/^\s*[=+\-@]/.test(cell)) {
    cell = `'${cell}`;
  }

  return `"${cell.replace(/"/g, '""')}"`;
}

function saveCSV(name, entries) {
  const header = [
    "Guest",
    "Email",
    "Response",
    "Attendees",
    "Dietary note",
    "Submitted",
  ];

  const lines = [
    header,
    ...entries.map((r) => [
      r.name,
      r.email,
      r.choice,
      r.count,
      r.dietary,
      r.createdAt,
    ]),
  ];

  const blob = new Blob(
    [
      "\uFEFF" +
        lines
          .map((r) => r.map(csvSafe).join(","))
          .join("\r\n"),
    ],
    { type: "text/csv;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = name;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Field({ label, children }) {
  return (
    <label className="mx-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

/* ----------------------------------
   FULLSCREEN GUEST EXPERIENCE
---------------------------------- */

function EventPreview({
  event,
  replies,
  onRSVP,
  onClose,
}) {
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    choice: "Attending",
    count: 1,
    dietary: "",
  });

  const [notice, setNotice] = useState("");

  const remaining = daysRemaining(event.date);

  const responseCount = replies
    .filter((r) => r.choice === "Attending")
    .reduce(
      (sum, r) => sum + Number(r.count || 0),
      0
    );

  const expired =
    daysRemaining(event.deadline) != null &&
    daysRemaining(event.deadline) < 0;

  function submit(e) {
    e.preventDefault();

    if (!draft.name.trim()) return;

    if (expired) {
      setNotice(
        "The sample RSVP deadline has passed."
      );
      return;
    }

    if (
      draft.choice === "Attending" &&
      responseCount + Number(draft.count) >
        Number(event.capacity)
    ) {
      setNotice(
        "This local demo has reached its configured guest capacity."
      );
      return;
    }

    onRSVP({
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim(),
      count:
        draft.choice === "Attending"
          ? Number(draft.count)
          : 0,
    });

    setDraft({
      name: "",
      email: "",
      choice: "Attending",
      count: 1,
      dietary: "",
    });

    setNotice(
      "Response recorded in this browser only. This is a demo, not a submitted invitation."
    );
  }

  return (
    <div
      className="mx-preview"
      role="dialog"
      aria-modal="true"
      aria-label="Guest experience demo"
    >
      <div className="mx-preview-bar">
        <span>
          ✦ MAISON GALA
          <b> / GUEST EXPERIENCE DEMO</b>
        </span>

        <button type="button" onClick={onClose}>
          ← Exit preview
        </button>
      </div>

      <div className="mx-invite">
        <section className="mx-invite-hero">
          <div className="mx-invite-frame">
            <span>
              AN INVITATION TO REMEMBER
            </span>

            <i>✳</i>

            <h1>{event.title}</h1>
            <p>{event.subtitle}</p>

            <div className="mx-invite-flourish">
              ✦ &nbsp; ◇ &nbsp; ✦
            </div>

            <strong>{event.hosts}</strong>
          </div>

          <div className="mx-invite-date">
            <span>YOU ARE CORDIALLY INVITED</span>
            <strong>
              {readableDate(event.date)}
            </strong>
            <small>
              {event.time || "Time to follow"}
              {" · "}
              {event.venue}
            </small>
          </div>
        </section>

        <section className="mx-invite-content">
          <div className="mx-invite-message">
            <span className="mx-kicker">
              A PERSONAL NOTE
            </span>

            <h2>
              Moments worth <em>keeping.</em>
            </h2>

            <p>{event.welcome}</p>

            <div className="mx-invite-info">
              <div>
                <small>VENUE</small>
                <strong>{event.venue}</strong>
                <span>{event.location}</span>
              </div>

              <div>
                <small>ATTIRE</small>
                <strong>{event.dress}</strong>
                <span>
                  Come as your most wonderful self
                </span>
              </div>
            </div>
          </div>

          <div className="mx-invite-progress">
            <span className="mx-kicker">
              THE CELEBRATION JOURNEY
            </span>

            <h2>
              It is all <em>coming together.</em>
            </h2>

            <div className="mx-phases">
              {PHASES.map((phase, i) => (
                <div
                  className={
                    i <= event.phase
                      ? "is-done"
                      : ""
                  }
                  key={phase}
                >
                  <span>
                    {i < event.phase
                      ? "✓"
                      : String(i + 1).padStart(2, "0")}
                  </span>
                  <strong>{phase}</strong>
                </div>
              ))}
            </div>

            <p>
              Current update:{" "}
              {PHASES[event.phase]}.
              Milestones reflect the planning
              team's demo selections, not a
              verified live service.
            </p>
          </div>

          <div className="mx-invite-program">
            <span className="mx-kicker">
              AN EVENING UNFOLDING
            </span>

            <h2>
              The <em>program.</em>
            </h2>

            <div className="mx-program-list">
              {[...event.schedule]
                .sort((a, b) =>
                  a.time.localeCompare(b.time)
                )
                .map((item) => (
                  <div key={item.id}>
                    <time>{item.time}</time>

                    <div>
                      <strong>
                        {item.title}
                      </strong>
                      <p>{item.detail}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="mx-invite-updates">
            <span className="mx-kicker">
              NOTES FROM THE STUDIO
            </span>

            <h2>
              Little <em>announcements.</em>
            </h2>

            {[...event.updates]
              .slice()
              .reverse()
              .map((item) => (
                <article key={item.id}>
                  <small>
                    {readableDate(item.date)}
                  </small>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}

            {!event.updates.length && (
              <p>
                Updates will appear here.
              </p>
            )}
          </div>

          <div className="mx-invite-rsvp">
            <span className="mx-kicker">
              YOUR PRESENCE MEANS EVERYTHING
            </span>

            <h2>
              Kindly <em>reply.</em>
            </h2>

            <p>
              RSVP by{" "}
              {readableDate(event.deadline)}.
              This interactive RSVP is a local
              prototype and does not notify
              an organizer.
            </p>

            <form onSubmit={submit}>
              <Field label="Your name">
                <input
                  required
                  maxLength="80"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      name: e.target.value,
                    })
                  }
                  placeholder="Full name"
                />
              </Field>

              <Field label="Email (optional)">
                <input
                  type="email"
                  maxLength="120"
                  value={draft.email}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      email: e.target.value,
                    })
                  }
                  placeholder="you@example.com"
                />
              </Field>

              <Field label="Your response">
                <select
                  value={draft.choice}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      choice: e.target.value,
                    })
                  }
                >
                  <option>Attending</option>
                  <option>Declined</option>
                  <option>Maybe</option>
                </select>
              </Field>

              {draft.choice === "Attending" && (
                <Field label="Number attending (including you)">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={draft.count}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        count: e.target.value,
                      })
                    }
                    required
                  />
                </Field>
              )}

              <Field label="Dietary notes (optional)">
                <textarea
                  rows="2"
                  maxLength="200"
                  value={draft.dietary}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      dietary: e.target.value,
                    })
                  }
                  placeholder="Allergies or meal preferences"
                />
              </Field>

              <button
                className="mx-primary"
                type="submit"
                disabled={expired}
              >
                Record sample RSVP ↗
              </button>
            </form>

            {notice && (
              <p
                role="status"
                className="mx-form-notice"
              >
                {notice}
              </p>
            )}
          </div>
        </section>

        <footer className="mx-invite-footer">
          <span>
            MAISON GALA ✦ THE ART OF GATHERING
          </span>

          <small>
            {remaining == null
              ? "Our story is unfolding"
              : remaining < 0
                ? "Thank you for celebrating"
                : remaining === 0
                  ? "Today is the day"
                  : `${remaining} days until the celebration`}
          </small>
        </footer>
      </div>
    </div>
  );
}

/* ----------------------------------
   STAFF EXPERIENCE EDITOR
---------------------------------- */

export default function MaisonClientExperience() {
  const [data, setData] = useState(loadData);
  const [section, setSection] =
    useState("studio");
  const [preview, setPreview] =
    useState(false);
  const [message, setMessage] =
    useState("");

  const [newCue, setNewCue] = useState({
    time: "18:00",
    title: "",
    detail: "",
  });

  const [newUpdate, setNewUpdate] =
    useState({
      title: "",
      detail: "",
    });

  const event =
    data.events.find(
      (e) => e.id === data.selectedId
    ) || data.events[0];

  const replies = useMemo(
    () => data.rsvps[event.id] || [],
    [data.rsvps, event.id]
  );

  const attendeeCount = replies
    .filter((r) => r.choice === "Attending")
    .reduce(
      (sum, r) => sum + Number(r.count || 0),
      0
    );

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch {
      setMessage(
        "Browser storage is unavailable; changes may not persist."
      );
    }
  }, [data]);

  useEffect(() => {
    if (!preview) return;

    function keyDown(e) {
      if (e.key === "Escape") {
        setPreview(false);
      }
    }

    window.addEventListener(
      "keydown",
      keyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        keyDown
      );
  }, [preview]);

  function change(patch) {
    setData((previous) => ({
      ...previous,
      events: previous.events.map((e) =>
        e.id === event.id
          ? { ...e, ...patch }
          : e
      ),
    }));
  }

  function addEvent() {
    const id = uid();

    const copy = {
      ...sampleEvent(),
      id,
      title: "Untitled celebration",
      hosts: "Host names",
      schedule: [],
      updates: [],
      phase: 0,
    };

    setData((previous) => ({
      ...previous,
      events: [
        ...previous.events,
        copy,
      ],
      selectedId: id,
    }));

    setSection("studio");

    setMessage(
      "New local event created. Add your event details before previewing."
    );
  }

  function deleteEvent() {
    if (data.events.length === 1) {
      setMessage(
        "Keep at least one demo event."
      );
      return;
    }

    if (
      !window.confirm(
        "Delete this event and its locally saved guest responses?"
      )
    ) {
      return;
    }

    setData((previous) => {
      const events = previous.events.filter(
        (e) => e.id !== event.id
      );

      const rsvps = {
        ...previous.rsvps,
      };

      delete rsvps[event.id];

      return {
        ...previous,
        events,
        rsvps,
        selectedId: events[0].id,
      };
    });
  }

  function updateCue(id, key, value) {
    change({
      schedule: event.schedule.map((a) =>
        a.id === id
          ? { ...a, [key]: value }
          : a
      ),
    });
  }

  function addCue(e) {
    e.preventDefault();

    if (!newCue.title.trim()) return;

    change({
      schedule: [
        ...event.schedule,
        {
          ...newCue,
          id: uid(),
          title: newCue.title.trim(),
        },
      ],
    });

    setNewCue({
      time: "18:00",
      title: "",
      detail: "",
    });
  }

  function addUpdate(e) {
    e.preventDefault();

    if (!newUpdate.title.trim()) return;

    change({
      updates: [
        ...event.updates,
        {
          ...newUpdate,
          id: uid(),
          date: localDate(new Date()),
        },
      ],
    });

    setNewUpdate({
      title: "",
      detail: "",
    });
  }

  function recordRSVP(response) {
    setData((previous) => ({
      ...previous,
      rsvps: {
        ...previous.rsvps,
        [event.id]: [
          ...(previous.rsvps[event.id] || []),
          {
            ...response,
            id: uid(),
            createdAt:
              new Date().toISOString(),
          },
        ],
      },
    }));
  }

  function removeRSVP(id) {
    setData((previous) => ({
      ...previous,
      rsvps: {
        ...previous.rsvps,
        [event.id]: (
          previous.rsvps[event.id] || []
        ).filter((r) => r.id !== id),
      },
    }));
  }

  return (
    <div className="mx-root">
      <header className="mx-header">
        <div>
          <span className="mx-kicker">
            MAISON GALA / BATCH 06
          </span>

          <h2>
            The guest{" "}
            <em>experience studio.</em>
          </h2>

          <p>
            Compose a private event microsite,
            curate the program and test guest
            interactions before connecting
            a real backend.
          </p>
        </div>

        <button
          className="mx-preview-button"
          onClick={() => setPreview(true)}
        >
          Enter guest preview
          <span>↗</span>
        </button>
      </header>

      <div className="mx-prototype-warning">
        <strong>Prototype workspace:</strong>{" "}
        Event details and RSVPs are saved
        in this browser only. No guest login,
        public invitation URL, email delivery
        or cross-device RSVP syncing is
        implemented. Use fictional
        information while testing.
      </div>

      <section className="mx-controlbar">
        <Field label="Active celebration">
          <select
            value={event.id}
            onChange={(e) =>
              setData({
                ...data,
                selectedId: e.target.value,
              })
            }
          >
            {data.events.map((item) => (
              <option
                value={item.id}
                key={item.id}
              >
                {item.title}
              </option>
            ))}
          </select>
        </Field>

        <button
          className="mx-quiet"
          onClick={addEvent}
        >
          + New event
        </button>

        <button
          className="mx-quiet mx-quiet--danger"
          onClick={deleteEvent}
        >
          Delete event
        </button>
      </section>

      <div className="mx-stats">
        <div>
          <span>EVENT STAGE</span>
          <strong>
            {PHASES[event.phase]}
          </strong>
        </div>

        <div>
          <span>GUEST RESPONSES</span>
          <strong>{replies.length}</strong>
        </div>

        <div>
          <span>ATTENDING SEATS</span>
          <strong>
            {attendeeCount}
            <small> / {event.capacity}</small>
          </strong>
        </div>

        <div>
          <span>DAYS UNTIL EVENT</span>
          <strong>
            {daysRemaining(event.date) ?? "—"}
          </strong>
        </div>
      </div>

      <nav
        className="mx-tabs"
        aria-label="Experience editor sections"
      >
        {SECTIONS.map(([id, label], i) => (
          <button
            key={id}
            className={
              section === id
                ? "is-active"
                : ""
            }
            onClick={() => setSection(id)}
          >
            <span>0{i + 1}</span>
            {label}
          </button>
        ))}
      </nav>

      {message && (
        <div
          className="mx-feedback"
          role="status"
        >
          {message}
          <button
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}

      {section === "studio" && (
        <div className="mx-edit-grid">
          <section className="mx-panel">
            <span className="mx-kicker">
              01 / INVITATION DETAILS
            </span>

            <h3>Set the scene.</h3>

            <div className="mx-form-grid">
              <Field label="Event title">
                <input
                  value={event.title}
                  maxLength="100"
                  onChange={(e) =>
                    change({
                      title: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Host names">
                <input
                  value={event.hosts}
                  maxLength="100"
                  onChange={(e) =>
                    change({
                      hosts: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Short subtitle">
                <input
                  value={event.subtitle}
                  maxLength="140"
                  onChange={(e) =>
                    change({
                      subtitle: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Venue">
                <input
                  value={event.venue}
                  maxLength="120"
                  onChange={(e) =>
                    change({
                      venue: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Location">
                <input
                  value={event.location}
                  maxLength="140"
                  onChange={(e) =>
                    change({
                      location: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Dress code">
                <input
                  value={event.dress}
                  maxLength="120"
                  onChange={(e) =>
                    change({
                      dress: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Event date">
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) =>
                    change({
                      date: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Start time">
                <input
                  type="time"
                  value={event.time}
                  onChange={(e) =>
                    change({
                      time: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="RSVP deadline">
                <input
                  type="date"
                  value={event.deadline}
                  onChange={(e) =>
                    change({
                      deadline: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Guest capacity">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={event.capacity}
                  onChange={(e) =>
                    change({
                      capacity: Math.max(
                        1,
                        Number(e.target.value) || 1
                      ),
                    })
                  }
                />
              </Field>
            </div>

            <Field label="Welcome note">
              <textarea
                rows="4"
                maxLength="900"
                value={event.welcome}
                onChange={(e) =>
                  change({
                    welcome: e.target.value,
                  })
                }
              />
            </Field>
          </section>

          <aside className="mx-panel mx-stage-panel">
            <span className="mx-kicker">
              02 / STATUS TRACKING
            </span>

            <h3>Milestones with meaning.</h3>

            <p>
              Choose the current production
              stage; the guest preview shows
              each completed milestone.
            </p>

            <div className="mx-phase-list">
              {PHASES.map((phase, index) => (
                <button
                  key={phase}
                  className={
                    index <= event.phase
                      ? "is-complete"
                      : ""
                  }
                  onClick={() =>
                    change({ phase: index })
                  }
                >
                  <span>
                    {index < event.phase
                      ? "✓"
                      : `0${index + 1}`}
                  </span>

                  {phase}

                  <b>
                    {event.phase === index
                      ? "CURRENT"
                      : ""}
                  </b>
                </button>
              ))}
            </div>

            <button
              className="mx-primary"
              onClick={() => setPreview(true)}
            >
              Preview invitation
              <span>↗</span>
            </button>
          </aside>
        </div>
      )}

      {section === "timeline" && (
        <div className="mx-edit-grid">
          <section className="mx-panel">
            <span className="mx-kicker">
              03 / PROGRAM DESIGN
            </span>

            <h3>
              Choreograph the evening.
            </h3>

            <div className="mx-cue-list">
              {event.schedule.map((cue) => (
                <div
                  className="mx-cue"
                  key={cue.id}
                >
                  <input
                    aria-label="Cue time"
                    type="time"
                    value={cue.time}
                    onChange={(e) =>
                      updateCue(
                        cue.id,
                        "time",
                        e.target.value
                      )
                    }
                  />

                  <input
                    aria-label="Cue title"
                    maxLength="100"
                    value={cue.title}
                    onChange={(e) =>
                      updateCue(
                        cue.id,
                        "title",
                        e.target.value
                      )
                    }
                  />

                  <input
                    aria-label="Cue description"
                    maxLength="160"
                    value={cue.detail}
                    onChange={(e) =>
                      updateCue(
                        cue.id,
                        "detail",
                        e.target.value
                      )
                    }
                  />

                  <button
                    aria-label={`Remove ${cue.title}`}
                    onClick={() =>
                      change({
                        schedule:
                          event.schedule.filter(
                            (item) =>
                              item.id !== cue.id
                          ),
                      })
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <form
              className="mx-inline-form"
              onSubmit={addCue}
            >
              <input
                type="time"
                required
                value={newCue.time}
                onChange={(e) =>
                  setNewCue({
                    ...newCue,
                    time: e.target.value,
                  })
                }
              />

              <input
                required
                maxLength="100"
                placeholder="New program moment"
                value={newCue.title}
                onChange={(e) =>
                  setNewCue({
                    ...newCue,
                    title: e.target.value,
                  })
                }
              />

              <input
                maxLength="160"
                placeholder="Description (optional)"
                value={newCue.detail}
                onChange={(e) =>
                  setNewCue({
                    ...newCue,
                    detail: e.target.value,
                  })
                }
              />

              <button type="submit">
                + Add
              </button>
            </form>
          </section>

          <section className="mx-panel">
            <span className="mx-kicker">
              04 / STUDIO JOURNAL
            </span>

            <h3>Guest announcements.</h3>

            {event.updates.map((update) => (
              <article
                className="mx-update"
                key={update.id}
              >
                <div>
                  <small>
                    {readableDate(update.date)}
                  </small>

                  <strong>
                    {update.title}
                  </strong>

                  <p>{update.detail}</p>
                </div>

                <button
                  aria-label={`Delete ${update.title}`}
                  onClick={() =>
                    change({
                      updates:
                        event.updates.filter(
                          (item) =>
                            item.id !== update.id
                        ),
                    })
                  }
                >
                  ×
                </button>
              </article>
            ))}

            <form
              className="mx-stack-form"
              onSubmit={addUpdate}
            >
              <Field label="Update headline">
                <input
                  required
                  maxLength="100"
                  value={newUpdate.title}
                  onChange={(e) =>
                    setNewUpdate({
                      ...newUpdate,
                      title: e.target.value,
                    })
                  }
                  placeholder="An exciting new detail"
                />
              </Field>

              <Field label="Message">
                <textarea
                  rows="3"
                  maxLength="500"
                  value={newUpdate.detail}
                  onChange={(e) =>
                    setNewUpdate({
                      ...newUpdate,
                      detail: e.target.value,
                    })
                  }
                />
              </Field>

              <button
                className="mx-primary"
                type="submit"
              >
                Publish local update ↗
              </button>
            </form>
          </section>
        </div>
      )}

      {section === "guests" && (
        <section className="mx-panel">
          <div className="mx-guest-head">
            <div>
              <span className="mx-kicker">
                05 / GUEST RELATIONS
              </span>

              <h3>Response register.</h3>

              <p>
                These records exist only
                on this device. Export them
                before clearing browser storage.
              </p>
            </div>

            <button
              className="mx-primary"
              disabled={!replies.length}
              onClick={() =>
                saveCSV(
                  `maison-rsvps-${localDate(new Date())}.csv`,
                  replies
                )
              }
            >
              Export guest CSV ↗
            </button>
          </div>

          {replies.length ? (
            <div className="mx-guest-table-wrap">
              <table className="mx-guest-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Response</th>
                    <th>Seats</th>
                    <th>Dietary note</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {replies.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>
                          {r.name}
                        </strong>
                        <small>
                          {r.email || "No email"}
                        </small>
                      </td>

                      <td>{r.choice}</td>
                      <td>{r.count}</td>

                      <td>
                        {r.dietary || "—"}
                      </td>

                      <td>
                        <button
                          onClick={() =>
                            removeRSVP(r.id)
                          }
                          aria-label={`Delete RSVP for ${r.name}`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mx-empty">
              No sample RSVPs yet. Open the
              guest preview and submit a
              test response.
            </div>
          )}
        </section>
      )}

      <footer className="mx-footer">
        <span>
          MAISON GALA / CLIENT EXPERIENCE PROTOTYPE
        </span>

        <button
          onClick={() => setPreview(true)}
        >
          Open full-screen guest preview ↗
        </button>
      </footer>

      {preview && (
        <EventPreview
          key={event.id}
          event={event}
          replies={replies}
          onRSVP={recordRSVP}
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  );
}