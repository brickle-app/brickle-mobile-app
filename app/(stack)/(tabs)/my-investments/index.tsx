import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Card } from "@/src/components/ui/card/Card";
import { Button } from "@/src/components/ui/button/Button";
import { formatCurrency } from "@/src/utils/formatCurrency";
import {
  getCategoryIcon,
  getCategoryIconCircleBackground,
  getCategoryIconGlyphColor,
} from "@/src/utils/categories";
import { Ionicons } from "@expo/vector-icons";
import { differenceInMonths } from "@/src/utils/dateUtils";
import { authStore } from "@/src/store/auth.store";
import { useBlockchainConfigStore } from "@/src/store/blockchainConfig.store";
import { ClaimRent, Investment } from "@/src/interfaces/investments.interface";
import { claimRent, getInvestmentForUserLeasing } from "@/src/services/brickle.service";
import { Colors } from "@/assets/Colors";
import { generatePermit } from "@/src/utils/generatePermit";
import { getUserActivityLogs } from "@/src/services/useractivity.service";
import { renderTransactionItem, Transaction } from "@/src/components/wallet/forms/TransactionsHistory";
import { UserActivityLog } from "@/src/types/user.types";
import {
  loadInvestorOnChainSnapshot,
  microToCopAmount,
  pollClaimableMicroAfterClaim,
} from "@/src/utils/leasingInvestorReads";
import {
  getLeasingClosureInfo,
  type LeasingClosureInfo,
} from "@/src/utils/leasingClosureInfo";
import {
  showRentClaimError,
  showRentClaimRejectedByServer,
  showRentClaimSessionIncomplete,
  showRentClaimSuccess,
} from "@/src/utils/userFeedback";
import {
  formatBricksDecimalQuantity,
  formatBricksTokenHuman,
  formatCurrentBricks,
  isCopMicroLeasingToken,
  nominalCapitalCopIntegerFromRaw,
  rawBalanceToCapitalCopAmount,
  resolvePricePerBrickMicro,
  rewriteRentClaimLogDescription,
} from "@/src/utils/bricksFormat";
import { usePullToRefresh } from "@/src/hooks/usePullToRefresh";

