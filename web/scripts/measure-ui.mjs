// Measured UI verification: read geometry from the live DOM, screenshots only as a last look.
//   node scripts/measure-ui.mjs            every check in measurements.json
//   node scripts/measure-ui.mjs <id> ...   one or more checks by id
//   node scripts/measure-ui.mjs --json     the same results as one JSON document
// Exit 0 when every enforced pair passes, 1 on a breach, 2 when the app or API is not reachable.
// The registry beside this file quotes the sentence each check protects and names the boxes.
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const here = dirname(fileURLToPath(import.meta.url))
const registry = JSON.parse(readFileSync(join(here, "measurements.json"), "utf8"))
const { baseUrl, apiUrl, checks: all } = registry

const argv = process.argv.slice(2)
const asJson = argv.includes("--json")
const wanted = argv.filter((arg) => !arg.startsWith("-"))
const settleMs = 700

function stop(message) {
  console.error(`measure-ui: ${message}`)
  process.exit(2)
}

async function answers(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    return res.ok
  } catch {
    return false
  }
}

if (!(await answers(apiUrl))) {
  stop(
    `the API did not answer at ${apiUrl}. Start it with: dotnet run --project api --launch-profile http`,
  )
}
if (!(await answers(baseUrl))) {
  stop(`the web dev server did not answer at ${baseUrl}. Start it with: cd web && npm run dev`)
}

const unknown = wanted.filter((id) => !all.some((check) => check.id === id))
if (unknown.length) {
  stop(`unknown check id: ${unknown.join(", ")}. Known: ${all.map((c) => c.id).join(", ")}`)
}
const checks = wanted.length ? all.filter((check) => wanted.includes(check.id)) : all

const round = (n) => Math.round(n * 10) / 10
const signed = (n) => `${n > 0 ? "+" : ""}${round(n)}px`

function assertFingerprintArgs(fingerprint) {
  return {
    selector: fingerprint.selector,
    text: fingerprint.text ?? null,
    match: fingerprint.match ?? "exact",
    labelSelector: fingerprint.labelSelector ?? null,
    minNoteLines: fingerprint.minNoteLines ?? 0,
    require: fingerprint.require ?? [],
  }
}

