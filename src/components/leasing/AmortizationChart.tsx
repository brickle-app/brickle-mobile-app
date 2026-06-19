import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { Colors } from "@/assets/Colors";
import {
  Asset,
  AmortizationTable,
} from "@/src/interfaces/investments.interface";
import { getAmortization } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";

interface AmortizationChartProps {
  asset: Asset;
  theme: {
    mainColor: string;
    secondaryColor: string;
  };
}

const BAR_WIDTH = 20;
const SPACING = 24;
const CHART_HEIGHT = 180;

export const AmortizationChart = ({ asset, theme }: AmortizationChartProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [amortizationTable, setAmortizationTable] =
    useState<AmortizationTable | null>(null);
  const [loading, setLoading] = useState(true);
  const user = authStore((state) => state.user);
  const screenWidth = Dimensions.get("window").width - 50;

  useEffect(() => {
    const fetchAmortization = async () => {
      if (!asset.id || !user?.email) return;
      try {
        setLoading(true);
        const dataFetched = await getAmortization(asset.id, user.email!);
        setAmortizationTable(dataFetched);
      } catch (error) {
        console.error("Error fetching amortization:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAmortization();
  }, [asset.id, user?.email]);

  const amortizationData = amortizationTable?.periods || [];

  const totalInstallment = amortizationTable?.totalInstallment || 0;

  const maxValue = useMemo(() => {
    if (amortizationData.length === 0) return 1;
    return Math.max(
      ...amortizationData.map((p) => p.capitalReturn + p.interest),
      1
    );
  }, [amortizationData]);

  const renderTooltip = () => {
    if (selectedIndex === null || !amortizationData[selectedIndex])
      return null;

    const period = amortizationData[selectedIndex];

    return (
      <View
        style={{
          position: "absolute",
          top: 10,
          left: Math.min(
            selectedIndex * (BAR_WIDTH + SPACING) + 24,
            screenWidth - 180
          ),
          backgroundColor: "white",
          borderRadius: 8,
          padding: 8,
          borderColor: "#ccc",
          borderWidth: 1,
          zIndex: 10,
          minWidth: 160,
        }}
      >
        <Text style={{ fontSize: 12, marginBottom: 4, fontWeight: "bold" }}>
          {period.monthLabel} - Cuota {selectedIndex + 1}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              backgroundColor: Colors.bluePrimary,
              borderRadius: 4,
              marginRight: 4,
            }}
          />
          <Text style={{ fontSize: 11 }}>
            Capital: {formatCurrency(period.capitalReturn)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              backgroundColor: Colors.greenPrimary,
              borderRadius: 4,
              marginRight: 4,
            }}
          />
          <Text style={{ fontSize: 11 }}>
            Rentabilidad: {formatCurrency(period.interest)}
          </Text>
        </View>
        <View
          style={{
            marginTop: 4,
            paddingTop: 4,
            borderTopWidth: 1,
            borderTopColor: "#e5e5e5",
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "600" }}>
            Total: {formatCurrency(period.installment)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={{
          height: 300,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.bluePrimary} />
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl mb-4 shadow-md overflow-hidden p-4">
      <View className="mb-4">
        <Text className="text-lg font-libre-bold text-gray-800 mb-1">
          Tabla de Amortización
        </Text>
        <Text className="text-sm text-gray-500">
          Cuota mensual: {formatCurrency(totalInstallment)}
        </Text>
      </View>

      <View className="relative" style={{ width: "100%" }}>
        <View className="flex absolute top-0 left-0 z-10">
          <View className="flex flex-row items-center mb-1">
            <View
              className="w-[10px] h-[10px] rounded-full"
              style={{ backgroundColor: Colors.bluePrimary }}
            />
            <Text className="text-sm text-blue-primary ml-2">
              Devolución de capital
            </Text>
          </View>
          <View className="flex flex-row items-center">
            <View
              className="w-[10px] h-[10px] rounded-full"
              style={{ backgroundColor: Colors.greenPrimary }}
            />
            <Text className="text-sm text-blue-primary ml-2">Rentabilidad</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 250, width: "100%", marginTop: 32 }}>
        {renderTooltip()}

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            height: CHART_HEIGHT,
            paddingTop: 24,
            gap: SPACING,
            paddingHorizontal: 24,
          }}
        >
          {amortizationData.map((period, index) => {
            const total = period.capitalReturn + period.interest;
            const capitalH = (period.capitalReturn / maxValue) * CHART_HEIGHT;
            const interestH = (period.interest / maxValue) * CHART_HEIGHT;
            const isSelected = selectedIndex === index;

            return (
              <TouchableOpacity
                key={`${period.monthLabel}-${index}`}
                onPress={() =>
                  setSelectedIndex(isSelected ? null : index)
                }
                activeOpacity={0.8}
                style={{
                  width: BAR_WIDTH,
                  height: CHART_HEIGHT,
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: BAR_WIDTH,
                    flexDirection: "column-reverse",
                    alignItems: "stretch",
                    height: total > 0 ? capitalH + interestH : 0,
                    borderRadius: 4,
                    overflow: "hidden",
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: Colors.bluePrimary,
                  }}
                >
                  <View
                    style={{
                      height: interestH,
                      backgroundColor: Colors.greenPrimary,
                      minHeight: interestH > 0 ? 4 : 0,
                    }}
                  />
                  <View
                    style={{
                      height: capitalH,
                      backgroundColor: Colors.bluePrimary,
                      minHeight: capitalH > 0 ? 4 : 0,
                    }}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {amortizationData.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              marginTop: 8,
              width: screenWidth,
            }}
          >
            {amortizationData
              .filter((_, i) => i % Math.max(1, Math.floor(amortizationData.length / 6)) === 0)
              .map((period, i) => (
                <Text
                  key={period.monthLabel}
                  style={{ fontSize: 10, color: "#666" }}
                  numberOfLines={1}
                >
                  {period.monthLabel}
                </Text>
              ))}
          </View>
        )}
      </View>
    </View>
  );
};
