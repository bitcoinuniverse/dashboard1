import React from "react";

const Filters = ({ filters, setFilters }) => (
  <div className="bg-gray-700 p-4 rounded-lg shadow mb-8 flex flex-col md:flex-row gap-4">
    <div className="flex-1 flex flex-col">
      <label className="text-sm font-bold text-pink-500 mb-2">
        Min Trades: {filters.minTrades}
      </label>
      <input
        type="range"
        min="0"
        max="100"
        value={filters.minTrades}
        onChange={(e) =>
          setFilters({ ...filters, minTrades: Number(e.target.value) })
        }
        className="w-full"
      />
    </div>
    <div className="flex-1 flex flex-col">
      <label className="text-sm font-bold text-pink-500 mb-2">
        Min Profit %: {filters.minProfit}
      </label>
      <input
        type="range"
        min="-100"
        max="1000"
        step="10"
        value={filters.minProfit}
        onChange={(e) =>
          setFilters({ ...filters, minProfit: Number(e.target.value) })
        }
        className="w-full"
      />
    </div>
    <div className="flex-1 flex flex-col">
      <label className="text-sm font-bold text-pink-500 mb-2">
        Min Volume (BTC): {filters.minVolume}
      </label>
      <input
        type="range"
        min="0"
        max="10"
        step="0.1"
        value={filters.minVolume}
        onChange={(e) =>
          setFilters({ ...filters, minVolume: Number(e.target.value) })
        }
        className="w-full"
      />
    </div>
  </div>
);

export default Filters;