async function measureCentre(page, check, width) {
  const data = await page.evaluate(
    ({ boxes, fingerprint, expect }) => {
      const clean = (text) => (text ?? "").replace(/\s+/g, " ").trim()
      const rows = [...document.querySelectorAll(boxes.row)]
      const row = rows.find(
        (candidate) => clean(candidate.querySelector(fingerprint.labelSelector)?.textContent) === fingerprint.text,
      )
      if (!row) {
        throw new Error(`fingerprint row "${fingerprint.text}" not found among ${rows.length} row(s)`)
      }
      const nodes = { value: row.querySelector(boxes.value), label: row.querySelector(boxes.label), note: row.querySelector(boxes.note) }
      for (const [key, node] of Object.entries(nodes)) {
        if (!node) throw new Error(`box ${key} (${boxes[key]}) is missing inside the fingerprinted row`)
      }
      const rect = (node) => {
        const r = node.getBoundingClientRect()
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, cy: (r.top + r.bottom) / 2 }
      }
      const value = rect(nodes.value)
      const label = rect(nodes.label)
      const note = rect(nodes.note)
      const rowRect = rect(row)
      const blockTop = Math.min(label.top, note.top)
      const blockBottom = Math.max(label.bottom, note.bottom)
      const range = document.createRange()
      range.selectNodeContents(nodes.note)
      const lineTops = new Set(
        [...range.getClientRects()].filter((r) => r.height > 0).map((r) => Math.round(r.top)),
      )
      const lineHeight = parseFloat(getComputedStyle(nodes.note).lineHeight)
      const noteLines = lineHeight > 0
        ? Math.max(1, Math.round((note.bottom - note.top) / lineHeight))
        : lineTops.size || 1
      if (fingerprint.minNoteLines && noteLines < fingerprint.minNoteLines) {
        throw new Error(
          `state mismatch: the note is ${noteLines} line(s), the registry says ${fingerprint.minNoteLines}`,
        )
      }
      return {
        expect,
        valueCy: value.cy,
        labelCy: label.cy,
        blockCy: (blockTop + blockBottom) / 2,
        rowCy: rowRect.cy,
        valueTop: value.top,
        valueBottom: value.bottom,
        labelTop: label.top,
        labelBottom: label.bottom,
        noteTop: note.top,
        leftValue: value.left,
        leftLabel: label.left,
        leftNote: note.left,
        noteLines,
      }
    },
    { boxes: check.boxes, fingerprint: assertFingerprintArgs(check.fingerprint), expect: width.expect ?? "centre-on-block" },
  )

  const tolerance = width.tolerance ?? check.tolerance
  const pairs = []
  const meta = { noteLines: data.noteLines, tolerance: `${tolerance}px` }

  if (data.expect === "stacked") {
    pairs.push({
      name: "label<value gap",
      value: data.valueTop - data.labelBottom,
      enforced: true,
      pass: data.valueTop - data.labelBottom >= -tolerance,
    })
    pairs.push({
      name: "value<note gap",
      value: data.noteTop - data.valueBottom,
      enforced: true,
      pass: data.noteTop - data.valueBottom >= -tolerance,
    })
    pairs.push({
      name: "left value-label",
      value: Math.abs(data.leftValue - data.leftLabel),
      enforced: true,
      pass: Math.abs(data.leftValue - data.leftLabel) <= tolerance,
      absolute: true,
    })
    pairs.push({
      name: "left value-note",
      value: Math.abs(data.leftValue - data.leftNote),
      enforced: true,
      pass: Math.abs(data.leftValue - data.leftNote) <= tolerance,
      absolute: true,
    })
    meta.centres = `value ${round(data.valueCy)} / label ${round(data.labelCy)} / block ${round(data.blockCy)}`
    return { pairs, meta }
  }

  const valueBlock = data.valueCy - data.blockCy
  pairs.push({
    name: "value-block",
    value: valueBlock,
    enforced: true,
    pass: Math.abs(valueBlock) <= tolerance,
  })
  pairs.push({
    name: "value-label",
    value: data.valueCy - data.labelCy,
    enforced: false,
    pass: true,
    note: "rejected anchor, printed so a wrong one is visible",
  })
  pairs.push({
    name: "value-rowbox",
    value: data.valueCy - data.rowCy,
    enforced: false,
    pass: true,
    note: "row-box anchor, printed so a wrong one is visible",
  })
  meta.centres = `value ${round(data.valueCy)} / block ${round(data.blockCy)} / row ${round(data.rowCy)}`
  return { pairs, meta }
}

async function measureNoHScroll(page, check, width) {
  const data = await page.evaluate((fingerprint) => {
    const clean = (text) => (text ?? "").replace(/\s+/g, " ").trim()
    const nodes = [...document.querySelectorAll(fingerprint.selector)]
    if (nodes.length === 0) throw new Error(`fingerprint selector "${fingerprint.selector}" matched nothing`)
    const texts = nodes.map((node) => clean(node.textContent))
    const hit =
      fingerprint.match === "contains"
        ? texts.some((text) => text.includes(fingerprint.text))
        : texts.some((text) => text === fingerprint.text)
    if (!hit) {
      throw new Error(`fingerprint "${fingerprint.text}" is not on the page under "${fingerprint.selector}"`)
    }
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }
  }, assertFingerprintArgs(check.fingerprint))

  const tolerance = width.tolerance ?? check.tolerance
  const delta = data.scrollWidth - data.clientWidth
  return {
    pairs: [
      {
        name: "scrollWidth-clientWidth",
        value: delta,
        enforced: true,
        pass: Math.abs(delta) <= tolerance,
      },
    ],
    meta: { scrollWidth: data.scrollWidth, clientWidth: data.clientWidth, tolerance: `${tolerance}px` },
  }
}

