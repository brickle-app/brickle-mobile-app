import React, { useMemo, useCallback } from "react";
import { View, Text, Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { formatCurrency, parseCopAmountFromText } from "@/src/utils/formatCurrency";
import { Colors } from "@/assets/Colors";

export interface PortfolioLinePoint {
  value: number;
  label: string;
}

interface PortfolioHistoricalLineChartProps {
  series: PortfolioLinePoint[];
  title: string;
  value: string;
  roi: string;
}

function formatYAxisCopAbsolute(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1000) return `${Math.round(value / 1000)}k`;
  return String(Math.round(value));
}

export function PortfolioHistoricalLineChart({
  series,
  title,
  value,
  roi,
}: PortfolioHistoricalLineChartProps) {
  const windowWidth = Dimensions.get("window").width;
  /** Ancho útil: padding del card (p-4) + eje Y; evita que la línea se dibuje fuera del contenedor. */
  const chartWidth = Math.max(200, windowWidth - 72);

  const data = useMemo(
    () =>
      series.map((p) => ({
        value: typeof p.value === "number" && Number.isFinite(p.value) ? p.value : 0,
        label: p.label ?? "",
      })),
    [series]
  );

  /** Eje Y desde el mínimo de la serie (capital total anclado) hacia arriba, no desde cero absoluto. */
  const { chartData, maxValue, yAxisLabelTexts } = useMemo(() => {
    const vals = data.map((d) => d.value);
    const vmin = Math.min(...vals);
    const vmax = Math.max(...vals);
    let span = Math.max(vmax - vmin, 1);
    const minBand = Math.max(Math.abs(vmax) * 0.015, 50_000);
    if (span < minBand) span = minBand;
    const floor = vmax - span;
    const shifted = data.map((d) => ({ ...d, value: d.value - floor }));
    const maxV = span * 1.12;
    const sections = 4;
    // Orden: índice 0 = parte inferior del gráfico (mínimo), último = arriba (máximo).
    const labels: string[] = [];
    for (let i = 0; i <= sections; i++) {
      const absVal = floor + (span * i) / sections;
      labels.push(formatYAxisCopAbsolute(absVal));
    }
    return { chartData: shifted, maxValue: maxV, yAxisLabelTexts: labels };
  }, [data]);

  const initialSpacing = 18;
  const endSpacing = 14;
  const yAxisReserve = 84;
  /** Espaciado mínimo entre puntos para lectura; el contenedor hace scroll horizontal si hace falta. */
  const minPointSpacing = 58;
  const scrollChartWidth = useMemo(() => {
    const n = chartData.length;
    if (n <= 1) return chartWidth;
    return Math.max(
      chartWidth,
      initialSpacing + endSpacing + yAxisReserve + (n - 1) * minPointSpacing
    );
  }, [chartData.length, chartWidth]);

  const spacing = useMemo(() => {
    const n = chartData.length;
    if (n <= 1) return 8;
    const plotSpan = scrollChartWidth - initialSpacing - endSpacing - yAxisReserve;
    return Math.max(minPointSpacing, plotSpan / (n - 1));
  }, [chartData.length, scrollChartWidth]);

  const dataPointLabelComponent = useCallback(
    (_item: { value?: number }, index: number) => {
      const row = data[index];
      if (!row) return <View />;
      return (
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 8,
            backgroundColor: "#fff",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            minWidth: 130,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 11, color: "#64748b" }}>{row.label || "Mes"}</Text>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1C3647", marginTop: 4 }}>
            {formatCurrency(row.value)}
          </Text>
          <Text style={{ fontSize: 9, color: "#94a3b8", marginTop: 4 }}>Patrimonio proyectado</Text>
        </View>
      );
    },
    [data]
  );

  if (!data.length) {
    return (
      <View className="bg-white w-full rounded-b-2xl mb-4 shadow-md p-4">
        <Text className="text-sm text-gray-500">{title}</Text>
        <Text className="text-gray-500 mt-4">No hay datos del periodo</Text>
      </View>
    );
  }

  const allZero = chartData.every((d) => d.value === 0);

  return (
    <View className="bg-white w-full rounded-b-2xl mb-4 shadow-md p-4">
      <View className="flex flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-2">
          <Text className="text-sm text-gray-500">{title}</Text>
          <Text className="text-2xl font-libre-bold text-gray-800">
            {formatCurrency(parseCopAmountFromText(value))}
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

      <View className="flex flex-row items-center gap-1 mb-2">
        <View
          className="mr-2 h-[10px] w-[10px] rounded-full"
          style={{ backgroundColor: Colors.bluePrimary }}
        />
        <Text className="flex-1 text-sm text-blue-primary">
          Patrimonio
        </Text>
      </View>

      {allZero ? (
        <Text className="py-6 text-center text-sm text-slate-500">
          Aún no hay una curva de proyección para mostrar. Desliza hacia abajo para actualizar; si
          acabas de invertir, puede tardar un poco. Si esto continúa, puede faltar información del
          contrato del activo en el sistema.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          nestedScrollEnabled
          className="w-full"
          contentContainerStyle={{ flexGrow: 0 }}
        >
          <LineChart
            data={chartData}
            height={240}
            width={scrollChartWidth}
            spacing={spacing}
            initialSpacing={initialSpacing}
            endSpacing={endSpacing}
            color1={Colors.bluePrimary}
            thickness1={2.5}
            curved
            hideDataPoints1={false}
            dataPointsRadius1={5}
            dataPointsColor1={Colors.bluePrimary}
            focusEnabled
            showDataPointOnFocus={false}
            showDataPointLabelOnFocus
            focusedDataPointRadius={6}
            focusedDataPointColor={Colors.bluePrimary}
            dataPointLabelComponent={dataPointLabelComponent}
            maxValue={maxValue}
            noOfSections={4}
            yAxisLabelTexts={yAxisLabelTexts}
            yAxisLabelWidth={76}
            yAxisTextStyle={{
              fontSize: 10,
              color: "#64748b",
              textAlign: "right",
              width: 72,
            }}
            yAxisLabelContainerStyle={{ paddingRight: 4 }}
            xAxisColor="#e2e8f0"
            yAxisColor="#e2e8f0"
            rulesColor="#f1f5f9"
            yAxisThickness={0}
            xAxisThickness={1}
            hideRules={false}
            showVerticalLines
            verticalLinesColor="#f1f5f9"
            xAxisLabelTextStyle={{
              fontSize: 10,
              color: "#64748b",
              width: 40,
              textAlign: "center",
            }}
            rotateLabel={false}
            isAnimated
            showStripOnFocus
            stripColor="rgba(28,54,71,0.2)"
            unFocusOnPressOut
          />
        </ScrollView>
      )}
    </View>
  );
}
