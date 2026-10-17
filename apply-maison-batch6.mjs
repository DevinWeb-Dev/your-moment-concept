// YOUR MOMENT — MAISON GALA BATCH 6
// Installs guest experience editor inside the existing staff area.
// No App.jsx changes, no new public route, no GitHub push.
//
// Run from project root:
// node apply-maison-batch6.mjs

import {
  existsSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from "node:fs";

import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();

const staffPath = join(
  root,
  "src/pages/MaisonStaffOperations.jsx"
);

const files = [
  "src/pages/MaisonStaffOperations.jsx",
  "src/pages/MaisonClientExperience.jsx",
  "src/styles/maison-client-experience.css",
];

// VERIFY REQUIRED FILES

for (const file of files) {
  if (!existsSync(join(root, file))) {
    throw Error(
      `Missing ${file}. No changes made.`
    );
  }
}

let code = readFileSync(
  staffPath,
  "utf8"
).replace(/\r\n/g, "\n");

const addedImport =
  'import MaisonClientExperience from "./MaisonClientExperience.jsx";';

const addedTab =
  '  ["experience", "Client Experience", "06"],';

const addedPanel =
  '{view === "experience" && <MaisonClientExperience />}';

const markers = [
  addedImport,
  addedTab,
  addedPanel,
];

// AVOID DUPLICATE INSTALLATION

if (
  markers.every((marker) =>
    code.includes(marker)
  )
) {
  console.log(
    "Batch 6 already integrated. No changes made."
  );

  process.exit(0);
}

if (
  markers.some((marker) =>
    code.includes(marker)
  )
) {
  throw Error(
    "Partial Batch 6 integration detected. No changes made."
  );
}

// SAFE UNIQUE REPLACEMENTS

function exactlyOnce(before, after) {
  if (
    code.split(before).length !== 2
  ) {
    throw Error(
      `Missing or duplicate integration anchor: ${before}. No changes made.`
    );
  }

  code = code.replace(
    before,
    after
  );
}

// ADD IMPORT

exactlyOnce(
  'import "../styles/maison-operations.css";',
  `import "../styles/maison-operations.css";\n${addedImport}`
);

// ADD NEW STAFF NAVIGATION

exactlyOnce(
  '  ["original", "Classic workspace", "↗"],',
  `${addedTab}\n  ["original", "Classic workspace", "↗"],`
);

// ADD CLIENT EXPERIENCE COMPONENT

exactlyOnce(
  '{view === "original" &&',
  `${addedPanel}\n            {view === "original" &&`
);

// HIDE BATCH 4 DATA TOOLBAR INSIDE NEW VIEW

// Supports Batch 4 alone or Batch 4 + Batch 5.

if (
  code.includes(
    'view !== "original" && view !== "insights" &&'
  )
) {
  exactlyOnce(
    'view !== "original" && view !== "insights" &&',
    'view !== "original" && view !== "insights" && view !== "experience" &&'
  );
} else {
  exactlyOnce(
    'view !== "original" &&',
    'view !== "original" && view !== "experience" &&'
  );
}

// VALIDATE

for (const marker of [
  addedImport,
  addedTab,
  addedPanel,
  'view !== "experience"',
  'view === "original"',
]) {
  if (!code.includes(marker)) {
    throw Error(
      `Integration check failed: ${marker}. No changes made.`
    );
  }
}

// BACK UP STAFF COMPONENT

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const backup = join(
  tmpdir(),
  `maison-staff-before-Batch6-${stamp}.jsx`
);

copyFileSync(
  staffPath,
  backup
);

// INSTALL

writeFileSync(
  staffPath,
  code,
  "utf8"
);

console.log(
  "\nMAISON GALA — BATCH 6 INSTALLED"
);

console.log(
  "Open /#/staff → Client Experience"
);

console.log(
  "Includes: event studio, milestones, program, announcements, RSVP preview & CSV"
);

console.log(
  "No App.jsx, quote storage, or GitHub changes."
);

console.log(
  `Backup: ${backup}\n`
);