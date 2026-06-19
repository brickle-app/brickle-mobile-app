import {
  Text,
  Pressable,
  PressableProps,
  Animated,
  useAnimatedValue,
  View,
} from "react-native";
import clsx from "clsx";

interface Props extends PressableProps {
  label?: string;
  variant?: "primary" | "secondary" | "blue";
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
  width?: string;
  height?: string;
  children?: React.ReactNode;
}

export const Button = ({
  label,
  children,
  variant = "primary",
  onPress,
  disabled,
  className,
  width = "w-primary-width",
  height = "h-primary-height",
  textClassName,
  icon,
}: Props): React.ReactElement => {
  const opacityAnim = useAnimatedValue(1);
  const scaleAnim = useAnimatedValue(1);

  const animateButton = (toOpacity: number, toScale: number) => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: toOpacity,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: toScale,
        ...(toScale === 1 ? { friction: 5, tension: 40 } : {}),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}
    >
      <Pressable
        onPressIn={() => animateButton(0.5, 0.8)}
        onPressOut={() => animateButton(1, 1)}
        onPress={onPress}
        disabled={disabled}
        className={clsx(
          " text-blue-primary flex flex-row gap-2  rounded-[64px] justify-center items-center",
          {
            "opacity-50": disabled,
            "bg-primary": variant === "primary",
            "bg-green-secondary": variant === "secondary",
            " bg-primary-white": variant === "blue",
          },
          className,
          width,
          height
        )}
      >
        {children ? (
          children
        ) : (
          <View className="flex flex-row gap-2  ">
            {icon}
            <Text
              className={`text-blue-primary text-base font-libre-bold ${textClassName}`}
            >
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};
