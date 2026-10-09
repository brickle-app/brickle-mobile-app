import React, { useState, useEffect } from 'react';
import { Colors } from "@/assets/Colors";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import { Modal, View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from "expo-haptics";
import { SwipeToPurchaseBottomSheet } from "./SwipeToPurchaseBottomSheet";
import { PurchaseProcessingScreen } from "./PurchaseProcessingScreen";
import { PurchaseStep } from "@/src/utils/purchaseProgress";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ModalStep = 'preview' | 'processing' | 'complete' | 'error';

const bricksLabel = (count: number) => `${count} ${count === 1 ? 'brick' : 'bricks'}`;

/** How long the finished checklist stays visible before the receipt slides in. */
const SUCCESS_HOLD_MS = 750;

interface BuyAssetModalProps {
  visible: boolean;
  onRequestClose: () => void;
  userBalance: string;
  bricksCount: number;
  assetName: string;
  pricePerToken: number;
  onPurchase: (onStep: (step: PurchaseStep) => void) => Promise<boolean>;
  onComplete: () => void;
  isLoading: boolean;
}

interface BuyAssetModalComponent extends React.FC<BuyAssetModalProps> {
  Preview: typeof Preview;
  ResultTransition: typeof ResultTransition;
  Complete: typeof Complete;
  Error: typeof Error;
}

export const BuyAssetModal: BuyAssetModalComponent = ({
  visible,
  onRequestClose,
  userBalance,
  bricksCount,
  assetName,
  pricePerToken,
  onPurchase,
  onComplete,
  isLoading
}) => {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<ModalStep>('preview');
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>('authorizing');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStep('preview');
    }
  }, [visible]);

  /** Solo notifica que el usuario soltó el swipe; el swiper ya está expandiendo. No inicia compra. */
  const handleSwipeTrigger = () => {};

  /** Cuando el swiper terminó de subir: pasamos a pantalla de procesamiento y lanzamos la compra. */
  const handleExpandComplete = async () => {
    setPurchaseStep('authorizing');
    setCurrentStep('processing');
    const success = await onPurchase(setPurchaseStep);
    if (!success) {
      setCurrentStep('error');
      return;
    }
    // Let the user see every step checked before the receipt appears.
    setPurchaseStep('done');
    await new Promise((resolve) => setTimeout(resolve, SUCCESS_HOLD_MS));
    setCurrentStep('complete');
  };

  const handleRetry = () => {
    setCurrentStep('preview');
  };

  const handleClose = () => {
    onRequestClose();
  };

  const handleComplete = () => {
    setCurrentStep('preview');
    onComplete();
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      transparent={true}
      animationType="fade"
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-violet-primary/80 relative">
          <View className="flex-1 justify-end">
            {(currentStep === 'preview' || currentStep === 'complete' || currentStep === 'error') && (
              <View
                className='flex-row justify-end mx-4 mb-4 absolute right-0 z-30'
                style={{ top: insets.top + 8 }}
              >
                <TouchableOpacity
                  className="flex-row items-center justify-center p-2"
                  onPress={handleClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons name="close-circle" size={28} color={Colors.white} />
                </TouchableOpacity>
              </View>
            )}
            {currentStep === 'processing' && (
              <PurchaseProcessingScreen
                step={purchaseStep}
                summary={`${bricksLabel(bricksCount)} · ${formatCurrency(pricePerToken * bricksCount)}`}
              />
            )}
            {currentStep === 'preview' && (
              <View className="bg-white rounded-t-3xl mx-4 min-h-[70%] relative">
                <BuyAssetModal.Preview
                  userBalance={userBalance}
                  bricksCount={bricksCount}
                  assetName={assetName}
                  pricePerToken={pricePerToken}
                  onSwipeTrigger={handleSwipeTrigger}
                  onExpandComplete={handleExpandComplete}
                  isLoading={isLoading}
                />
              </View>
            )}
            {(currentStep === 'complete' || currentStep === 'error') && (
              <View className="bg-white rounded-t-3xl mx-4 min-h-[70%] relative">
                <BuyAssetModal.ResultTransition>
                  {currentStep === 'complete' && (
                    <BuyAssetModal.Complete
                      assetName={assetName}
                      bricksCount={bricksCount}
                      pricePerToken={pricePerToken}
                      onRequest={handleComplete}
                    />
                  )}
                  {currentStep === 'error' && (
                    <BuyAssetModal.Error
                      assetName={assetName}
                      bricksCount={bricksCount}
                      pricePerToken={pricePerToken}
                      onRetry={handleRetry}
                    />
                  )}
                </BuyAssetModal.ResultTransition>
              </View>
            )}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

interface PreviewPurchaseProps {
  userBalance: string;
  bricksCount: number;
  assetName: string;
  pricePerToken: number;
  onSwipeTrigger: () => void;
  onExpandComplete: () => void;
  isLoading: boolean;
}

interface CompletePurchaseProps {
  assetName: string;
  bricksCount: number;
  pricePerToken: number;
  onRequest: () => void;
}

interface ErrorPurchaseProps {
  assetName: string;
  bricksCount: number;
  pricePerToken: number;
  onRetry: () => void;
}

const Preview: React.FC<PreviewPurchaseProps> = ({
  userBalance,
  bricksCount,
  assetName,
  pricePerToken,
  onSwipeTrigger,
  onExpandComplete,
  isLoading
}) => {
  return (
    <>
      <View className="p-8 pb-36">
        <View className="flex items-center justify-between">
          <Image source={require("@/assets/logos/simple-logo-purple.png")} className="w-8 h-14" />
          <Text className="text-blue-primary font-libre-bold text-2xl mt-8">Comprar Bricks</Text>
          <Text className="text-blue-primary font-libre-bold text-2xl">{assetName}</Text>
          <Text className="text-text-primary font-libre-bold text-base mt-2">
            {formatCurrency(parseFloat(userBalance))} Disponible
          </Text>
        </View>

        <View className="flex w-full justify-between max-w-[80%] mx-auto mt-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary font-libre-bold text-base mr-2">
              Bricks seleccionados
            </Text>
            <Text className="text-text-primary text-base">
              {bricksCount}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary font-libre-bold text-base mr-2">
              Valor total
            </Text>
            <Text className="text-text-primary text-base">
              {formatCurrency(pricePerToken * bricksCount)}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 }}>
        <SwipeToPurchaseBottomSheet
          onPurchaseTrigger={onSwipeTrigger}
          onExpandComplete={onExpandComplete}
          disabled={isLoading}
          modalHeight={SCREEN_HEIGHT}
        />
      </View>
    </>
  );
};

const ResultTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 320 });
    translateY.value = withTiming(0, { duration: 320 });
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ paddingTop: 8 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const Complete: React.FC<CompletePurchaseProps> = (
  {
    assetName,
    bricksCount,
    pricePerToken,
    onRequest,
  }
) => {
  React.useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  return (<View className="p-8 pb-36">
    <View className="flex items-center justify-between">
      <Animated.View
        entering={ZoomIn.springify().damping(12)}
        className="w-16 h-16 rounded-full bg-green-primary items-center justify-center"
      >
        <Ionicons name="checkmark" size={36} color={Colors.bluePrimary} />
      </Animated.View>
      <Animated.Text
        entering={FadeInDown.delay(120).duration(360)}
        className="text-blue-primary font-libre-bold text-2xl mt-8"
      >
        Compra realizada
      </Animated.Text>
      <Text className="text-text-primary text-center font-libre-bold text-base mt-2">
        Tu compra de {bricksLabel(bricksCount)} de "{assetName}" ha sido completada con éxito.
      </Text>
    </View>

    <Animated.View
      entering={FadeInDown.delay(240).duration(420)}
      className="flex w-full justify-between max-w-[80%] mx-auto mt-8"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-text-primary font-libre-bold text-base mr-2">
          Estatus compra
        </Text>
        <Text className="text-text-primary text-base">
          Completada
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-text-primary font-libre-bold text-base mr-2">
          Bricks adquiridos
        </Text>
        <Text className="text-text-primary text-base">
          {bricksCount}
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-text-primary font-libre-bold text-base mr-2">
          Valor total
        </Text>
        <Text className="text-text-primary text-base">
          {formatCurrency(pricePerToken * bricksCount)}
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-text-primary font-libre-bold text-base mr-2">
          Fecha
        </Text>
        <Text className="text-text-primary text-base">
          {new Date().toLocaleDateString()}
        </Text>
      </View>
    </Animated.View>

    <TouchableOpacity
      className="bg-green-primary rounded-full py-3 px-6 mt-8 self-center"
      onPress={onRequest}
    >
      <Text className="text-blue-primary font-libre-bold text-base">
        Continuar
      </Text>
    </TouchableOpacity>
  </View>)
};

const Error: React.FC<ErrorPurchaseProps> = ({
  assetName,
  bricksCount,
  pricePerToken,
  onRetry
}) => {
  React.useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }, []);

  return (
    <>
      <View className="p-8 pb-36">
        <View className="flex items-center justify-between">
          <Ionicons name="alert-circle" size={48} color={Colors.red} />
          <Text className="text-red font-libre-bold text-2xl mt-8">Error en la compra</Text>
          <Text className="text-text-primary font-libre-bold text-base mt-2 text-center">
            No pudimos procesar tu compra de {bricksLabel(bricksCount)} de "{assetName}".
            Por favor, intenta nuevamente.
          </Text>
        </View>

        <View className="flex w-full justify-between max-w-[80%] mx-auto mt-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary font-libre-bold text-base mr-2">
              Estado de la operación
            </Text>
            <Text className="text-red text-base">
              Fallida
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary font-libre-bold text-base mr-2">
              bricks solicitados
            </Text>
            <Text className="text-text-primary text-base">
              {bricksCount}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary font-libre-bold text-base mr-2">
              Valor total
            </Text>
            <Text className="text-text-primary text-base">
              {formatCurrency(pricePerToken * bricksCount)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary font-libre-bold text-base mr-2">
              Fecha del intento
            </Text>
            <Text className="text-text-primary text-base">
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="bg-orange-primary rounded-full py-3 px-6 mt-8 self-center"
        onPress={onRetry}
      >
        <Text className="text-primary-white font-libre-bold text-base">
          Reintentar compra
        </Text>
      </TouchableOpacity>
    </>
  );
};

BuyAssetModal.Preview = Preview;
BuyAssetModal.ResultTransition = ResultTransition;
BuyAssetModal.Complete = Complete;
BuyAssetModal.Error = Error;
