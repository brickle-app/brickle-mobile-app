import {
  StyleSheet,
  ViewStyle,
  StyleProp,
  Text,
  View,
  Animated,
  TouchableWithoutFeedback,
  useAnimatedValue,
} from "react-native";
import { useState, useEffect, ReactNode } from "react";

import Thumb from "@/assets/icons/SVG/Thumb.svg";
import { Colors } from "@/assets/Colors";

/** Debe coincidir con el ancho/alto real del thumb en píxeles (sin depender del padding del track). */
const THUMB_SIZE = 32;

interface SwitchProps {
  rate: string;
  value: { value: boolean };
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  trackColors?: { on: string; off: string };
  /** Icono opcional a la izquierda dentro del track (ej. icono de gráfica) */
  leftIcon?: ReactNode;
  /** Color del texto del porcentaje (ej. blanco cuando el track es oscuro) */
  rateTextColor?: string;
}

// Custom hook for animated values

export const CustomSwitch = ({
  rate,
  value,
  onPress,
  style,
  duration = 200,
  trackColors = { on: Colors.greenPrimary, off: Colors.greenSecondary },
  leftIcon,
  rateTextColor,
}: SwitchProps) => {
  // Animation values
  const translateX = useAnimatedValue(0);
  const bgColor = useAnimatedValue(value.value ? 1 : 0);

  // Track element measurements
  const [trackWidth, setTrackWidth] = useState(0);
  const rateParsed = Number.isFinite(Number.parseFloat(rate))
    ? Number.parseFloat(rate).toFixed(2)
    : "0.00";
  const rateLabel = `${rateParsed}%`;
  const thumbReserve = THUMB_SIZE + 4;
  const horizontalPad = 12;
  const minTrackWidth = 102;
  const maxTrackWidth = 168;
  const estimatedTextWidth = Math.ceil(rateLabel.length * 9);
  const computedTrackWidth = Math.min(
    maxTrackWidth,
    Math.max(minTrackWidth, estimatedTextWidth + thumbReserve + horizontalPad)
  );

  const maxThumbTravel =
    trackWidth > 0 ? Math.max(0, trackWidth - THUMB_SIZE) : 0;

  // Update animation when value changes
  useEffect(() => {
    const newPosition = value.value ? maxThumbTravel : 0;

    // Animate the position
    Animated.timing(translateX, {
      toValue: newPosition,
      duration,
      useNativeDriver: true,
    }).start();

    // Animate the background color
    Animated.timing(bgColor, {
      toValue: value.value ? 1 : 0,
      duration,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.value, maxThumbTravel]);

  // Handle track measurements
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth(width);

    const travel = Math.max(0, width - THUMB_SIZE);
    translateX.setValue(value.value ? travel : 0);
  };

  // Interpolate background color
  const backgroundColor = bgColor.interpolate({
    inputRange: [0, 1],
    outputRange: [trackColors.off, trackColors.on],
  });

  const rateColor = rateTextColor ?? Colors.bluePrimary;
  const trackStyle = [
    styles.track,
    leftIcon
      ? [styles.trackWithIcon, { minWidth: Math.max(124, computedTrackWidth + 16) }]
      : { width: computedTrackWidth },
  ];

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onPress}>
        <Animated.View
          style={[
            trackStyle,
            style,
            { backgroundColor },
            {
              borderRadius: THUMB_SIZE / 2,
              overflow: "hidden",
            },
          ]}
          onLayout={handleLayout}
        >
          {leftIcon ? (
            <View style={styles.leftIconWrap} pointerEvents="none">
              {leftIcon}
            </View>
          ) : null}
          {value.value && (
            <View
              style={[
                styles.rateTextSlot,
                leftIcon ? styles.rateTextSlotOnWithIcon : styles.rateTextSlotOn,
              ]}
              pointerEvents="none"
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                style={[styles.rateText, { color: rateColor }]}
              >
                {rateLabel}
              </Text>
            </View>
          )}

          <Animated.View
            style={[
              styles.thumb,
              {
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                transform: [{ translateX }],
                borderRadius: THUMB_SIZE / 2,
              },
            ]}
            collapsable={false}
          >
            <Thumb width={THUMB_SIZE - 2} height={THUMB_SIZE - 2} />
          </Animated.View>

          {!value.value && (
            <View
              style={[
                styles.rateTextSlot,
                leftIcon
                  ? styles.rateTextSlotOffWithIcon
                  : styles.rateTextSlotOff,
              ]}
              pointerEvents="none"
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                style={[styles.rateText, { color: rateColor }]}
              >
                {rateLabel}
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  /** Sin flex center: el thumb va absolute en x=0 y solo translateX lo mueve a los extremos */
  track: {
    height: THUMB_SIZE,
    position: "relative",
  },
  trackWithIcon: {
    minWidth: 118,
    paddingLeft: 28,
  },
  leftIconWrap: {
    position: "absolute",
    left: 6,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 0,
  },
  rateTextSlot: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 0,
  },
  /** Thumb a la derecha: el % queda a la izquierda del thumb */
  rateTextSlotOn: {
    left: 6,
    right: THUMB_SIZE + 2,
  },
  rateTextSlotOff: {
    left: THUMB_SIZE + 2,
    right: 6,
  },
  rateTextSlotOnWithIcon: {
    left: 28,
    right: THUMB_SIZE + 2,
  },
  rateTextSlotOffWithIcon: {
    left: THUMB_SIZE + 2,
    right: 8,
  },
  rateText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  thumb: {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
