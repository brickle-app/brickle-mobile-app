import { Platform } from "react-native";

export const pickerStyle = Platform.select({
  ios: {
    borderWidth: 2,
    borderColor: "bg-text-primary",
    borderRadius: 9999,
  },
  android: {
    borderWidth: 2,
    borderColor: "bg-text-primary",
    position: "absolute" as "absolute",
    top: -4,
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
  },
});
