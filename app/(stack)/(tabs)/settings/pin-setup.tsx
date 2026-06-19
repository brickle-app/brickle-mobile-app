import React from "react";
import { PinSetupView } from "@/src/components/pin/PinSetupView";

/** Crear PIN desde Perfil → Seguridad (opcional volver atrás). */
export default function PinSetupSettingsScreen() {
  return <PinSetupView mandatory={false} />;
}
