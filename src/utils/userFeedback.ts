import { Alert, Platform, ToastAndroid } from "react-native";

/**
 * Avisos breves para el usuario final (sin términos de blockchain).
 * Android: toast nativo. iOS: alert (no hay toast del sistema).
 */
export function showRentClaimSuccess(): void {
  const title = "Listo";
  const message =
    "Recibimos el cobro de tu renta. El dinero se acreditará en tu billetera en la app; si no ves el saldo al instante, espera un momento y vuelve a abrir esta pantalla.";

  if (Platform.OS === "android") {
    ToastAndroid.show(
      "Tu renta se envió a tu billetera en la app.",
      ToastAndroid.LONG
    );
  } else {
    Alert.alert(title, message);
  }
}

export function showRentClaimRejectedByServer(): void {
  const title = "No se pudo cobrar";
  const message =
    "El sistema no confirmó el cobro de tu renta. Espera unos minutos e inténtalo de nuevo. Si sigue igual, escríbenos a soporte.";

  if (Platform.OS === "android") {
    ToastAndroid.show(
      "No se confirmó el cobro. Inténtalo más tarde o contacta soporte.",
      ToastAndroid.LONG
    );
  } else {
    Alert.alert(title, message);
  }
}

export function showRentClaimSessionIncomplete(): void {
  const message =
    "No tenemos toda la información de tu cuenta o billetera. Cierra sesión, vuelve a entrar e inténtalo de nuevo.";

  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert("Revisa tu sesión", message);
  }
}

export function showRentClaimError(err: unknown): void {
  const title = "No pudimos cobrar tu renta";
  const message = mapClaimErrorToFriendlyMessage(err);

  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert(title, message);
  }
}

function mapClaimErrorToFriendlyMessage(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message;
    if (m.includes("Brickle API Error")) {
      return "Hubo un problema al comunicarnos con el servicio. Revisa tu conexión a internet e inténtalo de nuevo. Si continúa, contacta a soporte.";
    }
    if (/network|Network|timeout|ECONNREFUSED/i.test(m)) {
      return "Parece que hay un problema de conexión. Revisa tu internet e inténtalo de nuevo.";
    }
  }
  return "Algo salió mal al cobrar tu renta. Inténtalo de nuevo más tarde. Si necesitas ayuda, escribe a soporte.";
}
