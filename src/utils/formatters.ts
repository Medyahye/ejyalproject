export function formatPrice(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(value);
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours}h`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

const MONTH_ABBREVIATIONS: Record<string, string> = {
  Mars: 'Mar',
  Avril: 'Avr',
  Mai: 'Mai',
  Juin: 'Jun',
  Juillet: 'Jul',
  Août: 'Aoû',
};

export function abbreviateMonth(month: string): string {
  return MONTH_ABBREVIATIONS[month] ?? month.slice(0, 3);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
