import { View, Text, SafeAreaView, ScrollView, RefreshControl } from "react-native";
import React, { useMemo, cloneElement } from "react";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import SearchBar from "@/src/components/discover/SearchBar";
import CategoryChips from "@/src/components/discover/CategoryChips";
import TrendingAssetCard from "@/src/components/discover/TrendingAssetCard";
import TrendingCarousel from "@/src/components/discover/TrendingCarousel";
import InfoIcon from "@/assets/icons/SVG/Info.svg";
import { Colors } from "@/assets/Colors";
import { mockCategories } from "@/src/data/mock-categories";
import { useFilteredCategories } from "@/src/hooks/discover/useFilteredCategories";
import { getRiskLevel } from "@/src/utils/riskLevel";
import { getCategory, getCategoryBgColor, getCategoryChipTextColor } from "@/src/utils/categories";
import { useRouter } from "expo-router";
import { searchStore } from "@/src/store/search.store";
import { Asset } from "@/src/interfaces/investments.interface";
import { TrendingAssetCardSkeleton } from "@/src/components/ui/skeleton";
import { useFetchTrendingAssets } from "@/src/hooks/discover/useFetchTrendingAssets";


const DiscoverScreen = () => {
  const router = useRouter();
  const { selectedCategories, handleCategoryPress, assets, loading } = useFilteredCategories();
  const { trendingAssets, isLoadingTrending, refreshControlProps } = useFetchTrendingAssets();
  const openSearchModal = searchStore((state) => state.openModal);

  const trendingTop3 = useMemo(() => trendingAssets?.slice(0, 3) ?? [], [trendingAssets]);
  const trendingRest = useMemo(() => trendingAssets?.slice(3) ?? [], [trendingAssets]);

  function normalizeCategory(raw: string): string {
    const trimmed = raw?.trim();
    if (!trimmed) return "Otra";
    const cat = getCategory(trimmed);
    return cat ? cat.name : trimmed;
  }

  const groupedByCategory = useMemo(() => {
    const groups = new Map<string, Asset[]>();
    for (const asset of trendingRest) {
      const category = normalizeCategory(asset.type || "");
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category)!.push(asset);
    }
    const ordered: { category: string; assets: Asset[] }[] = [];
    for (const cat of mockCategories) {
      const normalized = normalizeCategory(cat.name);
      if (groups.has(normalized)) {
        ordered.push({ category: normalized, assets: groups.get(normalized)! });
        groups.delete(normalized);
      }
    }
    for (const [category, remainingAssets] of groups) {
      ordered.push({ category, assets: remainingAssets });
    }
    return ordered;
  }, [trendingRest]);

  const handleAssetPress = (asset: Asset) => {
    router.push(`/(stack)/asset-detail/${asset.id}?source=discover-page` as import("expo-router").Href);
  };

  return (
    <SafeAreaView className="flex-1">
      <BackGroundGradient variant="discover" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl {...refreshControlProps} />}>
        <View className="pt-4">
          <SearchBar
            value=""
            onChangeText={() => { }}
            onFilterPress={() => ({})}
            onInputPress={openSearchModal}
          />
        </View>

        <View className="mb-6">
          <Text className="text-text-primary text-lg font-libre-regular mb-3 mx-4">
            Categorías
          </Text>
          <CategoryChips
            categories={mockCategories}
            selectedCategories={selectedCategories || []}
            onCategoryPress={handleCategoryPress}
          />
          {assets.length > 0 && (
            <Text className="text-text-primary text-base font-libre-bold mx-4 mt-2">
              Total de resultados: {assets.length}
            </Text>
          )}
        </View>

        {/* Trending Section — only visible when no category is selected */}
        {selectedCategories === null && (
          <View className="mb-6">
            <View className="flex-row items-center mx-4 mb-4">
              <Text className="text-text-primary text-lg font-libre-regular mr-1">
                En tendencia
              </Text>
              <InfoIcon width={18} height={18} color={Colors.orangePrimary} />
            </View>

            {isLoadingTrending ? (
              <View className="px-4">
                <View className="flex-row" style={{ height: 100, gap: 10 }}>
                  <View className="flex-1 bg-gray-200 rounded-2xl" />
                </View>
              </View>
            ) : (
              <TrendingCarousel
                assets={trendingTop3}
                onAssetPress={handleAssetPress}
              />
            )}

            {/* Category groups for remaining assets */}
            {groupedByCategory.map(({ category, assets: catAssets }) => {
              const bgColor = getCategoryBgColor(category);
              const textColor = getCategoryChipTextColor(category);
              const mockCat = mockCategories.find(
                (m) => normalizeCategory(m.name) === category
              );
              return (
                <View key={category} className="mt-6">
                  <View className="flex-row items-center mx-4 mb-3">
                    {mockCat ? (
                      mockCat.icon
                    ) : (() => {
                      const catTokens = getCategory(category);
                      const icon = catTokens?.icon;
                      return (
                        <View
                          className="size-8 items-center justify-center rounded-full mr-2"
                          style={{ backgroundColor: catTokens?.iconCircleBackground || bgColor }}
                        >
                          {icon && React.isValidElement(icon)
                            ? cloneElement(icon as React.ReactElement<{ width?: number; height?: number }>, {
                                width: 18,
                                height: 18,
                              })
                            : null}
                        </View>
                      );
                    })()}
                    <View
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: bgColor }}
                    >
                      <Text
                        className="text-sm font-libre-bold"
                        style={{ color: textColor }}
                      >
                        {category}
                      </Text>
                    </View>
                  </View>

                  <View className="flex gap-4">
                    {catAssets.map((asset) => (
                      <TrendingAssetCard
                        key={asset.id}
                        id={asset.id}
                        name={asset.name}
                        price={asset.pricePerToken}
                        bidsAvailable={asset.tokensAvailable}
                        riskLevel={getRiskLevel(asset.agreement?.riskLevel || 1)}
                        roi={asset.tir?.toString() || "0"}
                        imageUrl={asset.coverImageUrl || ""}
                        miniatureImageUrl={asset.miniatureImageUrl}
                        categoryType={asset.type}
                        onPress={() => handleAssetPress(asset)}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {selectedCategories !== null && assets.length === 0 && (
          <View className="m-4">
            <Text className="text-text-primary text-lg font-libre-regular">
              No hay resultados para esta categoría
            </Text>
          </View>

        )}

        {selectedCategories !== null && assets.length > 0 && (
          <View>
            <Text className="text-text-primary text-lg font-libre-regular mx-4 mb-4">
              Resultados
            </Text>
            {loading ? (
              <View className="flex gap-4">
                <TrendingAssetCardSkeleton />
                <TrendingAssetCardSkeleton />
                <TrendingAssetCardSkeleton />
              </View>
            ) : (
              <View className="flex gap-4">
                {assets?.map((asset: Asset) => (
                  <TrendingAssetCard
                    key={asset.id}
                    id={asset.id}
                    name={asset.name}
                    price={asset.pricePerToken}
                    bidsAvailable={asset.tokensAvailable}
                    riskLevel={getRiskLevel(asset.agreement?.riskLevel || 1)}
                    roi={asset.tir?.toString() || "0"}
                    imageUrl={asset.coverImageUrl || ""}
                    miniatureImageUrl={asset.miniatureImageUrl}
                    categoryType={asset.type}
                    onPress={() => handleAssetPress(asset)}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscoverScreen;
