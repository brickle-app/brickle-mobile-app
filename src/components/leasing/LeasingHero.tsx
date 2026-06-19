import { formatCurrency } from "@/src/utils/formatCurrency";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View, StyleSheet, ImageBackground, ImageSourcePropType } from "react-native";
import SimpleLogoSvg from "@/assets/logos/simple-logo-red.svg";
import { Colors } from "@/assets/Colors";

interface LeasingHeroProps {
  image?: ImageSourcePropType | null;
  roi: number;
  title: string;
  pricePerToken: number;
  theme: { mainColor: string; secondaryColor: string };
  /** Sin tokens: aspecto atenuado */
  soldOut?: boolean;
}

const badgeShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 3,
  elevation: 2,
};

const titleBlockShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 3,
};

const TOP_LINE_HEIGHT = 3;

export const LeasingHero = ({ image, roi, title, pricePerToken, theme, soldOut }: LeasingHeroProps) => {
  const heroHeight = 280;

  return (
    <View style={[styles.card, soldOut ? { opacity: 0.78 } : undefined]}>
      {/* Línea superior delgada del mismo color que la sección inferior */}
      <View
        style={[
          styles.topLine,
          { backgroundColor: theme.mainColor, height: TOP_LINE_HEIGHT },
        ]}
      />
      <View style={[styles.imageWrapper, { height: heroHeight }]}>
        <ImageBackground
          source={image || require("@/assets/images/default-assets/no-photo.png")}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.6)"]}
            style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
            pointerEvents="none"
          />
          <View
            style={[
              styles.roiBadge,
              { backgroundColor: theme.mainColor },
              badgeShadow,
            ]}
          >
            <Text className="text-white font-libre-bold text-sm">{roi}% E.A.</Text>
          </View>
        </ImageBackground>
      </View>
      {/* Badge Brickle: conectado a la línea superior, esquinas inferiores redondeadas */}
      <View style={styles.logoBadge}>
        <View
          style={[
            styles.logoBadgeInner,
            { backgroundColor: theme.mainColor },
            badgeShadow,
          ]}
        >
          <SimpleLogoSvg width={14} height={25} />
        </View>
      </View>
      <View style={[styles.titleBlock, { backgroundColor: theme.mainColor }, titleBlockShadow]}>
        <Text
          className="text-xl font-libre font-bold"
          style={{ color: Colors.white }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-sm font-libre-regular mt-1" style={{ color: "rgba(255,255,255,0.95)" }}>
          <Text className="font-libre-medium">{formatCurrency(pricePerToken)}</Text>
          <Text className="font-libre-regular"> por Brick</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
    width: "100%",
    position: "relative",
  },
  topLine: {
    width: "100%",
    alignSelf: "stretch",
  },
  imageWrapper: {
    overflow: "hidden",
  },
  roiBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  logoBadge: {
    position: "absolute",
    top: 0,
    right: 12,
    zIndex: 10,
  },
  logoBadgeInner: {
    paddingTop: TOP_LINE_HEIGHT + 8,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});