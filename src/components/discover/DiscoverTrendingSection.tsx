import React, { cloneElement } from "react";
import { Text, View } from "react-native";
import InfoIcon from "@/assets/icons/SVG/Info.svg";
import { Colors } from "@/assets/Colors";
import { mockCategories } from "@/src/data/mock-categories";
import { Asset } from "@/src/interfaces/investments.interface";
import { getCategory, getCategoryBgColor, getCategoryChipTextColor } from "@/src/utils/categories";
import { DiscoverAssetCardList } from "./DiscoverAssetCardList";
import { groupAssetsByCategory, normalizeCategory } from "./discoverScreen.logic";
import TrendingCarousel from "./TrendingCarousel";

interface DiscoverTrendingSectionProps {
  topAssets: Asset[];
  restAssets: Asset[];
  loading: boolean;
  errorMessage: string | null;
  onAssetPress: (asset: Asset) => void;
}

export const DiscoverTrendingSection = ({
  topAssets,
  restAssets,
  loading,
  errorMessage,
  onAssetPress,
}: DiscoverTrendingSectionProps) => {
  const groupedByCategory = groupAssetsByCategory(restAssets, mockCategories);

  return (
    <View className="mb-6">
      <View className="flex-row items-center mx-4 mb-4">
        <Text className="text-text-primary text-lg font-libre-regular mr-1">En tendencia</Text>
        <InfoIcon width={18} height={18} color={Colors.orangePrimary} />
      </View>

      {errorMessage ? (
        <Text className="text-text-primary text-base font-libre-regular mx-4">{errorMessage}</Text>
      ) : loading ? (
        <View className="px-4"><View className="flex-row bg-gray-200 rounded-2xl" style={{ height: 100 }} /></View>
      ) : topAssets.length > 0 ? (
        <TrendingCarousel assets={topAssets} onAssetPress={onAssetPress} />
      ) : (
        <Text className="text-text-primary text-base font-libre-regular mx-4">No hay activos en tendencia disponibles</Text>
      )}

      {groupedByCategory.map(({ category, assets }) => (
        <View key={category} className="mt-6">
          <CategoryHeader category={category} />
          <DiscoverAssetCardList assets={assets} onAssetPress={onAssetPress} />
        </View>
      ))}
    </View>
  );
};

const CategoryHeader = ({ category }: { category: string }) => {
  const bgColor = getCategoryBgColor(category);
  const textColor = getCategoryChipTextColor(category);
  const mockCat = mockCategories.find((m) => normalizeCategory(m.name) === category);
  const icon = getCategory(category)?.icon;

  return (
    <View className="flex-row items-center mx-4 mb-3">
      {mockCat?.icon ?? (
        <View className="size-8 items-center justify-center rounded-full mr-2" style={{ backgroundColor: bgColor }}>
          {icon && React.isValidElement(icon)
            ? cloneElement(icon as React.ReactElement<{ width?: number; height?: number }>, { width: 18, height: 18 })
            : null}
        </View>
      )}
      <View className="rounded-full px-3 py-1" style={{ backgroundColor: bgColor }}>
        <Text className="text-sm font-libre-bold" style={{ color: textColor }}>{category}</Text>
      </View>
    </View>
  );
};