async function measureScrollHeight(page, check, width) {
  const data = await page.evaluate(
    ({ boxes, fingerprint }) => {
      const clean = (text) => (text ?? "").replace(/\s+/g, " ").trim()
      const label = [...document.querySelectorAll(fingerprint.selector)].find(
        (node) => clean(node.textContent) === fingerprint.text,
      )
      if (!label) {
        throw new Error(`fingerprint "${fingerprint.text}" is not on the page under "${fingerprint.selector}"`)
      }
      for (const item of fingerprint.require) {
        const found = document.querySelectorAll(item.selector).length
        if (found < item.min) {
          throw new Error(
            `state mismatch: "${item.selector}" has ${found} match(es), the check needs at least ${item.min}`,
          )
        }
      }
      const card = document.querySelector(boxes.card)
      if (!card) throw new Error(`card box "${boxes.card}" is missing`)
      const first = card.clientHeight
      card.scrollTop = card.scrollHeight
      const atMax = card.clientHeight
      const maxTop = card.scrollTop
      card.scrollTop = 0
      return {
        first,
        atMax,
        maxTop,
        scrollHeight: card.scrollHeight,
        overflowY: getComputedStyle(card).overflowY,
        cue: boxes.cue ? document.querySelectorAll(boxes.cue).length : null,
      }
    },
    { boxes: check.boxes, fingerprint: assertFingerprintArgs(check.fingerprint) },
  )

  if (data.scrollHeight <= data.first) {
    throw new Error(
      `state mismatch: "${check.boxes.card}" does not overflow (${data.scrollHeight}px content in ${data.first}px), so comparing its height proves nothing`,
    )
  }

  const tolerance = width.tolerance ?? check.tolerance
  const delta = data.atMax - data.first
  return {
    pairs: [
      {
        name: "height-at-scroll-top0-vs-max",
        value: delta,
        enforced: true,
        pass: Math.abs(delta) <= tolerance,
      },
    ],
    meta: {
      clientHeight: data.first,
      atMaxHeight: data.atMax,
      scrollHeight: data.scrollHeight,
      scrollTopMax: data.maxTop,
      overflowY: data.overflowY,
      cues: data.cue,
      tolerance: `${tolerance}px`,
    },
  }
}

async function measureSameLine(page, check, width) {
  const data = await page.evaluate(
    ({ boxes, fingerprint }) => {
      const clean = (text) => (text ?? "").replace(/\s+/g, " ").trim()
      const title = [...document.querySelectorAll(fingerprint.selector)].find(
        (node) => clean(node.textContent) === fingerprint.text,
      )
      if (!title) {
        throw new Error(`fingerprint "${fingerprint.text}" is not on the page under "${fingerprint.selector}"`)
      }
      for (const item of fingerprint.require) {
        const nodes = [...document.querySelectorAll(item.selector)]
        if (nodes.length < item.min) {
          throw new Error(
            `state mismatch: "${item.selector}" has ${nodes.length} match(es), the check needs at least ${item.min}`,
          )
        }
        if (item.minHeight) {
          const tallest = Math.max(...nodes.map((node) => node.getBoundingClientRect().height))
          if (tallest < item.minHeight) {
            throw new Error(
              `state mismatch: "${item.selector}" is ${Math.round(tallest)}px tall, the check needs at least ${item.minHeight}px`,
            )
          }
        }
      }
      const section = title.closest(".acc")
      if (!section) throw new Error(`"${fingerprint.selector}" is not inside a section`)
      const left = section.querySelector(boxes.left)
      const sources = section.querySelector(boxes.sources)
      if (!left) throw new Error(`left box "${boxes.left}" is missing the fingerprinted section`)
      if (!sources) throw new Error(`sources box "${boxes.sources}" is missing inside the fingerprinted section`)
      const box = left.getBoundingClientRect()
      if (box.height === 0) {
        throw new Error(`state mismatch: "${boxes.left}" has no height, so its section is closed`)
      }
      const range = document.createRange()
      range.selectNodeContents(left)
      const lines = [...range.getClientRects()].filter((rect) => rect.height > 0)
      const lastLineBottom = lines.reduce((bottom, rect) => Math.max(bottom, rect.bottom), box.bottom)
      const sourcesBox = sources.getBoundingClientRect()
      return {
        lastLineBottom,
        leftBottom: box.bottom,
        sourcesBottom: sourcesBox.bottom,
        sourcesHeight: sourcesBox.height,
      }
    },
    { boxes: check.boxes, fingerprint: assertFingerprintArgs(check.fingerprint) },
  )

  const tolerance = width.tolerance ?? check.tolerance
  const delta = check.anchor === "box" ? data.sourcesBottom - data.leftBottom : data.sourcesBottom - data.lastLineBottom
  return {
    pairs: [
      {
        name: "sources-bottom-vs-left-box",
        value: delta,
        enforced: true,
        pass: Math.abs(delta) <= tolerance,
      },
    ],
    meta: {
      leftBottom: round(data.leftBottom),
      sourcesBottom: round(data.sourcesBottom),
      leftBoxBottom: round(data.leftBottom),
      sourcesHeight: round(data.sourcesHeight),
      tolerance: `${tolerance}px`,
    },
  }
}

