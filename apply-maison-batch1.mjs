// YOUR MOMENT / MAISON GALA BATCH 1
// SAFE APP INTEGRATION
//
// Run:
// node apply-maison-batch1.mjs

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
  "src/components/MaisonGalaChrome.jsx",
  "src/pages/MaisonGalaHome.jsx",
  "src/styles/maison-gala.css",
];

for (const path of required) {
  if (!existsSync(join(root, path))) {
    throw new Error(
      `Missing: ${path}`
    );
  }
}

if (!existsSync(appPath)) {
  throw new Error(
    "Run inside your-moment-concept."
  );
}

let source = readFileSync(
  appPath,
  "utf8"
);

if (
  source.includes(
    'from "./components/MaisonGalaChrome.jsx"'
  )
) {
  console.log(
    "Batch 1 is already integrated. No changes made."
  );

  process.exit(0);
}

if (
  !source.includes(
    'import "./styles/site.css";'
  )
) {
  throw new Error(
    "Original site.css import not found. No changes made."
  );
}

for (const code of [
  "function BrandLogo()",
  "function SectionHeading(",
  "function HomePage()",
  "function VenuesPage()",
  "<Header />",
  "<Footer />",
  "<HomePage />",
]) {
  if (!source.includes(code)) {
    throw new Error(
      `Missing expected anchor: ${code}. No changes made.`
    );
  }
}

source = source.replace(
  /\r\n/g,
  "\n"
);

function between(start, end, replacement) {
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
      `Cannot safely replace ${start}. No changes made.`
    );
  }

  source =
    source.slice(0, a) +
    replacement +
    source.slice(b);
}

// Replace old logo, header and footer only.
// Preserve SectionHeading and VenueCard,
// which are still used elsewhere.

between(
  "function BrandLogo()",
  "function SectionHeading(",
  `// MAISON GALA BATCH 1 / PUBLIC SHELL
function Header() { return <MaisonHeader />; }
function Footer() { return <MaisonFooter />; }

`
);

// Replace homepage only.
// All other public and staff pages remain.

between(
  "function HomePage()",
  "function VenuesPage()",
  `// MAISON GALA BATCH 1 / NEW HOMEPAGE
function HomePage() { return <MaisonGalaHome />; }

`
);

// Remove imports used only in the retired sections.

for (const line of [
  "  NavLink,\n",
  "  Menu,\n",
  "  Sparkles,\n",
  "  X,\n",
  "  BRAND,\n",
  "  PRINCIPLES,\n",
  "  FAQS,\n",
]) {
  if (!source.includes(line)) {
    throw new Error(
      `Expected old import not found: ${line.trim()}. No changes made.`
    );
  }

  source = source.replace(
    line,
    ""
  );
}

// Import new public components.

source = source.replace(
  'import "./styles/site.css";',
  `import "./styles/site.css";
import { MaisonHeader, MaisonFooter } from "./components/MaisonGalaChrome.jsx";
import MaisonGalaHome from "./pages/MaisonGalaHome.jsx";`
);

// Create backup outside project repository.

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const backupPath = join(
  tmpdir(),
  `your-moment-App-before-maison-${stamp}.jsx`
);

copyFileSync(
  appPath,
  backupPath
);

// Save new App.jsx only after validation.

writeFileSync(
  appPath,
  source,
  "utf8"
);

console.log(
  "MAISON GALA BATCH 1 INTEGRATED"
);

console.log(
  "Updated App.jsx public shell and homepage wrappers only."
);

console.log(
  "Existing routes, quote calculator, and staff operations preserved."
);

console.log(
  `Backup: ${backupPath}`
);

console.log(
  "No GitHub push performed."
);