import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { Colors } from "@/assets/Colors";

interface HeaderAssetsCardProps {
  title: string;
  value: string;
  pricePerToken: number;
  roi: number;
  icon: React.ReactNode;
  colorIconBg: string;
  /** Si se define, el SVG del icono usa este color (paleta categoría). */
  iconGlyphColor?: string;
  showClaimableWarning?: boolean;
  onPress?: () => void;
}

const CLAIM_CARD_MAX_W = 360;
const ICON_SIZE_CLAIM = 72;
const ICON_GLYPH = 40;

export const HeaderAssetsCard = ({
  title,
  value,
  pricePerToken,
  roi,
  icon,
  colorIconBg,
  iconGlyphColor,
  showClaimableWarning,
  onPress,
}: HeaderAssetsCardProps) => {
  const iconNode =
    iconGlyphColor && React.isValidElement(icon)
      ? React.cloneElement(icon as React.ReactElement<{ color?: string; width?: number; height?: number }>, {
          color: iconGlyphColor,
          width: showClaimableWarning ? ICON_GLYPH : 44,
          height: showClaimableWarning ? ICON_GLYPH : 44,
        })
      : icon;

  const titleText =
    title.length > 28 && !showClaimableWarning ? `${title.slice(0, 28)}…` : title;

  const ClaimableLayout = () => (
    <View style={styles.containerClaim}>
      <View className="w-full flex-row items-stretch gap-3">
        <View
          className="shrink-0 items-center justify-center rounded-full"
          style={{
            width: ICON_SIZE_CLAIM,
            height: ICON_SIZE_CLAIM,
            backgroundColor: colorIconBg,
          }}
        >
          {iconNode}
        </View>

        <View className="min-w-0 flex-1 justify-center py-0.5 pr-1">
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="text-base font-libre-bold text-text-primary leading-tight"
          >
            {title}
          </Text>
          <Text className="mt-1 text-sm text-icons-primary">Bricks</Text>
          <Text className="mt-0.5 font-libre-bold text-sm text-text-primary">
            {value}{" "}
            <Text className="font-libre-bold text-sm text-text-primary">
              ({formatCurrency(pricePerToken)})
            </Text>
          </Text>
        </View>

        <View className="shrink-0 justify-between items-end py-0.5 pl-1" style={{ minWidth: 100 }}>
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: Colors.orangePrimary }}
          >
            <Text className="text-center text-[10px] font-libre-bold text-white">
              Reclamar renta
            </Text>
          </View>
          <View
            className="mt-2 rounded-md px-2 py-1"
            style={{ backgroundColor: Colors.greenPrimary }}
          >
            <Text
              className="text-center text-[10px] font-libre-bold"
              style={{ color: Colors.bluePrimary }}
            >
              {Number.isFinite(Number(roi)) ? Number(roi).toFixed(1) : String(roi)}% E.A.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const DefaultLayout = () => (
    <View style={styles.container}>
      <View className="flex w-full flex-row items-center justify-center gap-4">
        <View
          className="flex size-[80px] items-center justify-center rounded-full"
          style={{ backgroundColor: colorIconBg }}
        >
          {iconNode}
        </View>

        <View className="relative min-w-0 flex-1 flex-col items-start justify-center gap-2 pr-1">
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-sm font-libre-bold text-text-primary"
          >
            {titleText}
          </Text>
          <View className="w-full flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Text className="text-sm text-icons-primary">Bricks</Text>
              <View className="flex flex-row flex-wrap items-baseline gap-x-1">
                <Text className="text-sm font-libre-bold text-text-primary">{value}</Text>
                <Text className="text-sm font-libre-bold text-text-primary">
                  ({formatCurrency(pricePerToken)})
                </Text>
              </View>
            </View>

            <View className="h-[25px] w-[75px] shrink-0 items-center justify-center rounded bg-green-primary px-1">
              <Text className="text-[10px] font-libre-bold">
                {String(roi)}% E.A.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const CardContent = () =>
    showClaimableWarning ? <ClaimableLayout /> : <DefaultLayout />;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalles de ${title}, ROI ${roi}%`}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const shadowIos: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 5,
};

const claimCardPlatformStyle = Platform.select<ViewStyle>({
  ios: shadowIos,
  android: { elevation: 4 },
});

const styles = StyleSheet.create({
  containerClaim: {
    width: "100%",
    maxWidth: CLAIM_CARD_MAX_W,
    alignSelf: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...claimCardPlatformStyle,
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 320,
    minHeight: 120,
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
