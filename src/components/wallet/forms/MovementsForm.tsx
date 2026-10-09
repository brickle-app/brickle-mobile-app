import { View, Text, TouchableOpacity, TextInput, SectionList, RefreshControl } from "react-native";
import { renderTransactionItem, Transaction } from "./TransactionsHistory";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { Card } from "../../ui/card/Card";
import { Colors } from "@/assets/Colors";
import Buscar from "@/assets/icons/SVG/Buscar.svg";
import { TransactionRowSkeleton } from "../../ui/skeleton";
import { getUserActivityLogs } from "@/src/services/useractivity.service";
import { authStore } from "@/src/store/auth.store";
import { UserActivityLog } from "@/src/types/user.types";
import { groupTransactionsByDay } from "@/src/utils/transactionGroups";

const RANGE_OPTIONS = [7, 15, 30, 60, 90];

const mapUserActivityLogToTransaction = (log: UserActivityLog, index: number): Transaction => {
  const getTransactionType = (type: string): Transaction['type'] => {
    switch (type) {
      case 'INVESTMENT':
        return 'investment';
      case 'INVESTMENT-RETURN':
      case 'INVESTMENT-RETURN-INTEREST':
      case 'INVESTMENT-RETURN-CAPITAL':
        return 'investment-return';
      case 'INVESTMENT-RETURN-FEE':
      case 'INVESTMENT-RETURN-WITHHOLDING':
        return 'deduction';
      case 'RECHARGE':
        return 'recharge';
      case 'WITHDRAW':
        return 'withdraw';
      default:
        return 'recharge'; // fallback
    }
  };

  const formatDate = (date: string | Date): string => {
    if (!date) return new Date().toLocaleDateString('es-CO');
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-CO');
  };

  return {
    id: `${log.userId}-${index}`, // Generate unique ID
    type: getTransactionType(log.type),
    description: (log.reference || `${log.type.toLowerCase().replace('-', ' ')}`)
      .replace(/Inversi[óo]n\s+en/gi, "Compra de")
      .replace(/Inversi[óo]n/gi, "Compra")
      .replace(/\[Intereses\]/gi, "[Rendimiento]")
      .replace(/Intereses/gi, "Rendimiento"),
    date: formatDate(log.timestamp || new Date().toISOString()),
    amount: Math.round(log.txAmount),
    occurredAt: log.timestamp ? new Date(log.timestamp).toISOString() : undefined,
  };
};

