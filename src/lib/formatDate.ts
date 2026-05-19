export function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  const part = d.slice(0, 10)
  const [y, m, day] = part.split('-')
  if (!y || !m || !day) return d
  return `${day}-${m}-${y}`
}
