import { PortfolioChartDto } from "@/src/interfaces/investments.interface";
import { getPortfolioByUserId } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { useEffect, useState, useMemo, useCallback } from "react";

interface ParsedChartData {
  barDataCapital: { value: number; label: string; frontColor: string }[];
  barDataRendimiento: { value: number; label: string; frontColor: string }[];
  /** Misma serie que envía el API en `value`: capital acumulado + rendimientos acumulados al cierre de cada mes. */
  barDataCombined: { value: number; label: string; frontColor: string }[];
  projectedLineData: { value: number; label: string }[];
  totalValue: string;
  roi: string;
}

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioChartDto | null>(null);
  const setTotalReturn = authStore((state) => state.setTotalReturn);
  const setTotalInvested = authStore((state) => state.setTotalInvested);
  const setCurrentValue = authStore((state) => state.setCurrentValue);
  const setRoi = authStore((state) => state.setRoi);
  const [isLoading, setIsLoading] = useState(true);
  const user = authStore((state) => state.user);

  const fetchPortfolio = useCallback(async () => {
    if (user?.email && user?.id) {
      setIsLoading(true);
      try {
        const from = new Date();
        from.setMonth(from.getMonth() - 5); // Fetch last 6 months of data (5 months back + current = 6 months)
        from.setDate(1); // Start from the first day of the month

        const fromDate = `${from.getFullYear()}-${(from.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;

        const to = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;

        const data = await getPortfolioByUserId(
          user.id,
          fromDate,
          to,
          user.email
        );
        if (data) {
          setPortfolio(data);
          setTotalReturn(data.totalReturn);
          const invested =
            typeof data.totalInvested === "number" && !Number.isNaN(data.totalInvested)
              ? data.totalInvested
              : Math.max(0, data.currentValue - (data.totalReturn ?? 0));
          setTotalInvested(invested);
          setCurrentValue(data.currentValue);
          setRoi(data.roi);
        }
      } catch (error) {
        // Service already handles session errors, just log here
        console.error("Error fetching portfolio:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [user?.email, user?.id]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const chartData = useMemo((): ParsedChartData => {
    if (!portfolio) {
      return {
        barDataCapital: [],
        barDataRendimiento: [],
        barDataCombined: [],
        projectedLineData: [],
        totalValue: "0",
        roi: "0",
      };
    }

    // Helper function to convert Spanish month names to short format
    const formatSpanishMonth = (monthStr: string): string => {
      const monthMap: { [key: string]: string } = {
        Enero: "Ene",
        Febrero: "Feb",
        Marzo: "Mar",
        Abril: "Abr",
        Mayo: "May",
        Junio: "Jun",
        Julio: "Jul",
        Agosto: "Ago",
        Septiembre: "Sep",
        Octubre: "Oct",
        Noviembre: "Nov",
        Diciembre: "Dic",
      };
      return monthMap[monthStr] || monthStr;
    };

    const barDataCapital = portfolio.chart.map((item) => {
      return {
        value: item.invested,
        label: formatSpanishMonth(item.monthText),
        frontColor: "#1C3647",
      };
    });

    const barDataRendimiento = portfolio.chart.map((item) => ({
      value: item.return,
      label: formatSpanishMonth(item.monthText),
      frontColor: "#85FA8F",
    }));

    const barDataCombined = portfolio.chart.map((item) => {
      const fromApi =
        typeof item.value === "number" && !Number.isNaN(item.value)
          ? item.value
          : item.invested + item.return;
      return {
        value: fromApi,
        label: formatSpanishMonth(item.monthText),
        frontColor: "#1C3647",
      };
    });

    /** Eje X: MM/YY (horizontal, compacto). */
    const formatMonthKeyLabel = (monthKey: string | undefined): string | null => {
      if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return null;
      const [yearStr, monthStr] = monthKey.split("-");
      const mm = monthStr.padStart(2, "0");
      return `${mm}/${yearStr.slice(2)}`;
    };

    // Proyección: patrimonio = efectivo reconstruido + activos (puede ser <0 si faltan recargas en logs).
    // No forzar a 0: enmascaraba toda la curva y mostraba el mensaje de “sin inversiones”.
    const projectedLineData: { value: number; label: string }[] =
      portfolio.projectedChart?.map((p) => ({
        value: typeof p.projectedValue === "number" ? p.projectedValue : Number(p.projectedValue),
        label: formatMonthKeyLabel(p.monthKey) ?? formatSpanishMonth(p.month),
      })) ?? [];

    return {
      barDataCapital,
      barDataRendimiento,
      barDataCombined,
      projectedLineData,
      totalValue: portfolio.currentValue.toString(),
      roi: portfolio.roi.toString(),
    };
  }, [portfolio]);

  return {
    portfolio,
    chartData,
    isLoading,
    setPortfolio,
    refetch: fetchPortfolio,
  };
};
