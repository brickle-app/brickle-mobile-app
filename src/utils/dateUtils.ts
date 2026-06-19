export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days}d`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return "Ahora";
}

export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return getTimeAgo(date);
  } else if (days === 1) {
    return "Ayer";
  } else if (days < 7) {
    return `${days} días`;
  } else {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  }
}

export function differenceInMonths(dateStart: Date, dateEnd: Date): number {
  const years = dateEnd.getFullYear() - dateStart.getFullYear();
  const months = dateEnd.getMonth() - dateStart.getMonth();
  let totalMonths = years * 12 + months;
  
  // Adjust if we haven't reached the same day in the end month
  if (dateEnd.getDate() < dateStart.getDate()) {
    totalMonths--;
  }
  
  return totalMonths >= 0 ? totalMonths : 0;
}
