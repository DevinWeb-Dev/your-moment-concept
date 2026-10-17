
// YOUR MOMENT — MAISON GALA / BATCH 5
// Adds Insights inside the existing Batch 4 /staff route.
// No new public route. No App.jsx or quotation engine changes.
// Run: node apply-maison-batch5.mjs

import {
  existsSync,
  readFileSync,
  copyFileSync,
  writeFileSync,
} from "node:fs";

import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();

const staffPath = join(
  root,
  "src",
  "pages",
  "MaisonStaffOperations.jsx"
);

const requiredFiles = [
  "src/pages/MaisonStaffOperations.jsx",
  "src/pages/MaisonInsightsCenter.jsx",
  "src/styles/maison-insights.css",
];

// CHECK REQUIRED FILES

for (const name of requiredFiles) {
  if (!existsSync(join(root, name))) {
    throw Error(
      `Missing ${name}. No changes made.`
    );
  }
}

let staff = readFileSync(
  staffPath,
  "utf8"
).replace(/\r\n/g, "\n");

const newImport =
  'import MaisonInsightsCenter from "./MaisonInsightsCenter.jsx";';

const newTab =
  '  ["insights", "Reports & Data Center", "05"],';

const newPanel =
  '{view === "insights" && <MaisonInsightsCenter embedded />}';

// PREVENT DUPLICATE INSTALLATION

if (
  staff.includes(newImport) ||
  staff.includes(newTab) ||
  staff.includes(newPanel)
) {
  if (
    staff.includes(newImport) &&
    staff.includes(newTab) &&
    staff.includes(newPanel)
  ) {
    console.log(
      "Batch 5 already installed. No changes made."
    );
    process.exit(0);
  }

  throw Error(
    "Partial Batch 5 detected. No changes made."
  );
}

// SAFE UNIQUE ANCHOR REPLACEMENT

function injectExactlyOnce(before, after) {
  if (staff.split(before).length !== 2) {
    throw Error(
      `Cannot find unique integration anchor: ${before}. No changes made.`
    );
  }

  staff = staff.replace(before, after);
}

// ADD COMPONENT IMPORT

const stylesheet =
  'import "../styles/maison-operations.css";';

injectExactlyOnce(
  stylesheet,
  `${stylesheet}\n${newImport}`
);

// ADD REPORTS NAVIGATION TAB

const classicTab =
  '  ["original", "Classic workspace", "↗"],';

injectExactlyOnce(
  classicTab,
  `${newTab}\n${classicTab}`
);

// RENDER NEW INSIGHTS PANEL

const classicPanel =
  '{view === "original" &&';

injectExactlyOnce(
  classicPanel,
  `${newPanel}${classicPanel}`
);

// HIDE DUPLICATE BATCH 4 DATA TOOLBAR
// WHEN INSIGHTS IS OPEN

injectExactlyOnce(
  '{view !== "original" &&',
  '{view !== "original" && view !== "insights" &&'
);

// VERIFY INTEGRATION

const invariants = [
  newImport,
  newTab,
  newPanel,
  'view !== "insights"',
  'view === "original"',
];

for (const required of invariants) {
  if (!staff.includes(required)) {
    throw Error(
      `Verification failed: ${required}. No changes made.`
    );
  }
}

// BACKUP ORIGINAL FILE OUTSIDE REPOSITORY

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const backup = join(
  tmpdir(),
  `maison-staff-before-Batch5-${stamp}.jsx`
);

copyFileSync(
  staffPath,
  backup
);

// APPLY BATCH 5

writeFileSync(
  staffPath,
  staff,
  "utf8"
);

console.log("");
console.log(
  "MAISON GALA — BATCH 5 INSTALLED SUCCESSFULLY"
);
console.log("Staff route: /#/staff");
console.log(
  "New navigation tab: Reports & Data Center"
);
console.log(
  "Features: reports, pipeline, forecast, settings, CSV and JSON backup"
);
console.log(
  "Original App.jsx and quotation engine unchanged."
);
console.log(`Backup: ${backup}`);
console.log("No GitHub push performed.");
console.log("");
