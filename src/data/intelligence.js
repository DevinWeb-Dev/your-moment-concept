import {
  VENUES,
  PACKAGES,
  ADDONS,
  MENU_OPTIONS,
  EVENT_TYPES,
  EVENT_PERIODS,
  calculateEstimate,
  formatPeso,
  localDateKey,
} from "./eventData.js";

import {
  PLAN_STAGES,
  PREPARATION_TASKS,
  getPlanOps,
} from "./eventOps.js";

export const SETTINGS_KEY =
  "your-moment-demo-settings-v1";

export const BACKUP_KIND =
  "your-moment-portfolio-backup";

export const BACKUP_VERSION = 1;

export const DEFAULT_SETTINGS = {
  studioName: "YOUR MOMENT.",
  region: "Metro Manila, Philippines (fictional)",
  descriptor: "Venues · Catering · Celebrations",
  planningNote:
    "This is a fictional event operations portfolio concept.",
};

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const LIMITS = {
  studioName: 60,
  region: 100,
  descriptor: 90,
  planningNote: 350,
};

export function validateSettings(value) {
  if (!isObject(value)) {
    throw new Error("Studio settings must be an object.");
  }

  const result = {};

  for (const [key, limit] of Object.entries(LIMITS)) {
    const text = value[key];

    if (
      typeof text !== "string" ||
      !text.trim() ||
      text.length > limit
    ) {
      throw new Error(
        `Invalid ${key} setting. Maximum ${limit} characters.`
      );
    }

    result[key] = text.trim();
  }

  return result;
}

export function loadSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "null"
    );

    return saved
      ? validateSettings(saved)
      : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function getIntelligence(quotes, operations) {
  const safe = Array.isArray(quotes) ? quotes : [];

  const sum = safe.reduce(
    (n, q) => n + (Number(q.total) || 0),
    0
  );

  const counts = (data, field) =>
    data.map((item) => {
      const entries = safe.filter(
        (q) => q[field] === item.id
      );

      return {
        ...item,
        count: entries.length,
        amount: entries.reduce(
          (n, q) => n + (Number(q.total) || 0),
          0
        ),
        guests: entries.reduce(
          (n, q) => n + (Number(q.guests) || 0),
          0
        ),
      };
    });

  const venues = counts(VENUES, "venueId").sort(
    (a, b) => b.count - a.count
  );

  const packages = counts(PACKAGES, "packageId").sort(
    (a, b) => b.count - a.count
  );

  const eventTypes = EVENT_TYPES.map((type) => ({
    label: type,
    count: safe.filter(
      (q) => q.eventType === type
    ).length,
  })).sort((a, b) => b.count - a.count);

  const stages = PLAN_STAGES.map((s) => ({
    ...s,
    count: safe.filter(
      (q) =>
        getPlanOps(operations, q.id).stage === s.id
    ).length,
  }));

  const monthIndex = (date) =>
    date.getFullYear() * 12 + date.getMonth();

  const months = Array.from(
    { length: 6 },
    (_, index) => {
      const date = new Date();

      date.setDate(1);
      date.setMonth(
        date.getMonth() - 5 + index
      );

      const target = monthIndex(date);

      const matches = safe.filter((q) => {
        const d = new Date(`${q.date}T12:00:00`);

        return (
          Number.isFinite(d.getTime()) &&
          monthIndex(d) === target
        );
      });

      return {
        key:
          `${date.getFullYear()}-` +
          String(date.getMonth() + 1).padStart(2, "0"),

        label: date.toLocaleDateString(
          "en-PH",
          {
            month: "short",
            year: "2-digit",
          }
        ),

        count: matches.length,

        amount: matches.reduce(
          (n, q) => n + (Number(q.total) || 0),
          0
        ),
      };
    }
  );

  return {
    count: safe.length,
    sampleTotal: sum,

    average: safe.length
      ? sum / safe.length
      : 0,

    totalGuests: safe.reduce(
      (n, q) => n + Number(q.guests || 0),
      0
    ),

    upcoming: safe.filter(
      (q) =>
        typeof q.date === "string" &&
        q.date >= localDateKey(new Date())
    ).length,

    venues,
    packages,
    eventTypes,
    stages,
    months,

    periodLabel:
      "Proposed event months (not booking creation months)",
  };
}

export function downloadDemoBackup({
  quotes,
  operations,
  settings,
}) {
  const payload = {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),

    disclaimer:
      "Fictional portfolio data only. Not a reservation system.",

    quotes,
    operations,
    settings,
  };

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    {
      type: "application/json;charset=utf-8",
    }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download =
    "your-moment-demo-backup-" +
    new Date().toISOString().slice(0, 10) +
    ".json";

  document.body.appendChild(a);
  a.click();
  a.remove();

  window.setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );
}

