import { CommitFunds, Asset } from "@/src/interfaces/investments.interface";
import { commitFunds, getAssetById } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { useBlockchainConfigStore } from "@/src/store/blockchainConfig.store";
import { useOnRefreshTriggerIncrement } from "@/src/hooks/useOnRefreshTriggerIncrement";
import { PurchaseState, TabType } from "@/src/types/leasing.types";
import { generatePermit } from "@/src/utils/generatePermit";
import { checkSessionError } from "@/src/utils/sessionManager";
import { useCallback, useState, useEffect } from "react";

export const useLeasingDetails = (assetId: string) => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("finances");
  const [purchaseState] = useState<PurchaseState>({
    selectedTokens: asset?.tokensAvailable || 0,
    totalInvestment: asset?.tokensAvailable
      ? asset?.tokensAvailable * asset?.pricePerToken
      : 0,
  });
  const [isBuyAssetModalVisible, setIsBuyAssetModalVisible] = useState(false);
  const [bricksCount, setBricksCount] = useState(0);
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleBuyAsset = async (
    email: string,
    walletAddress: string,
    bricksCount: number,
    amount: number
  ) => {
    setPurchaseLoading(true);
    const { baseToken: tokenAddress, paymasterAddress } =
      await useBlockchainConfigStore.getState().fetchConfig();

    try {
      const permit = await generatePermit(
        tokenAddress,
        paymasterAddress,
        walletAddress || "",
        amount
      );

      const commitFundsDto: CommitFunds = {
        token: tokenAddress,
        sender: walletAddress || "",
        amount,
        deadline: permit.deadline,
        totalTokens: bricksCount,
        permitSignature: {
          v: permit.v,
          r: permit.r,
          s: permit.s,
        },
      };

      const result = await commitFunds(assetId, email, commitFundsDto);
      setPurchaseLoading(false);
      return { success: result };
    } catch (error) {
      console.error("Failed to buy asset:", error);
      setPurchaseLoading(false);
      checkSessionError(error);
      return { success: false };
    }
  };

  const fetchAssetDetails = async (id: string) => {
    if (!id?.trim()) {
      setError("ID de activo no válido");
      setLoading(false);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const assetData = await getAssetById(
        id,
        authStore.getState().user?.email || ""
      );
      if (assetData) {
        setAsset(assetData);
      } else {
        setError("Activo no encontrado");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el detalle";
      setError(message);
      setAsset(null);
      if (__DEV__) {
        console.warn("Failed to fetch asset:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshAssetData = useCallback(async () => {
    if (assetId) {
      await fetchAssetDetails(assetId);
    }
  }, [assetId]);

  useEffect(() => {
    if (assetId) {
      fetchAssetDetails(assetId);
    }
  }, [assetId]);

  useOnRefreshTriggerIncrement(() => {
    if (assetId) {
      void fetchAssetDetails(assetId);
    }
  });

  return {
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
  };
};
