import { Colors } from "@/assets/Colors";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { Asset } from "@/src/interfaces/investments.interface";
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
  Platform,
  InputAccessoryView,
} from "react-native";

const BRICKS_INPUT_ACCESSORY_ID = "bricks-count-input";

export const LeasingResume = ({
  asset,
  soldOut,
  isBlocked,
  handleBuyAsset,
}: {
  asset: Asset;
  soldOut?: boolean;
  isBlocked: boolean;
  handleBuyAsset: (bricksCount: number) => void;
}) => {
  const [bricksCount, setBricksCount] = useState(0);
  const [bricksInput, setBricksInput] = useState("0");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const pricePerToken = asset.pricePerToken;
  const totalInvestment = bricksCount * pricePerToken;
  const noTokens = soldOut === true || (asset.tokensAvailable ?? 0) <= 0;

  // On Android the window resizes with the keyboard, so the floating card moves up on its own;
  // on iOS it has to be lifted manually or the keyboard covers the input.
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    const show = Keyboard.addListener("keyboardWillShow", (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener("keyboardWillHide", () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const updateBricks = (count: number) => {
    setBricksCount(count);
    setBricksInput(String(count));
  };

  const incrementBricks = () => {
    if (noTokens) return;
    if (bricksCount < asset.tokensAvailable) {
      updateBricks(bricksCount + 1);
    }
  };

  const decrementBricks = () => {
    if (noTokens) return;
    if (bricksCount > 0) {
      updateBricks(bricksCount - 1);
    }
  };

  const handleBricksInputChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    if (digits === "") {
      setBricksCount(0);
      setBricksInput("");
      return;
    }
    updateBricks(Math.min(parseInt(digits, 10), asset.tokensAvailable ?? 0));
  };

  const disabled = noTokens || bricksCount === 0 || bricksCount > asset.tokensAvailable;

  const thinShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  };

  return (
    <View style={[styles.container, keyboardHeight > 0 && { bottom: keyboardHeight }]}>
      <View className="bg-white rounded-t-3xl p-6 border-t border-gray-100" style={thinShadow}>
        <View className="mb-4 flex-row justify-between items-center">
          <Text className="text-base font-libre-regular text-blue-primary">Número de bricks</Text>
          <View className="flex-row items-center rounded-2xl border border-gray-200 bg-gray-50">
            <TouchableOpacity
              onPress={decrementBricks}
              className="w-10 h-10 items-center justify-center"
              disabled={noTokens}
              style={{ opacity: noTokens ? 0.45 : 1 }}
            >
              <Text className="text-lg font-libre-medium text-blue-primary">-</Text>
            </TouchableOpacity>
            <TextInput
              value={bricksInput}
              onChangeText={handleBricksInputChange}
              onFocus={() => {
                if (bricksCount === 0) setBricksInput("");
              }}
              onBlur={() => setBricksInput(String(bricksCount))}
              keyboardType="number-pad"
              returnKeyType="done"
              selectTextOnFocus
              editable={!noTokens}
              maxLength={String(asset.tokensAvailable ?? 0).length}
              inputAccessoryViewID={Platform.OS === "ios" ? BRICKS_INPUT_ACCESSORY_ID : undefined}
              accessibilityLabel="Número de bricks"
              className="min-w-[44px] text-center text-base font-libre-medium text-blue-primary"
              style={{ paddingVertical: 0 }}
            />
            <TouchableOpacity
              onPress={incrementBricks}
              className="w-10 h-10 items-center justify-center"
              disabled={noTokens || bricksCount >= asset.tokensAvailable}
              style={{ opacity: noTokens || bricksCount >= asset.tokensAvailable ? 0.5 : 1 }}
            >
              <Text className="text-lg font-libre-medium text-blue-primary">+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-libre-regular text-blue-primary">Precio por token</Text>
            <Text className="text-base font-libre-medium text-blue-primary">{formatCurrency(pricePerToken)}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-libre-regular text-blue-primary">Inversión total</Text>
            <Text className="text-base font-libre-medium text-blue-primary">{formatCurrency(totalInvestment)}</Text>
          </View>
        </View>
        <TouchableOpacity
          className="rounded-full py-4 items-center"
          onPress={() => {
            if (noTokens) return;
            Keyboard.dismiss();
            handleBuyAsset(bricksCount);
          }}
          style={[
            {
              backgroundColor: disabled || isBlocked ? Colors.gray : Colors.greenPrimary,
              opacity: disabled || isBlocked ? 0.75 : 1,
            },
            thinShadow,
          ]}
          disabled={disabled || isBlocked}
        >
          <Text className="text-base font-libre-medium text-blue-primary">
            {noTokens ? "Agotado" : "Comprar bricks"}
          </Text>
        </TouchableOpacity>
      </View>
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={BRICKS_INPUT_ACCESSORY_ID}>
          <View className="flex-row justify-end bg-gray-100 border-t border-gray-200 px-4 py-2">
            <TouchableOpacity onPress={Keyboard.dismiss}>
              <Text className="text-base font-libre-medium text-blue-primary">Listo</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: 16,
    zIndex: 100,
  },
});