import React, { useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, PanResponder } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/assets/Colors";

interface SignaturePadProps {
  /** Called with the current set of stroke paths every time they change. */
  onChange: (svgPaths: string[]) => void;
  height?: number;
}

const SignaturePad = ({ onChange, height = 180 }: SignaturePadProps) => {
  const [paths, setPaths] = useState<string[]>([]);
  const currentPath = useRef<string>("");
  const [renderedCurrentPath, setRenderedCurrentPath] = useState("");

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          currentPath.current = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
          setRenderedCurrentPath(currentPath.current);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          currentPath.current += ` L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
          setRenderedCurrentPath(currentPath.current);
        },
        onPanResponderRelease: () => {
          if (!currentPath.current) return;
          setPaths((prev) => {
            const next = [...prev, currentPath.current];
            onChange(next);
            return next;
          });
          currentPath.current = "";
          setRenderedCurrentPath("");
        },
      }),
    [onChange]
  );

  function clear() {
    setPaths([]);
    currentPath.current = "";
    setRenderedCurrentPath("");
    onChange([]);
  }

  const isEmpty = paths.length === 0;

  return (
    <View className="w-full">
      <View
        {...panResponder.panHandlers}
        style={{ height }}
        className="w-full rounded-xl border border-gray-200 bg-white overflow-hidden"
      >
        {isEmpty && !renderedCurrentPath && (
          <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
            <Text className="text-text-secondary font-libre-regular text-xs">
              Firma aquí con tu dedo
            </Text>
          </View>
        )}
        <Svg width="100%" height={height}>
          {paths.map((d, index) => (
            <Path
              key={index}
              d={d}
              stroke={Colors.textPrimary}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {renderedCurrentPath ? (
            <Path
              d={renderedCurrentPath}
              stroke={Colors.textPrimary}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ) : null}
        </Svg>
      </View>
      <TouchableOpacity
        onPress={clear}
        disabled={isEmpty}
        className="self-end mt-2"
        hitSlop={8}
      >
        <Text
          className={`font-libre-bold text-xs ${
            isEmpty ? "text-gray-300" : "text-text-primary underline"
          }`}
        >
          Borrar firma
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignaturePad;
