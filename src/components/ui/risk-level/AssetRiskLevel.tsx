import React from "react";
import { View, Text } from "react-native";
import { RISK_LEVELS } from "@/src/utils/riskLevel";
import RiesgoBajoIcon from "@/assets/icons/SVG/riesgo-bajo.svg";
import RiesgoMedioIcon from "@/assets/icons/SVG/riesgo-medio.svg";
import RiesgoAltoIcon from "@/assets/icons/SVG/riesgo-alto.svg";

function pickRiskIcon(level: string) {
  if (level === RISK_LEVELS.MEDIUM) return RiesgoMedioIcon;
  if (level === RISK_LEVELS.HIGH) return RiesgoAltoIcon;
  return RiesgoBajoIcon;
}

interface RiskLevelIconProps {
  level: string;
  size?: number;
}

/** Icono del diseño RIesgos.svg: bajo = flecha verde, medio = círculo, alto = flecha burdeos. */
export function RiskLevelIcon({ level, size = 14 }: RiskLevelIconProps) {
  const Icon = pickRiskIcon(level);
  return <Icon width={size} height={size} />;
}

interface RiskLevelInlineProps {
  level: string;
  /** Texto antes del nivel (p. ej. "Riesgo "). */
  prefix?: string;
  iconSize?: number;
  textClassName?: string;
}

/** Una línea: texto + icono a la derecha (tarjetas Discover / dashboard). */
export function RiskLevelInline({
  level,
  prefix = "Riesgo ",
  iconSize = 12,
  textClassName = "text-[11px] font-libre-regular leading-tight text-secondary",
}: RiskLevelInlineProps) {
  return (
    <View className="flex-row items-center gap-1">
      <Text className={textClassName}>
        {prefix}
        {level}
      </Text>
      <RiskLevelIcon level={level} size={iconSize} />
    </View>
  );
}

interface RiskLevelLabeledProps {
  level: string;
  iconSize?: number;
}

/** Bloque “Nivel de riesgo” + fila valor gris + icono (detalle / pestaña Números). */
export function RiskLevelLabeled({ level, iconSize = 16 }: RiskLevelLabeledProps) {
  return (
    <View className="flex-1 pr-4">
      <Text className="mb-1 text-base font-libre-medium text-text-primary">Nivel de riesgo</Text>
      <View className="flex-row items-center gap-1.5">
        <Text className="text-sm font-libre-regular text-secondary">{level}</Text>
        <RiskLevelIcon level={level} size={iconSize} />
      </View>
    </View>
  );
}
