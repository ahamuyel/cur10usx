/**
 * Translation Validation Script
 *
 * Ensures all locale files (pt, en, fr) have identical key structures.
 * Run: npx tsx scripts/validate-translations.ts
 */

import pt from "../src/lib/i18n/pt"
import en from "../src/lib/i18n/en"
import fr from "../src/lib/i18n/fr"

type TranslationObject = Record<string, unknown>

function getKeys(obj: TranslationObject, prefix = ""): string[] {
  const keys: string[] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getKeys(obj[key] as TranslationObject, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

const locales: Record<string, TranslationObject> = { pt, en, fr }
const localeKeys: Record<string, Set<string>> = {}

for (const [name, data] of Object.entries(locales)) {
  localeKeys[name] = new Set(getKeys(data))
}

const localeNames = Object.keys(locales)
let hasErrors = false

// Compare each pair
for (let i = 0; i < localeNames.length; i++) {
  for (let j = i + 1; j < localeNames.length; j++) {
    const a = localeNames[i]
    const b = localeNames[j]
    const keysA = localeKeys[a]
    const keysB = localeKeys[b]

    const missingInB = [...keysA].filter((k) => !keysB.has(k))
    const missingInA = [...keysB].filter((k) => !keysA.has(k))

    if (missingInB.length > 0) {
      console.error(`\n  [${a}] keys missing in [${b}]:`)
      missingInB.forEach((k) => console.error(`    - ${k}`))
      hasErrors = true
    }
    if (missingInA.length > 0) {
      console.error(`\n  [${b}] keys missing in [${a}]:`)
      missingInA.forEach((k) => console.error(`    - ${k}`))
      hasErrors = true
    }
  }
}

// Check for empty string values (should be translated, not empty)
for (const [name, data] of Object.entries(locales)) {
  const keys = getKeys(data)
  for (const key of keys) {
    const parts = key.split(".")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = data
    for (const part of parts) {
      value = value?.[part]
    }
    if (value === "") {
      console.warn(`  [${name}] empty value for key: ${key}`)
    }
  }
}

if (hasErrors) {
  console.error("\n  TRANSLATION VALIDATION FAILED — fix missing keys above.\n")
  process.exit(1)
} else {
  console.log("\n  All locale files have identical key structures.\n")
}
