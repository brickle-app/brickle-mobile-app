import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Asset } from "@/src/interfaces/investments.interface";
import { getAssetListState } from "./discoverScreen.logic";
import { DiscoverAssetCardList } from "./DiscoverAssetCardList";
import { DiscoveryCategoryChip } from "./DiscoveryCategoryChip";
import { mockCategories } from "@/src/data/mock-categories";
import { normalizeCategory } from "./discoverScreen.logic";

interface DiscoverCategoryResultsProps {
  assets: Asset[];
  loading: boolean;
  errorMessage: string | null;
  onAssetPress: (asset: Asset) => void;
  selectedCategories: string[] | null;
  onClearCategory?: () => void;
}

export const DiscoverCategoryResults = ({
  assets,
  loading,
  errorMessage,
  onAssetPress,
  selectedCategories,
  onClearCategory,
}: DiscoverCategoryResultsProps) => {
  const state = getAssetListState({ loading, assetsCount: assets.length, errorMessage });

  if (state === "error" || state === "empty") {
    const selectedCategory = selectedCategories?.[0] ?? null;
    const matchedCategory = selectedCategory
      ? mockCategories.find((c) => normalizeCategory(c.name) === normalizeCategory(selectedCategory))
      : null;

    return (
      <Animated.View entering={FadeInDown.duration(280)} className="items-center px-6 pt-10">
        {matchedCategory ? (
          <DiscoveryCategoryChip category={matchedCategory} className="mb-5" />
        ) : null}

        <Text className="text-text-primary text-lg font-libre-bold text-center mb-2">
          {state === "error"
            ? "No pudimos cargar los activos"
            : matchedCategory
              ? `No hay activos en ${matchedCategory.text}`
              : "No hay resultados para esta categoría"}
        </Text>

        <Text className="text-gray-500 text-sm font-libre-regular text-center leading-5 mb-6">
          {state === "error"
            ? errorMessage ?? "Intenta de nuevo más tarde."
            : "El filtro está activo, pero aún no tenemos activos disponibles para esta categoría. Prueba otra categoría o vuelve más tarde."}
        </Text>

        {onClearCategory ? (
          <TouchableOpacity
            onPress={onClearCategory}
            accessibilityRole="button"
            accessibilityLabel="Ver todas las categorías"
            className="rounded-full bg-blue-primary/10 px-5 py-2.5"
          >
            <Text className="font-libre-bold text-sm text-blue-primary">
              Ver todas las categorías
            </Text>
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <Text className="text-text-primary text-lg font-libre-regular mx-4 mb-4">Resultados</Text>
      <DiscoverAssetCardList assets={assets} loading={state === "loading"} onAssetPress={onAssetPress} />
    </Animated.View>
  );
};
