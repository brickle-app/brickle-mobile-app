import React, { useEffect } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import {
  WALLET_ACTIVATION_STEPS,
  WalletActivationStep,
  computeActivationProgress,
  getActivationStepIndex,
} from "@/src/utils/walletActivation";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 156;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const SUCCESS_HOLD_MS = 1100;
const GLOW_SIZE = RING_SIZE + 140;

interface WalletActivationOverlayProps {
  visible: boolean;
  step: WalletActivationStep;
  /** 0..1 progress of the key derivation. */
  derivationProgress: number;
  /** Called after the success state has been shown, so the screen can move on. */
  onFinished: () => void;
}

export function WalletActivationOverlay({
  visible,
  step,
  derivationProgress,
  onFinished,
}: WalletActivationOverlayProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const isDone = step === "done";
  const overall = computeActivationProgress(step, derivationProgress);
  const percent = Math.round(overall * 100);
  const activeIndex = getActivationStepIndex(step);

  const ringProgress = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    ringProgress.value = withTiming(overall, {
      duration: reduceMotion ? 0 : 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [overall, reduceMotion, ringProgress]);

  useEffect(() => {
    if (!visible || reduceMotion) return;
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1
    );
  }, [visible, reduceMotion, glow]);

  useEffect(() => {
    if (!visible) {
      ringProgress.value = 0;
      return;
    }
    if (!isDone) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const timer = setTimeout(onFinished, SUCCESS_HOLD_MS);
    return () => clearTimeout(timer);
  }, [isDone, visible, onFinished, ringProgress]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - ringProgress.value),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + glow.value * 0.45,
    transform: [{ scale: 1 + glow.value * 0.1 }],
  }));

  const activeDetail = WALLET_ACTIVATION_STEPS[Math.min(activeIndex, WALLET_ACTIVATION_STEPS.length - 1)].detail;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        /* The activation can't be cancelled midway. */
      }}
    >
      <LinearGradient
        colors={["#0E1F2B", "#1C3647", "#16303F"]}
        style={[styles.container, { paddingTop: insets.top + 72, paddingBottom: Math.max(insets.bottom, 20) + 24 }]}
      >
        <View style={styles.content}>
          <View style={styles.ringWrapper}>
            <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none">
              <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
                <Defs>
                  <RadialGradient id="activationGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={Colors.greenPrimary} stopOpacity={0.28} />
                    <Stop offset="55%" stopColor={Colors.greenPrimary} stopOpacity={0.08} />
                    <Stop offset="100%" stopColor={Colors.greenPrimary} stopOpacity={0} />
                  </RadialGradient>
                </Defs>
                <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#activationGlow)" />
              </Svg>
            </Animated.View>
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={Colors.greenPrimary}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                animatedProps={ringProps}
                fill="none"
              />
            </Svg>
            <View style={styles.ringCenter}>
              {isDone ? (
                <Animated.View entering={ZoomIn.springify().damping(14)}>
                  <Ionicons name="checkmark" size={64} color={Colors.greenPrimary} />
                </Animated.View>
              ) : (
                <Animated.Text key="percent" entering={FadeIn} style={styles.percent}>
                  {percent}
                  <Text style={styles.percentSign}>%</Text>
                </Animated.Text>
              )}
            </View>
          </View>

          <Animated.Text key={isDone ? "title-done" : "title"} entering={FadeIn.duration(300)} style={styles.title}>
            {isDone ? "Wallet activada" : "Activando tu wallet"}
          </Animated.Text>
          <View style={styles.subtitleSlot}>
            <Animated.Text
              key={isDone ? "done" : step}
              entering={FadeIn.duration(350)}
              exiting={FadeOut.duration(150)}
              style={styles.subtitle}
            >
              {isDone ? "Ya puedes firmar transacciones desde este dispositivo." : activeDetail}
            </Animated.Text>
          </View>

          <View style={styles.steps}>
            {WALLET_ACTIVATION_STEPS.map((item, index) => {
              const state = index < activeIndex ? "done" : index === activeIndex ? "active" : "pending";
              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.delay(index * 90).duration(420)}
                  style={styles.stepRow}
                >
                  <View style={styles.stepIndicator}>
                    {state === "done" && (
                      <Animated.View entering={ZoomIn.springify().damping(13)} style={styles.stepDone}>
                        <Ionicons name="checkmark" size={14} color={Colors.bluePrimary} />
                      </Animated.View>
                    )}
                    {state === "active" && <ActivityIndicator size="small" color={Colors.greenPrimary} />}
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
          <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.55)" />
          <Text style={styles.footerText}>
            Tus palabras nunca salen de este teléfono. Puede tardar hasta un minuto; mantén la app abierta.
          </Text>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28 },
  content: { flex: 1, alignItems: "center" },
  ringWrapper: { width: RING_SIZE, height: RING_SIZE, alignItems: "center", justifyContent: "center" },
  glow: { position: "absolute", width: GLOW_SIZE, height: GLOW_SIZE },
  ringSvg: { position: "absolute", transform: [{ rotate: "-90deg" }] },
  ringCenter: { position: "absolute", alignItems: "center", justifyContent: "center" },
  percent: {
    fontFamily: "LibreFranklin-Bold",
    fontSize: 44,
    color: Colors.white,
    fontVariant: ["tabular-nums"],
  },
  percentSign: { fontFamily: "LibreFranklin-Regular", fontSize: 20, color: "rgba(255,255,255,0.6)" },
  title: {
    marginTop: 48,
    fontFamily: "LibreFranklin-Bold",
    fontSize: 26,
    color: Colors.white,
    textAlign: "center",
  },
  subtitleSlot: { marginTop: 10, minHeight: 44, justifyContent: "center" },
  subtitle: {
    fontFamily: "LibreFranklin-Regular",
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.68)",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  steps: { marginTop: 36, alignSelf: "stretch", gap: 18, paddingHorizontal: 8 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepIndicator: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  stepDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.greenPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepPending: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  stepTitle: { flex: 1, fontFamily: "LibreFranklin-Regular", fontSize: 16, color: "rgba(255,255,255,0.72)" },
  stepTitleActive: { fontFamily: "LibreFranklin-Bold", color: Colors.white },
  stepTitlePending: { color: "rgba(255,255,255,0.32)" },
  footer: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 8 },
  footerText: {
    flex: 1,
    fontFamily: "LibreFranklin-Regular",
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(255,255,255,0.55)",
  },
});
