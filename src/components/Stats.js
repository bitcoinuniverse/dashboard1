import React from "react";

const Stats = ({ data }) => {
  const totalTraders = Object.keys(data).length;
  const totalVolume = Object.values(data).reduce(
    (sum, item) => sum + item.totalVolume,
    0
  );
  const avgProfit = totalTraders
    ? Object.values(data).reduce((sum, item) => sum + item.profitPercent, 0) /
      totalTraders
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-700 p-4 rounded-lg shadow text-center">
        <i className="fas fa-users text-pink-500 text-2xl mb-2"></i>
        <p className="text-lg">Total Traders: {totalTraders}</p>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg shadow text-center">
        <i className="fas fa-chart-bar text-pink-500 text-2xl mb-2"></i>
        <p className="text-lg">Total Volume: {totalVolume.toFixed(4)} BTC</p>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg shadow text-center">
        <i className="fas fa-chart-line text-pink-500 text-2xl mb-2"></i>
        <p className="text-lg">Avg Profit: {avgProfit.toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default Stats;
