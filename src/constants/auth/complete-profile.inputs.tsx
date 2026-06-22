import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { TextInputProps } from "react-native";
import { DocumentTypeEnum } from "@/src/types/user.types";

export interface SelectOption {
  label: string;
  value: string | number;
}

interface CompleteProfileInput {
  id: string;
  label: string;
  placeholder: string;
  type: TextInputProps["keyboardType"] | "select" | "date";
  icon: React.ReactNode;
  options?: SelectOption[];
}

export const completeProfileInputs: CompleteProfileInput[] = [
  {
    id: "firstName",
    label: "Nombres",
    placeholder: "Ingresa tus nombres",
    type: "default",
    icon: <Ionicons name="person-outline" size={24} color={Colors.textPrimary} />,
  },
  {
    id: "lastName",
    label: "Apellidos",
    placeholder: "Ingresa tus apellidos",
    type: "default",
    icon: <Ionicons name="person-outline" size={24} color={Colors.textPrimary} />,
  },
  {
    id: "phoneNumber",
    label: "Número de teléfono",
    placeholder: "3001234567",
    type: "phone-pad",
    icon: <Ionicons name="call-outline" size={24} color={Colors.textPrimary} />,
  },
  {
    id: "birthDate",
    label: "Fecha de nacimiento",
    placeholder: "DD/MM/AAAA",
    type: "date",
    icon: (
      <Ionicons name="calendar-outline" size={24} color={Colors.textPrimary} />
    ),
  },
  {
    id: "nationality",
    label: "Nacionalidad",
    placeholder: "Selecciona tu nacionalidad",
    type: "select",
    icon: <Ionicons name="flag-outline" size={24} color={Colors.textPrimary} />,
    options: [
      { label: "Selecciona tu nacionalidad", value: "" },
      { label: "Colombia", value: "CO" },
      { label: "Perú", value: "PE" },
      { label: "Ecuador", value: "EC" },
      { label: "Chile", value: "CL" },
      { label: "Brasil", value: "BR" },
      { label: "México", value: "MX" },
      { label: "Uruguay", value: "UY" },
      { label: "Paraguay", value: "PY" },
      { label: "Costa Rica", value: "CR" },
      { label: "Honduras", value: "HN" },
      { label: "Panamá", value: "PA" },
      { label: "El Salvador", value: "SV" },
      { label: "Guatemala", value: "GT" }
    ],
  },
  {
    id: "residenceCountry",
    label: "País de residencia",
    placeholder: "Colombia",
    type: "select",
    icon: <Ionicons name="flag-outline" size={24} color={Colors.textPrimary} />,
    options: [
      { label: "Colombia", value: "CO" },
    ],
  },
  {
    id: "documentType",
    label: "Tipo de documento",
    placeholder: "Selecciona tu tipo de documento",
    type: "select",
    icon: (
      <Ionicons name="id-card-outline" size={24} color={Colors.textPrimary} />
    ),
    options: [
      { label: "Selecciona tu tipo de documento", value: "" },
      { label: "Cédula de ciudadanía", value: DocumentTypeEnum.CC },
      { label: "Cédula de extranjería", value: DocumentTypeEnum.CE },
      { label: "Pasaporte", value: DocumentTypeEnum.Pasaporte },
    ],
  },
  {
    id: "documentNumber",
    label: "Número de documento",
    placeholder: "Número de documento",
    type: "default",
    icon: (
      <Ionicons name="id-card-outline" size={24} color={Colors.textPrimary} />
    ),
  },
];
