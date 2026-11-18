/** "Иван Петров" -> "ИП", "alex" -> "A". Максимум две буквы. */
export function getInitials(name?: string) {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
