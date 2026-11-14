// UI lint: spacing rhythm, token colours, class inventory.
// Baseline mode lets the current debt stay while the gate blocks new debt.
//   node scripts/lint-ui.mjs           check
//   node scripts/lint-ui.mjs --update  rewrite the baseline and the inventory
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const webRoot = join(here, "..")
const cssPath = join(webRoot, "src", "styles", "global.css")
const baselinePath = join(here, "lint-ui.baseline.json")
const inventoryPath = join(here, "ui-inventory.json")

const SPACING_PROPS =
  /^(margin|padding)(-top|-right|-bottom|-left|-block|-inline|-block-start|-block-end|-inline-start|-inline-end)?$|^(gap|row-gap|column-gap)$/
const SPACING_STEP = 4
const SPACING_MAX = 96
const HEX = /#[0-9a-fA-F]{3,8}\b/
const CLASS = /\.(-?[a-zA-Z_][\w-]*)/g

const update = process.argv.includes("--update")

function parseCss(source) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  const lines = css.split("\n")
  const lineOf = (index) => {
    let lo = 0
    let hi = lines.length - 1
    let seen = 0
    for (let i = 0; i < lines.length; i++) {
      seen += lines[i].length + 1
      if (seen > index) return i + 1
    }
    return hi + 1
  }
  const rules = []
  const stack = []
  let selector = ""
  let decl = ""
  for (let i = 0; i < css.length; i++) {
    const ch = css[i]
    if (ch === "{") {
      const sel = selector.trim().replace(/\s+/g, " ")
      stack.push(sel)
      rules.push({ selector: sel, isAt: sel.startsWith("@"), depth: stack.length, line: lineOf(i) })
      selector = ""
      decl = ""
    } else if (ch === "}") {
      stack.pop()
      selector = ""
      decl = ""
      if (stack.length) rules.push({ selector: stack[stack.length - 1], isAt: true, close: true })
    } else if (ch === ";") {
      const text = decl.trim()
      const top = stack[stack.length - 1] ?? ""
      if (text && !top.startsWith("@")) {
        const colon = text.indexOf(":")
        if (colon > 0) {
          rules.push({
            selector: top,
            prop: text.slice(0, colon).trim().toLowerCase(),
            value: text.slice(colon + 1).trim(),
            line: lineOf(i),
          })
        }
      }
      decl = ""
    } else {
      if (stack.length && !stack[stack.length - 1].startsWith("@")) decl += ch
      else selector += ch
    }
  }
  return rules
}

const css = readFileSync(cssPath, "utf8")
const rules = parseCss(css)

const violations = []
const classes = new Set()

for (const rule of rules) {
  if (!rule.prop) {
    if (rule.selector) {
      for (const m of rule.selector.matchAll(CLASS)) classes.add(m[1])
    }
    continue
  }
  const value = rule.value.replace(/!important/gi, "").trim()
  const inRoot = rule.selector.includes(":root")

  if (SPACING_PROPS.test(rule.prop)) {
    for (const m of value.matchAll(/(-?\d+(?:\.\d+)?)px/g)) {
      const n = Math.abs(Number(m[1]))
      if (n > SPACING_MAX || n % SPACING_STEP !== 0) {
        violations.push({
          rule: "spacing",
          selector: rule.selector,
          detail: `${rule.prop}: ${m[1]}px`,
          line: rule.line,
          message: `${m[1]}px is off the ${SPACING_STEP}px grid (max ${SPACING_MAX}px)`,
        })
      }
    }
  }

  if (!inRoot) {
    const hex = value.match(HEX)
    if (hex) {
      violations.push({
        rule: "color",
        selector: rule.selector,
        detail: `${rule.prop}: ${hex[0]}`,
        line: rule.line,
        message: `hard-coded ${hex[0]} outside :root; use a token`,
      })
    }
  }
}

const previous = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, "utf8"))
  : { spacing: [], color: [] }
const previousInventory = existsSync(inventoryPath)
  ? JSON.parse(readFileSync(inventoryPath, "utf8"))
  : { classes: [] }

const key = (v) => `${v.selector}\u0000${v.detail}`

if (update) {
  const baseline = { spacing: [], color: [] }
  for (const v of violations) baseline[v.rule].push(key(v))
  for (const k of Object.keys(baseline)) baseline[k] = [...new Set(baseline[k])].sort()
  writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n")
  writeFileSync(
    inventoryPath,
    JSON.stringify({ classes: [...classes].sort() }, null, 2) + "\n",
  )
  console.log(
    `lint-ui: baselined ${violations.length} existing violations, inventoried ${classes.size} classes`,
  )
  process.exit(0)
}

const known = {
  spacing: new Set(previous.spacing ?? []),
  color: new Set(previous.color ?? []),
}
const fresh = violations.filter((v) => !known[v.rule]?.has(key(v)))
const fixed = []
for (const rule of ["spacing", "color"]) {
  const live = new Set(violations.filter((v) => v.rule === rule).map(key))
  for (const k of known[rule] ?? []) if (!live.has(k)) fixed.push({ rule, key: k })
}

const inventory = new Set(previousInventory.classes ?? [])
const newClasses = [...classes].filter((c) => !inventory.has(c)).sort()
const staleClasses = [...inventory].filter((c) => !classes.has(c)).sort()

const shown = new Set()
const report = []
for (const v of fresh) {
  report.push(`  ${v.rule}: ${v.selector} { ${v.detail} }  ${v.message}  (line ${v.line})`)
  shown.add(key(v))
}

let failed = false
if (report.length) {
  failed = true
  console.error(`lint-ui: ${fresh.length} new violation(s)\n${report.join("\n")}`)
}
if (newClasses.length) {
  failed = true
  console.error(
    `lint-ui: ${newClasses.length} class(es) missing from scripts/ui-inventory.json\n` +
      newClasses.map((c) => `  .${c}`).join("\n") +
      `\n  Add the entry, or run --update if the class is meant to exist.`,
  )
}
if (staleClasses.length) {
  failed = true
  console.error(
    `lint-ui: ${staleClasses.length} inventoried class(es) no longer in global.css\n` +
      staleClasses.map((c) => `  .${c}`).join("\n") +
      `\n  Remove the entry, or run --update to resync.`,
  )
}
if (fixed.length) {
  console.log(`lint-ui: ${fixed.length} baselined violation(s) are gone. Run --update to shrink the baseline.`)
}

if (failed) process.exit(1)

console.log(
  `lint-ui: clean. ${violations.length} baselined, ${classes.size} classes inventoried, ` +
    `${relative(webRoot, cssPath).replace(/\\/g, "/")} is ${rules.length} rules.`,
)
