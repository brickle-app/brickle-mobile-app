import { Asset } from "@/src/interfaces/investments.interface";
import { getCategory } from "@/src/utils/categories";

export type AssetListState = "loading" | "error" | "empty" | "ready";

interface AssetListStateInput {
  loading: boolean;
  assetsCount: number;
  errorMessage: string | null;
}

export const getAssetListState = ({ loading, assetsCount, errorMessage }: AssetListStateInput): AssetListState => {
  if (loading) return "loading";
  if (errorMessage) return "error";
  if (assetsCount === 0) return "empty";
  return "ready";
};

export const normalizeCategory = (raw?: string | null): string => {
  const trimmed = raw?.trim();
  if (!trimmed) return "Otra";
  return getCategory(trimmed)?.name ?? trimmed;
};

export const groupAssetsByCategory = (
  assets: Asset[],
  orderedCategories: { name: string }[]
): { category: string; assets: Asset[] }[] => {
  const groups = new Map<string, Asset[]>();
  for (const asset of assets) {
    const category = normalizeCategory(asset.type);
    groups.set(category, [...(groups.get(category) ?? []), asset]);
  }

  const ordered = orderedCategories.flatMap((cat) => {
    const normalized = normalizeCategory(cat.name);
    const categoryAssets = groups.get(normalized);
    if (!categoryAssets) return [];
    groups.delete(normalized);
    return [{ category: normalized, assets: categoryAssets }];
  });

  return [...ordered, ...Array.from(groups, ([category, categoryAssets]) => ({ category, assets: categoryAssets }))];
};
