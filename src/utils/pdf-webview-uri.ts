import { Platform } from "react-native";

/**
 * Android WebView a menudo no pinta PDFs remotos; el visor embebido de Google es un fallback fiable.
 * iOS suele renderizar el PDF nativamente en WKWebView.
 */
export function getWebViewUriForDocument(url: string): string {
  const isPdf = /\.pdf(\?|$)/i.test(url);
  if (Platform.OS === "android" && isPdf) {
    return `https://docs.google.com/gviewer?embedded=true&url=${encodeURIComponent(url)}`;
  }
  return url;
}
