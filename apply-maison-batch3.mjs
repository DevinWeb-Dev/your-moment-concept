// YOUR MOMENT — MAISON GALA BATCH 3
// CORRECTED INTEGRATION SCRIPT
//
// Run:
// node apply-maison-batch3.mjs
//
// No Batch 2 import dependency.
// No GitHub push.

import {
  copyFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();

const appPath = join(
  root,
  "src",
  "App.jsx"
);

const requiredFiles = [
  "src/App.jsx",
  "src/pages/MaisonCelebrationPackages.jsx",
  "src/pages/MaisonPackageComparison.jsx",
  "src/pages/MaisonCateringAtelier.jsx",
  "src/pages/MaisonEventPlanner.jsx",
  "src/styles/maison-celebrations.css",
];

// CHECK REQUIRED FILES

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    throw new Error(
      `Missing ${file}. No changes made.`
    );
  }
}

let code = readFileSync(
  appPath,
  "utf8"
).replace(/\r\n/g, "\n");

const signature =
  'import MaisonEventPlanner from "./pages/MaisonEventPlanner.jsx";';

// PREVENT DUPLICATE INSTALLATION

if (code.includes(signature)) {
  console.log(
    "Batch 3 is already integrated. No changes made."
  );

  process.exit(0);
}

// VALIDATE ORIGINAL APP STRUCTURE
// No dependency on MaisonVenueDossier.

const required = [
  'import "./styles/site.css";',
  "function PackagesPage()",
  "function GalleryPage()",
  "function PlannerPage(",
  "function NotFoundPage()",
  "function buildPlannerInitialForm(",
  "function createQuote(form)",
  "function deleteQuote(id)",
  "onCreateQuote={createQuote}",
  'path="packages"',
  'path="planner"',
  'path="compare"',
  'path="menus"',
  'path="plans"',
  'path="calendar"',
  'path="staff"',
];

for (const marker of required) {
  if (!code.includes(marker)) {
    throw new Error(
      `App.jsx differs at: ${marker}. No changes made.`
    );
  }
}

// SAFE COMPONENT REPLACEMENT

function replaceSection(
  start,
  end,
  replacement
) {
  const a = code.indexOf(start);

  const b = code.indexOf(
    end,
    a + start.length
  );

  if (
    a < 0 ||
    b <= a ||
    code.indexOf(start, a + 1) !== -1
  ) {
    throw new Error(
      `Unsafe component boundary: ${start}. No changes made.`
    );
  }

  code =
    code.slice(0, a) +
    replacement +
    code.slice(b);
}

// REPLACE PACKAGES PAGE ONLY

replaceSection(
  "function PackagesPage()",
  "function GalleryPage()",
  `function PackagesPage() {
  return <MaisonCelebrationPackages />;
}

`
);

// REPLACE PLANNER PAGE ONLY

replaceSection(
  "function PlannerPage(",
  "function NotFoundPage()",
  `function PlannerPage(props) {
  return (
    <MaisonEventPlanner
      {...props}
      buildInitial={buildPlannerInitialForm}
    />
  );
}

`
);

// UPDATE COMPARISON AND MENU ROUTES

const replacements = [
  [
    "<PackageComparePage />",
    "<MaisonPackageComparison />",
  ],
  [
    "<CateringMenuStudioPage />",
    "<MaisonCateringAtelier />",
  ],
];

for (const [before, after] of replacements) {
  if (code.split(before).length !== 2) {
    throw new Error(
      `Cannot uniquely find ${before}. No changes made.`
    );
  }

  code = code.replace(
    before,
    after
  );
}

// IMPORT NEW BATCH 3 COMPONENTS

const importAnchor =
  'import "./styles/site.css";';

if (
  code.split(importAnchor).length !== 2
) {
  throw new Error(
    "Cannot find unique site.css import. No changes made."
  );
}

code = code.replace(
  importAnchor,
  `${importAnchor}

import MaisonCelebrationPackages from "./pages/MaisonCelebrationPackages.jsx";

import MaisonPackageComparison from "./pages/MaisonPackageComparison.jsx";

import MaisonCateringAtelier from "./pages/MaisonCateringAtelier.jsx";

${signature}`
);

// REMOVE RETIRED PAGE IMPORTS

code = code.replace(
  /^import PackageComparePage from .*\n/m,
  ""
);

code = code.replace(
  /^import CateringMenuStudioPage from .*\n/m,
  ""
);

// REMOVE UNUSED IMPORT SPECIFIERS

for (const name of [
  "useMemo",
  "useParams",
  "useSearchParams",
  "ArrowRight",
  "ArrowUpRight",
  "CalendarDays",
  "Check",
  "CheckCircle2",
  "ChevronRight",
  "Gem",
  "Search",
  "ShieldCheck",
  "Sparkles",
  "Trash2",
  "Users",
  "UtensilsCrossed",
  "IMAGES",
  "VENUES",
  "PACKAGES",
  "ADDONS",
  "MENU_OPTIONS",
  "EVENT_TYPES",
  "EVENT_PERIODS",
  "formatPeso",
  "formatDate",
  "dateAfter",
  "findVenue",
  "findPackage",
  "calculateEstimate",
]) {
  const count = (
    code.match(
      new RegExp(
        `\\b${name}\\b`,
        "g"
      )
    ) || []
  ).length;

  if (count === 1) {
    code = code.replace(
      new RegExp(
        `^  ${name},\\n`,
        "m"
      ),
      ""
    );

    if (name === "useMemo") {
      code = code.replace(
        "useEffect, useMemo, useState",
        "useEffect, useState"
      );
    }
  }
}

// REMOVE UNUSED SECTION HEADING
// ONLY IF NO OTHER PAGE USES IT

if (
  (
    code.match(/\bSectionHeading\b/g) ||
    []
  ).length === 1 &&
  code.includes(
    "function SectionHeading("
  ) &&
  code.includes(
    "function HomePage()"
  )
) {
  replaceSection(
    "function SectionHeading(",
    "function HomePage()",
    ""
  );
}

// VERIFY ORIGINAL FUNCTIONALITY REMAINS

const invariants = [
  'path="staff"',
  'path="planner"',
  'path="calendar"',
  'path="plans"',
  "function createQuote(form)",
  "function deleteQuote(id)",
  "function buildPlannerInitialForm(",
  "onCreateQuote={createQuote}",
  "<MaisonCelebrationPackages />",
  "<MaisonEventPlanner",
  "<MaisonPackageComparison />",
  "<MaisonCateringAtelier />",
];

for (const marker of invariants) {
  if (!code.includes(marker)) {
    throw new Error(
      `Validation failed: ${marker}. No changes made.`
    );
  }
}

// CREATE BACKUP OUTSIDE REPOSITORY

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const backup = join(
  tmpdir(),
  `your-moment-App-before-Batch3-${stamp}.jsx`
);

copyFileSync(
  appPath,
  backup
);

// SAVE MODIFIED APP.JSX

writeFileSync(
  appPath,
  code,
  "utf8"
);

console.log("");
console.log("==============================");
console.log(" YOUR MOMENT — BATCH 3");
console.log("==============================");
console.log("BATCH 3 CONNECTED SUCCESSFULLY");
console.log("");
console.log("Pages updated:");
console.log("/packages");
console.log("/compare");
console.log("/menus");
console.log("/planner");
console.log("");
console.log(
  "Existing quotation engine preserved."
);
console.log(
  "Existing Staff Dashboard preserved."
);
console.log(
  "Existing calendar and saved proposals preserved."
);
console.log("");
console.log(`Backup: ${backup}`);
console.log("No GitHub push performed.");