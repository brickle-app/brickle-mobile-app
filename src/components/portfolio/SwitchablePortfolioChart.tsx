import React, { useState, useMemo } from "react";
import { View, Text, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { Colors } from "@/assets/Colors";

interface DataItem {
  value: number;
  frontColor: string;
  label?: string;
}

interface ProjectionMonthPoint {
  month: string;
  /** Principal pendiente al cierre del mes (barra grande, decreciente). */
  projectedValue: number;
  monthText: string;
  /** Capital devuelto ese mes (segmento superior). */
  capital?: number;
  /** Capital devuelto ese mes (alias). */
  capitalReturned?: number;
  /** Intereses del mes (segmento medio, decreciente). */
  interest?: number;
}

interface SwitchablePortfolioChartProps {
  barDataCapital: DataItem[];
  barDataRendimiento: DataItem[];
  projectionData?: ProjectionMonthPoint[];
  title: string;
  value: string;
  roi: string;
  currentValue?: number;
}

// Colores de la gráfica de portfolio
const COLOR_PRINCIPAL = Colors.bluePrimary;           // azul — principal restante
const COLOR_INTEREST  = Colors.greenPrimary;           // verde claro — intereses del mes
const COLOR_CAPITAL   = Colors.bluePrimary;            // verde oscuro/casi azul — capital devuelto

export const SwitchablePortfolioChart = ({
  barDataCapital,
  barDataRendimiento,
  projectionData,
  title,
  value,
  roi,
  currentValue = 0,
}: SwitchablePortfolioChartProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const screenWidth = Dimensions.get("window").width - 50;

  // Hay datos de proyección con el nuevo modelo de amortización si capital > 0
  const showProjections = projectionData && projectionData.length > 0;
  const isAmortizationMode =
    showProjections &&
    projectionData!.some((p) => {
      const capitalMonth = p.capital ?? p.capitalReturned ?? 0;
      return capitalMonth > 0 && typeof p.interest === "number";
    });

  // ── Histórico (barras Capital + Rendimiento) ──────────────────────────────
  const historicalOriginalData = useMemo(
    () =>
      barDataCapital.map((c, i) => ({
        capital: c.value,
        rendimiento: barDataRendimiento[i]?.value ?? 0,
        interest: 0,
        principal: 0,
        delivered: 0,
        projectedValue: 0,
        label: c.label,
      })),
    [barDataCapital, barDataRendimiento]
  );

  const historicalStackedData = useMemo(
    () =>
      barDataCapital.map((c, i) => {
        const rendimientoValue = barDataRendimiento[i]?.value ?? 0;
        return {
          stacks: [
            { value: Math.max(0, c.value), color: COLOR_PRINCIPAL },
            { value: Math.max(0, rendimientoValue), color: Colors.greenPrimary },
          ],
          label: c.label,
        };
      }),
    [barDataCapital, barDataRendimiento]
  );

  // ── Proyección amortización (2 capas visibles: Intereses + Capital) ────────
  const projectionOriginalData = useMemo(
    () =>
      projectionData?.map((p) => {
        const capDevuelto = p.capital ?? p.capitalReturned ?? 0;
        const intereses = p.interest ?? 0;
        const principal = Math.max(0, p.projectedValue);
        return {
          principal,
          interest: intereses,
          capital: capDevuelto,
          delivered: capDevuelto + intereses,
          rendimiento: intereses,          // alias para tooltip genérico
          label: p.monthText,
          projectedValue: p.projectedValue,
        };
      }) ?? [],
    [projectionData]
  );

  const projectionStackedData = useMemo(() => {
    if (!projectionData?.length) return [];

    if (isAmortizationMode) {
      return projectionData.map((p) => {
        const capDevuelto = Math.max(0, p.capital ?? p.capitalReturned ?? 0);
        const intereses   = Math.max(0, p.interest ?? 0);
        return {
          stacks: [
            { value: intereses,   color: COLOR_INTEREST  },
            { value: capDevuelto, color: COLOR_CAPITAL   },
          ],
          label: p.monthText,
        };
      });
    }

    // Fallback: modo legado (sin amortización)
    return projectionData.map((p) => {
      const projectedReturn = Math.max(0, p.projectedValue - currentValue);
      return {
        stacks: [
          { value: currentValue,    color: COLOR_PRINCIPAL },
          { value: projectedReturn, color: Colors.greenPrimary },
        ],
        label: p.monthText,
      };
    });
  }, [projectionData, currentValue, isAmortizationMode]);

  const currentStackedData = showProjections
    ? projectionStackedData
    : historicalStackedData;
  const currentOriginalData = showProjections
    ? projectionOriginalData
    : historicalOriginalData;

  // ── Tooltip ───────────────────────────────────────────────────────────────
  const renderTooltip = () => {
    if (selectedIndex === null || !currentOriginalData[selectedIndex]) return null;
    const item = currentOriginalData[selectedIndex];

    return (
      <View
        style={{
          position: "absolute",
          top: 10,
          left: Math.min(selectedIndex * 48 + 20, screenWidth - 170),
          backgroundColor: "white",
          borderRadius: 8,
          padding: 8,
          borderColor: "#e2e8f0",
          borderWidth: 1,
          zIndex: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {item.label && (
          <Text style={{ fontSize: 12, marginBottom: 4, fontWeight: "bold" }}>
            {item.label}
          </Text>
        )}

        {showProjections && isAmortizationMode ? (
          <>
            <View style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#334155" }}>
                Entrega del mes: {formatCurrency(item.delivered)}
              </Text>
              <Text style={{ fontSize: 10, color: "#64748b" }}>
                Valor portfolio pendiente: {formatCurrency(item.projectedValue)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <View style={{ width: 8, height: 8, backgroundColor: COLOR_INTEREST, borderRadius: 4, marginRight: 4 }} />
              <Text style={{ fontSize: 11 }}>
                Intereses: {formatCurrency(item.interest)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 8, height: 8, backgroundColor: COLOR_CAPITAL, borderRadius: 4, marginRight: 4 }} />
              <Text style={{ fontSize: 11 }}>
                Capital devuelto: {formatCurrency(item.capital)}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <View style={{ width: 8, height: 8, backgroundColor: COLOR_PRINCIPAL, borderRadius: 4, marginRight: 4 }} />
              <Text style={{ fontSize: 11 }}>Capital: {formatCurrency(item.capital)}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 8, height: 8, backgroundColor: Colors.greenPrimary, borderRadius: 4, marginRight: 4 }} />
              <Text style={{ fontSize: 11 }}>Rendimiento: {formatCurrency(item.rendimiento)}</Text>
            </View>
          </>
        )}
      </View>
    );
  };

  // ── Leyenda ───────────────────────────────────────────────────────────────
  const renderLegend = () => {
    if (showProjections && isAmortizationMode) {
      return (
        <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLOR_INTEREST, marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: "#374151" }}>Intereses</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLOR_CAPITAL, marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: "#374151" }}>Capital devuelto</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={{ marginTop: 12, flexDirection: "column", gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLOR_PRINCIPAL, marginRight: 6 }} />
          <Text style={{ fontSize: 12, color: "#374151" }}>
            {showProjections ? "Capital invertido" : "Capital invertido"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.greenPrimary, marginRight: 6 }} />
          <Text style={{ fontSize: 12, color: "#374151" }}>
            {showProjections ? "Rendimiento proyectado" : "Rendimiento obtenido"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex flex-col w-full rounded-lg bg-white shadow-md overflow-hidden mb-4">
      {/* Header */}
      <View className="bg-white rounded-t-2xl p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-2">
            <Text className="text-sm text-gray-500">{title}</Text>
            <Text className="text-2xl font-libre-bold text-gray-800">
              {formatCurrency(parseFloat(value))}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: Colors.greenPrimary,
              borderRadius: 4,
              justifyContent: "center",
              alignItems: "center",
              width: 100,
              height: 25,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "bold", color: Colors.bluePrimary }}>
              {parseFloat(roi).toFixed(2)}% E.A.
            </Text>
          </View>
        </View>

        {renderLegend()}
      </View>

      {/* Chart */}
      <View className="px-4 pb-4">
        {currentStackedData && currentStackedData.length > 0 ? (
          <View style={{ height: 260, width: "100%", position: "relative" }}>
            {renderTooltip()}
            <BarChart
              stackData={currentStackedData}
              barWidth={showProjections && isAmortizationMode ? 28 : 22}
              initialSpacing={24}
              spacing={showProjections && isAmortizationMode ? 20 : 18}
              hideYAxisText={false}
              yAxisTextStyle={{ fontSize: 9, color: "#94a3b8" }}
              formatYLabel={(label: string) => {
                const n = parseFloat(label.replace(/\s/g, "").replace(",", "."));
                if (isNaN(n)) return label;
                const abs = Math.abs(n);
                if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
                if (abs >= 1_000)    return `${Math.round(n / 1_000)}k`;
                return String(Math.round(n));
              }}
              yAxisLabelWidth={44}
              hideAxesAndRules={false}
              xAxisColor="#e2e8f0"
              yAxisColor="#e2e8f0"
              rulesColor="#f1f5f9"
              yAxisThickness={0}
              xAxisThickness={1}
              width={screenWidth - 44}
              barBorderRadius={4}
              isAnimated
              onPress={(_: any, index: number) => {
                setSelectedIndex(selectedIndex === index ? null : index);
              }}
            />
          </View>
        ) : (
          <View style={{ height: 260, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#666", fontSize: 16, marginBottom: 10 }}>
              No hay datos disponibles
            </Text>
            <Text style={{ color: "#999", fontSize: 14 }}>
              {showProjections ? "Proyecciones del portafolio" : "Histórico del portafolio"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
