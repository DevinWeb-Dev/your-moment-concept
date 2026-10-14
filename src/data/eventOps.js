import {
  VENUES,
  PACKAGES,
  EVENT_PERIODS,
  findVenue,
  findPackage,
  localDateKey,
} from "./eventData.js";

export const OPERATIONS_KEY =
  "your-moment-demo-operations-v1";

export const PLAN_STAGES = [
  {
    id: "new",
    label: "New Concept",
    description: "A newly saved fictional event plan.",
  },
  {
    id: "reviewing",
    label: "In Review",
    description: "Sample details are being reviewed.",
  },
  {
    id: "planning",
    label: "Planning",
    description: "Preparing the fictional event concept.",
  },
  {
    id: "ready",
    label: "Concept Ready",
    description: "Internal sample planning is complete.",
  },
  {
    id: "archived",
    label: "Archived",
    description: "Kept for reference, not active planning.",
  },
];

export const PREPARATION_TASKS = [
  {
    id: "review-brief",
    group: "Planning Essentials",
    title: "Review the event brief",
    detail:
      "Check the proposed event type, date, and preferred time.",
  },
  {
    id: "check-capacity",
    group: "Planning Essentials",
    title: "Check illustrative guest capacity",
    detail:
      "Compare the sample guest count with the selected venue.",
  },
  {
    id: "review-estimate",
    group: "Planning Essentials",
    title: "Review the sample cost estimate",
    detail:
      "Inspect venue, catering, and optional add-on amounts.",
  },
  {
    id: "review-menu",
    group: "Dining & Styling",
    title: "Review catering preferences",
    detail:
      "Check the selected starter, main course, and dessert.",
  },
  {
    id: "create-moodboard",
    group: "Dining & Styling",
    title: "Prepare an event mood board",
    detail:
      "Document inspiration for flowers, lighting, and tables.",
  },
  {
    id: "seating-concept",
    group: "Dining & Styling",
    title: "Draft a seating arrangement",
    detail:
      "Sketch a fictional guest layout and circulation plan.",
  },
  {
    id: "draft-run-sheet",
    group: "Final Concept Review",
    title: "Review the sample run sheet",
    detail:
      "Inspect the proposed event-day activity sequence.",
  },
  {
    id: "final-check",
    group: "Final Concept Review",
    title: "Complete the internal concept review",
    detail:
      "Check that the demo information is consistent.",
  },
];

export const RUN_SHEET_TEMPLATES = {
  morning: [
    ["08:00", "Preparation & styling concept"],
    ["09:00", "Proposed guest welcome"],
    ["09:30", "Opening program"],
    ["10:30", "Sample dining service"],
    ["12:30", "Closing program"],
    ["13:00", "Proposed event conclusion"],
  ],
  afternoon: [
    ["13:00", "Preparation & styling concept"],
    ["14:00", "Proposed guest welcome"],
    ["14:30", "Opening program"],
    ["15:30", "Sample dining service"],
    ["17:30", "Closing program"],
    ["18:00", "Proposed event conclusion"],
  ],
  evening: [
    ["17:00", "Preparation & styling concept"],
    ["18:00", "Proposed guest welcome"],
    ["18:30", "Opening program"],
    ["19:30", "Sample dining service"],
    ["21:30", "Closing program"],
    ["22:00", "Proposed event conclusion"],
  ],
};

const STAGE_IDS = new Set(
  PLAN_STAGES.map((item) => item.id)
);

const TASK_IDS = new Set(
  PREPARATION_TASKS.map((item) => item.id)
);

export function loadOperations() {
  try {
    const value = JSON.parse(
      localStorage.getItem(OPERATIONS_KEY) || "{}"
    );

    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      return {};
    }

    return value;
  } catch {
    return {};
  }
}

export function getPlanOps(operations, planId) {
  const source = operations?.[planId];

  const record =
    source &&
    typeof source === "object" &&
    !Array.isArray(source)
      ? source
      : {};

  const stage = STAGE_IDS.has(record.stage)
    ? record.stage
    : "new";

  const completedTasks = Array.isArray(
    record.completedTasks
  )
    ? [
        ...new Set(
          record.completedTasks.filter(
            (id) => TASK_IDS.has(id)
          )
        ),
      ]
    : [];

  const note =
    typeof record.note === "string"
      ? record.note.slice(0, 500)
      : "";

  return {
    stage,
    completedTasks,
    note,
  };
}

export function stageInfo(id) {
  return (
    PLAN_STAGES.find(
      (item) => item.id === id
    ) || PLAN_STAGES[0]
  );
}

export function taskProgress(operations, planId) {
  const record = getPlanOps(
    operations,
    planId
  );

  const completed =
    record.completedTasks.length;

  return {
    completed,
    total: PREPARATION_TASKS.length,
    percent: Math.round(
      (completed / PREPARATION_TASKS.length) * 100
    ),
  };
}

export function todayKey() {
  return localDateKey(new Date());
}

export function addDays(key, offset) {
  const date = new Date(`${key}T12:00:00`);

  date.setDate(date.getDate() + offset);

  return localDateKey(date);
}

export function mondayOf(key) {
  const date = new Date(`${key}T12:00:00`);

  const weekday = date.getDay();

  date.setDate(
    date.getDate() +
      (weekday === 0 ? -6 : 1 - weekday)
  );

  return localDateKey(date);
}

export function shortDate(key) {
  const date = new Date(`${key}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return key || "Unknown";
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

export function weekdayName(key) {
  const date = new Date(`${key}T12:00:00`);

  return date.toLocaleDateString("en-PH", {
    weekday: "short",
  });
}

export function getUpcomingPlans(quotes) {
  const today = todayKey();

  return quotes
    .filter(
      (quote) =>
        typeof quote.date === "string" &&
        quote.date >= today
    )
    .sort((a, b) => {
      const left = `${a.date}|${a.period}`;
      const right = `${b.date}|${b.period}`;

      return left.localeCompare(right);
    });
}

export function venueInterest(quotes) {
  return VENUES.map((venue) => ({
    ...venue,
    count: quotes.filter(
      (quote) => quote.venueId === venue.id
    ).length,
  })).sort(
    (a, b) =>
      b.count - a.count ||
      a.name.localeCompare(b.name)
  );
}

function csvCell(value) {
  let text = String(value ?? "");

  // Avoid formula execution when opening user-generated
  // strings in spreadsheet applications.
  if (/^\s*[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function exportOperationsCSV(
  quotes,
  operations
) {
  const header = [
    "Demo Reference",
    "Fictional Event Alias",
    "Venue",
    "Event Type",
    "Catering Package",
    "Guests",
    "Proposed Date",
    "Period",
    "Planning Stage",
    "Checklist Progress",
    "Saved Sample Estimate PHP",
  ];

  const rows = quotes.map((quote) => {
    const record = getPlanOps(
      operations,
      quote.id
    );

    const progress = taskProgress(
      operations,
      quote.id
    );

    return [
      quote.id,
      quote.alias,
      findVenue(quote.venueId)?.name || "",
      quote.eventType,
      findPackage(quote.packageId)?.name || "",
      quote.guests,
      quote.date,
      EVENT_PERIODS.find(
        (item) => item.id === quote.period
      )?.name || quote.period,
      stageInfo(record.stage).label,
      `${progress.completed}/${progress.total}`,
      quote.total,
    ];
  });

  const csv =
    "\uFEFF" +
    [
      header.map(csvCell).join(","),
      ...rows.map(
        (row) => row.map(csvCell).join(",")
      ),
    ].join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download =
    "your-moment-demo-operations.csv";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}