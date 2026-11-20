import { cn } from '@/shared/lib';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  height?: number;
  color?: string;
  valueLabel?: string;
  className?: string;
}

const axisTick = { fill: '#9ca3af', fontSize: 11 };

export function BarChart({
  data,
  height = 160,
  color = '#3b82f6',
  valueLabel = '',
  className,
}: BarChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
          <RechartsTooltip
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{
              background: '#171717',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              color: '#fff',
            }}
            formatter={(value) => `${value} ${valueLabel}`.trim()}
          />
          <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
