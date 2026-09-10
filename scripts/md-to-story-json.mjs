#!/usr/bin/env node
// Converts one or more markdown user-story files into numbered JSON files,
// using a persistent counter file for continuous IDs across runs.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'

const COUNTER_FILE = '.ksforge-playground/story-counter.txt'
const OUTPUT_DIR = 'user-stories/json'

function nextId() {
  const current = existsSync(COUNTER_FILE)
    ? parseInt(readFileSync(COUNTER_FILE, 'utf8').trim(), 10) || 0
    : 0
  const next = current + 1
  mkdirSync(dirname(COUNTER_FILE), { recursive: true })
  writeFileSync(COUNTER_FILE, `${next}\n`)
  return next
}

function parseStory(markdown) {
  let title = ''
  let section = null
  const description = []
  const acceptanceCriteria = []

  for (const line of markdown.split(/\r?\n/)) {
    const h1 = line.match(/^#\s+(.*)/)
    const h2 = line.match(/^##\s+(.*)/)
    if (h1) {
      title = h1[1].trim()
      continue
    }
    if (h2) {
      const heading = h2[1].trim().toLowerCase()
      section = heading.includes('akzeptanz') || heading.includes('acceptance')
        ? 'acceptance'
        : 'description'
      continue
    }
    if (section === 'acceptance') {
      const item = line.match(/^[-*]\s+(.*)/)
      if (item) acceptanceCriteria.push(item[1].trim())
    } else if (line.trim()) {
      description.push(line.trim())
    }
  }

  return { title, description: description.join(' '), acceptanceCriteria }
}

const argvFiles = process.argv.slice(2)
const envFiles = (process.env.CHANGED_FILES || '')
  .split('\n')
  .map((f) => f.trim())
  .filter(Boolean)
const files = argvFiles.length > 0 ? argvFiles : envFiles

if (files.length === 0) {
  console.log('No markdown files given, nothing to convert.')
  process.exit(0)
}

mkdirSync(OUTPUT_DIR, { recursive: true })
const outputs = []

for (const file of [...files].sort()) {
  const markdown = readFileSync(file, 'utf8')
  const { title, description, acceptanceCriteria } = parseStory(markdown)
  const id = nextId()
  const story = { id, title, description, acceptanceCriteria, sourceFile: file }
  const outPath = `${OUTPUT_DIR}/${id}.json`
  writeFileSync(outPath, JSON.stringify(story, null, 2) + '\n')
  outputs.push(outPath)
  console.log(`Wrote ${outPath}`)
}

if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `json_paths=${outputs.join(' ')}\n`, { flag: 'a' })
}
