import React, { useState, useEffect } from "react";
import { ScrollView, RefreshControl, View, Text, TouchableOpacity } from "react-native";
import { LeasingHero } from "./LeasingHero";
import { BricksPurchaseSlider } from "./BricksPurchaseSlider";
import { LeasingTabs } from "./LeasingTabs";
import { DetailsTab } from "./DetailsTab";
import { FinancesTab } from "./FinancesTab";
import { LeasingResume } from "./LeasingResume";
import { BuyAssetModal } from "./BuyAssetModal";
import { useLeasingDetails } from "@/src/hooks/leasing/useLeasingDetails";
import { authStore } from "@/src/store/auth.store";
import { refreshStore } from "@/src/store/refresh.store";
import { usePullToRefresh } from "@/src/hooks/usePullToRefresh";
import { getLeasingDetailTheme } from "@/src/utils/categories";
import { LeasingDetailScreenSkeleton } from "@/src/components/ui/skeleton";
import StandaloneHeader from "../ui/customHeader/standaloneHeder";
import { Colors } from "@/assets/Colors";
import { PartialBrickleUser } from "@/src/types/user.types";
import { AuthErrorModal } from "@/src/components/ui/modal/AuthErrorModal";
import { purchaseLeasingAsset } from "./leasingPurchase";

interface LeasingDetailScreenProps {
  assetId: string;
  userBalance: string;
  source?: "dashboard" | "discover-page" | "portfolio";
  onBackPress: () => void;
  onNavigateToWalletRestore: () => void;
  onNavigateToWalletUpgrade: () => void;
  onNavigateToPortfolio: () => void;
}

export const LeasingDetailScreen = ({
  assetId,
  userBalance,
  source = "discover-page",
  onBackPress,
  onNavigateToWalletRestore,
  onNavigateToWalletUpgrade,
  onNavigateToPortfolio,
}: LeasingDetailScreenProps) => {
  const user = authStore((state) => state.user);
  const { triggerRefresh } = refreshStore();
  const [showAuthError, setShowAuthError] = useState(false);
  const [walletAction, setWalletAction] = useState<"restore" | "upgrade">("restore");
  const {
    asset,
    loading,
    error,
    purchaseLoading,
    activeTab,
    purchaseState,
    isBuyAssetModalVisible,
    bricksCount,
    handleTabChange,
    handleBuyAsset,
    setBricksCount,
    setIsBuyAssetModalVisible,
    refreshAssetData,
  } = useLeasingDetails(assetId);

  const { refreshControlProps } = usePullToRefresh({
    onRefresh: refreshAssetData,
  });

  useEffect(() => {
    refreshAssetData();
  }, [assetId, refreshAssetData]);

  const handleOnPurchase = async (userParam: PartialBrickleUser, tokens: number, pricePerToken: number) => {
    return purchaseLeasingAsset({
      user: userParam,
      tokens,
      pricePerToken,
      handleBuyAsset,
      onMissingPrivateKey: () => {
        setWalletAction("restore");
        setIsBuyAssetModalVisible(false);
        setShowAuthError(true);
      },
      onWalletUpgradeRequired: () => {
        setWalletAction("upgrade");
        setIsBuyAssetModalVisible(false);
        setShowAuthError(true);
      },
    });
  }

  const handleRetryAuth = () => {
    setShowAuthError(false);
    if (walletAction === "upgrade") {
      onNavigateToWalletUpgrade();
      return;
    }

    onNavigateToWalletRestore();
  };

  const handleCloseAuthError = () => {
    setShowAuthError(false);
  };

  if (error && !loading) {
    return (
      <View style={{ flex: 1 }}>
        <StandaloneHeader title="Detalle de inversión" onBackPress={onBackPress} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ fontSize: 16, color: "#374151", textAlign: "center", marginBottom: 16 }}>
            {error}
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 24 }}>
            El servidor puede esperar un ID en formato válido. Revisa que el activo exista.
          </Text>
          <TouchableOpacity
            onPress={() => refreshAssetData()}
            style={{ backgroundColor: "#2563EB", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          >
            <Text style={{ color: "#FFF", fontWeight: "600" }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!asset || loading) {
    return <LeasingDetailScreenSkeleton />;
  }

  const theme = getLeasingDetailTheme(asset.type);
  const tokensLeft = asset.tokensAvailable ?? 0;
  const isSoldOut = tokensLeft <= 0;
  /** Tema neutro cuando no quedan bricks (pantalla “deshabilitada”). */
  const inactiveTheme = { mainColor: "#ADB5BD", secondaryColor: "#DEE2E6" };
  const activeTheme = isSoldOut ? inactiveTheme : theme;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.appBackground }}>
      <StandaloneHeader
        title="Detalle de inversión"
        onBackPress={onBackPress}
      />
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: Colors.appBackground }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        refreshControl={<RefreshControl {...refreshControlProps} />}
        contentContainerStyle={{ paddingBottom: 200 }}
      >
        {/* Hero Image */}
        <LeasingHero
          image={asset.coverImageUrl?.includes("http") ? { uri: asset.coverImageUrl } : null}
          roi={asset.tir || 0}
          title={asset.name}
          pricePerToken={asset.pricePerToken}
          theme={activeTheme}
          soldOut={isSoldOut}
        />

        {/* Purchase Slider */}
        <BricksPurchaseSlider
          purchaseState={purchaseState}
          currentFunding={asset.tokensAvailable}
          totalTokens={asset.tokens}
          pricePerToken={asset.pricePerToken}
          theme={activeTheme}
          soldOut={isSoldOut}
        />

        {/* Tabs */}
        <LeasingTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          theme={activeTheme}
          soldOut={isSoldOut}
        >
          {activeTab !== 'details' ? (
            <FinancesTab asset={asset} theme={activeTheme} />
          ) : (
            <DetailsTab asset={asset} theme={activeTheme} />
          )}
        </LeasingTabs>
      </ScrollView>

      {/* Floating Leasing Resume */}
      <LeasingResume
        asset={asset}
        soldOut={isSoldOut}
        isBlocked={!user?.isFullProfileComplete}
        handleBuyAsset={(bricksCount) => {
          setIsBuyAssetModalVisible(true);
          setBricksCount(bricksCount);
        }}
      />

      <BuyAssetModal
        visible={isBuyAssetModalVisible && bricksCount > 0}
        onRequestClose={() => setIsBuyAssetModalVisible(false)}
        userBalance={userBalance}
        bricksCount={bricksCount}
        assetName={asset.name}
        pricePerToken={asset.pricePerToken}
        onPurchase={() => handleOnPurchase(user as PartialBrickleUser, bricksCount, asset?.pricePerToken)}
        onComplete={() => {
          setIsBuyAssetModalVisible(false);
          setTimeout(() => {
            triggerRefresh();
            onNavigateToPortfolio();
          }, 300);
        }}
        isLoading={purchaseLoading}
      />

      <AuthErrorModal
        isVisible={showAuthError}
        onClose={handleCloseAuthError}
        onRetry={handleRetryAuth}
        title="Wallet no disponible"
        message={walletAction === "upgrade"
          ? "Para comprar debes actualizar tu wallet al nuevo sistema con backup code. Este paso es obligatorio para proteger tu cuenta."
          : "Tu sesión está activa, pero este dispositivo no tiene la clave necesaria para firmar la compra. Restaura tu wallet para continuar."}
        retryLabel={walletAction === "upgrade" ? "Actualizar wallet" : "Restaurar wallet"}
      />
    </View>
  );
}; 
