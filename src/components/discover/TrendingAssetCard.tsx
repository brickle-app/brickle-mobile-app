import { View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import React from "react";
import { Colors } from "@/assets/Colors";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { getCategory, getCategoryBgColor, getCategoryChipTextColor } from "@/src/utils/categories";
import CATEGORIES from "@/src/utils/categories";
import SimpleLogoSvg from "@/assets/logos/simple-logo-red.svg";
import { RiskLevelInline } from "@/src/components/ui/risk-level/AssetRiskLevel";
import {
  TRENDING_CARD_RADIUS,
  TRENDING_IMAGE_BORDER_PX,
  TRENDING_IMAGE_FRAME_PX,
  TRENDING_INNER_LEFT_RADIUS_PX,
  TRENDING_LOGO_FLAG_BOTTOM_RADIUS_PX,
} from "@/src/components/discover/trendingAssetCardLayout";

function categoryBorderColor(type: string): string {
  const key = type?.trim() || "";
  if (!key) return Colors.violetSecondary;
  if (getCategory(key)) return getCategoryBgColor(key);
  const entry = Array.from(CATEGORIES.entries()).find(
    ([, c]) => c.name.toLowerCase() === key.toLowerCase()
  );
  return entry ? getCategoryBgColor(entry[0]) : Colors.violetSecondary;
}

/** Texto sobre el color de categoría (chip / pill). */
function categoryAccentForeground(type: string): string {
  const key = type?.trim() || "";
  if (getCategory(key)) return getCategoryChipTextColor(key);
  const entry = Array.from(CATEGORIES.entries()).find(
    ([, c]) => c.name.toLowerCase() === key.toLowerCase()
  );
  return entry ? getCategoryChipTextColor(entry[0]) : Colors.white;
}

interface TrendingAssetCardProps {
  id: string;
  name: string;
  price: number;
  bidsAvailable: number;
  riskLevel: { level: string; color: string };
  roi: string;
  imageUrl: string;
  miniatureImageUrl?: string | null;
  discoverImageUrl?: string | null;
  categoryType?: string;
  isNew?: boolean;
  onPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
  containerStyle?: ViewStyle;
}

function isSoldOut(bidsAvailable: number): boolean {
  const n = Number(bidsAvailable);
  if (!Number.isFinite(n)) return true;
  return n <= 0;
}

const TrendingAssetCard: React.FC<TrendingAssetCardProps> = ({
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
}) => {
  const soldOut = isSoldOut(bidsAvailable);
  const displayImage = discoverImageUrl || miniatureImageUrl || imageUrl;
  const categoryBg = categoryBorderColor(categoryType);
  const categoryFg = categoryAccentForeground(categoryType);
  const borderColor = categoryBg;

  const thinShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  };

  return (
    <TouchableOpacity
      className="relative mx-4 overflow-hidden rounded-2xl bg-white"
      style={[thinShadow, containerStyle]}
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
        {/* Marco 4pt + foto: atenúa si agotado; chip “Agotado” va aparte para mantener color */}
        <View style={soldOut ? { opacity: 0.48 } : undefined}>
          <View
            style={[
              styles.imageFrame,
              {
                width: TRENDING_IMAGE_FRAME_PX,
                height: TRENDING_IMAGE_FRAME_PX,
                padding: TRENDING_IMAGE_BORDER_PX,
                backgroundColor: borderColor,
                borderTopLeftRadius: TRENDING_CARD_RADIUS,
                borderBottomLeftRadius: TRENDING_CARD_RADIUS,
              },
            ]}
          >
          <View
            style={[
              styles.imageInnerClip,
              {
                borderTopLeftRadius: TRENDING_INNER_LEFT_RADIUS_PX,
                borderBottomLeftRadius: TRENDING_INNER_LEFT_RADIUS_PX,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              },
            ]}
          >
            <View style={styles.imageAndBadgeLayer}>
              <Image
                source={
                  displayImage && displayImage.length > 0
                    ? { uri: displayImage }
                    : require("@/assets/images/default-assets/no-photo.png")
                }
                style={styles.imageFill}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.logoBadge,
                  {
                    backgroundColor: borderColor,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: TRENDING_LOGO_FLAG_BOTTOM_RADIUS_PX,
                    borderBottomRightRadius: TRENDING_LOGO_FLAG_BOTTOM_RADIUS_PX,
                  },
                ]}
              >
                <SimpleLogoSvg width={12} height={21} />
              </View>
            </View>
          </View>
          </View>
        </View>
        <View className="flex-1 justify-between px-2.5 py-2" style={styles.contentColumn}>
          <View
            style={[
              styles.contentFadedBlock,
              soldOut ? { opacity: 0.48 } : undefined,
            ]}
          >
            <View style={soldOut ? { paddingTop: 30 } : undefined}>
              <Text
                className="text-text-primary font-libre-bold text-sm leading-tight"
                style={{ marginBottom: 4 }}
                numberOfLines={2}
              >
                {name}
              </Text>
              <Text className="text-text-primary font-libre-medium text-sm leading-tight">
                {formatCurrency(price)}{" "}
                <Text className="text-secondary font-libre-regular text-xs">por Brick</Text>
              </Text>
              <Text className="mt-0.5 text-[11px] font-libre-regular leading-tight text-secondary">
                {soldOut ? "Sin Bricks disponibles" : `${bidsAvailable} Bricks disponibles`}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center justify-between">
            <RiskLevelInline
              level={riskLevel.level}
              prefix="Riesgo "
              iconSize={12}
              textClassName="text-[11px] font-libre-regular leading-tight text-secondary"
            />
              <View
                className="rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: soldOut ? "rgba(28, 54, 71, 0.1)" : borderColor,
                }}
              >
                <Text
                  className="text-[11px] font-libre-bold"
                  style={{
                    color: soldOut ? "rgba(28, 54, 71, 0.55)" : categoryFg,
                  }}
                >
                  {roi}% E.A.
                </Text>
              </View>
            </View>
          </View>
          {soldOut ? (
            <View
              style={[
                styles.soldOutPill,
                {
                  backgroundColor: categoryBg,
                  borderColor: "rgba(0,0,0,0.12)",
                },
              ]}
              accessibilityRole="text"
              accessibilityLabel="Activo agotado"
            >
              <Text style={[styles.soldOutPillText, { color: categoryFg }]}>Agotado</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageFrame: {
    overflow: "hidden",
  },
  imageInnerClip: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    alignSelf: "stretch",
    overflow: "hidden",
  },
  imageAndBadgeLayer: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    position: "relative",
  },
  imageFill: {
    ...StyleSheet.absoluteFillObject,
  },
  logoBadge: {
    position: "absolute",
    top: 0,
    left: 6,
    paddingHorizontal: 4,
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  contentColumn: {
    position: "relative",
  },
  contentFadedBlock: {
    flex: 1,
    minHeight: 0,
    justifyContent: "space-between",
  },
  /** Velo ligero con tinte navy (marca), sin bloquear el chip */
  soldOutScrim: {
    backgroundColor: "rgba(28, 54, 71, 0.06)",
  },
  /** Chip alineado con badges ROI / tipografía Brickle */
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
  soldOutPillText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});

export default TrendingAssetCard;
