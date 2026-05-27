const DATE_FORMAT = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const TIME_FORMAT = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
});

const DATETIME_FORMAT = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date: string | Date): string {
  return DATE_FORMAT.format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return TIME_FORMAT.format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return DATETIME_FORMAT.format(new Date(date));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("+49") && cleaned.length >= 12) {
    const rest = cleaned.slice(3);
    return `+49 ${rest.slice(0, 3)} •••• ${rest.slice(-3)}`;
  }
  return phone;
}

export function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export function isThisWeek(date: string | Date): boolean {
  const d = new Date(date);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

export function relativeDay(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (isToday(d)) return "Heute";
  if (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  )
    return "Morgen";
  return formatDate(d);
}