const kindRunner = {
  centre: measureCentre,
  "no-h-scroll": measureNoHScroll,
  "scroll-height": measureScrollHeight,
  "same-line": measureSameLine,
}

const browser = await chromium.launch()
const results = []
const lines = []

for (const check of checks) {
  const run = kindRunner[check.kind]
  if (!run) stop(`check "${check.id}" has unknown kind "${check.kind}"`)
  for (const width of check.widths) {
    const context = await browser.newContext({
      viewport: { width: width.width, height: width.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      locale: "cs-CZ",
    })
    const page = await context.newPage()
    page.setDefaultTimeout(15000)
    let measured
    try {
      await page.goto(baseUrl + check.route, { waitUntil: "domcontentloaded", timeout: 20000 })
      const waitFor = check.boxes.value ?? check.boxes.card ?? check.fingerprint.selector
      await page.waitForSelector(waitFor, { timeout: 15000 })
      await page.waitForSelector(check.fingerprint.selector, { timeout: 15000 })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(settleMs)
      measured = await run(page, check, width)
    } catch (error) {
      const message = (error?.message ?? String(error)).split("\n")[0]
      if (/ERR_CONNECTION|ERR_NAME_NOT_RESOLVED|ECONNREFUSED/i.test(message)) {
        await context.close()
        await browser.close()
        stop(`${baseUrl} stopped answering during the run: ${message}`)
      }
      measured = { pairs: [], meta: {}, error: message }
    } finally {
      await context.close()
    }

    const breaches = measured.pairs.filter((pair) => pair.enforced && !pair.pass)
    results.push({
      id: check.id,
      sentence: check.sentence,
      route: check.route,
      width: width.width,
      pairs: measured.pairs,
      meta: measured.meta,
      error: measured.error ?? null,
      breached: breaches.length > 0 || Boolean(measured.error),
    })

    if (!asJson) {
      if (measured.error) {
        lines.push(`FAIL ${check.id} ${width.width}  ${measured.error}`)
      } else {
        const tolerance = measured.meta.tolerance ?? ""
        for (const pair of measured.pairs) {
          const status = pair.enforced ? (pair.pass ? "ok  " : "FAIL") : "info"
          const value = pair.absolute ? `${round(pair.value)}px` : signed(pair.value)
          const suffix = pair.enforced ? `  tolerance ${tolerance}` : `  (${pair.note})`
          lines.push(`${status} ${check.id} ${width.width} ${pair.name} ${value}${suffix}`)
        }
        const meta = Object.entries(measured.meta)
          .filter(([key]) => key !== "tolerance")
          .map(([key, value]) => `${key} ${value}`)
          .join(", ")
        lines.push(`     ${check.id} ${width.width} ${meta}`)
      }
      if (!measured.error) lines.push("")
    }
  }
}

await browser.close()

const breaches = results.filter((result) => result.breached)
const pairs = results.reduce((sum, result) => sum + result.pairs.length, 0)

if (asJson) {
  console.log(JSON.stringify({ checks: results, breaches: breaches.length, pairs }, null, 2))
} else {
  for (const line of lines) console.log(line)
  const ids = [...new Set(results.map((result) => result.id))]
  console.log(
    breaches.length
      ? `measure-ui: BREACH. ${breaches.length} of ${results.length} run(s) failed, ${pairs} pair(s) measured.`
      : `measure-ui: ${ids.length} check(s) pass at ${results.length} run(s), ${pairs} pair(s) measured.`,
  )
  if (breaches.length) {
    for (const breach of breaches) {
      const detail = breach.error ?? breach.pairs.filter((p) => p.enforced && !p.pass).map((p) => p.name).join(", ")
      console.log(`  ${breach.id} at ${breach.width}: ${detail}`)
    }
  }
}

process.exit(breaches.length ? 1 : 0)
