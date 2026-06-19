import { Slot } from "expo-router";

/**
 * Sin Stack anidado para evitar "Couldn't find a navigation context"
 * en AmortizationChart/FinancesTab. La pantalla [id] se monta en el Stack principal.
 */
export default function AssetDetailLayout() {
  return <Slot />;
}
