// LogBarChart.tsx
import React, { useMemo } from 'react';
import { BarChart, BarChartPropsType } from 'react-native-gifted-charts';

type Datum = { value: number; label?: string; frontColor?: string;[key: string]: any };
type Props = Omit<BarChartPropsType, 'data' | 'maxValue' | 'stepValue' | 'yAxisLabelTexts'> & {
  data: Datum[];
  base?: number;
  epsilon?: number;
  showPowerLabels?: boolean;
  labelFormatter?: (value: number) => string;
};

const defaultFormatter = (n: number) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return `${n}`;
};

function LogBarChart({
  data,
  base = 10,
  epsilon = 1e-3,
  showPowerLabels = false,
  labelFormatter = defaultFormatter,
  ...rest
}: Props) {
  const logB = (v: number) => Math.log(v) / Math.log(base);
  const values = data.map(d => (d.value <= 0 ? epsilon : d.value));
  const minPow = Math.floor(Math.min(...values.map(v => logB(v))));
  const maxPow = Math.ceil(Math.max(...values.map(v => logB(v))));
  const exponents = Array.from(
    { length: maxPow - minPow + 1 },
    (_, i) => i + minPow
  );

  const transformed = useMemo(() =>
    data.map(d => ({
      ...d,
      value: Math.max(0, logB(d.value <= 0 ? epsilon : d.value) - minPow),
    })), [data, minPow, epsilon, base]
  );

  const yAxisLabelTexts = exponents.map(p =>
    showPowerLabels
      ? `${base}^${p}`
      : labelFormatter(Math.pow(base, p))
  );

  return (
    <BarChart
      data={transformed}
      yAxisLabelTexts={yAxisLabelTexts}
      maxValue={exponents.length - 1}
      stepValue={1}
      {...rest}
    />
  );
}

export { LogBarChart };
