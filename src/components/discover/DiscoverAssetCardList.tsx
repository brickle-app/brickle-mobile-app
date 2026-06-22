import React from "react";
import { Text, View } from "react-native";
import TrendingAssetCard from "./TrendingAssetCard";
import { TrendingAssetCardSkeleton } from "@/src/components/ui/skeleton";
import { Asset } from "@/src/interfaces/investments.interface";
import { getRiskLevel } from "@/src/utils/riskLevel";

interface DiscoverAssetCardListProps {
  assets: Asset[];
  loading?: boolean;
  onAssetPress: (asset: Asset) => void;
}

export const DiscoverAssetCardList = ({ assets, loading = false, onAssetPress }: DiscoverAssetCardListProps) => {
  if (loading) {
    return (
      <View className="flex gap-4">
        <TrendingAssetCardSkeleton />
        <TrendingAssetCardSkeleton />
        <TrendingAssetCardSkeleton />
      </View>
    );
  }

  if (assets.length === 0) {
    return (
      <Text className="text-text-primary text-base font-libre-regular mx-4">
        No hay activos disponibles por el momento
      </Text>
    );
  }

  return (
    <View className="flex gap-4">
      {assets.map((asset) => (
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
          onPress={() => onAssetPress(asset)}
        />
      ))}
    </View>
  );
};
