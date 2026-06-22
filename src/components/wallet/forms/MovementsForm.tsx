import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from "react-native";
import { renderTransactionItem, Transaction } from "./TransactionsHistory";
import React, { useMemo, useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../ui/card/Card";
import { Colors } from "@/assets/Colors";
import Buscar from "@/assets/icons/SVG/Buscar.svg";
import { getUserActivityLogs } from "@/src/services/useractivity.service";
import { authStore } from "@/src/store/auth.store";
import { UserActivityLog } from "@/src/types/user.types";

const mapUserActivityLogToTransaction = (log: UserActivityLog, index: number): Transaction => {
  const getTransactionType = (type: string): Transaction['type'] => {
    switch (type) {
      case 'INVESTMENT':
        return 'investment';
      case 'INVESTMENT-RETURN':
      case 'INVESTMENT-RETURN-INTEREST':
      case 'INVESTMENT-RETURN-CAPITAL':
        return 'investment-return';
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
  };
};

export const MovementsForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysBack, setDaysBack] = useState(30);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const { user } = authStore();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id || !user?.email) {
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getUserActivityLogs(user.email!, user.id!, undefined, daysBack);

        if (response && response.logs) {
          const mappedTransactions = response.logs.map((log, index) => {
            const transaction = mapUserActivityLogToTransaction(log, index);
            return transaction;
          });
          setTransactions(mappedTransactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError("Error al cargar las transacciones");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id, user?.email, daysBack]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) =>
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.date.includes(searchTerm)
    );
  }, [transactions, searchTerm]);

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-libre-bold mb-5">Historial de movimientos</Text>
      <Card className="bg-primary-white rounded-[10px] py-8 flex-1">

        <View className="flex flex-row justify-between mb-6 px-4">
          {/* Buscador */}
          <View className="mb-4 flex-row items-center border border-secondary rounded-full bg-white px-5 py-2 h-12">
            <Buscar color={Colors.textPrimary} width={30} height={30} />
            <TextInput
              className="flex w-3/5 p-2 text-text-primary text-sm"
              placeholder="Buscar movimiento"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm ? (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <Ionicons name="close" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filtro de fechas */}
          <View className="mb-4 self-end relative">
            <TouchableOpacity
              className="border border-secondary rounded-full p-3 flex-row items-center"
              onPress={() => setShowDateFilter(!showDateFilter)}
            >
              <Ionicons name="calendar" size={18} color={Colors.textPrimary} />
              <Text className="ml-2 text-xs text-text-primary">{daysBack}d</Text>
            </TouchableOpacity>

            {showDateFilter && (
              <View className="absolute top-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[120px]">
                {[7, 15, 30, 60, 90].map((days) => (
                  <TouchableOpacity
                    key={days}
                    className={`p-3 border-b border-gray-100 ${daysBack === days ? 'bg-blue-50' : ''}`}
                    onPress={() => {
                      setDaysBack(days);
                      setShowDateFilter(false);
                    }}
                  >
                    <Text className={`text-sm ${daysBack === days ? 'text-blue-primary font-libre-bold' : 'text-gray-700'}`}>
                      Últimos {days} días
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        {loading ? (
          <View className="py-6 items-center">
            <ActivityIndicator size="large" color={Colors.bluePrimary} />
            <Text className="text-gray-500 mt-2">
              Cargando transacciones...
            </Text>
          </View>
        ) : error ? (
          <View className="py-6 items-center">
            <Ionicons name="alert-circle-outline" size={48} color={Colors.orangePrimary} />
            <Text className="text-gray-500 mt-2 text-center">
              {error}
            </Text>
            <TouchableOpacity
              className="mt-4 bg-blue-primary px-4 py-2 rounded-full"
              onPress={() => {
                // Retry fetching
                if (user?.id && user?.email) {
                  const fetchTransactions = async () => {
                    try {
                      setLoading(true);
                      setError(null);
                      const response = await getUserActivityLogs(user.email!, user.id!, undefined, daysBack);
                      if (response && response.logs) {
                        const mappedTransactions = response.logs.map((log, index) =>
                          mapUserActivityLogToTransaction(log, index)
                        );
                        setTransactions(mappedTransactions);
                      }
                    } catch {
                      setError("Error al cargar las transacciones");
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchTransactions();
                }
              }}
            >
              <Text className="text-white font-libre-bold">
                Reintentar
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            style={{ flex: 1 }}
            ListEmptyComponent={
              <View className="py-6 items-center">
                <Ionicons name="receipt-outline" size={48} color={Colors.gray} />
                <Text className="text-gray-500 mt-2">
                  {searchTerm ? "No se encontraron transacciones" : "No tienes transacciones aún"}
                </Text>
                {searchTerm && (
                  <TouchableOpacity
                    className="mt-2"
                    onPress={() => setSearchTerm("")}
                  >
                    <Text className="text-blue-primary font-libre-bold">
                      Limpiar búsqueda
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            contentContainerStyle={{
              paddingBottom: 20,
              paddingHorizontal: 16,
              flexGrow: 1,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
      </Card>
    </View>
  );
};
