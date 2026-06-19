import React, { useState, useEffect } from 'react';
import { Colors } from "@/assets/Colors";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";
import { Modal, View, Text, TouchableOpacity, Image, Dimensions, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SwipeToPurchaseBottomSheet } from "./SwipeToPurchaseBottomSheet";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type PurchaseStep = 'preview' | 'processing' | 'complete' | 'error';

interface BuyAssetModalProps {
  visible: boolean;
  onRequestClose: () => void;
  userBalance: string;
  bricksCount: number;
  assetName: string;
  pricePerToken: number;
  onPurchase: () => Promise<boolean>;
  onComplete: () => void;
  isLoading: boolean;
}

interface BuyAssetModalComponent extends React.FC<BuyAssetModalProps> {
  Preview: typeof Preview;
  Processing: typeof Processing;
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
  const [currentStep, setCurrentStep] = useState<PurchaseStep>('preview');

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
    setCurrentStep('processing');
    const success = await onPurchase();
    if (!success) {
      setCurrentStep('error');
      return;
    }
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
              <BuyAssetModal.Processing />
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

const LOGO_MAX_W = 72;
const LOGO_MAX_H = 112;

const Processing: React.FC = () => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.greenPrimary,
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: Math.max(insets.bottom, 24),
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: LOGO_MAX_W,
          height: LOGO_MAX_H,
          marginBottom: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("@/assets/logos/simple-logo-purple.png")}
          style={{ width: LOGO_MAX_W, height: LOGO_MAX_H }}
          resizeMode="contain"
        />
      </View>
      <Text className="text-blue-primary font-libre-bold text-xl mb-4 text-center">
        Procesando compra
      </Text>
      <Text className="text-blue-primary font-libre-regular text-base mb-8 opacity-90 text-center px-2">
        Estamos confirmando tu inversión
      </Text>
      <ActivityIndicator size="large" color={Colors.bluePrimary} />
    </View>
  );
};

const ResultTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 320 });
    translateY.value = withTiming(0, { duration: 320 });
  }, []);

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
  return (<View className="p-8 pb-36">
    <View className="flex items-center justify-between">
      <Image source={require("@/assets/logos/simple-logo-purple.png")} className="w-8 h-14" />
      <Text className="text-blue-primary font-libre-bold text-2xl mt-8">Compra Realizada</Text>
      <Text className="text-text-primary text-center font-libre-bold text-base mt-2">
        Tu compra de {bricksCount} bricks de "{assetName}" ha sido completada con éxito.
      </Text>
    </View>

    <View className="flex w-full justify-between max-w-[80%] mx-auto mt-8">
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
    </View>

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
  return (
    <>
      <View className="p-8 pb-36">
        <View className="flex items-center justify-between">
          <Ionicons name="alert-circle" size={48} color={Colors.red} />
          <Text className="text-red font-libre-bold text-2xl mt-8">Error en la compra</Text>
          <Text className="text-text-primary font-libre-bold text-base mt-2 text-center">
            No pudimos procesar tu compra de {bricksCount} bricks de "{assetName}".
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
BuyAssetModal.Processing = Processing;
BuyAssetModal.ResultTransition = ResultTransition;
BuyAssetModal.Complete = Complete;
BuyAssetModal.Error = Error;