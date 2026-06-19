import React from "react";
import { Text, View } from "react-native";
import { SpecificationsTable } from "./SpecificationsTable";
import { CompanyInfo } from "./CompanyInfo";
import { Asset } from "@/src/interfaces/investments.interface";

interface DetailsTabProps {
  asset: Asset;
  theme: {
    mainColor: string;
    secondaryColor: string;
  };
}

export const DetailsTab = ({ asset, theme }: DetailsTabProps) => {
  const company = asset.company;
  const description = (asset.description ?? "").trim();
  const specs = asset?.details ?? [];

  return (
    <View className="bg-white rounded-2xl mb-6">
      <View className="px-4 py-6">
        <Text className="text-lg font-libre-bold text-text-primary mb-4">
          Descripción
        </Text>
        <Text className="text-sm text-text-primary leading-6">
          {description.length > 0
            ? description
            : "Aún no hay una descripción publicada para este activo."}
        </Text>
      </View>

      <SpecificationsTable specifications={specs} />

      <CompanyInfo
        company={{
          name: company?.name ?? "—",
          creditRating: company?.creditRating ?? "—",
          yearsInOperation: company?.operationTime ?? 0,
          leasingContract: company?.leasingContract?.trim()
            ? String(company.leasingContract)
            : "Leasing",
        }}
        theme={theme}
      />
    </View>
  );
}; 