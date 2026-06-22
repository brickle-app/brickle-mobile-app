const DISPLAY_DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function formatDateForDisplay(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function parseDisplayDate(value?: string): Date | undefined {
  if (!value) return undefined;

  const match = DISPLAY_DATE_REGEX.exec(value);
  if (!match) return undefined;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

export function getAdultMaximumDate(today = new Date()): Date {
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
}

export function isAdultDisplayDate(value: string, today = new Date()): boolean {
  const date = parseDisplayDate(value);
  if (!date) return false;

  return date <= getAdultMaximumDate(today);
}
