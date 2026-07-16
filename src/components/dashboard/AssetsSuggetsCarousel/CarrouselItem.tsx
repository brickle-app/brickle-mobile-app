import { View, Text, Image, TouchableOpacity, useWindowDimensions } from "react-native";
import React from "react";
import { Asset } from "@/src/interfaces/investments.interface";
import { getCategory, getCategoryBgColor } from "@/src/utils/categories";
import CATEGORIES from "@/src/utils/categories";
import { getAssetRiskLevel } from "@/src/utils/assetRiskLevel";
import { RiskLevelInline } from "@/src/components/ui/risk-level/AssetRiskLevel";
import { Colors } from "@/assets/Colors";
import {
  getSuggestedCardSize,
  SUGGESTED_CARD_IMAGE_HEIGHT_FRACTION,
} from "./suggestedCardLayout";

function categoryColor(type: string): string {
  const key = type?.trim() || "";
  if (!key) return Colors.violetSecondary;
  if (getCategory(key)) return getCategoryBgColor(key);
  const entry = Array.from(CATEGORIES.entries()).find(
    ([, c]) => c.name.toLowerCase() === key.toLowerCase()
  );
  return entry ? getCategoryBgColor(entry[0]) : Colors.violetSecondary;
}

interface CarrouselItemProps {
  asset?: Asset;
  onPress: (asset: Asset) => void;
  title?: string;
  image?: string;
  displayMiniature?: boolean;
  risk?: string;
  roi?: string;
}

function sanitizeSuggestedAssetTitle(rawTitle?: string): string {
  if (!rawTitle) return "Activo";

  // Elimina identificadores numéricos al final (ej: "Motoniveladora 20261304").
  const cleaned = rawTitle.replace(/\s+\d{4,}$/, "").trim();
  return cleaned || "Activo";
}

const CarrouselItem = ({
  asset,
  onPress,
  title,
  image,
  displayMiniature = false,
  risk,
  roi,
}: CarrouselItemProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardSize = getSuggestedCardSize(windowWidth);
  const imageHeight = Math.round(cardSize * SUGGESTED_CARD_IMAGE_HEIGHT_FRACTION);
  const textBlockHeight = cardSize - imageHeight;

  const displayTitle = sanitizeSuggestedAssetTitle(asset?.name || title);
  const riskLevel = getAssetRiskLevel(asset);
  const displayRoi = asset?.tir != null ? `${asset.tir}% E.A.` : roi || "0% E.A.";
  const displayImage = displayMiniature ? asset?.miniatureImageUrl : asset?.coverImageUrl || image;
  const overlayColor = asset?.type ? categoryColor(asset.type) : Colors.violetTertiary;

  return (
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation();
        onPress(asset as Asset);
      }}
      activeOpacity={0.8}
      style={{ width: cardSize, height: cardSize }}
    >
      <View
        className="flex flex-col overflow-hidden bg-primary-white"
        style={{
          width: cardSize,
          height: cardSize,
          borderRadius: 18,
          elevation: 0,
        }}
      >
        <View style={{ width: "100%", height: imageHeight }} className="relative overflow-hidden">
          {displayImage ? (
            <Image
              className="w-full h-full absolute inset-0"
              source={{ uri: displayImage }}
              defaultSource={require("@/assets/images/default-assets/portatil.png")}
              resizeMode="cover"
            />
          ) : (
            <Image
              className="w-full h-full absolute inset-0"
              source={require("@/assets/images/default-assets/portatil.png")}
              resizeMode="cover"
            />
          )}
        </View>
        <View
          className="flex w-full flex-col justify-center px-3 py-2"
          style={{ height: textBlockHeight, backgroundColor: overlayColor }}
        >
          <Text className="font-libre-bold text-sm text-white" numberOfLines={2}>
            {displayTitle}
          </Text>
          <View className="mt-0.5">
            <RiskLevelInline
              level={riskLevel.level}
              prefix="Riesgo "
              iconSize={11}
              textClassName="font-libre-regular text-xs leading-tight text-white"
            />
          </View>
          <Text className="mt-1 font-libre-bold text-xs" style={{ color: Colors.walletIconGreen }}>
            {displayRoi}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CarrouselItem;
