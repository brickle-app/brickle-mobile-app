import React from "react";
import { Image, View } from "react-native";
import SimpleLogoSvg from "@/assets/logos/simple-logo-red.svg";
import {
  TRENDING_CARD_RADIUS,
  TRENDING_IMAGE_BORDER_PX,
  TRENDING_IMAGE_FRAME_PX,
  TRENDING_INNER_LEFT_RADIUS_PX,
  TRENDING_LOGO_FLAG_BOTTOM_RADIUS_PX,
} from "./trendingAssetCardLayout";
import { trendingAssetCardStyles as styles } from "./TrendingAssetCard.styles";

interface TrendingAssetImageProps {
  displayImage: string;
  borderColor: string;
  soldOut: boolean;
}

export const TrendingAssetImage = ({ displayImage, borderColor, soldOut }: TrendingAssetImageProps) => (
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
            source={displayImage ? { uri: displayImage } : require("@/assets/images/default-assets/no-photo.png")}
            style={styles.imageFill}
            resizeMode="cover"
          />
          <View
            style={[
              styles.logoBadge,
              {
                backgroundColor: borderColor,
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
);
