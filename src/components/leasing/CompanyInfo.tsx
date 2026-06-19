import React from "react";
import { Text, View } from "react-native";
import { ICompanyInfo } from "@/src/types/leasing.types";
import { Colors } from "@/assets/Colors";

interface CompanyInfoProps {
  company: ICompanyInfo;
  theme: {
    mainColor: string;
    secondaryColor: string;
  };
}

const labelOnAccent = "rgba(255,255,255,0.88)";
const valueOnAccent = Colors.white;

export const CompanyInfo = ({ company, theme }: CompanyInfoProps) => {
  return (
    <View className="px-5 py-4 rounded-[10px] mx-4" style={{ backgroundColor: theme.mainColor }}>
      <Text
        className="text-lg text-center font-libre-bold mb-4"
        style={{ color: valueOnAccent }}
      >
        Información de la empresa
      </Text>

      <View className="flex flex-row justify-between items-center flex-wrap gap-3">
        <View>
          <View className="flex flex-col min-w-[90px]">
            <Text className="text-sm font-libre-regular" style={{ color: labelOnAccent }}>
              Empresa arrendataria
            </Text>
            <Text className="text-sm font-libre-medium" style={{ color: valueOnAccent }}>
              {company.name}
            </Text>
          </View>

          <View className="flex flex-col min-w-[90px] mt-5">
            <Text className="text-sm font-libre-regular" style={{ color: labelOnAccent }}>
              Calificación crediticia
            </Text>
            <Text className="text-sm font-libre-medium" style={{ color: valueOnAccent }}>
              {company.creditRating}
            </Text>
          </View>

        </View>

        <View className="mr-10">
          <View className="flex flex-col min-w-[90px]">
            <Text className="text-sm font-libre-regular" style={{ color: labelOnAccent }}>
              Años en operación
            </Text>
            <Text className="text-sm font-libre-medium" style={{ color: valueOnAccent }}>
              {company.yearsInOperation > 0 ? `${company.yearsInOperation} años` : "—"}
            </Text>
          </View>

          <View className="flex flex-col min-w-[90px] mt-5">
            <Text className="text-sm font-libre-regular" style={{ color: labelOnAccent }}>
              Contrato de leasing
            </Text>
            <Text className="text-sm font-libre-medium" style={{ color: valueOnAccent }}>
              {company.leasingContract}
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
}; 