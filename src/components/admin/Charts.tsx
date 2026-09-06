import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: ChartData[];
  formatValue?: (v: number) => string;
  height?: number;
}

const DEFAULT_COLORS = [
  '#8B5CF6', '#FF5A00', '#38BDF8', '#22C55E', '#F59E0B', '#EF4444', '#A78BFA', '#FF8A33',
];

export function BarChart({ data, formatValue, height = 200 }: BarChartProps) {
  if (data.length === 0) {
    return <div className="text-center py-10 text-white/25 text-sm">Sem dados</div>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3" style={{ minHeight: height }}>
      {data.map((item, i) => {
        const color = item.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
        const pct = (item.value / max) * 100;
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">{item.label}</span>
              <span className="text-white/70 font-mono">
                {formatValue ? formatValue(item.value) : item.value}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  formatValue?: (v: number) => string;
  height?: number;
}

export function LineChart({ data, formatValue, height = 200 }: LineChartProps) {
  if (data.length === 0) {
    return <div className="text-center py-10 text-white/25 text-sm">Sem dados</div>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const width = 100;
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - ((d.value - min) / range) * (height - 20) - 10;
    return `${x},${y}`;
  });
  const areaPoints = `0,${height} ${points.join(' ')} ${width},${height}`;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#FF5A00" />
          </linearGradient>
        </defs>
        <motion.polygon
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          points={areaPoints}
          fill="url(#lineGradient)"
        />
        <motion.polyline
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          points={points.join(' ')}
          fill="none"
          stroke="url(#strokeGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const x = (i / Math.max(data.length - 1, 1)) * width;
          const y = height - ((d.value - min) / range) * (height - 20) - 10;
          return (
            <motion.circle
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              cx={x}
              cy={y}
              r="1.5"
              fill="#FF5A00"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-white/30">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
      {formatValue && (
        <div className="flex justify-between text-[10px] text-white/20">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}
    </div>
  );
}

interface DonutChartProps {
  data: ChartData[];
  size?: number;
}

export function DonutChart({ data, size = 160 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return <div className="text-center py-10 text-white/25 text-sm">Sem dados</div>;
  }
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        {data.map((item, i) => {
          const color = item.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          const pct = item.value / total;
          const dash = pct * circumference;
          const segment = (
            <motion.circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: -offset }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += dash;
          return segment;
        })}
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle" className="fill-white font-playfair" fontSize="16">
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((item, i) => {
          const color = item.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className="text-white/50">{item.label}</span>
              <span className="text-white/70 font-mono ml-auto">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Icon size={14} className="text-purple-400" />
        <h3 className="text-xs tracking-widest text-white/30 uppercase">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}
