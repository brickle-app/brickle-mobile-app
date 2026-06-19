import React from "react";
import { View, useWindowDimensions } from "react-native";
import { Skeleton } from "./Skeleton";
import {
  getSuggestedCardSize,
  SUGGESTED_CARD_IMAGE_HEIGHT_FRACTION,
} from "@/src/components/dashboard/AssetsSuggetsCarousel/suggestedCardLayout";
import { Colors } from "@/assets/Colors";

export const CarouselItemSkeleton = () => {
  const { width } = useWindowDimensions();
  const size = getSuggestedCardSize(width);
  const imageHeight = Math.round(size * SUGGESTED_CARD_IMAGE_HEIGHT_FRACTION);
  const textBlockHeight = size - imageHeight;

  return (
    <View
      className="flex flex-col overflow-hidden bg-primary-white"
      style={{ width: size, height: size, borderRadius: 18, elevation: 0 }}
    >
      <View className="relative w-full overflow-hidden" style={{ height: imageHeight }}>
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </View>
      <View
        className="flex w-full flex-col justify-center px-3 py-2"
        style={{ height: textBlockHeight, backgroundColor: Colors.violetSecondary }}
      >
        <Skeleton width="85%" height={12} borderRadius={4} />
        <Skeleton width="55%" height={10} borderRadius={4} className="mt-2" />
        <Skeleton width={48} height={10} borderRadius={4} className="mt-2" />
      </View>
    </View>
  );
};