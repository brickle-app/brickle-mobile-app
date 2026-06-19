import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { TextInputProps } from "react-native";
interface RegisterInput {
  id: string;
  label: string;
  placeholder: string;
  type: TextInputProps["keyboardType"];
  icon: React.ReactNode;
}
export const registerInputs: RegisterInput[] = [
  {
    id: "firstName",
    label: "Nombres",
    placeholder: "Ingresa tus nombres",
    type: "default",
    icon: (
      <Ionicons name="person-outline" size={24} color={Colors.textPrimary} />
    ),
  },
  {
    id: "lastName",
    label: "Apellidos",
    placeholder: "Ingresa tus apellidos",
    type: "default",
    icon: (
      <Ionicons name="person-outline" size={24} color={Colors.textPrimary} />
    ),
  },
  {
    id: "email",
    label: "Correo electrónico",
    placeholder: "Ingresa tu correo electrónico",
    type: "email-address",
    icon: <Ionicons name="mail-outline" size={24} color={Colors.textPrimary} />,
  },
  {
    id: "phone",
    label: "Número de teléfono",
    placeholder: "Ingresa tu número de teléfono",
    type: "numeric",
    icon: <Ionicons name="call-outline" size={24} color={Colors.textPrimary} />,
  },
];
