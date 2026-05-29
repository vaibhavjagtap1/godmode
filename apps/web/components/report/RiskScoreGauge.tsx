'use client';

import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';

export function RiskScoreGauge({ score }: { score: number }) {
  const color = score <= 20 ? '#22c55e' : score <= 50 ? '#f59e0b' : score <= 75 ? '#f97316' : '#ef4444';

  return (
    <div className="h-44 w-full rounded border border-slate-700 bg-panel p-4">
      <p className="font-mono text-xs uppercase text-accent">Risk Score</p>
      <div className="h-32">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={[{ name: 'score', value: score }, { name: 'remaining', value: 100 - score }]} dataKey="value" innerRadius={44} outerRadius={56} startAngle={180} endAngle={0}>
              <Cell fill={color} />
              <Cell fill="#1f2937" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="-mt-10 text-center text-2xl font-semibold">{score}</p>
    </div>
  );
}
