import React from "react";
import { View } from "react-native";
import { Skeleton } from "./Skeleton";
import {
  TRENDING_CARD_RADIUS,
  TRENDING_IMAGE_BORDER_PX,
  TRENDING_IMAGE_FRAME_PX,
  TRENDING_INNER_IMAGE_PX,
  TRENDING_INNER_LEFT_RADIUS_PX,
} from "@/src/components/discover/trendingAssetCardLayout";
import { Colors } from "@/assets/Colors";

export const TrendingAssetCardSkeleton = () => {
  return (
    <View className="mx-4 overflow-hidden rounded-2xl bg-primary-white shadow-sm">
      <View className="flex-row">
        <View
          style={{
            width: TRENDING_IMAGE_FRAME_PX,
            height: TRENDING_IMAGE_FRAME_PX,
            padding: TRENDING_IMAGE_BORDER_PX,
            borderTopLeftRadius: TRENDING_CARD_RADIUS,
            borderBottomLeftRadius: TRENDING_CARD_RADIUS,
            backgroundColor: Colors.violetSecondary,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: TRENDING_INNER_IMAGE_PX,
              height: TRENDING_INNER_IMAGE_PX,
              borderTopLeftRadius: TRENDING_INNER_LEFT_RADIUS_PX,
              borderBottomLeftRadius: TRENDING_INNER_LEFT_RADIUS_PX,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              overflow: "hidden",
            }}
          >
            <Skeleton width="100%" height="100%" borderRadius={0} />
          </View>
        </View>
        <View className="flex-1 px-2.5 py-2">
          <Skeleton width="85%" height={14} className="mb-1.5" />
          <Skeleton width="55%" height={14} className="mb-1" />
          <Skeleton width="45%" height={11} className="mb-1.5" />
          <View className="mt-1 flex-row items-center justify-between">
            <Skeleton width="35%" height={11} />
            <Skeleton width={52} height={20} borderRadius={999} />
          </View>
        </View>
      </View>
    </View>
  );
};