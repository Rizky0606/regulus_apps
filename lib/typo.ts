export function runBasicTypoFixes(input: string) {
  if (!input) return ""
  let s = input

  // Normalize spaces around punctuation
  s = s.replace(/\s*([,;:.!?])\s*/g, "$1 ")
  // Remove double spaces
  s = s.replace(/\s{2,}/g, " ")
  // Normalize quotes to “curly” for readability
  s = s.replace(/"([^"]*)"/g, "“$1”")
  // Replace triple dots with ellipsis
  s = s.replace(/\.{3}/g, "…")
  // Ensure dash spacing (—)
  s = s.replace(/\s*-\s*/g, " — ")
  // Trim lines
  s = s
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")

  return s.trim()
}
