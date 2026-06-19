import React from "react";
import { View, StyleSheet, Platform, type ViewStyle } from "react-native";
import { Skeleton } from "./Skeleton";
import { Colors } from "@/assets/Colors";

const CLAIM_MAX_W = 360;

interface HeaderAssetsCardSkeletonProps {
  variant?: "default" | "claimable";
}

export const HeaderAssetsCardSkeleton = ({
  variant = "default",
}: HeaderAssetsCardSkeletonProps) => {
  if (variant === "claimable") {
    return (
      <View style={styles.claimableOuter}>
        <View className="w-full flex-row items-stretch gap-3">
          <Skeleton width={72} height={72} borderRadius={36} />
          <View className="min-w-0 flex-1 justify-center gap-2 py-1">
            <Skeleton width="85%" height={16} borderRadius={4} />
            <Skeleton width={48} height={12} borderRadius={4} />
            <View className="flex-row items-center gap-2">
              <Skeleton width={36} height={14} borderRadius={4} />
              <Skeleton width={88} height={14} borderRadius={4} />
            </View>
          </View>
          <View className="shrink-0 justify-between items-end py-1" style={{ width: 100 }}>
            <Skeleton width={96} height={28} borderRadius={999} />
            <Skeleton width={72} height={24} borderRadius={6} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View className="w-full flex-row items-center gap-3 px-1">
        <Skeleton width={80} height={80} borderRadius={40} />
        <View className="min-w-0 flex-1 flex-col justify-center gap-2">
          <Skeleton width="88%" height={14} borderRadius={4} />
          <View className="w-full flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Skeleton width={44} height={12} borderRadius={4} className="mb-1" />
              <View className="flex-row items-center gap-2">
                <Skeleton width={36} height={14} borderRadius={4} />
                <Skeleton width={72} height={14} borderRadius={4} />
              </View>
            </View>
            <Skeleton width={75} height={25} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );
};

const shadowIos: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 5,
};

const claimableOuterPlatform = Platform.select<ViewStyle>({
  ios: shadowIos,
  android: { elevation: 4 },
});

const defaultCardPlatform = Platform.select<ViewStyle>({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  android: { elevation: 4 },
});

const styles = StyleSheet.create({
  claimableOuter: {
    width: "100%",
    maxWidth: CLAIM_MAX_W,
    alignSelf: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...claimableOuterPlatform,
  },
  container: {
    width: "100%",
    alignSelf: "stretch",
    minHeight: 120,
    marginBottom: 12,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...defaultCardPlatform,
  },
});
