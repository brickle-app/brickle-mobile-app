import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";

const INITIAL_HEIGHT = 130;
/** Finger travel needed to arm the purchase. */
const TRAVEL = 260;
const COMPLETION_THRESHOLD = 0.8;
const FLICK_VELOCITY = -700;
const TOP_CORNER_RADIUS = 40;

interface SwipeToPurchaseBottomSheetProps {
  /** Fired the moment the swipe is released past the threshold. */
  onPurchaseTrigger: () => void;
  /** Fired when the sheet has finished expanding to full screen, so the caller can start processing. */
  onExpandComplete?: () => void;
  disabled?: boolean;
  modalHeight?: number;
}

const lightImpact = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
const armImpact = (armed: boolean) =>
  Haptics.impactAsync(armed ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});

export const SwipeToPurchaseBottomSheet = ({
  onPurchaseTrigger,
  onExpandComplete,
  disabled = false,
  modalHeight = 400,
}: SwipeToPurchaseBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const fullTravel = Math.max(modalHeight - INITIAL_HEIGHT, TRAVEL);
  const labelBottom = Math.max(insets.bottom, 16) + 18;

  // Everything below runs on the UI thread: no React state while dragging.
  const translate = useSharedValue(0);
  const armed = useSharedValue(false);
  const triggered = useSharedValue(false);
  const hint = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    // A gentle, repeating nudge that teaches the gesture.
    hint.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 650, easing: Easing.in(Easing.cubic) }),
          withDelay(1400, withTiming(0, { duration: 0 }))
        ),
        -1
      )
    );
  }, [hint, reduceMotion]);

  const startPurchase = () => {
    "worklet";
    triggered.value = true;
    runOnJS(onPurchaseTrigger)();
    translate.value = withSpring(
      fullTravel,
      { damping: 26, stiffness: 220, overshootClamping: true },
      (finished) => {
        if (finished && onExpandComplete) runOnJS(onExpandComplete)();
      }
    );
  };

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onBegin(() => {
      runOnJS(lightImpact)();
    })
    .onUpdate((event) => {
      if (triggered.value) return;
      const next = Math.max(0, Math.min(-event.translationY, TRAVEL));
      translate.value = next;

      const isArmed = next / TRAVEL >= COMPLETION_THRESHOLD;
      if (isArmed !== armed.value) {
        armed.value = isArmed;
        runOnJS(armImpact)(isArmed);
      }
    })
    .onEnd((event) => {
      if (triggered.value) return;
      const progressNow = translate.value / TRAVEL;
      const flicked = event.velocityY < FLICK_VELOCITY && progressNow > 0.3;

      if (progressNow >= COMPLETION_THRESHOLD || flicked) {
        startPurchase();
      } else {
        armed.value = false;
        translate.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });

  const progress = useDerivedValue(() => Math.min(1, translate.value / TRAVEL));
  const armedAmount = useDerivedValue(() => withTiming(armed.value ? 1 : 0, { duration: 140 }));

  const sheetStyle = useAnimatedStyle(() => ({
    height: INITIAL_HEIGHT + translate.value,
    borderTopLeftRadius: interpolate(translate.value, [TRAVEL, fullTravel], [TOP_CORNER_RADIUS, 0], Extrapolation.CLAMP),
    borderTopRightRadius: interpolate(translate.value, [TRAVEL, fullTravel], [TOP_CORNER_RADIUS, 0], Extrapolation.CLAMP),
  }));

  const idleLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP) * (1 - armedAmount.value),
    transform: [{ translateY: -progress.value * 18 }],
  }));

  const armedLabelStyle = useAnimatedStyle(() => ({
    opacity:
      armedAmount.value *
      (1 - interpolate(translate.value, [TRAVEL, fullTravel * 0.6], [0, 1], Extrapolation.CLAMP)),
    transform: [{ scale: 0.96 + armedAmount.value * 0.04 }],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -hint.value * 7 }],
  }));

  const handleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6], [0.6, 0], Extrapolation.CLAMP),
    transform: [{ scaleX: 1 + progress.value * 0.5 }],
  }));

  const logoStyle = useAnimatedStyle(() => {
    const reveal = interpolate(translate.value, [TRAVEL * 0.7, fullTravel * 0.85], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: reveal,
      transform: [{ scale: 0.7 + reveal * 0.3 }],
    };
  });

  const triggerFromAccessibility = () => {
    if (disabled || triggered.value) return;
    triggered.value = true;
    onPurchaseTrigger();
    translate.value = withSpring(
      fullTravel,
      { damping: 26, stiffness: 220, overshootClamping: true },
      (finished) => {
        if (finished && onExpandComplete) runOnJS(onExpandComplete)();
      }
    );
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        className="bg-green-primary"
        accessible
        accessibilityRole="button"
        accessibilityLabel="Desliza hacia arriba para comprar"
        accessibilityActions={[{ name: "activate", label: "Comprar" }]}
        onAccessibilityAction={triggerFromAccessibility}
        style={[
          sheetStyle,
          {
            width: "100%",
            minHeight: INITIAL_HEIGHT,
            justifyContent: "flex-end",
            alignItems: "center",
            overflow: "hidden",
          },
        ]}
      >
        <Animated.View
          className="w-16 h-2 bg-blue-primary rounded-full self-center absolute top-4 z-20"
          style={handleStyle}
        />

        {/* Revealed while the sheet fills the screen: hands over seamlessly to the processing screen. */}
        <Animated.View
          pointerEvents="none"
          style={[
            { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center" },
            logoStyle,
          ]}
        >
          <Image
            source={require("@/assets/logos/simple-logo-purple.png")}
            style={{ width: 56, height: 88 }}
            resizeMode="contain"
          />
        </Animated.View>

        <View className="w-full items-center" style={{ height: labelBottom + 30 }} pointerEvents="none">
          <Animated.View style={[{ position: "absolute", bottom: labelBottom }, idleLabelStyle]}>
            <View className="flex-row items-center gap-3">
              <Text className="text-center text-base font-libre-bold text-blue-primary">Desliza para comprar</Text>
              <Animated.View style={arrowStyle}>
                <Ionicons name="arrow-up-circle-sharp" size={24} color={Colors.bluePrimary} />
              </Animated.View>
            </View>
          </Animated.View>

          <Animated.View style={[{ position: "absolute", bottom: labelBottom }, armedLabelStyle]}>
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={22} color={Colors.bluePrimary} />
              <Text className="text-center text-base font-libre-bold text-blue-primary">Suelta para confirmar</Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};
