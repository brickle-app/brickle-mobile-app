import { Colors } from "@/assets/Colors";
import ExcavatorIcon from "@/assets/icons/SVG/Maquinaria.svg";
import ComputerIcon from "@/assets/icons/SVG/Computador.svg";
import CrossIcon from "@/assets/icons/SVG/Salud.svg";
import ElectronicsIcon from "@/assets/icons/SVG/Computador.svg";
import HealthIcon from "@/assets/icons/SVG/Salud.svg";
import FurnitureIcon from "@/assets/icons/SVG/Mobiliario.svg";
import AgricultureIcon from "@/assets/icons/SVG/Agricultura.svg";
import EnergyIcon from "@/assets/icons/SVG/Energia.svg";
import React from "react";

/**
 * Paleta unificada (chip referencia):
 * - chipBackground: fondo del pill / franja categoría / borde destacado
 * - iconCircleBackground: círculo del icono en chip y listas
 * - iconGlyphColor: trazo del SVG sobre el círculo (= chipBackground en referencia)
 * - chipTextColor: texto del chip (= iconCircleBackground en referencia)
 */
export interface CategoryVisualTokens {
  name: string;
  icon: React.ReactNode;
  chipBackground: string;
  iconCircleBackground: string;
  iconGlyphColor: string;
  chipTextColor: string;
}

const DEFS: Record<string, CategoryVisualTokens> = {
  Maquinaria: {
    name: "Maquinaria",
    icon: <ExcavatorIcon height={80} width={80} color={Colors.violetTertiary} />,
    chipBackground: Colors.violetTertiary,
    iconCircleBackground: Colors.orangePrimary,
    iconGlyphColor: Colors.violetTertiary,
    chipTextColor: Colors.orangePrimary,
  },
  Energia: {
    name: "Energía",
    icon: <EnergyIcon width={80} height={80} color={Colors.violetPrimary} />,
    chipBackground: Colors.violetPrimary,
    iconCircleBackground: Colors.violetSecondary,
    iconGlyphColor: Colors.violetPrimary,
    chipTextColor: Colors.violetSecondary,
  },
  Electronicos: {
    name: "Electrónicos",
    icon: <ElectronicsIcon width={50} height={50} color={Colors.violetSecondary} />,
    chipBackground: Colors.violetSecondary,
    iconCircleBackground: Colors.violetPrimary,
    iconGlyphColor: Colors.violetSecondary,
    chipTextColor: Colors.white,
  },
  Salud: {
    name: "Salud",
    icon: <HealthIcon width={80} height={80} color={Colors.violetPrimary} />,
    chipBackground: Colors.violetPrimary,
    iconCircleBackground: Colors.greenSecondary,
    iconGlyphColor: Colors.violetPrimary,
    chipTextColor: Colors.greenSecondary,
  },
  Agricultura: {
    name: "Agricultura",
    icon: <AgricultureIcon width={80} height={80} color={Colors.greenPrimary} />,
    chipBackground: Colors.greenPrimary,
    iconCircleBackground: Colors.bluePrimary,
    iconGlyphColor: Colors.greenPrimary,
    chipTextColor: Colors.bluePrimary,
  },
  Mobiliario: {
    name: "Mobiliario",
    icon: <FurnitureIcon width={80} height={80} color={Colors.orangePrimary} />,
    chipBackground: Colors.orangePrimary,
    iconCircleBackground: Colors.violetTertiary,
    iconGlyphColor: Colors.orangePrimary,
    chipTextColor: Colors.violetTertiary,
  },
  Vehiculos: {
    name: "Vehículos",
    icon: <CrossIcon height={80} width={80} color={Colors.violetTertiary} />,
    chipBackground: Colors.violetTertiary,
    iconCircleBackground: Colors.orangePrimary,
    iconGlyphColor: Colors.violetTertiary,
    chipTextColor: Colors.orangePrimary,
  },
  Tecnologia: {
    name: "Tecnología",
    icon: <ComputerIcon width={70} height={70} color={Colors.violetSecondary} />,
    chipBackground: Colors.violetSecondary,
    iconCircleBackground: Colors.violetPrimary,
    iconGlyphColor: Colors.violetSecondary,
    chipTextColor: Colors.white,
  },
};

const CATEGORIES = new Map<string, CategoryVisualTokens>(
  Object.entries(DEFS).map(([k, v]) => [k, v])
);

const FALLBACK: CategoryVisualTokens = {
  name: "Categoría",
  icon: <ComputerIcon width={50} height={50} color={Colors.white} />,
  chipBackground: Colors.violetPrimary,
  iconCircleBackground: Colors.violetSecondary,
  iconGlyphColor: Colors.white,
  chipTextColor: Colors.white,
};

function resolveCategoryKey(id: string): string {
  const raw = id?.trim() || "";
  if (!raw) return "";
  if (CATEGORIES.has(raw)) return raw;
  const lower = raw.toLowerCase();
  for (const key of CATEGORIES.keys()) {
    if (key.toLowerCase() === lower) return key;
    const def = CATEGORIES.get(key);
    if (def?.name.toLowerCase() === lower) return key;
  }
  return "";
}

function getDef(id: string): CategoryVisualTokens {
  const key = resolveCategoryKey(id);
  if (!key) return FALLBACK;
  return CATEGORIES.get(key) ?? FALLBACK;
}

/** Fondo del chip / pill (y piezas que usan el “color categoría” principal). */
export function getCategoryBgColor(id: string): string {
  return getDef(id).chipBackground;
}

/** Fondo del círculo del icono (listas dashboard, búsqueda, etc.). */
export function getCategoryIconCircleBackground(id: string): string {
  return getDef(id).iconCircleBackground;
}

/** Color del trazo del icono SVG sobre el círculo. */
export function getCategoryIconGlyphColor(id: string): string {
  return getDef(id).iconGlyphColor;
}

/** Texto del chip / etiqueta sobre el fondo del pill. */
export function getCategoryChipTextColor(id: string): string {
  return getDef(id).chipTextColor;
}

/**
 * @deprecated Usar getCategoryChipTextColor o getCategoryIconCircleBackground según contexto.
 * Alias histórico: devuelve el color de **texto del chip** (no el círculo).
 */
export function getCategoryColor(id: string): string {
  return getDef(id).chipTextColor;
}

/** Tema detalle leasing: main = chip, secondary = círculo icono. */
export function getLeasingDetailTheme(type: string): {
  mainColor: string;
  secondaryColor: string;
} {
  const d = getDef(type);
  return {
    mainColor: d.chipBackground,
    secondaryColor: d.iconCircleBackground,
  };
}

const CATEGORIES_EXPORT = CATEGORIES;

export default CATEGORIES_EXPORT;

export const getCategory = (id: string) => {
  const key = resolveCategoryKey(id);
  if (!key) return undefined;
  return CATEGORIES.get(key);
};

export const getCategories = (iconSize: number = 80) => {
  return Array.from(CATEGORIES.values()).map((category) => ({
    id: category.name,
    name: category.name,
    icon: category.icon,
    color: category.chipTextColor,
    bgColor: category.chipBackground,
  }));
};

export const getCategoryIcon = (id: string) => {
  return getDef(id).icon;
};
