import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import PagerView from "react-native-pager-view";
import { CarouselItemSkeleton } from "./CarouselItemSkeleton";
import { getSuggestedCardSize, SUGGESTED_CARD_GAP } from "@/src/components/dashboard/AssetsSuggetsCarousel/suggestedCardLayout";

export const AssetsSuggestCarouselSkeleton = () => {
  const { width } = useWindowDimensions();
  const rowHeight = getSuggestedCardSize(width);

  return (
    <View style={[styles.wrapper, { height: rowHeight }]} className="mb-10 w-full bg-transparent">
      <PagerView style={styles.container} initialPage={0} scrollEnabled={false}>
        <View style={styles.page} key="skeleton-1">
          <CarouselItemSkeleton />
          <CarouselItemSkeleton />
        </View>
        <View style={styles.page} key="skeleton-2">
          <CarouselItemSkeleton />
          <CarouselItemSkeleton />
        </View>
        <View style={styles.page} key="skeleton-3">
          <CarouselItemSkeleton />
          <CarouselItemSkeleton />
        </View>
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  container: {
    flex: 1,
  },
  page: {
    flexDirection: "row",
    width: "100%",
    gap: SUGGESTED_CARD_GAP,
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
});