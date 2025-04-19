import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Chart from 'chart.js/auto';

const PieChart = ({ title, data, labels }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    const textColor = darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    
    // Generate colors for pie chart
    const colors = [
      '#0072f5', // primary blue
      '#00cfbd', // teal
      '#7828c8', // purple
      '#f5a524', // yellow
      '#f31260', // red
      '#17c964', // green
    ];
    
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 1,
          borderColor: darkMode ? '#1a1a1a' : '#ffffff',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: textColor,
              padding: 20,
              font: {
                size: 12
              }
            }
          },
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

export default PieChart; 