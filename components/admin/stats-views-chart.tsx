"use client";

import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StatsViewsChart({ labels, data }: { labels: string[]; data: number[] }) {
  return (
    <div className="bg-white dark:bg-card rounded-lg p-4 shadow">
      <h3 className="font-semibold mb-2">Statistik Pembaca Bulanan</h3>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Page Views',
              data,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37,99,235,0.1)',
              fill: true,
              tension: 0.4,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false },
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { display: false } },
          },
        }}
      />
    </div>
  );
}
