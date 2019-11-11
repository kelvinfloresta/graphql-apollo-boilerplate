export function capitalize (text: string): string {
  const firstWord = text[0].toUpperCase()
  const rest = text.slice(1)
  return firstWord + rest
}
