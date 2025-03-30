import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto";

const ActivityPopup = ({ data, closePopup }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null); // Added to store the chart instance

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (ctx) {
      // Destroy the previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create a new chart instance and store it
      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.profitHistory.map((point) =>
            new Date(point.time).toLocaleDateString("en-GB")
          ),
          datasets: [
            {
              label: "Profit % over time",
              data: data.profitHistory.map((point) => point.profitPercent),
              borderColor: "#ec4899",
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          plugins: { legend: { display: true }, tooltip: { enabled: true } },
          scales: {
            x: { display: true },
            y: { display: true, ticks: { callback: (value) => `${value}%` } },
          },
          animation: false,
        },
      });
    }

    // Cleanup function to destroy the chart when the component unmounts or data changes
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null; // Reset the ref
      }
    };
  }, [data]); // Dependency on data ensures the chart updates when data changes

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full border border-pink-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            Profit Chart for {data.address.slice(0, 4)}...
            {data.address.slice(-4)}
          </h3>
          <button
            onClick={closePopup}
            className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <canvas ref={chartRef} width="600" height="400"></canvas>
      </div>
    </div>
  );
};

export default ActivityPopup;
