import React from "react";
import { Text, View } from "react-native";
import { Asset } from "@/src/interfaces/investments.interface";
import { getAssetListState } from "./discoverScreen.logic";
import { DiscoverAssetCardList } from "./DiscoverAssetCardList";

interface DiscoverCategoryResultsProps {
  assets: Asset[];
  loading: boolean;
  errorMessage: string | null;
  onAssetPress: (asset: Asset) => void;
}

export const DiscoverCategoryResults = ({
  assets,
  loading,
  errorMessage,
  onAssetPress,
}: DiscoverCategoryResultsProps) => {
  const state = getAssetListState({ loading, assetsCount: assets.length, errorMessage });

  if (state === "error" || state === "empty") {
    return (
      <View className="m-4">
        <Text className="text-text-primary text-lg font-libre-regular">
          {state === "error" ? errorMessage : "No hay resultados para esta categoría"}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text className="text-text-primary text-lg font-libre-regular mx-4 mb-4">Resultados</Text>
      <DiscoverAssetCardList assets={assets} loading={state === "loading"} onAssetPress={onAssetPress} />
    </View>
  );
};
