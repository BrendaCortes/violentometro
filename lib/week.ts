export interface WeekRange {
  start: Date;
  end: Date;
  label: string;
}

export function getCurrentWeek(now: Date = new Date()): WeekRange {
  const d = new Date(now);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fmt = (date: Date) =>
    date.toLocaleDateString('es', { day: 'numeric', month: 'long' });
  const label = `${fmt(monday)} – ${fmt(sunday)}`;

  return { start: monday, end: sunday, label };
}

export function isInWeek(date: Date | string, week: WeekRange): boolean {
  const t = new Date(date).getTime();
  return t >= week.start.getTime() && t <= week.end.getTime();
}
