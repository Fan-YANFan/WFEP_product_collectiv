/** Build Google Calendar "add event" URL */
export function googleCalendarUrl(title: string, date: string, notes?: string): string {
  const start = date.replace(/-/g, "");
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replace(/-/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details: notes ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Build downloadable .ics data URI for Apple Calendar */
export function appleCalendarIcs(title: string, date: string, notes?: string): string {
  const start = date.replace(/-/g, "");
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replace(/-/g, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${title.replace(/,/g, "\\,")}`,
    notes ? `DESCRIPTION:${notes.replace(/,/g, "\\,")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
