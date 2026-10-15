import React, { useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, PanResponder } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/assets/Colors";

interface SignaturePadProps {
  /** Called with the current set of stroke paths every time they change. */
  onChange: (svgPaths: string[]) => void;
  /** Drawing started/ended: the parent ScrollView must stop scrolling meanwhile, or it steals the stroke. */
  onDrawingChange?: (isDrawing: boolean) => void;
  height?: number;
}

const SignaturePad = ({
  onChange,
  onDrawingChange,
  height = 180,
}: SignaturePadProps) => {
  const [paths, setPaths] = useState<string[]>([]);
  const pathsRef = useRef<string[]>([]);
  const currentPath = useRef<string>("");
  const [renderedCurrentPath, setRenderedCurrentPath] = useState("");

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // Keep the gesture even when the enclosing ScrollView asks for it
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (event) => {
          onDrawingChange?.(true);
          const { locationX, locationY } = event.nativeEvent;
          currentPath.current = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
          setRenderedCurrentPath(currentPath.current);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          currentPath.current += ` L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
          setRenderedCurrentPath(currentPath.current);
        },
        onPanResponderRelease: () => finishStroke(),
        onPanResponderTerminate: () => finishStroke(),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, onDrawingChange],
  );

  function finishStroke() {
    onDrawingChange?.(false);
    if (!currentPath.current) return;
    // Notify the parent outside of a state updater: calling its setState from inside one
    // triggered "Cannot update a component while rendering a different component".
    const next = [...pathsRef.current, currentPath.current];
    pathsRef.current = next;
    setPaths(next);
    onChange(next);
    currentPath.current = "";
    setRenderedCurrentPath("");
  }

  function clear() {
    pathsRef.current = [];
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
          <View
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none"
          >
            <Text className="text-text-secondary font-libre-regular text-xs">
              Firma aquí con tu dedo
            </Text>
          </View>
        )}
        {/* Not a touch target: touches landing on a drawn Path reported locationX/Y relative to
            that Path instead of the pad, so new strokes were drawn off-canvas. */}
        <Svg width="100%" height={height} pointerEvents="none">
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
