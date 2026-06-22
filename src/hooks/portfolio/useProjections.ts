import { useState, useCallback, useMemo } from "react";
import { authStore } from "@/src/store/auth.store";
import { getPortfolioProjectionByUserId } from "@/src/services/brickle.service";
import {
  ProjectionPointDto,
} from "@/src/interfaces/investments.interface";

interface ProjectionParams {
  currentValue?: number;
  projectionMonths?: number;
  expectedAnnualReturn?: number;
  startDate?: string; // YYYY-MM format
  investedPrincipal?: number;
}

interface ParsedProjectionData {
  projectionData: {
    month: string;
    /** Principal pendiente al cierre del mes (valor de la barra grande, decreciente). */
    projectedValue: number;
    monthText: string;
    /** Capital devuelto ese mes (segmento superior de la barra). */
    capital?: number;
    /** Capital devuelto ese mes (alias de capital, compatibilidad). */
    capitalReturned?: number;
    /** Intereses generados ese mes (segmento medio, decreciente). */
    interest?: number;
  }[];
}

export const useProjections = () => {
  const [projections, setProjections] = useState<ProjectionPointDto[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = authStore((state) => state.user);

  const fetchProjections = useCallback(
    async (params: ProjectionParams) => {
      if (!user?.email || !user?.id) {
        setError("Usuario no autenticado");
        return;
      }

      // Validate required parameters
      if (!params.currentValue || params.currentValue <= 0) {
        setError(
          "El valor actual del portfolio es requerido y debe ser mayor a 0"
        );
        return;
      }

      if (!params.projectionMonths || params.projectionMonths <= 0) {
        setError(
          "El número de meses de proyección es requerido y debe ser mayor a 0"
        );
        return;
      }

      if (!params.expectedAnnualReturn || params.expectedAnnualReturn <= 0) {
        setError("La tasa anual esperada es requerida y debe ser mayor a 0");
        return;
      }

      if (!params.startDate) {
        setError("La fecha de inicio es requerida en formato YYYY-MM");
        return;
      }

      // Validate startDate format (YYYY-MM)
      const dateRegex = /^\d{4}-\d{2}$/;
      if (!dateRegex.test(params.startDate)) {
        setError("La fecha de inicio debe estar en formato YYYY-MM");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await getPortfolioProjectionByUserId(
          user.id,
          params.startDate,
          params.currentValue,
          user.email,
          params.projectionMonths,
          params.expectedAnnualReturn,
          params.investedPrincipal
        );

        if (data) {
          setProjections(data);
        }
      } catch (error) {
        console.error("Error fetching projections:", error);
        setError("Error al cargar las proyecciones del portfolio");
      } finally {
        setIsLoading(false);
      }
    },
    [user?.email, user?.id]
  );

  const parsedProjectionData = useMemo((): ParsedProjectionData => {
    if (
      !projections ||
      !Array.isArray(projections) ||
      projections.length === 0
    ) {
      return {
        projectionData: [],
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

    // Create projection data using the month names as they come from API
    const projectionData = projections.map((item) => {
      const projectedValue =
        typeof item.projectedValue === "number"
          ? item.projectedValue
          : Number(item.projectedValue ?? 0);
      const capital =
        typeof item.capital === "number"
          ? item.capital
          : Number(item.capital ?? 0);
      const capitalReturned =
        typeof item.capitalReturned === "number"
          ? item.capitalReturned
          : Number(item.capitalReturned ?? 0);
      const interest =
        typeof item.interest === "number"
          ? item.interest
          : Number(item.interest ?? 0);

      const base: ParsedProjectionData["projectionData"][number] = {
        month: item.month,
        projectedValue: Number.isFinite(projectedValue) ? projectedValue : 0,
        monthText: formatSpanishMonth(item.month),
      };
      // capital devuelto este mes
      if (Number.isFinite(capital)) {
        base.capital = capital;
      }
      if (Number.isFinite(capitalReturned)) {
        base.capitalReturned = capitalReturned;
      }
      // intereses del mes (no acumulados)
      if (Number.isFinite(interest)) {
        base.interest = interest;
      }
      return base;
    });

    return {
      projectionData,
    };
  }, [projections]);

  // Helper function to generate default start date (current month)
  const getDefaultStartDate = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  }, []);

  // Helper function to validate projection parameters before making the call
  const validateParams = useCallback(
    (params: ProjectionParams): string | null => {
      if (!params.currentValue || params.currentValue <= 0) {
        return "El valor actual del portfolio es requerido y debe ser mayor a 0";
      }

      if (!params.projectionMonths || params.projectionMonths <= 0) {
        return "El número de meses de proyección es requerido y debe ser mayor a 0";
      }

      if (!params.expectedAnnualReturn) {
        return "La tasa anual esperada es requerida";
      }

      if (params.expectedAnnualReturn < 0 || params.expectedAnnualReturn > 1) {
        return "La tasa anual esperada debe estar entre 0 y 1 (ej: 0.07 para 7%)";
      }

      if (!params.startDate) {
        return "La fecha de inicio es requerida en formato YYYY-MM";
      }

      const dateRegex = /^\d{4}-\d{2}$/;
      if (!dateRegex.test(params.startDate)) {
        return "La fecha de inicio debe estar en formato YYYY-MM";
      }

      return null;
    },
    []
  );

  return {
    projections,
    parsedProjectionData,
    isLoading,
    error,
    fetchProjections,
    getDefaultStartDate,
    validateParams,
  };
};
