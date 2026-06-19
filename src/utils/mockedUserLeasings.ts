import { UserLeasing } from "../types/portfolio.types";
import ComputerIcon from "@/assets/icons/SVG/Computador.svg";
import CrossIcon from "@/assets/icons/SVG/Salud.svg";
import { Colors } from "@/assets/Colors";
import React from "react";

export const USER_LEASINGS: UserLeasing[] = [
  {
    id: "user-leasing-002",
    assetName: "Computadores HP",
    monthlyPayment: 375,
    nextPaymentDate: "2025-06-27",
    paymentStatus: "pending",
    tokensOwned: 3,
    totalTokens: 20,
    paymentsCompleted: 12,
    totalPayments: 24,
    icon: React.createElement(ComputerIcon, {
      height: 60,
      width: 60,
      color: Colors.violetTertiary,
    }),
    colorIconBg: "bg-violet-secondary",
    contractStartDate: "2023-01-20",
    contractEndDate: "2025-01-20",
  },
  {
    id: "user-leasing-003",
    assetName: "Camillas Médicas",
    monthlyPayment: 450,
    nextPaymentDate: "2025-06-10",
    paymentStatus: "overdue",
    tokensOwned: 2,
    totalTokens: 20,
    paymentsCompleted: 6,
    totalPayments: 48,
    icon: React.createElement(CrossIcon, {
      height: 60,
      width: 60,
      color: Colors.violetTertiary,
    }),
    colorIconBg: "bg-green-primary",
    contractStartDate: "2023-06-28",
    contractEndDate: "2027-06-28",
  },
];