export default function MyInvestments() {
  const { assetId, investmentData } = useLocalSearchParams<{
    assetId: string;
    investmentData: string;
  }>();

  const routeInvestment = useMemo((): Investment | null => {
    if (!investmentData) return null;
    try {
      return JSON.parse(investmentData) as Investment;
    } catch {
      return null;
    }
  }, [investmentData]);

  const [serverInvestment, setServerInvestment] = useState<Investment | null>(null);
  const userInvestment = serverInvestment ?? routeInvestment;

  const [claimableMicro, setClaimableMicro] = useState<bigint>(0n);
  const [claimedMicro, setClaimedMicro] = useState<bigint>(0n);
  const [leasingTokenBalance, setLeasingTokenBalance] = useState<bigint>(0n);
  const [leasingTokenPriceMicro, setLeasingTokenPriceMicro] = useState<bigint>(0n);
  const [leasingTokenTotalSupply, setLeasingTokenTotalSupply] = useState<bigint>(0n);
  const [coreTotalLeasingTokens, setCoreTotalLeasingTokens] = useState<bigint>(0n);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(true);
  const [isClaimingRent, setIsClaimingRent] = useState(false);
  const [rawRentLogs, setRawRentLogs] = useState<UserActivityLog[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(true);
  const [closureInfo, setClosureInfo] = useState<LeasingClosureInfo | null>(null);

  const user = authStore((state) => state.user);

  useEffect(() => {
    setServerInvestment(null);
  }, [investmentData]);

  useEffect(() => {
    const email = user?.email;
    const uid = user?.id;
    const leasingId = routeInvestment?.leasingId;
    if (!email || !uid || !leasingId) return;
    let cancelled = false;
    (async () => {
      try {
        const fresh = await getInvestmentForUserLeasing(email, uid, leasingId);
        if (!cancelled && fresh) {
          setServerInvestment(fresh);
        }
      } catch (e) {
        console.warn("refresh investment from API", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.id, routeInvestment?.leasingId]);

  const fetchRentMovements = useCallback(
    async (leasingIdOverride?: string) => {
      const leasingId = leasingIdOverride ?? userInvestment?.leasingId;
      if (!user?.id || !user?.email || !leasingId) {
        setIsLoadingMovements(false);
        return;
      }

      try {
        setIsLoadingMovements(true);
        const response = await getUserActivityLogs(
          user.email,
          user.id,
          leasingId,
          90,
          "SUCCESS"
        );

        if (response?.logs) {
          const rentLogs = response.logs.filter(
            (log) =>
              log.type === "INVESTMENT-RETURN" ||
              log.type === "INVESTMENT-RETURN-INTEREST" ||
              log.type === "INVESTMENT-RETURN-CAPITAL"
          );
          setRawRentLogs(rentLogs);
        } else {
          setRawRentLogs([]);
        }
      } catch (error) {
        console.error("Error fetching rent movements:", error);
      } finally {
        setIsLoadingMovements(false);
      }
    },
    [user?.id, user?.email, userInvestment?.leasingId]
  );

  const asset = userInvestment?.leasing;

  const refreshOnChainSnapshot = useCallback(async () => {
    if (!userInvestment || !user) return;
    setIsLoadingEarnings(true);
    try {
      const [snap, closure] = await Promise.all([
        loadInvestorOnChainSnapshot(userInvestment, user),
        userInvestment.leasing?.contractAddress
          ? getLeasingClosureInfo(userInvestment.leasing.contractAddress)
          : Promise.resolve(null),
      ]);
      setClaimableMicro(snap.claimableMicro);
      setClaimedMicro(snap.claimedMicro);
      setLeasingTokenBalance(snap.leasingTokenBalance);
      setLeasingTokenPriceMicro(snap.leasingTokenPriceMicro);
      setLeasingTokenTotalSupply(snap.leasingTokenTotalSupply);
      setCoreTotalLeasingTokens(snap.coreTotalLeasingTokens);
      setClosureInfo(closure);
    } finally {
      setIsLoadingEarnings(false);
    }
  }, [userInvestment, user]);

  const refreshOnChainForInvestment = useCallback(
    async (inv: Investment) => {
      if (!inv?.leasing?.contractAddress || !user?.walletAddress) {
        setIsLoadingEarnings(false);
        return;
      }
      setIsLoadingEarnings(true);
      try {
        const [snap, closure] = await Promise.all([
          loadInvestorOnChainSnapshot(inv, user),
          getLeasingClosureInfo(inv.leasing.contractAddress),
        ]);
        setClaimableMicro(snap.claimableMicro);
        setClaimedMicro(snap.claimedMicro);
        setLeasingTokenBalance(snap.leasingTokenBalance);
        setLeasingTokenPriceMicro(snap.leasingTokenPriceMicro);
        setLeasingTokenTotalSupply(snap.leasingTokenTotalSupply);
        setCoreTotalLeasingTokens(snap.coreTotalLeasingTokens);
        setClosureInfo(closure);
      } finally {
        setIsLoadingEarnings(false);
      }
    },
    [user]
  );

  const handlePullRefresh = useCallback(async () => {
    const email = user?.email;
    const uid = user?.id;
    const leasingId = userInvestment?.leasingId ?? routeInvestment?.leasingId;
    let latest: Investment | null = userInvestment;

    if (email && uid && leasingId) {
      try {
        const fresh = await getInvestmentForUserLeasing(email, uid, leasingId);
        if (fresh) {
          setServerInvestment(fresh);
          latest = fresh;
        }
      } catch (e) {
        console.warn("pull refresh investment API", e);
      }
    }

    if (latest?.leasing?.contractAddress && user?.walletAddress) {
      await refreshOnChainForInvestment(latest);
    } else {
      setIsLoadingEarnings(false);
    }

    await fetchRentMovements(latest?.leasingId);
  }, [
    user,
    userInvestment,
    routeInvestment?.leasingId,
    fetchRentMovements,
    refreshOnChainForInvestment,
  ]);

  const { refreshControlProps } = usePullToRefresh({
    onRefresh: handlePullRefresh,
  });

  useEffect(() => {
    if (!userInvestment?.leasing?.contractAddress || !user?.walletAddress) {
      setIsLoadingEarnings(false);
      setLeasingTokenBalance(0n);
      setLeasingTokenPriceMicro(0n);
      setLeasingTokenTotalSupply(0n);
      setCoreTotalLeasingTokens(0n);
      setClaimableMicro(0n);
      setClaimedMicro(0n);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoadingEarnings(true);
      const [snap, closure] = await Promise.all([
        loadInvestorOnChainSnapshot(userInvestment, user),
        getLeasingClosureInfo(userInvestment.leasing.contractAddress!),
      ]);
      if (cancelled) return;
      setClaimableMicro(snap.claimableMicro);
      setClaimedMicro(snap.claimedMicro);
      setLeasingTokenBalance(snap.leasingTokenBalance);
      setLeasingTokenPriceMicro(snap.leasingTokenPriceMicro);
      setLeasingTokenTotalSupply(snap.leasingTokenTotalSupply);
      setCoreTotalLeasingTokens(snap.coreTotalLeasingTokens);
      setClosureInfo(closure);
      setIsLoadingEarnings(false);
    })();
    void fetchRentMovements();
    return () => {
      cancelled = true;
    };
  }, [
    userInvestment?.leasing?.contractAddress,
    user?.walletAddress,
    userInvestment?.paymentCount,
    userInvestment,
    user,
    assetId,
    fetchRentMovements,
  ]);

  function resolveMonthlyTermMonths(): number {
    const t = asset?.agreement?.termTime;
    if (t != null && Number(t) > 0) return Math.round(Number(t));
    if (closureInfo != null && closureInfo.termMonths > 0) return closureInfo.termMonths;
    return 0;
  }

  const monthlyTermMonths = resolveMonthlyTermMonths();
  const paidInstallments = userInvestment?.paymentCount ?? 0;

  const paymentsProgressLabel = useMemo(() => {
    if (monthlyTermMonths > 0) {
      const shown = Math.min(paidInstallments, monthlyTermMonths);
      return `${shown}/${monthlyTermMonths}`;
    }
    if (paidInstallments > 0) {
      return `${paidInstallments}`;
    }
    return "—";
  }, [monthlyTermMonths, paidInstallments]);

  const rentMovements: Transaction[] = useMemo(() => {
    const formatDate = (date: string | Date): string => {
      if (!date) return new Date().toLocaleDateString("es-CO");
      return new Date(date).toLocaleDateString("es-CO");
    };
    return rawRentLogs.map((log, index) => {
      let description = rewriteRentClaimLogDescription(log.reference || "Renta reclamada", monthlyTermMonths);
      description = description
        .replace(/Inversi[óo]n\s+en/gi, "Compra de")
        .replace(/Inversi[óo]n/gi, "Compra")
        .replace(/\[Intereses\]/gi, "[Rendimiento]")
        .replace(/Intereses/gi, "Rendimiento");
      return {
        id: `${log.userId}-${index}`,
        type: "investment-return",
        description,
        date: formatDate(log.timestamp || new Date().toISOString()),
        amount: Math.round(log.txAmount),
      };
    });
  }, [rawRentLogs, monthlyTermMonths]);

  const claimableCopDisplay = microToCopAmount(claimableMicro);
  const claimedCopDisplay = microToCopAmount(claimedMicro);

  const pricePerBrickMicro = useMemo(
    () => resolvePricePerBrickMicro(leasingTokenPriceMicro, asset?.pricePerToken ?? 0),
    [leasingTokenPriceMicro, asset?.pricePerToken]
  );

  /** Total de bricks del activo en catálogo (p. ej. 16); sirve para detectar escala nominal vs capital. */
  const catalogBricksForScale = useMemo(() => {
    const t = asset?.tokens;
    if (t != null && Number(t) > 0) return Math.round(Number(t));
    return 0;
  }, [asset?.tokens]);

  /** Nominal = 1 brick ≈ 10⁶ raw; COP/micro = mint con capital comprometido (suministro raw >> bricks×10⁶). */
  const isCapitalScaleBrickToken = useMemo(
    () =>
      isCopMicroLeasingToken(leasingTokenTotalSupply, coreTotalLeasingTokens, catalogBricksForScale),
    [leasingTokenTotalSupply, coreTotalLeasingTokens, catalogBricksForScale]
  );
  const isNominalBrickScale = !isCapitalScaleBrickToken;

  const capitalVigenteCop = useMemo(() => {
    if (leasingTokenBalance === 0n) return 0;
    if (isNominalBrickScale) {
      return nominalCapitalCopIntegerFromRaw(leasingTokenBalance, asset?.pricePerToken ?? 0);
    }
    return rawBalanceToCapitalCopAmount(leasingTokenBalance);
  }, [leasingTokenBalance, isNominalBrickScale, asset?.pricePerToken]);

  /** En escala nominal: COP retirados del activo vía quema de BRICKS (inversión inicial − saldo capital en tokens). */
  const amortizacionAcumuladaTokensCop = useMemo(() => {
    if (!isNominalBrickScale) return null;
    const ini = Math.round(userInvestment?.amount ?? 0);
    if (ini <= 0) return null;
    return Math.max(0, ini - capitalVigenteCop);
  }, [isNominalBrickScale, userInvestment?.amount, capitalVigenteCop]);

  const totalBricksComprados = useMemo(() => {
    const fromInvestment = userInvestment?.bricksCount;
    const fromAgreement = asset?.agreement?.tokensPurchased;
    if (fromInvestment != null && fromInvestment > 0) return fromInvestment;
    if (fromAgreement != null && fromAgreement > 0) return Math.round(Number(fromAgreement));
    return 0;
  }, [userInvestment?.bricksCount, asset?.agreement?.tokensPurchased]);

  const bricksQuemadosAcumuladosLabel = useMemo(() => {
    if (!isNominalBrickScale || totalBricksComprados <= 0) return null;
    const current = Number(leasingTokenBalance) / 1e6;
    if (!Number.isFinite(current)) return null;
    const burned = Math.max(0, totalBricksComprados - current);
    if (burned <= 1e-9) return null;
    return formatBricksDecimalQuantity(burned);
  }, [isNominalBrickScale, totalBricksComprados, leasingTokenBalance]);

  const bricksActualesLabel = useMemo(() => {
    if (leasingTokenBalance === 0n) return "0";
    if (isNominalBrickScale) return formatBricksTokenHuman(leasingTokenBalance);
    return formatCurrentBricks(leasingTokenBalance, pricePerBrickMicro);
  }, [leasingTokenBalance, isNominalBrickScale, pricePerBrickMicro]);

  const contractMonthsLabel = useMemo(() => {
    const term = asset?.agreement?.termTime;
    if (term != null && Number(term) > 0) return `${Math.round(Number(term))} meses`;
    const contractPeriod = asset?.contractTime ? new Date(asset.contractTime) : new Date();
    const m = differenceInMonths(new Date(), contractPeriod);
    return `${m} meses`;
  }, [asset?.agreement?.termTime, asset?.contractTime]);

  if (!assetId || !asset || !userInvestment) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 justify-center items-center bg-gray-50">
          <Text className="text-gray-600">Cargando...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  const categoryType = asset.type || "Maquinaria";
  const categoryIconCircleBg = getCategoryIconCircleBackground(categoryType);
  const categoryIconGlyph = getCategoryIconGlyphColor(categoryType);
  const categoryIcon = getCategoryIcon(categoryType);

  const handleClaimRent = async () => {
    if (!userInvestment?.leasing?.contractAddress || !user?.email || !user?.id || !user?.walletAddress) {
      console.warn("Missing contract address or email address");
      showRentClaimSessionIncomplete();
      return;
    }

    if (claimableMicro === 0n) return;

    const amountMicroBeforeClaim = claimableMicro;
    setIsClaimingRent(true);
    setClaimableMicro(0n);

    try {
      const { baseToken: tokenAddress, paymasterAddress } =
        await useBlockchainConfigStore.getState().fetchConfig({ force: true });

      const permit = await generatePermit(
        tokenAddress,
        paymasterAddress,
        user.walletAddress || "",
        0,
        { operation: "claimRent" }
      );

      const claimRentDto: ClaimRent = {
        token: tokenAddress,
        receiver: user.walletAddress,
        amount: microToCopAmount(amountMicroBeforeClaim),
        deadline: permit.deadline,
        permitSignature: {
          v: permit.v,
          r: permit.r,
          s: permit.s,
        },
      };

      const ok = await claimRent(user.id, userInvestment.leasingId, user.email, claimRentDto);
      if (!ok) {
        await refreshOnChainSnapshot();
        showRentClaimRejectedByServer();
        return;
      }

      const coreAddr = userInvestment.leasing.contractAddress;
      const polled = await pollClaimableMicroAfterClaim(coreAddr, user.walletAddress);
      setClaimableMicro(polled);

      const snap = await loadInvestorOnChainSnapshot(userInvestment, user);
      setClaimedMicro(snap.claimedMicro);
      setLeasingTokenBalance(snap.leasingTokenBalance);
      setLeasingTokenPriceMicro(snap.leasingTokenPriceMicro);
      setLeasingTokenTotalSupply(snap.leasingTokenTotalSupply);
      setCoreTotalLeasingTokens(snap.coreTotalLeasingTokens);

      const closure = await getLeasingClosureInfo(coreAddr);
      setClosureInfo(closure);

      if (user.email && user.id) {
        try {
          const fresh = await getInvestmentForUserLeasing(user.email, user.id, userInvestment.leasingId);
          if (fresh) setServerInvestment(fresh);
        } catch (e) {
          console.warn("post-claim investment refresh", e);
        }
      }

      await fetchRentMovements();
      showRentClaimSuccess();
    } catch (error) {
      console.error("Error claiming rent:", error);
      await refreshOnChainSnapshot();
      showRentClaimError(error);
    } finally {
      setIsClaimingRent(false);
    }
  };

  return (
    <SafeAreaProvider>
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl {...refreshControlProps} />}
      >
        <View className="p-4 gap-4">
          <Card variant="default" className="bg-white shadow-sm">
            <View className="flex-row items-start gap-4 mb-4">
              {asset.miniatureImageUrl || asset.coverImageUrl ? (
                <Image
                  source={{ uri: asset.miniatureImageUrl || asset.coverImageUrl || "" }}
                  className="w-16 h-16 rounded-lg"
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="w-16 h-16 rounded-lg justify-center items-center"
                  style={{ backgroundColor: categoryIconCircleBg }}
                >
                  {categoryIcon ? (
                    React.cloneElement(
                      categoryIcon as React.ReactElement<{
                        width?: number;
                        height?: number;
                        color?: string;
                      }>,
                      { width: 28, height: 28, color: categoryIconGlyph }
                    )
                  ) : (
                    <Ionicons name="cube-outline" size={24} color={categoryIconGlyph} />
                  )}
                </View>
              )}
              <View className="flex-1">
                <Text className="text-lg font-libre-bold text-gray-900 mb-1">{asset.name}</Text>
                <Text className="text-sm text-gray-600 mb-2">{asset.type}</Text>
                <View className="flex-row items-center gap-2">
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: categoryIconCircleBg }}
                  >
                    <Text
                      className="text-xs font-libre-bold"
                      style={{ color: categoryIconGlyph }}
                    >
                      TIR: {asset.tir || 0}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-4 gap-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total bricks comprados</Text>
                <Text className="font-libre-bold text-gray-900">
                  {totalBricksComprados > 0 ? totalBricksComprados : "—"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Bricks actuales</Text>
                <Text className="font-libre-bold text-gray-900">
                  {isLoadingEarnings ? "..." : bricksActualesLabel}
                </Text>
              </View>
              {bricksQuemadosAcumuladosLabel != null ? (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Bricks quemados (acum.)</Text>
                  <Text className="font-libre-bold text-gray-900">{bricksQuemadosAcumuladosLabel}</Text>
                </View>
              ) : null}
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Valor por token</Text>
                <Text className="font-libre-bold text-gray-900">
                  {formatCurrency(asset.pricePerToken)} COP$
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Inversión inicial</Text>
                <Text className="font-libre-bold text-gray-900">
                  {formatCurrency(userInvestment.amount || 0)} COP$
                </Text>
              </View>
              {amortizacionAcumuladaTokensCop != null && amortizacionAcumuladaTokensCop > 0 ? (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Amortización acum. (tokens)</Text>
                  <Text className="font-libre-bold text-gray-900">
                    {formatCurrency(amortizacionAcumuladaTokensCop)} COP$
                  </Text>
                </View>
              ) : null}
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Saldo capital en activo</Text>
                <Text className="font-libre-bold text-gray-900">
                  {isLoadingEarnings ? "..." : formatCurrency(capitalVigenteCop)} COP$
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total rentas reclamadas</Text>
                <Text className="font-libre-bold text-gray-900">
                  {isLoadingEarnings ? "..." : formatCurrency(claimedCopDisplay)} COP$
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Tiempo de contrato</Text>
                <Text className="font-libre-bold text-gray-900">{contractMonthsLabel}</Text>
              </View>
            </View>
          </Card>

          <Card variant="default" className="bg-white shadow-sm">
            <View className="mb-4">
              <Text className="text-lg font-libre-bold text-gray-900 mb-4">Estado de pagos</Text>

              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600">Número de pagos</Text>
                  <View className="bg-blue-50 px-3 py-1 rounded-full">
                    <Text className="font-libre-bold text-blue-600">{paymentsProgressLabel}</Text>
                  </View>
                </View>
                {monthlyTermMonths === 0 && paidInstallments > 0 ? (
                  <Text className="text-xs text-gray-500">
                    Cuotas reclamadas en la app. El plazo total se muestra cuando está en el acuerdo o se lee del
                    contrato en cadena.
                  </Text>
                ) : null}

                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600">Valor por reclamar</Text>
                  <View className="bg-green-50 px-3 py-1 rounded-full">
                    <Text className="font-libre-bold text-green-600">
                      {isLoadingEarnings ? "..." : formatCurrency(claimableCopDisplay)} COP$
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Button
              label={isClaimingRent ? "Reclamando..." : "Reclamar renta"}
              variant="primary"
              onPress={handleClaimRent}
              className="!w-full"
              textClassName="text-blue-primary"
              disabled={isLoadingEarnings || claimableMicro === 0n || isClaimingRent}
            />
          </Card>

          <Card variant="default" className="bg-white shadow-sm">
            <View className="mb-4">
              <Text className="text-lg font-libre-bold text-gray-900 mb-4">Rentas reclamadas</Text>

              {isLoadingMovements ? (
                <View className="py-6 items-center">
                  <ActivityIndicator size="large" color={Colors.bluePrimary} />
                  <Text className="text-gray-500 mt-2">Cargando movimientos...</Text>
                </View>
              ) : rentMovements.length > 0 ? (
                <FlatList
                  data={rentMovements}
                  renderItem={renderTransactionItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  contentContainerStyle={{
                    paddingBottom: 20,
                    paddingHorizontal: 16,
                    flexGrow: 1,
                  }}
                  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                />
              ) : (
                <View className="py-6 items-center">
                  <Ionicons name="receipt-outline" size={48} color={Colors.gray} />
                  <Text className="text-gray-500 mt-2">No tienes rentas reclamadas aún</Text>
                </View>
              )}
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