const stageIds = new Set(
  PLAN_STAGES.map((s) => s.id)
);

const taskIds = new Set(
  PREPARATION_TASKS.map((t) => t.id)
);

export function parseDemoBackup(text) {
  if (
    typeof text !== "string" ||
    text.length > 1_500_000
  ) {
    throw new Error(
      "The backup is too large. Maximum size is 1.5 MB."
    );
  }

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }

  if (
    !isObject(data) ||
    data.kind !== BACKUP_KIND ||
    data.version !== BACKUP_VERSION
  ) {
    throw new Error(
      "Not a recognized YOUR MOMENT version 1 backup."
    );
  }

  if (
    !Array.isArray(data.quotes) ||
    data.quotes.length > 30 ||
    !isObject(data.operations)
  ) {
    throw new Error(
      "The backup contains an invalid set of demo records."
    );
  }

  const ids = new Set();

  const quotes = data.quotes.map((q) => {
    if (
      !isObject(q) ||
      typeof q.id !== "string" ||
      !/^YMO-[A-Za-z0-9-]{4,60}$/.test(q.id) ||
      ids.has(q.id)
    ) {
      throw new Error(
        "Invalid or duplicate demo proposal reference."
      );
    }

    ids.add(q.id);

    if (
      typeof q.alias !== "string" ||
      q.alias.trim().length < 2 ||
      q.alias.length > 50
    ) {
      throw new Error(
        "Invalid event alias in backup."
      );
    }

    if (
      !EVENT_TYPES.includes(q.eventType) ||
      !EVENT_PERIODS.some(
        (p) => p.id === q.period
      )
    ) {
      throw new Error(
        "Invalid event type or event period."
      );
    }

    if (
      typeof q.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(q.date)
    ) {
      throw new Error(
        "Invalid proposed event date."
      );
    }

    const parsedDate = new Date(
      `${q.date}T12:00:00`
    );

    const normalizedDate = [
      parsedDate.getFullYear(),

      String(
        parsedDate.getMonth() + 1
      ).padStart(2, "0"),

      String(
        parsedDate.getDate()
      ).padStart(2, "0"),
    ].join("-");

    if (
      Number.isNaN(parsedDate.getTime()) ||
      normalizedDate !== q.date
    ) {
      throw new Error(
        "Impossible proposed event date in backup."
      );
    }

    if (
      !isObject(q.menu) ||
      !Object.entries(MENU_OPTIONS).every(
        ([course, options]) =>
          options.includes(q.menu[course])
      )
    ) {
      throw new Error(
        "An event contains invalid menu preferences."
      );
    }

    if (
      !Array.isArray(q.addonIds) ||
      q.addonIds.some(
        (id) =>
          !ADDONS.some(
            (a) => a.id === id
          )
      )
    ) {
      throw new Error(
        "An event contains an invalid sample add-on."
      );
    }

    const estimate = calculateEstimate(q);

    if (
      !estimate ||
      !Number.isFinite(q.total) ||
      q.total < 0 ||
      q.total > 1_000_000_000
    ) {
      throw new Error(
        "An event has invalid guest counts or sample pricing."
      );
    }

    if (
      q.createdAt !== undefined &&
      (
        typeof q.createdAt !== "string" ||
        q.createdAt.length > 40
      )
    ) {
      throw new Error(
        "An event has an invalid creation timestamp."
      );
    }

    return {
      id: q.id,
      alias: q.alias,
      venueId: q.venueId,
      packageId: q.packageId,
      eventType: q.eventType,
      guests: estimate.guests,
      date: q.date,
      period: q.period,

      menu: { ...q.menu },

      addonIds: [...new Set(q.addonIds)],

      total: q.total,
      createdAt: q.createdAt || "",
    };
  });

  if (
    Object.keys(data.operations).length > 100
  ) {
    throw new Error(
      "Too many operation records in backup."
    );
  }

  const operations = {};

  for (const id of ids) {
    const record = data.operations[id];

    if (record === undefined) {
      continue;
    }

    if (
      !isObject(record) ||
      !stageIds.has(record.stage) ||
      !Array.isArray(record.completedTasks) ||
      record.completedTasks.some(
        (task) => !taskIds.has(task)
      ) ||
      typeof record.note !== "string" ||
      record.note.length > 500
    ) {
      throw new Error(
        `Invalid planning checklist or stage for ${id}.`
      );
    }

    operations[id] = {
      stage: record.stage,

      completedTasks: [
        ...new Set(record.completedTasks),
      ],

      note: record.note,
    };
  }

  return {
    quotes,
    operations,
    settings: validateSettings(data.settings),
  };
}

export { formatPeso };