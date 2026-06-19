/**
 * Formato para moneda con opción de símbolo y separador
 */
export const formatCurrency = (
  amount: number,
  symbol = "$",
  decimalPlaces = 0
): string => {
  const formatter = new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  return `${symbol}${formatter.format(amount)}`;
};

export const formatColombianPesos = (value: string | number): string => {
  const numericValue = typeof value === 'string' ? value.replace(/\D/g, '') : value.toString();
  
  if (!numericValue) return '';
  
  const number = parseInt(numericValue, 10);
  return number.toLocaleString('es-CO');
};

export const unformatColombianPesos = (formattedValue: string): string => {
  return formattedValue.replace(/\./g, '');
};

export function parseCopAmountFromText(raw: string | number): number {
  const s = String(raw ?? "").trim();
  if (!s) return 0;

  const compact = s.replace(/\s/g, "");
  // Decimal plano desde wallet / API (punto o coma como decimal)
  if (/^-?\d+\.\d+$|^-?\d+$/.test(compact)) {
    const n = Number.parseFloat(compact);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  if (/^-?\d+,\d{1,2}$/.test(compact)) {
    const n = Number.parseFloat(compact.replace(",", "."));
    return Number.isFinite(n) ? Math.round(n) : 0;
  }

  const digits = compact.replace(/\D/g, "");
  if (digits.length > 0) return Number.parseInt(digits, 10) || 0;
  return Number.parseFloat(compact.replace(",", ".")) || 0;
}
