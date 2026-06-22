import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TRENDING_CARD_RADIUS } from "./trendingAssetCardLayout";
import { TrendingAssetContent } from "./TrendingAssetContent";
import { TrendingAssetImage } from "./TrendingAssetImage";
import { cardShadow, trendingAssetCardStyles as styles } from "./TrendingAssetCard.styles";
import { TrendingAssetCardProps } from "./TrendingAssetCard.types";
import { getAssetCategoryColors, getDisplayImage, isSoldOut } from "./TrendingAssetCard.logic";

const TrendingAssetCard = ({
  id,
  name,
  price,
  bidsAvailable,
  riskLevel,
  roi,
  imageUrl,
  miniatureImageUrl,
  discoverImageUrl,
  categoryType = "",
  onPress,
  containerStyle,
}: TrendingAssetCardProps) => {
  const soldOut = isSoldOut(bidsAvailable);
  const displayImage = getDisplayImage(discoverImageUrl, miniatureImageUrl, imageUrl);
  const { background: categoryBg, foreground: categoryFg } = getAssetCategoryColors(categoryType);

  return (
    <TouchableOpacity
      className="relative mx-4 overflow-hidden rounded-2xl bg-white"
      style={[cardShadow, containerStyle]}
      onPress={() => onPress?.(id)}
      activeOpacity={0.8}
    >
      {soldOut ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, styles.soldOutScrim, { borderRadius: TRENDING_CARD_RADIUS }]}
        />
      ) : null}
      <View className="flex-row" pointerEvents="box-none" style={{ zIndex: 1 }}>
        <TrendingAssetImage displayImage={displayImage} borderColor={categoryBg} soldOut={soldOut} />
        <TrendingAssetContent
          name={name}
          price={price}
          bidsAvailable={bidsAvailable}
          riskLevel={riskLevel}
          roi={roi}
          soldOut={soldOut}
          categoryBg={categoryBg}
          categoryFg={categoryFg}
        />
      </View>
    </TouchableOpacity>
  );
};

export default TrendingAssetCard;
