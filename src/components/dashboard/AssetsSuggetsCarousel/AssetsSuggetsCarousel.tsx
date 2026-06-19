import { View, StyleSheet, useWindowDimensions } from "react-native";
import React, { useRef, useEffect, useState, useCallback } from "react";
import PagerView from "react-native-pager-view";
import CarrouselItem from "./CarrouselItem";
import { Asset } from "@/src/interfaces/investments.interface";
import { getSuggestedCardSize, SUGGESTED_CARD_GAP } from "./suggestedCardLayout";
import { Colors } from "@/assets/Colors";

interface AssetsSuggestCarouselProps {
  assets?: Asset[];
  onAssetPress: (asset: Asset) => void;
}

const AUTO_SCROLL_INTERVAL = 3000; // ms between slides

const AssetsSuggestCarousel = ({ assets, onAssetPress }: AssetsSuggestCarouselProps) => {
  const { width: windowWidth } = useWindowDimensions();
  const rowHeight = getSuggestedCardSize(windowWidth);
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build pages: 2 assets per page
  const effectiveAssets: Asset[] = (assets && assets.length > 0)
    ? assets
    : [{
        id: 'dummy',
        name: 'Portátiles HP',
        tir: 9.2,
        agreement: { riskLevel: 4 },
        coverImageUrl: null,
      } as Asset];

  const pages: Asset[][] = [];
  for (let i = 0; i < effectiveAssets.length; i += 2) {
    pages.push(effectiveAssets.slice(i, i + 2));
  }
  const totalPages = pages.length;

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (totalPages <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrentPage((prev) => {
        const next = (prev + 1) % totalPages;
        pagerRef.current?.setPage(next);
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
  }, [totalPages]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoScroll]);

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    const newPage = e.nativeEvent.position;
    setCurrentPage(newPage);
    // Restart timer after manual swipe
    startAutoScroll();
  };

  return (
    <View style={{ width: "100%" }} className="mb-10">
      {/* PagerView */}
      <View style={[styles.wrapper, { height: rowHeight }]}>
        <PagerView
          ref={pagerRef}
          style={styles.container}
          initialPage={0}
          scrollEnabled={true}
          onPageSelected={handlePageSelected}
        >
          {pages.map((pageAssets, pageIndex) => (
            <View style={styles.page} key={`page-${pageIndex}`}>
              {pageAssets.map((asset, assetIndex) => (
                <CarrouselItem
                  key={`${pageIndex}-${assetIndex}-${asset.id}`}
                  asset={asset}
                  displayMiniature={true}
                  onPress={onAssetPress}
                />
              ))}
            </View>
          ))}
        </PagerView>
      </View>

      {/* Dot indicators */}
      {totalPages > 1 && (
        <View style={styles.dotsContainer}>
          {pages.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentPage ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default AssetsSuggestCarousel;

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
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  dot: {
    borderRadius: 99,
    height: 6,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.bluePrimary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: "#C0C0C0",
  },
});

