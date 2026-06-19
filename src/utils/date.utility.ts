/**
 * Convierte una fecha en formato DD/MM/YYYY a formato ISO string
 * @param dateString - Fecha en formato DD/MM/YYYY
 * @returns Fecha en formato ISO string
 * @throws Error si el formato de fecha no es válido
 */
export function parseDateToISO(dateString: string): string {
  if (!dateString || typeof dateString !== "string") {
    throw new Error("La fecha es requerida y debe ser una cadena de texto");
  }

  // Verificar si la fecha contiene barras diagonales
  if (!dateString.includes("/")) {
    throw new Error(
      `Formato de fecha no válido: ${dateString}. Se esperaba DD/MM/YYYY`
    );
  }

  // Separar día, mes y año
  const dateParts = dateString.split("/");

  if (dateParts.length !== 3) {
    throw new Error(
      `Formato de fecha no válido: ${dateString}. Se esperaba DD/MM/YYYY`
    );
  }

  const [day, month, year] = dateParts;

  // Validar que todas las partes sean números
  if (
    !day ||
    !month ||
    !year ||
    isNaN(Number(day)) ||
    isNaN(Number(month)) ||
    isNaN(Number(year))
  ) {
    throw new Error(
      `Formato de fecha no válido: ${dateString}. Todos los componentes deben ser números`
    );
  }

  // Validar rangos básicos
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (dayNum < 1 || dayNum > 31) {
    throw new Error(`Día no válido: ${day}. Debe estar entre 1 y 31`);
  }

  if (monthNum < 1 || monthNum > 12) {
    throw new Error(`Mes no válido: ${month}. Debe estar entre 1 y 12`);
  }

  if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
    throw new Error(
      `Año no válido: ${year}. Debe estar entre 1900 y ${new Date().getFullYear()}`
    );
  }

  // Crear la fecha en formato YYYY-MM-DD
  const isoDateString = `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}`;

  const dateObject = new Date(yearNum, monthNum - 1, dayNum);

  if (isNaN(dateObject.getTime())) {
    throw new Error(
      `Fecha no válida: ${dateString}. La fecha resultante no es válida`
    );
  }

  // Verificar que la fecha coincida con los valores ingresados (evitar fechas como 31/02/2023)
  if (dateObject.getFullYear() !== yearNum || dateObject.getMonth() + 1 !== monthNum || dateObject.getDate() !== dayNum) {
    throw new Error(
      `Fecha no válida: ${dateString}. La fecha no existe en el calendario`
    );
  }

  return isoDateString;
}

/**
 * Valida si una fecha está en formato DD/MM/YYYY
 * @param dateString - Fecha a validar
 * @returns true si es válida, false si no
 */
export function isValidDateFormat(dateString: string): boolean {
  try {
    parseDateToISO(dateString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convierte una fecha ISO a formato DD/MM/YYYY
 * @param isoDateString - Fecha en formato ISO
 * @returns Fecha en formato DD/MM/YYYY
 */
export function formatDateFromISO(isoDateString: string): string {
  const date = new Date(isoDateString);

  if (isNaN(date.getTime())) {
    throw new Error(`Fecha ISO no válida: ${isoDateString}`);
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();

  return `${day}/${month}/${year}`;
}

export const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toISOString().split("T")[0];
};

export const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return "";

  // If it's already in yyyy/mm/dd format, return as is
  if (dateString.includes("/")) return dateString;

  // Convert from yyyy-mm-dd to yyyy/mm/dd
  if (dateString.includes("-")) {
    return dateString.replace(/-/g, "/");
  }

  // If it's a different format, try to parse and reformat
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  }

  return dateString;
};
