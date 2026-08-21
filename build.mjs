#!/usr/bin/env node
// Generates a fully static index.html — no runtime JS, no client-side
// fetching or rendering. Run this whenever beasts.data.mjs or your art
// changes:
//
//   npm install
//   npm run build
//
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { BEASTS } from "./beasts.data.mjs";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const IMAGE_BASE = "images/";
const CLASSES = ["Brute", "Hunter", "Magic"];
const CLASS_KEY = { Brute: "brute", Hunter: "hunter", Magic: "magic" };
const TIER_VAR = { 1: "t1", 2: "t2", 3: "t3", 4: "t4", 5: "t5" };

const FORMS = [
  { key: "static-regular", shiny: false, animated: false, label: "Static" },
  { key: "animated-regular", shiny: false, animated: true, label: "Animated" },
  { key: "static-shiny", shiny: true, animated: false, label: "Shiny" },
  { key: "animated-shiny", shiny: true, animated: true, label: "Shiny · Anim" },
];

function fileNameFor(beast, form) {
  const ext = form.animated ? "gif" : "png";
  const suffix = form.shiny ? "shiny" : `t${beast.tier}`;
  return `${beast.slug}-${suffix}.${ext}`;
}

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Try to load the real card renderer at build time (a normal npm import,
// no CDN, no browser fetch). If it's not installed yet, or a given call
// fails, we fall back to a plain <img> for that card — the build always
// succeeds, and any failures are printed below instead of hitting a user's
// browser console.
let renderBeastCardSvg = null;
let tierColor = null;
try {
  const lib = await import("@provable-games/collectables");
  renderBeastCardSvg = lib.renderBeastCardSvg;
  tierColor = lib.tierColor;
  console.log("[build] using @provable-games/collectables for card rendering");
} catch (err) {
  console.warn(`[build] @provable-games/collectables not available (${err.message}) — using plain <img> cards.`);
  console.warn("[build] run `npm install` to enable the real beast cards.");
}

function cardHtml(beast, form) {
  const label = `${beast.name} — ${form.label}`;

  if (!beast.finished) {
    return `<div class="card-slot placeholder" role="img" aria-label="${esc(label)} (in progress)"><span class="placeholder-glyph">?</span></div>`;
  }

  const imageUrl = IMAGE_BASE + fileNameFor(beast, form);

  const imageExists = existsSync("./" + imageUrl);

  if (imageExists &&renderBeastCardSvg) {
    try {
      const beastRecord = {
        id: beast.slug,
        name: beast.name,
        tier: beast.tier,
        type: beast.class, // "Brute" | "Hunter" | "Magic"
        shiny: form.shiny,
        animated: form.animated,
      };
      let svg = renderBeastCardSvg(beastRecord, { art: imageUrl });
      // native lazy-loading for the art image inside the SVG — cheap win
      // now that we control the full output string at build time.
      // svg = svg.replace(/<image /g, '<image loading="lazy" decoding="async" ');
      return `<div class="card-slot${form.shiny ? " shiny" : ""}" role="img" aria-label="${esc(label)}">${svg}</div>`;
    } catch (err) {
      console.error(`[build] renderBeastCardSvg failed for ${beast.name} (${form.key}): ${err.message}`);
    }
  }

  return (
    `<div class="card-slot${form.shiny ? " shiny" : ""}" role="img" aria-label="${esc(label)}">` +
    `<img src="${imageUrl}" alt="${esc(label)}" loading="lazy" decoding="async" ` +
    `onerror="this.parentElement.classList.add('placeholder');this.outerHTML='<span class=&quot;placeholder-glyph&quot;>?</span>'" />` +
    `</div>`
  );
}

function rowHtml(beast) {
  const color = (tierColor && tierColor(beast.tier)) || `var(--${TIER_VAR[beast.tier]})`;
  const cards = FORMS.map((f) => cardHtml(beast, f)).join("");
  return `
      <div class="beast-row${beast.finished ? "" : " is-placeholder"}">
        <div class="beast-meta">
          <span class="row-status${beast.finished ? "" : " wip"}">${beast.finished ? "" : "in progress"}</span>
        </div>
        <div class="beast-forms">${cards}</div>
      </div>`;
}

function sectionHtml(cls) {
  const beasts = BEASTS.filter((b) => b.class === cls).sort((a, b) => a.tier - b.tier);
  if (!beasts.length) return "";
  return `
    <section class="class-section">
      <div class="class-heading class-${CLASS_KEY[cls]}">
        <h2>${cls}</h2>
        <div class="rule"></div>
        <span class="count">${beasts.length} beasts</span>
      </div>
      ${beasts.map(rowHtml).join("")}
    </section>`;
}

const galleryHtml = CLASSES.map(sectionHtml).join("\n");

const template = readFileSync(join(__dirname, "template.html"), "utf8");
const output = template.replace("<!-- GALLERY -->", galleryHtml);
writeFileSync(join(__dirname, "index.html"), output);

const finishedCount = BEASTS.filter((b) => b.finished).length;
console.log(`[build] wrote index.html — ${BEASTS.length} beasts (${finishedCount} finished, ${BEASTS.length - finishedCount} placeholder)`);
