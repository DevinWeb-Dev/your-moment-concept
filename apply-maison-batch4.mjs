
 // YOUR MOMENT — MAISON GALA BATCH 4
 // Integration: premium staff shell + original staff dashboard
 // No quote engine modification. No GitHub push.
 // Run at project root: node apply-maison-batch4.mjs

import {
  existsSync,
  readFileSync,
  copyFileSync,
  writeFileSync,
} from "node:fs";

import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const appPath = join(root, "src", "App.jsx");

for (const item of [
  "src/App.jsx",
  "src/pages/MaisonStaffOperations.jsx",
  "src/styles/maison-operations.css",
]) {
  if (!existsSync(join(root, item))) {
    throw Error(`Missing ${item}. No changes made.`);
  }
}

let app = readFileSync(appPath, "utf8").replace(/\r\n/g, "\n");

const signature =
  'import MaisonStaffOperations from "./pages/MaisonStaffOperations.jsx";';

if (app.includes(signature)) {
  if (!app.includes("<MaisonStaffOperations legacy={")) {
    throw Error("Partial Batch 4 integration detected. No changes made.");
  }
  console.log("Batch 4 is already installed. No changes made.");
  process.exit(0);
}

const anchor = 'import "./styles/site.css";';

if (app.split(anchor).length !== 2) {
  throw Error("Could not find unique site.css import. No changes made.");
}

for (const marker of [
  'path="staff"',
  'path="plans"',
  'path="calendar"',
  "function createQuote(form)",
  "function deleteQuote(id)",
]) {
  if (!app.includes(marker)) {
    throw Error(`Original App.jsx missing ${marker}. No changes made.`);
  }
}

// Locate exactly one staff route without assuming
// the original component's name or JSX props.

const found = [...app.matchAll(/\bpath\s*=\s*["']staff["']/g)];

if (found.length !== 1) {
  throw Error(
    `Found ${found.length} staff route(s); expected exactly one. No changes made.`
  );
}

const pathAt = found[0].index;
const routeAt = app.lastIndexOf("<Route", pathAt);
const nextRoute = app.indexOf("<Route", pathAt + found[0][0].length);

const elementMatch = /\belement\s*=\s*\{/.exec(
  app.slice(routeAt, nextRoute < 0 ? undefined : nextRoute)
);

if (routeAt < 0 || !elementMatch) {
  throw Error("Staff route has no readable element={...} prop. No changes made.");
}

const openBrace =
  routeAt + elementMatch.index + elementMatch[0].lastIndexOf("{");

function closingBrace(input, start) {
  let depth = 0;
  let quote = "";
  let escaped = false;

  for (let i = start; i < input.length; i++) {
    const c = input[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (c === "\\") {
        escaped = true;
      } else if (c === quote) {
        quote = "";
      }
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }

    if (c === "{") {
      depth++;
    } else if (c === "}" && --depth === 0) {
      return i;
    }
  }

  return -1;
}

const endBrace = closingBrace(app, openBrace);

if (endBrace < 0 || (nextRoute >= 0 && endBrace > nextRoute)) {
  throw Error("Cannot safely parse staff route element. No changes made.");
}

const original = app.slice(openBrace + 1, endBrace).trim();

if (!original || !/^[<(]/.test(original)) {
  throw Error("Unexpected staff element expression. No changes made.");
}

// Preserve original React element with all existing props.

app =
  app.slice(0, openBrace + 1) +
  `<MaisonStaffOperations legacy={${original}} />` +
  app.slice(endBrace);

// Add new import.

app = app.replace(anchor, `${anchor}\n${signature}`);

// Verify required functionality remains.

for (const marker of [
  "<MaisonStaffOperations legacy={",
  original,
  'path="staff"',
  'path="plans"',
  'path="calendar"',
  "function createQuote(form)",
  "function deleteQuote(id)",
]) {
  if (!app.includes(marker)) {
    throw Error(`Post-check failed for ${marker}. No changes made.`);
  }
}

// Create backup outside repository.

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const backup = join(
  tmpdir(),
  `your-moment-App-before-Batch4-${stamp}.jsx`
);

copyFileSync(appPath, backup);

// Write updated App.jsx.

writeFileSync(appPath, app, "utf8");

console.log("\nYOUR MOMENT — MAISON GALA / BATCH 4");
console.log("STAFF OPERATIONS INSTALLED SUCCESSFULLY");
console.log("Route updated: /#/staff");
console.log(
  "Included: Command Center, Proposal Desk, Venue Schedule, Run of Show"
);
console.log(
  "Original staff workspace retained under 'Classic workspace'."
);
console.log(
  "Original /plans, /calendar, and quote engine unchanged."
);
console.log(`Backup: ${backup}`);
console.log("No GitHub push performed.\n");
