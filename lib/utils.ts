export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatCurrency(inr: number, status?: string): string {
  if (inr === 0) return 'Free';
  const prefix = status === 'estimated' ? '₹' : '₹';
  const suffix = status === 'estimated' ? ' (est.)' : '';
  return `${prefix}${Math.round(inr)}${suffix}`;
}

export function formatCarbon(kg: number): string {
  if (kg < 0.01) return '< 0.01 kg';
  return `${kg.toFixed(2)} kg`;
}

export function getModeColor(mode: string): string {
  switch (mode) {
    case 'SUBWAY':
    case 'METRO':
    case 'RAIL':
      return '#1a73e8'; // Google Blue
    case 'BUS':
      return '#e37400'; // Google Yellow/Amber
    case 'WALK':
      return '#1e8e3e'; // Google Green
    default:
      return '#5f6368'; // Google Charcoal
  }
}
