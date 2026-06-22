import React, { useCallback, useMemo } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import SearchBar from "@/src/components/discover/SearchBar";
import CategoryChips from "@/src/components/discover/CategoryChips";
import { DiscoverCategoryResults } from "@/src/components/discover/DiscoverCategoryResults";
import { DiscoverTrendingSection } from "@/src/components/discover/DiscoverTrendingSection";
import { mockCategories } from "@/src/data/mock-categories";
import { useFilteredCategories } from "@/src/hooks/discover/useFilteredCategories";
import { useFetchTrendingAssets } from "@/src/hooks/discover/useFetchTrendingAssets";
import { Asset } from "@/src/interfaces/investments.interface";
import { searchStore } from "@/src/store/search.store";

const DiscoverScreen = () => {
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const openSearchModal = searchStore((state) => state.openModal);
  const { selectedCategories, handleCategoryPress, assets, loading, errorMessage } = useFilteredCategories();
  const {
    trendingAssets,
    isLoadingTrending,
    refreshControlProps,
    trendingErrorMessage,
  } = useFetchTrendingAssets();

  const trendingTop3 = useMemo(() => trendingAssets?.slice(0, 3) ?? [], [trendingAssets]);
  const trendingRest = useMemo(() => trendingAssets?.slice(3) ?? [], [trendingAssets]);

  const handleAssetPress = useCallback(
    (asset: Asset) => {
      router.push(`/(stack)/asset-detail/${asset.id}?source=discover-page` as import("expo-router").Href);
    },
    [router]
  );

  const handleClearCategory = useCallback(() => {
    handleCategoryPress(null);
  }, [handleCategoryPress]);

  return (
    <SafeAreaView className="flex-1">
      <BackGroundGradient variant="discover" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomTabBarHeight + 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl {...refreshControlProps} />}
      >
        <View className="pt-4">
          <SearchBar value="" onChangeText={() => {}} onFilterPress={() => ({})} onInputPress={openSearchModal} />
        </View>

        <View className="mb-6">
          <Text className="text-text-primary text-lg font-libre-regular mb-3 mx-4">Categorías</Text>
          <CategoryChips
            categories={mockCategories}
            selectedCategories={selectedCategories || []}
            onCategoryPress={handleCategoryPress}
          />
          {selectedCategories !== null && assets.length > 0 && (
            <Text className="text-text-primary text-base font-libre-bold mx-4 mt-2">
              Total de resultados: {assets.length}
            </Text>
          )}
        </View>

        {selectedCategories === null ? (
          <DiscoverTrendingSection
            topAssets={trendingTop3}
            restAssets={trendingRest}
            loading={isLoadingTrending}
            errorMessage={trendingErrorMessage}
            onAssetPress={handleAssetPress}
          />
        ) : (
          <DiscoverCategoryResults
            assets={assets}
            loading={loading}
            errorMessage={errorMessage}
            onAssetPress={handleAssetPress}
            selectedCategories={selectedCategories}
            onClearCategory={handleClearCategory}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscoverScreen;
