import React, { useState, useRef } from 'react';
import { View, Text, Image, ActivityIndicator, PanResponder } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from '@/assets/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const INITIAL_HEIGHT = 130;
const MAX_HEIGHT = 400;
const COMPLETION_THRESHOLD = 0.8;
const SPRING_DURATION_MS = 420;
const TOP_CORNER_RADIUS = 40;

interface SwipeToPurchaseBottomSheetProps {
  onPurchaseTrigger: () => void;
  /** Llamado cuando el swiper termina de expandirse hasta arriba (opcional, para transición) */
  onExpandComplete?: () => void;
  disabled?: boolean;
  modalHeight?: number;
}

export const SwipeToPurchaseBottomSheet = ({
  onPurchaseTrigger,
  onExpandComplete,
  disabled = false,
  modalHeight = MAX_HEIGHT
}: SwipeToPurchaseBottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(0);

  const height = useSharedValue(INITIAL_HEIGHT);
  const startY = useRef(0);
  const targetFullHeight = modalHeight;

  const updateProgress = (newProgress: number) => {
    setProgress(newProgress);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,

    onPanResponderGrant: (evt) => {
      startY.current = evt.nativeEvent.pageY;
    },

    onPanResponderMove: (evt, gestureState) => {
      const currentY = evt.nativeEvent.pageY;
      const deltaY = startY.current - currentY;

      const clampedDistance = Math.max(0, Math.min(deltaY, MAX_HEIGHT - INITIAL_HEIGHT));
      const newHeight = INITIAL_HEIGHT + clampedDistance;

      height.value = newHeight;

      const currentProgress = clampedDistance / (MAX_HEIGHT - INITIAL_HEIGHT);
      updateProgress(currentProgress);
    },

    onPanResponderRelease: (evt, gestureState) => {
      const deltaY = Math.max(0, gestureState.dy * -1);
      const currentProgress = deltaY / (MAX_HEIGHT - INITIAL_HEIGHT);

      const shouldTrigger = currentProgress >= COMPLETION_THRESHOLD ||
        (currentProgress > 0.3 && Math.abs(gestureState.vy) > 0.5);

      if (shouldTrigger) {
        height.value = withSpring(modalHeight, { damping: 20, stiffness: 150 });
        updateProgress(1);
        onPurchaseTrigger();
        if (onExpandComplete) {
          setTimeout(() => onExpandComplete(), SPRING_DURATION_MS);
        }
      } else {
        height.value = withSpring(INITIAL_HEIGHT, { damping: 20, stiffness: 150 });
        updateProgress(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const isNearFull = height.value >= targetFullHeight * 0.9;
    return {
      height: height.value,
      borderTopLeftRadius: isNearFull ? 0 : TOP_CORNER_RADIUS,
      borderTopRightRadius: isNearFull ? 0 : TOP_CORNER_RADIUS,
    };
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      className="bg-green-primary"
      style={[animatedStyle, {
        width: '100%',
        minHeight: INITIAL_HEIGHT,
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: 'hidden',
      }]}
    >
      {/* Drag handle */}
      <View className="w-16 h-2 bg-blue-primary rounded-full opacity-60 self-center mt-4 absolute top-2 z-20" />

      {/* Content */}
      <View
        className="w-full flex-1 justify-end items-center px-6"
        style={{
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        {/* Space for drag handle */}
        <View className="h-8" />

        {progress < COMPLETION_THRESHOLD && (
          <View className='flex-row gap-3 mb-6'>
            <Text className="text-center text-base font-libre-bold text-blue-primary">
              Swipe para comprar
            </Text>
            <Ionicons name="arrow-up-circle-sharp" size={24} color={Colors.bluePrimary} />
          </View>
        )}

        {progress >= COMPLETION_THRESHOLD && disabled && (
          <View className="items-center justify-center mb-4" style={{ paddingVertical: 8 }}>
            <View style={{ width: 56, height: 88, justifyContent: "center", alignItems: "center" }}>
              <Image
                source={require("@/assets/logos/simple-logo-purple.png")}
                style={{ width: 56, height: 88 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-blue-primary font-libre-bold text-base mt-4">
              Procesando bricks
            </Text>
            <ActivityIndicator size='large' color={Colors.bluePrimary} />
          </View>
        )}
      </View>
    </Animated.View>
  );
};