import { View } from "react-native";
import { AccountTypeSelector } from "../AccountTypeSelector";
import { BankAccountFormData, FormErrors } from "@/src/types/forms";
import { FormField } from "@/src/components/ui/input";
import { SelectBottomSheet } from "../../ui/input/SelectBottomSheet";

interface BankAccountFormProps {
  formData: BankAccountFormData;
  onFieldChange: (field: keyof BankAccountFormData, value: string) => void;
  onFieldBlur: (field: keyof BankAccountFormData) => void;
  touched?: Record<string, boolean>;
  errors: FormErrors;
}

export const BankAccountForm = ({
  formData,
  onFieldChange,
  onFieldBlur,
  errors,
}: BankAccountFormProps) => {
  /*const renderError = (field: keyof BankAccountFormData) => {
    if (touched[field] && errors[field]) {
      return <Text className="text-red-500 text-xs mt-1 ml-3">{errors[field]}</Text>;
    }
    return null;
  };*/

  return (
    <View>
      <View className="my-6">
        <FormField
          label="Nombre del titular de la cuenta"
          placeholder="Nombres y apellidos"
          value={formData.accountHolderName}
          onChangeText={(value) => onFieldChange('accountHolderName', value)}
          onBlur={() => onFieldBlur('accountHolderName')}
          error={errors.accountHolderName}
        />
      </View>

      <View className="mb-6">
        <SelectBottomSheet
          label="Tipo de documento"
          value={formData.documentType}
          options={[
            { label: "Cédula de ciudadanía", value: "cc" },
            { label: "Cédula de extranjería", value: "ce" },
            { label: "Pasaporte", value: "pa" },
          ]}
          onValueChange={(value) => onFieldChange('documentType', value.toString())}
          error={errors.documentType}
        />
      </View>

      <View className="mb-6">
        <FormField
          label="Número de documento"
          placeholder="10450456545"
          keyboardType="numeric"
          value={formData.documentNumber}
          onChangeText={(value) => onFieldChange('documentNumber', value)}
          onBlur={() => onFieldBlur('documentNumber')}
          error={errors.documentNumber}
        />
      </View>

      <View className="mb-6">
        <SelectBottomSheet
          label="Datos bancarios"
          value={formData.bankName}
          options={[
            { label: "Bancolombia", value: "bancolombia" },
            { label: "Davivienda", value: "davivienda" },
            { label: "BBVA", value: "bbva" },
            { label: "Scotiabank", value: "scotiabank" },
            { label: "Nequi", value: "nequi" },
            { label: "Daviplata", value: "daviplata" },
          ]}
          onValueChange={(value) => onFieldChange('bankName', value.toString())}
          error={errors.bankName}
        />
      </View>

      <View className="mb-6">
        <AccountTypeSelector
          selectedType={formData.accountType}
          onTypeChange={(value) => onFieldChange('accountType', value)}
        />
      </View>

      <View className="mb-6">
        <FormField
          label="Número de cuenta"
          placeholder="123-4567890-10"
          keyboardType="numeric"
          value={formData.accountNumber}
          onChangeText={(value) => onFieldChange('accountNumber', value)}
          onBlur={() => onFieldBlur('accountNumber')}
          error={errors.accountNumber}
        />
      </View>

      <View className="mb-6">
        <FormField
          label="Monto a enviar"
          placeholder="0.00"
          keyboardType="numeric"
          value={formData.amount}
          onChangeText={(value) => onFieldChange('amount', value)}
          onBlur={() => onFieldBlur('amount')}
          error={errors.amount}
        />
      </View>
    </View>
  );
};