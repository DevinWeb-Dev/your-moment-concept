import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Gem,
  ListChecks,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import {
  EVENT_PERIODS,
  findVenue,
  findPackage,
  formatDate,
  formatPeso,
} from "../../data/eventData.js";

import {
  PLAN_STAGES,
  PREPARATION_TASKS,
  RUN_SHEET_TEMPLATES,
  getPlanOps,
  taskProgress,
} from "../../data/eventOps.js";

const GROUPS = [
  "Planning Essentials",
  "Dining & Styling",
  "Final Concept Review",
];

export default function EventRunSheetPage() {
  const {
    quotes,
    operations,
    onSetStage,
    onToggleTask,
    onSaveNote,
    onResetTasks,
  } = useOutletContext();

  const [params, setParams] = useSearchParams();

  const requestedId = params.get("plan");

  const selectedPlan =
    quotes.find(
      (item) => item.id === requestedId
    ) ||
    quotes[0] ||
    null;

  const record = selectedPlan
    ? getPlanOps(
        operations,
        selectedPlan.id
      )
    : null;

  const progress = selectedPlan
    ? taskProgress(
        operations,
        selectedPlan.id
      )
    : {
        completed: 0,
        total: PREPARATION_TASKS.length,
        percent: 0,
      };

  const [noteDraft, setNoteDraft] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setNoteDraft(
      record?.note || ""
    );

    setNotice("");
  }, [
    selectedPlan?.id,
    record?.note,
  ]);

  const venue = selectedPlan
    ? findVenue(selectedPlan.venueId)
    : null;

  const packageItem = selectedPlan
    ? findPackage(selectedPlan.packageId)
    : null;

  const period = selectedPlan
    ? EVENT_PERIODS.find(
        (item) =>
          item.id === selectedPlan.period
      )
    : null;

  const runSheet =
    RUN_SHEET_TEMPLATES[
      selectedPlan?.period
    ] ||
    RUN_SHEET_TEMPLATES.evening;

  const completedSet = useMemo(
    () =>
      new Set(
        record?.completedTasks || []
      ),
    [record?.completedTasks]
  );

  function changePlan(id) {
    setParams({
      plan: id,
    });
  }

  function saveNote(event) {
    event.preventDefault();

    if (!selectedPlan) return;

    onSaveNote(
      selectedPlan.id,
      noteDraft.trim()
    );

    setNotice(
      "Fictional planning note saved in this browser."
    );
  }

  function resetChecklist() {
    if (!selectedPlan) return;

    if (
      !window.confirm(
        "Reset this demo event's preparation checklist?"
      )
    ) {
      return;
    }

    onResetTasks(
      selectedPlan.id
    );

    setNotice(
      "Preparation checklist reset."
    );
  }

  return (
    <div className="ymo-page">
      <div className="ymo-page-heading">
        <div>
          <span className="ymo-eyebrow">
            EVENT COORDINATION / RUN SHEET
          </span>

          <h1>
            Every detail,
            <br />
            <em>beautifully timed.</em>
          </h1>

          <p>
            Review a sample event timeline,
            track preparation tasks, and
            organize internal planning notes.
          </p>
        </div>

        <Link
          to="/staff/desk"
          className="ymo-secondary-button"
        >
          <ClipboardList size={18} />
          Proposal Desk
          <ArrowRight size={18} />
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="ymo-panel">
          <div className="ymo-empty">
            <ListIcon />

            <h3>
              No event concepts to organize.
            </h3>

            <p>
              Save your first fictional event
              proposal in the public planner
              before using this run sheet.
            </p>

            <Link
              to="/planner"
              className="ymo-primary-button"
            >
              Create Event Concept
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="ymo-run-selector">
            <label>
              <span>SELECT A SAVED EVENT CONCEPT</span>

              <select
                value={selectedPlan.id}
                onChange={(event) =>
                  changePlan(
                    event.target.value
                  )
                }
              >
                {quotes.map((quote) => (
                  <option
                    key={quote.id}
                    value={quote.id}
                  >
                    {quote.alias} —{" "}
                    {findVenue(
                      quote.venueId
                    )?.name || "Venue"}
                  </option>
                ))}
              </select>
            </label>

            <span>
              <ShieldCheck size={17} />
              INTERNAL DEMO WORKSPACE
            </span>
          </div>

          <div className="ymo-run-hero">
            <div className="ymo-run-image">
              {venue?.image && (
                <img
                  src={venue.image}
                  alt={`Illustrative ${venue.name} setting`}
                />
              )}
            </div>

            <div className="ymo-run-hero-copy">
              <span className="ymo-eyebrow">
                YOUR EVENT CONCEPT
              </span>

              <h2>
                {selectedPlan.alias}
              </h2>

              <p>
                {selectedPlan.eventType}
                {" · "}
                {venue?.name || "Sample venue"}
              </p>

              <div className="ymo-run-facts">
                <span>
                  <CalendarDays size={17} />
                  {formatDate(
                    selectedPlan.date
                  )}
                </span>

                <span>
                  <Clock3 size={17} />
                  {period?.name || "Event"}
                </span>

                <span>
                  <Users size={17} />
                  {selectedPlan.guests} guests
                </span>
              </div>

              <strong className="ymo-run-reference">
                {selectedPlan.id}
              </strong>
            </div>
          </div>

          <div className="ymo-run-grid">
            <section className="ymo-panel">
              <div className="ymo-panel-heading">
                <div>
                  <span className="ymo-eyebrow">
                    PREPARATION WORKFLOW
                  </span>

                  <h2>
                    The checklist <em>edit.</em>
                  </h2>
                </div>
              </div>

              <div className="ymo-checklist-summary">
                <div>
                  <strong>
                    {progress.percent}%
                  </strong>

                  <span>
                    {progress.completed} of{" "}
                    {progress.total} tasks done
                  </span>
                </div>

                <div className="ymo-progress-track">
                  <span
                    style={{
                      width: `${progress.percent}%`,
                    }}
                  />
                </div>
              </div>

              {GROUPS.map((group) => (
                <div
                  className="ymo-task-group"
                  key={group}
                >
                  <h3>{group}</h3>

                  {PREPARATION_TASKS.filter(
                    (task) =>
                      task.group === group
                  ).map((task) => {
                    const checked =
                      completedSet.has(
                        task.id
                      );

                    return (
                      <label
                        className={`ymo-task ${
                          checked
                            ? "is-complete"
                            : ""
                        }`}
                        key={task.id}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            onToggleTask(
                              selectedPlan.id,
                              task.id
                            )
                          }
                        />

                        <span className="ymo-task-check">
                          {checked && (
                            <Check size={15} />
                          )}
                        </span>

                        <span>
                          <strong>
                            {task.title}
                          </strong>

                          <small>
                            {task.detail}
                          </small>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ))}

              <button
                type="button"
                className="ymo-reset-button"
                onClick={resetChecklist}
                disabled={
                  progress.completed === 0
                }
              >
                <RotateCcw size={17} />
                Reset This Checklist
              </button>
            </section>

            <div className="ymo-run-side">
              <section className="ymo-panel">
                <div className="ymo-panel-heading">
                  <div>
                    <span className="ymo-eyebrow">
                      PROPOSAL STATUS
                    </span>

                    <h2>
                      Planning <em>stage.</em>
                    </h2>
                  </div>
                </div>

                <label className="ymo-stage-field">
                  <span>
                    INTERNAL CONCEPT STAGE
                  </span>

                  <select
                    value={record.stage}
                    onChange={(event) =>
                      onSetStage(
                        selectedPlan.id,
                        event.target.value
                      )
                    }
                  >
                    {PLAN_STAGES.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <p className="ymo-panel-note">
                  Changing the stage will
                  never confirm a venue
                  reservation or contact
                  a real supplier.
                </p>
              </section>

              <section className="ymo-panel">
                <div className="ymo-panel-heading">
                  <div>
                    <span className="ymo-eyebrow">
                      SAMPLE EVENT PROGRAM
                    </span>

                    <h2>
                      A beautifully
                      <br />
                      <em>planned flow.</em>
                    </h2>
                  </div>
                </div>

                <div className="ymo-timeline">
                  {runSheet.map(
                    ([time, title], index) => (
                      <div
                        className="ymo-timeline-item"
                        key={`${time}-${title}`}
                      >
                        <span className="ymo-timeline-time">
                          {time}
                        </span>

                        <div className="ymo-timeline-dot">
                          <i />
                        </div>

                        <div>
                          <small>
                            PHASE{" "}
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </small>

                          <strong>
                            {title}
                          </strong>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <p className="ymo-panel-note">
                  Sample timing template
                  for a {period?.name?.toLowerCase() ||
                    "fictional event"}.
                  Not a confirmed supplier
                  schedule or production
                  instruction.
                </p>
              </section>

              <section className="ymo-panel">
                <div className="ymo-panel-heading">
                  <div>
                    <span className="ymo-eyebrow">
                      DINING & BUDGET
                    </span>

                    <h2>
                      The event <em>details.</em>
                    </h2>
                  </div>
                </div>

                <div className="ymo-run-detail-list">
                  <div>
                    <UtensilsCrossed size={19} />

                    <span>
                      <small>Catering package</small>
                      <strong>
                        {packageItem?.name ||
                          "Sample catering"}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <Gem size={19} />

                    <span>
                      <small>Saved estimate</small>
                      <strong>
                        {formatPeso(
                          selectedPlan.total
                        )}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="ymo-menu-preview">
                  <span>
                    SAMPLE CATERING PREFERENCES
                  </span>

                  <p>
                    <strong>Starter:</strong>{" "}
                    {selectedPlan.menu?.starter ||
                      "Not selected"}
                  </p>

                  <p>
                    <strong>Main:</strong>{" "}
                    {selectedPlan.menu?.main ||
                      "Not selected"}
                  </p>

                  <p>
                    <strong>Dessert:</strong>{" "}
                    {selectedPlan.menu?.dessert ||
                      "Not selected"}
                  </p>
                </div>
              </section>
            </div>
          </div>

          <section className="ymo-panel ymo-notes-panel">
            <div className="ymo-panel-heading">
              <div>
                <span className="ymo-eyebrow">
                  INTERNAL PLANNING NOTES
                </span>

                <h2>
                  The finishing <em>thoughts.</em>
                </h2>
              </div>
            </div>

            <form onSubmit={saveNote}>
              <label>
                <span>
                  FICTIONAL CONCEPT NOTES
                </span>

                <textarea
                  rows={5}
                  maxLength={500}
                  placeholder="e.g. Explore warm ivory table styling and garden-inspired floral concepts..."
                  value={noteDraft}
                  onChange={(event) => {
                    setNoteDraft(
                      event.target.value
                    );

                    setNotice("");
                  }}
                />
              </label>

              <div className="ymo-notes-footer">
                <span>
                  {noteDraft.length}/500 characters
                </span>

                <button
                  type="submit"
                  className="ymo-primary-button"
                  disabled={
                    noteDraft.trim() ===
                    record.note
                  }
                >
                  <Save size={17} />
                  Save Planning Note
                </button>
              </div>

              {notice && (
                <div
                  className="ymo-feedback"
                  role="status"
                >
                  <CheckCircle2 size={18} />
                  {notice}
                </div>
              )}
            </form>
          </section>
        </>
      )}

      <div className="ymo-bottom-notice">
        <ShieldCheck size={23} />

        <div>
          <strong>
            A fictional coordination experience.
          </strong>

          <p>
            Checklists and run sheets are
            illustrative. Do not use this
            interface for real staff assignments,
            food safety procedures, medical
            requirements, or event operations.
          </p>
        </div>
      </div>
    </div>
  );
}

function ListIcon() {
  return (
    <ListChecks size={33} />
  );
}