export const MovementsForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [daysBack, setDaysBack] = useState(30);
  const { user } = authStore();
  const latestRequest = useRef(0);

  const loadTransactions = useCallback(
    async (range: number) => {
      if (!user?.id || !user?.email) {
        setError("Usuario no autenticado");
        setIsFetching(false);
        return;
      }

      // Only the most recent request may update the screen: switching ranges quickly must not
      // let a slow, older response overwrite a newer one.
      const requestId = ++latestRequest.current;
      setIsFetching(true);
      setError(null);

      try {
        const response = await getUserActivityLogs(user.email!, user.id!, undefined, range);
        if (requestId !== latestRequest.current) return;
        setTransactions((response?.logs ?? []).map(mapUserActivityLogToTransaction));
        setHasLoadedOnce(true);
      } catch (loadError) {
        if (requestId !== latestRequest.current) return;
        console.warn('Error fetching transactions:', loadError);
        setError("No pudimos cargar tus movimientos. Revisa tu conexión e inténtalo de nuevo.");
      } finally {
        if (requestId === latestRequest.current) setIsFetching(false);
      }
    },
    [user?.id, user?.email]
  );

  useEffect(() => {
    void loadTransactions(daysBack);
  }, [loadTransactions, daysBack]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadTransactions(daysBack);
    setIsRefreshing(false);
  }, [loadTransactions, daysBack]);

  const handleSelectRange = (days: number) => {
    if (days === daysBack) return;
    Haptics.selectionAsync().catch(() => {});
    setDaysBack(days);
  };

  const sections = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? transactions.filter(
          (transaction) =>
            transaction.description.toLowerCase().includes(term) || transaction.date.includes(term)
        )
      : transactions;
    return groupTransactionsByDay(filtered);
  }, [transactions, searchTerm]);

  const showSkeleton = isFetching && !hasLoadedOnce;
  const showBlockingError = error !== null && !hasLoadedOnce;

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-libre-bold mb-5">Historial de movimientos</Text>
      <Card className="bg-primary-white rounded-[10px] py-6 flex-1">
        <View className="px-4 mb-3">
          <View className="flex-row items-center border border-secondary rounded-full bg-white px-4 h-12">
            <Buscar color={Colors.textPrimary} width={26} height={26} />
            <TextInput
              className="flex-1 px-2 text-text-primary text-sm"
              placeholder="Buscar movimiento"
              placeholderTextColor={Colors.gray}
              value={searchTerm}
              onChangeText={setSearchTerm}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchTerm ? (
              <TouchableOpacity
                onPress={() => setSearchTerm("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Borrar búsqueda"
              >
                <Ionicons name="close-circle" size={20} color={Colors.gray} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View className="flex-row mt-3" style={{ gap: 8 }}>
            {RANGE_OPTIONS.map((days) => {
              const selected = days === daysBack;
              return (
                <TouchableOpacity
                  key={days}
                  onPress={() => handleSelectRange(days)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Últimos ${days} días`}
                  className={`rounded-full px-3.5 py-1.5 border ${
                    selected ? "bg-blue-primary border-blue-primary" : "bg-white border-secondary"
                  }`}
                >
                  <Text className={`text-xs font-libre-bold ${selected ? "text-white" : "text-text-primary"}`}>
                    {days}d
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {showSkeleton ? (
          <TransactionRowSkeleton rows={5} />
        ) : showBlockingError ? (
          <View className="py-6 items-center px-6">
            <Ionicons name="cloud-offline-outline" size={44} color={Colors.orangePrimary} />
            <Text className="text-gray-500 mt-3 text-center">{error}</Text>
            <TouchableOpacity
              className="mt-4 bg-blue-primary px-5 py-2.5 rounded-full"
              onPress={() => void loadTransactions(daysBack)}
            >
              <Text className="text-white font-libre-bold">Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View entering={FadeIn.duration(220)} style={{ flex: 1, opacity: isFetching && !isRefreshing ? 0.55 : 1 }}>
            {error ? (
              <TouchableOpacity onPress={() => void loadTransactions(daysBack)} className="mx-4 mb-2 py-2 px-3 rounded-xl bg-orange-primary/10">
                <Text className="text-xs text-text-primary">{error} Toca para reintentar.</Text>
              </TouchableOpacity>
            ) : null}
            <SectionList
              sections={sections}
              renderItem={renderTransactionItem}
              renderSectionHeader={({ section }) => (
                <Text className="text-xs font-libre-bold text-gray-500 uppercase tracking-wide pt-4 pb-2 px-5">
                  {section.title}
                </Text>
              )}
              keyExtractor={(item) => item.id}
              stickySectionHeadersEnabled={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              style={{ flex: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={Colors.bluePrimary}
                  colors={[Colors.bluePrimary]}
                />
              }
              ListEmptyComponent={
                <View className="py-10 items-center">
                  <Ionicons name="receipt-outline" size={48} color={Colors.gray} />
                  <Text className="text-gray-500 mt-2 text-center px-6">
                    {searchTerm
                      ? "No encontramos movimientos con esa búsqueda"
                      : `No tienes movimientos en los últimos ${daysBack} días`}
                  </Text>
                  {searchTerm ? (
                    <TouchableOpacity className="mt-2" onPress={() => setSearchTerm("")}>
                      <Text className="text-blue-primary font-libre-bold">Limpiar búsqueda</Text>
                    </TouchableOpacity>
                  ) : daysBack < 90 ? (
                    <TouchableOpacity className="mt-2" onPress={() => handleSelectRange(90)}>
                      <Text className="text-blue-primary font-libre-bold">Ver los últimos 90 días</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              }
              contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16, flexGrow: 1 }}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          </Animated.View>
        )}
      </Card>
    </View>
  );
};
