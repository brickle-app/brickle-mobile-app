import React, { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { PURCHASE_STEPS, PurchaseStep, getPurchaseStepIndex } from "@/src/utils/purchaseProgress";

const RING_SIZE = 132;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const GLOW_SIZE = 420;

interface PurchaseProcessingScreenProps {
  step: PurchaseStep;
  summary: string;
}

export function PurchaseProcessingScreen({ step, summary }: PurchaseProcessingScreenProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const activeIndex = getPurchaseStepIndex(step);
  const isDone = step === "done";

  const spin = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    spin.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1);
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
  }, [spin, breathe, reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: isDone ? 0 : 1,
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.05 }],
  }));

  const activeDetail = PURCHASE_STEPS[Math.min(activeIndex, PURCHASE_STEPS.length - 1)].detail;

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={[
        styles.container,
        { paddingTop: insets.top + 56, paddingBottom: Math.max(insets.bottom, 20) + 24 },
      ]}
    >
      <View style={styles.glow} pointerEvents="none">
        <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
          <Defs>
            <RadialGradient id="purchaseGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.5} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#purchaseGlow)" />
        </Svg>
      </View>

      <View style={styles.content}>
        <View style={styles.ringWrapper}>
          <Animated.View style={[styles.ring, ringStyle]}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="rgba(28,54,71,0.14)"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={Colors.bluePrimary}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={`${RING_CIRCUMFERENCE * 0.26} ${RING_CIRCUMFERENCE}`}
                fill="none"
              />
            </Svg>
          </Animated.View>
          {isDone ? (
            <Animated.View entering={ZoomIn.springify().damping(13)} style={styles.doneBadge}>
              <Ionicons name="checkmark" size={46} color={Colors.greenPrimary} />
            </Animated.View>
          ) : (
            <Animated.View style={logoStyle}>
              <Image
                source={require("@/assets/logos/simple-logo-purple.png")}
                style={{ width: 48, height: 76 }}
                resizeMode="contain"
              />
            </Animated.View>
          )}
        </View>

        <Animated.Text key={isDone ? "title-done" : "title"} entering={FadeIn.duration(260)} style={styles.title}>
          {isDone ? "Compra confirmada" : "Procesando tu compra"}
        </Animated.Text>
        <Text style={styles.summary}>{summary}</Text>

        <View style={styles.subtitleSlot}>
          <Animated.Text
            key={isDone ? "done" : step}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(120)}
            style={styles.subtitle}
          >
            {isDone ? "Tus bricks ya están en tu portafolio." : activeDetail}
          </Animated.Text>
        </View>

        <View style={styles.steps}>
          {PURCHASE_STEPS.map((item, index) => {
            const state = index < activeIndex ? "done" : index === activeIndex ? "active" : "pending";
            return (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(120 + index * 90).duration(380)}
                style={styles.stepRow}
              >
                <View style={styles.stepIndicator}>
                  {state === "done" && (
                    <Animated.View entering={ZoomIn.springify().damping(13)} style={styles.stepDone}>
                      <Ionicons name="checkmark" size={14} color={Colors.greenPrimary} />
                    </Animated.View>
                  )}
                  {state === "active" && <ActivityIndicator size="small" color={Colors.bluePrimary} />}
                  {state === "pending" && <View style={styles.stepPending} />}
                </View>
                <Text
                  style={[
                    styles.stepTitle,
                    state === "active" && styles.stepTitleActive,
                    state === "pending" && styles.stepTitlePending,
                  ]}
                >
                  {item.title}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Ionicons name="lock-closed" size={14} color="rgba(28,54,71,0.6)" />
        <Text style={styles.footerText}>Mantén la app abierta hasta que termine. Tu dinero está protegido.</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.greenPrimary,
    paddingHorizontal: 28,
  },
  glow: { position: "absolute", top: -60, alignSelf: "center", width: GLOW_SIZE, height: GLOW_SIZE },
  content: { flex: 1, alignItems: "center" },
  ringWrapper: { width: RING_SIZE, height: RING_SIZE, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute" },
  doneBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.bluePrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 40,
    fontFamily: "LibreFranklin-Bold",
    fontSize: 26,
    color: Colors.bluePrimary,
    textAlign: "center",
  },
  summary: {
    marginTop: 6,
    fontFamily: "LibreFranklin-Bold",
    fontSize: 14,
    color: "rgba(28,54,71,0.7)",
    textAlign: "center",
  },
  subtitleSlot: { marginTop: 12, minHeight: 46, justifyContent: "center" },
  subtitle: {
    fontFamily: "LibreFranklin-Regular",
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(28,54,71,0.8)",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  steps: { marginTop: 32, alignSelf: "stretch", gap: 18, paddingHorizontal: 8 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepIndicator: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  stepDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.bluePrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepPending: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "rgba(28,54,71,0.3)",
  },
  stepTitle: { flex: 1, fontFamily: "LibreFranklin-Regular", fontSize: 16, color: "rgba(28,54,71,0.75)" },
  stepTitleActive: { fontFamily: "LibreFranklin-Bold", color: Colors.bluePrimary },
  stepTitlePending: { color: "rgba(28,54,71,0.38)" },
  footer: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 8 },
  footerText: {
    flex: 1,
    fontFamily: "LibreFranklin-Regular",
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(28,54,71,0.6)",
  },
});
