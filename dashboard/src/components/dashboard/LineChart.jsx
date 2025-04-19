import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Chart from 'chart.js/auto';

const LineChart = ({ title, data, labels }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    const textColor = darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          borderColor: '#0072f5',
          backgroundColor: 'rgba(0, 114, 245, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
            }
          },
          y: {
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
            },
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, labels, darkMode, title]);

  return (
    <div className="card h-80">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default LineChart; 