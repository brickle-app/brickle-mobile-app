export interface GroupableTransaction {
  id: string;
  /** ISO timestamp of the movement. Items without one are grouped under "Sin fecha". */
  occurredAt?: string;
}

export interface TransactionSection<T extends GroupableTransaction> {
  key: string;
  title: string;
  data: T[];
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** "Hoy", "Ayer", "9 oct" (same year) or "9 oct 2025". */
export function getDayLabel(date: Date, now: Date = new Date()): string {
  const diffDays = Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  const base = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === now.getFullYear() ? base : `${base} ${date.getFullYear()}`;
}

/** Groups already-sorted movements by calendar day, keeping the incoming order. */
export function groupTransactionsByDay<T extends GroupableTransaction>(
  transactions: T[],
  now: Date = new Date()
): TransactionSection<T>[] {
  const sections: TransactionSection<T>[] = [];
  const byKey = new Map<string, TransactionSection<T>>();

  for (const transaction of transactions) {
    const date = transaction.occurredAt ? new Date(transaction.occurredAt) : null;
    const valid = date && !Number.isNaN(date.getTime());
    const key = valid ? dayKey(date) : "unknown";

    let section = byKey.get(key);
    if (!section) {
      section = { key, title: valid ? getDayLabel(date, now) : "Sin fecha", data: [] };
      byKey.set(key, section);
      sections.push(section);
    }
    section.data.push(transaction);
  }

  return sections;
}
