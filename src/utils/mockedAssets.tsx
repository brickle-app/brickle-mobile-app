import { LeasingAsset } from "../types/leasing.types";
import ExcavatorIcon from "@/assets/icons/SVG/Maquinaria.svg";
import { Colors } from "@/assets/Colors";
import ComputerIcon from "@/assets/icons/SVG/Computador.svg";
import CrossIcon from "@/assets/icons/SVG/Salud.svg";

export const ASSETS: {
  title: string;
  value: string;
  roi: number;
  icon: React.ReactNode;
  colorIconBg: string;
  leasingData: LeasingAsset;
}[] = [
    {
      title: "Excavadora Caterpillar",
      value: "25 ($2.5000)",
      roi: 4.8,
      icon: (
        <ExcavatorIcon height={80} width={80} color={Colors.violetTertiary} />
      ),
      colorIconBg: "bg-orange-primary",
      leasingData: {
        id: "caterpillar-machinery-001",
        title: "Excavadora Caterpillar",
        description:
          "Excavadora de alta resistencia CAT 320D, ideal para obras de construcción e infraestructura. Equipo especializado con tecnología GPS y sistemas hidráulicos avanzados.",
        image:
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop",
        roi: 4.8,
        pricePerToken: 2500,
        totalTokens: 25,
        minTokens: 1,
        maxTokens: 10,
        currentFunding: 12500,
        targetFunding: 62500,
        specifications: [
          { title: "Marca", value: "Caterpillar" },
          { title: "Modelo", value: "320D" },
          { title: "Potencia", value: "140 HP" },
          { title: "Capacidad", value: "1.2 m³" },
          { title: "Año", value: "2023" },
        ],
        company: {
          name: "Construcciones Gamma",
          creditRating: "AA+",
          yearsInOperation: 12,
          leasingContract: "3 años con opción de compra",
        },
        performanceMetrics: {
          riskLevel: {
            level: "Bajo",
            color: "#85FA8F"
          },
          riskPercentage: 4.8,
          annualRate: 4.8,
          contractPeriod: "36 meses",
          totalReturn: "15.2% anual",
          liquidity: "Alta",
        },
      },
    },
    {
      title: "Computadores HP",
      value: "20 ($1.500)",
      roi: 6.8,
      icon: <ComputerIcon height={60} width={60} color={Colors.violetTertiary} />,
      colorIconBg: "bg-violet-secondary",
      leasingData: {
        id: "computers-hp-002",
        title: "Computadores HP",
        description:
          "Flota de 20 computadores HP EliteDesk con procesadores Intel i7, ideales para oficinas corporativas y coworking. Equipos empresariales con soporte técnico incluido.",
        image:
          "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&h=600&fit=crop",
        roi: 6.8,
        pricePerToken: 1500,
        totalTokens: 20,
        minTokens: 1,
        maxTokens: 8,
        currentFunding: 15000,
        targetFunding: 30000,
        specifications: [
          { title: "Marca", value: "HP" },
          { title: "Modelo", value: "EliteDesk 800" },
          { title: "Procesador", value: "Intel Core i7" },
          { title: "RAM", value: "16GB DDR4" },
          { title: "Almacenamiento", value: "512GB SSD" },
        ],
        company: {
          name: "TechSpace Solutions",
          creditRating: "A+",
          yearsInOperation: 8,
          leasingContract: "2 años con renovación automática",
        },
        performanceMetrics: {
          riskLevel: {
            level: "Bajo",
            color: "#85FA8F"
          },
          riskPercentage: 6.8,
          annualRate: 6.8,
          contractPeriod: "24 meses",
          totalReturn: "20.4% anual",
          liquidity: "Media",
        },
      },
    },
    {
      title: "Camillas",
      value: "20 ($1.500)",
      roi: 7.2,
      icon: <CrossIcon height={80} width={80} color={Colors.violetTertiary} />,
      colorIconBg: "bg-green-primary",
      leasingData: {
        id: "medical-beds-003",
        title: "Camillas Médicas",
        description:
          "Camillas hospitalarias eléctricas de alta gama con funciones de elevación y posicionamiento automático. Equipamiento médico certificado para clínicas y hospitales.",
        image:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
        roi: 7.2,
        pricePerToken: 1500,
        totalTokens: 20,
        minTokens: 1,
        maxTokens: 5,
        currentFunding: 9000,
        targetFunding: 30000,
        specifications: [
          { title: "Tipo", value: "Camilla eléctrica" },
          { title: "Material", value: "Acero inoxidable" },
          { title: "Capacidad", value: "200 kg" },
          { title: "Certificación", value: "FDA/CE" },
          { title: "Garantía", value: "5 años" },
        ],
        company: {
          name: "MedEquip Colombia",
          creditRating: "AA",
          yearsInOperation: 20,
          leasingContract: "4 años con mantenimiento incluido",
        },
        performanceMetrics: {
          riskLevel: {
            level: "Muy Bajo",
            color: "#85FA8F"
          },
          riskPercentage: 7.2,
          annualRate: 7.2,
          contractPeriod: "48 meses",
          totalReturn: "28.8% anual",
          liquidity: "Media",
        },
      },
    },
  ];
