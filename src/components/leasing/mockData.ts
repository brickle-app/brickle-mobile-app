import { LeasingAsset } from "@/src/types/leasing.types";

export const mockLeasingAsset: LeasingAsset = {
  id: "caterpillar-machinery-001",
  title: "3 Máquinas caterpillar",
  description:
    "Equipo logístico de clase 1H-170 con tecnología de vanguardia de proyecto y calidad efectiva. Adecuado a cooperativas de pesca con flota pesquera relacionada; o también para construcción de túneles de 5,000 metros de longitud.",
  image:
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop",
  roi: 8.2,
  pricePerToken: 800,
  totalTokens: 100,
  minTokens: 10,
  maxTokens: 50,
  currentFunding: 1600,
  targetFunding: 80000,
  specifications: [
    {
      label: "Marca",
      value: "Caterpillar",
    },
    {
      label: "Tamaño de paquete",
      value: "16 gigabytes",
    },
    {
      label: "RAM",
      value: "8GB",
    },
    {
      label: "Capacidad",
      value: "500 GB",
    },
    {
      label: "Procesador",
      value: "Intel Core i7",
    },
  ],
  company: {
    name: "Grupo Arval",
    creditRating: "AAA",
    yearsInOperation: 15,
    leasingContract: "5 años por opción-compra",
  },
  performanceMetrics: {
    riskLevel: {
      level: "Moderado",
      color: "#EB7F58"
    },
    riskPercentage: 8.2,
    contractPeriod: "36 meses",
    totalReturn: "32.5% anual",
    liquidity: "Media",
  },
};
