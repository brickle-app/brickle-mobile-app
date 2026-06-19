import { useEffect, useState, useCallback } from "react";
import { Platform, Linking } from "react-native";
import Constants from "expo-constants";
import { checkAppVersion } from "../services/brickle.service";
import { AppVersionInfo } from "../types/app.types";
import { APP_STORE_URLS } from "../utils/constants";

function semverCompare(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export function useAppUpdate() {
  const [updateInfo, setUpdateInfo] = useState<AppVersionInfo | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    checkAppVersion().then((info) => {
      if (!mounted) return;

      if (!info?.latestVersion) {
        setChecked(true);
        return;
      }

      const currentVersion = Constants.expoConfig?.version ?? "0.0.0";
      const needsUpdate = semverCompare(info.latestVersion, currentVersion) > 0;

      if (needsUpdate) {
        setUpdateInfo(info);
      }
      setChecked(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const storeUrl = Platform.OS === "ios"
    ? updateInfo?.iosStoreUrl ?? APP_STORE_URLS.ios
    : updateInfo?.androidStoreUrl ?? APP_STORE_URLS.android;

  const openStore = useCallback(() => {
    Linking.openURL(storeUrl).catch(() => {});
  }, [storeUrl]);

  return {
    updateAvailable: updateInfo !== null,
    latestVersion: updateInfo?.latestVersion ?? null,
    openStore,
    checked,
  };
}
