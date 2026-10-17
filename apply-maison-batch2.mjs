// YOUR MOMENT — MAISON GALA BATCH 2
// Run: node apply-maison-batch2.mjs

import {
  existsSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from "node:fs";

import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();

const appPath = join(
  root,
  "src",
  "App.jsx"
);

const required = [
  "src/pages/MaisonVenueCollection.jsx",
  "src/pages/MaisonVenueDossier.jsx",
  "src/styles/maison-venues.css",
];

for (const file of required) {
  if (!existsSync(join(root, file))) {
    throw new Error(
      `Missing ${file}; no changes made.`
    );
  }
}

if (!existsSync(appPath)) {
  throw new Error(
    "Run from your-moment-concept project root."
  );
}

let source = readFileSync(
  appPath,
  "utf8"
).replace(/\r\n/g, "\n");

const signature =
  'import MaisonVenueCollection from "./pages/MaisonVenueCollection.jsx";';

if (source.includes(signature)) {
  console.log(
    "Maison Gala Batch 2 is already installed. Nothing changed."
  );

  process.exit(0);
}

const anchors = [
  'import MaisonGalaHome from "./pages/MaisonGalaHome.jsx";',
  "function VenueCard({ venue })",
  "function HomePage()",
  "function VenuesPage()",
  "function VenueDetailsPage()",
  "function PackagesPage()",
  'path="venues"',
  'path="venues/:venueId"',
];

for (const anchor of anchors) {
  if (!source.includes(anchor)) {
    throw new Error(
      `Cannot find ${anchor}. Nothing changed; share current App.jsx for a targeted fix.`
    );
  }
}

function replaceRange(start, end, replacement) {
  const a = source.indexOf(start);

  const b = source.indexOf(
    end,
    a + start.length
  );

  if (
    a < 0 ||
    b < 0 ||
    source.indexOf(start, a + 1) !== -1
  ) {
    throw new Error(
      `Could not uniquely locate ${start}; no changes made.`
    );
  }

  source =
    source.slice(0, a) +
    replacement +
    source.slice(b);
}

/*
  Remove the retired original VenueCard.
  Other shared helpers remain unchanged.
*/

replaceRange(
  "function VenueCard({ venue })",
  "function HomePage()",
  `// The old catalog card is retired; other shared helpers remain.
`
);

/*
  Replace only the existing venue
  route components, not the route tree.
*/

replaceRange(
  "function VenuesPage()",
  "function PackagesPage()",
  `// MAISON GALA BATCH 2 / FOUR VENUE EDITORIALS
function VenuesPage() {
  return <MaisonVenueCollection />;
}

function VenueDetailsPage() {
  return <MaisonVenueDossier />;
}

`
);

/* Add new React imports */

source = source.replace(
  'import MaisonGalaHome from "./pages/MaisonGalaHome.jsx";',
  `import MaisonGalaHome from "./pages/MaisonGalaHome.jsx";
${signature}
import MaisonVenueDossier from "./pages/MaisonVenueDossier.jsx";`
);

/*
  Remove imported names only when
  they have become unused.
*/

for (const symbol of [
  "useParams",
  "ChevronRight",
  "Search",
  "Gem",
  "ShieldCheck",
  "Users",
  "VENUES",
  "findVenue",
]) {
  const usages =
    source.match(
      new RegExp(`\\b${symbol}\\b`, "g")
    ) || [];

  if (usages.length === 1) {
    source = source.replace(
      new RegExp(
        `^  ${symbol},\\n`,
        "m"
      ),
      ""
    );
  }
}

/* Backup original App.jsx outside repo */

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const backup = join(
  tmpdir(),
  `your-moment-before-venues-${stamp}.jsx`
);

copyFileSync(
  appPath,
  backup
);

/* Write only after all validations */

writeFileSync(
  appPath,
  source,
  "utf8"
);

console.log(
  "BATCH 2 INSTALLED — venue routes now render collection and dossiers."
);

console.log(
  "Original booking, planner, operations and homepage logic preserved."
);

console.log(`Backup: ${backup}`);

console.log(
  "No GitHub push performed."
);