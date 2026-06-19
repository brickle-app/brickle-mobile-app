import { View, StyleSheet } from "react-native";
import React, { useRef, useEffect, useState, useCallback } from "react";
import PagerView from "react-native-pager-view";
import TrendingAssetCard from "./TrendingAssetCard";
import { Asset } from "@/src/interfaces/investments.interface";
import { getRiskLevel } from "@/src/utils/riskLevel";
import { Colors } from "@/assets/Colors";

interface TrendingCarouselProps {
  assets?: Asset[];
  onAssetPress: (asset: Asset) => void;
}

const AUTO_SCROLL_INTERVAL = 3000;

const TrendingCarousel = ({ assets = [], onAssetPress }: TrendingCarouselProps) => {
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalPages = assets.length;

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
    setCurrentPage(e.nativeEvent.position);
    startAutoScroll();
  };

  if (totalPages === 0) return null;

  return (
    <View style={{ width: "100%" }}>
      <View style={styles.wrapper}>
        <PagerView
          ref={pagerRef}
          style={styles.container}
          initialPage={0}
          scrollEnabled={true}
          onPageSelected={handlePageSelected}
        >
          {assets.map((asset, index) => (
            <View style={styles.page} key={`trending-page-${index}`}>
              <TrendingAssetCard
                id={asset.id}
                name={asset.name}
                price={asset.pricePerToken}
                bidsAvailable={asset.tokensAvailable}
                riskLevel={getRiskLevel(asset.agreement?.riskLevel || 1)}
                roi={asset.tir?.toString() || "0"}
                imageUrl={asset.coverImageUrl || ""}
                miniatureImageUrl={asset.miniatureImageUrl}
                discoverImageUrl={asset.discoverImageUrl}
                categoryType={asset.type}
                onPress={() => onAssetPress(asset)}
                containerStyle={{ marginHorizontal: 0 }}
              />
            </View>
          ))}
        </PagerView>
      </View>

      {totalPages > 1 && (
        <View style={styles.dotsContainer}>
          {assets.map((_, i) => (
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

export default TrendingCarousel;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 120,
  },
  container: {
    flex: 1,
  },
  page: {
    width: "100%",
    justifyContent: "center",
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
