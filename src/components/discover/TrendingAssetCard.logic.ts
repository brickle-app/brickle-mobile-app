import { Colors } from "@/assets/Colors";
import { getCategory, getCategoryBgColor, getCategoryChipTextColor } from "@/src/utils/categories";
import CATEGORIES from "@/src/utils/categories";
import { TrendingAssetCategoryColors } from "./TrendingAssetCard.types";

const findCategoryKey = (type: string) => {
  const key = type?.trim() || "";
  if (!key) return null;
  if (getCategory(key)) return key;
  return Array.from(CATEGORIES.entries()).find(([, c]) => c.name.toLowerCase() === key.toLowerCase())?.[0] ?? null;
};

export const getAssetCategoryColors = (type: string): TrendingAssetCategoryColors => {
  const key = findCategoryKey(type);
  return {
    background: key ? getCategoryBgColor(key) : Colors.violetSecondary,
    foreground: key ? getCategoryChipTextColor(key) : Colors.white,
  };
};

export const isSoldOut = (bidsAvailable: number): boolean => {
  const n = Number(bidsAvailable);
  return !Number.isFinite(n) || n <= 0;
};

export const getDisplayImage = (
  discoverImageUrl?: string | null,
  miniatureImageUrl?: string | null,
  imageUrl?: string | null
) => discoverImageUrl || miniatureImageUrl || imageUrl || "";
