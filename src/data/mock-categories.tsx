import MachineIcon from "@/assets/icons/SVG/Maquinaria.svg";
import EnergyIcon from "@/assets/icons/SVG/Energia.svg";
import ElectronicsIcon from "@/assets/icons/SVG/Computador.svg";
import HealthIcon from "@/assets/icons/SVG/Salud.svg";
import AgricultureIcon from "@/assets/icons/SVG/Agricultura.svg";
import FurnitureIcon from "@/assets/icons/SVG/Mobiliario.svg";
import { Colors } from "@/assets/Colors";
import { View } from "react-native";

export interface Category {
  id: string;
  name: string;
  text: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
}

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Maquinaria",
    text: "Maquinaria",
    bgColor: Colors.violetTertiary,
    textColor: Colors.orangePrimary,
    icon: (
      <View
        style={{ backgroundColor: Colors.orangePrimary }}
        className="size-9 flex-row items-center justify-center rounded-full"
      >
        <MachineIcon width={28} height={28} color={Colors.violetTertiary} />
      </View>
    ),
  },
  {
    id: "2",
    name: "Energia",
    text: "Energía",
    bgColor: Colors.violetPrimary,
    textColor: Colors.violetSecondary,
    icon: (
      <View
        style={{ backgroundColor: Colors.violetSecondary }}
        className="size-9 flex-row items-center justify-center rounded-full"
      >
        <EnergyIcon width={28} height={28} color={Colors.violetPrimary} />
      </View>
    ),
  },
  {
    id: "3",
    name: "Electronicos",
    text: "Electrónicos",
    bgColor: Colors.violetSecondary,
    textColor: Colors.white,
    icon: (
      <View
        style={{ backgroundColor: Colors.violetPrimary }}
        className="size-9 flex-row items-center justify-center rounded-full"
      >
        <ElectronicsIcon width={28} height={28} color={Colors.violetSecondary} />
      </View>
    ),
  },
  {
    id: "4",
    name: "Salud",
    text: "Salud",
    bgColor: Colors.violetPrimary,
    textColor: Colors.greenSecondary,
    icon: (
      <View
        style={{ backgroundColor: Colors.greenSecondary }}
        className="size-9 flex-row items-center justify-center rounded-full"
      >
        <HealthIcon width={28} height={28} color={Colors.violetPrimary} />
      </View>
    ),
  },
  {
    id: "5",
    name: "Agricultura",
    text: "Agricultura",
    bgColor: Colors.greenPrimary,
    textColor: Colors.bluePrimary,
    icon: (
      <View
        style={{ backgroundColor: Colors.bluePrimary }}
        className="size-9 flex-row items-center justify-center rounded-full"
      >
        <AgricultureIcon width={28} height={28} color={Colors.greenPrimary} />
      </View>
    ),
  },
  {
    id: "6",
    name: "Mobiliario",
    text: "Mobiliario",
    bgColor: Colors.orangePrimary,
    textColor: Colors.violetTertiary,
    icon: (
      <View
        style={{ backgroundColor: Colors.violetTertiary }}
        className="size-9 flex-row items-center justify-center rounded-full"
      >
        <FurnitureIcon width={28} height={28} color={Colors.orangePrimary} />
      </View>
    ),
  },
];
