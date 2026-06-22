import { StyleSheet } from "react-native";

export const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 3,
  elevation: 2,
};

export const trendingAssetCardStyles = StyleSheet.create({
  imageFrame: { overflow: "hidden" },
  imageInnerClip: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    alignSelf: "stretch",
    overflow: "hidden",
  },
  imageAndBadgeLayer: { flex: 1, minHeight: 0, minWidth: 0, position: "relative" },
  imageFill: { ...StyleSheet.absoluteFillObject },
  logoBadge: {
    position: "absolute",
    top: 0,
    left: 6,
    paddingHorizontal: 4,
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  contentColumn: { position: "relative" },
  contentFadedBlock: { flex: 1, minHeight: 0, justifyContent: "space-between" },
  soldOutScrim: { backgroundColor: "rgba(28, 54, 71, 0.06)" },
  soldOutPill: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  soldOutPillText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
});
