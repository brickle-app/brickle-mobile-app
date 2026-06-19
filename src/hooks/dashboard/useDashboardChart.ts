export default function useDashboardChart() {
  // --- Hardcoded Data ---
  const MOCK_BALANCE_COMPLETE = "15075167";
  const MOCK_BALANCE_INCOMPLETE = "0";

  const stackData = [
    {
      stacks: [
        { value: 1000, color: "#1C3647" },
        { value: 2000, color: "#85FA8F" },
      ],
      label: "Enero",
    },
    {
      stacks: [
        { value: 1000, color: "#1C3647" },
        { value: 1500, color: "#85FA8F" },
      ],
      label: "Febrero",
    },
    {
      stacks: [
        { value: 1400, color: "#1C3647" },
        { value: 3740, color: "#85FA8F" },
      ],
      label: "Marzo",
    },
    {
      stacks: [
        { value: 4500, color: "#1C3647" },
        { value: 4800, color: "#85FA8F" },
      ],
      label: "Abril",
    },
    {
      stacks: [
        { value: 4500, color: "#1C3647" },
        { value: 5000, color: "#85FA8F" },
      ],
      label: "Mayo",
    },
    {
      stacks: [
        { value: 4500, color: "#1C3647" },
        { value: 4800, color: "#85FA8F" },
      ],
      label: "Junio",
    },
  ];

  const MOCK_CHART_TITLE = "Proyección valor de cartera";
  const MOCK_CHART_ROI = "3.5%";
  return {
    chartData: stackData,
    chartTitle: MOCK_CHART_TITLE,
    chartRoi: MOCK_CHART_ROI,
    balanceComplete: MOCK_BALANCE_COMPLETE,
    balanceIncomplete: MOCK_BALANCE_INCOMPLETE,
  };
}
