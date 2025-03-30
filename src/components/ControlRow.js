import React from "react";

const ControlRow = ({ filters, setFilters, refreshData, exportData }) => (
  <div className="bg-gray-700 p-4 rounded-lg shadow mb-8 flex flex-col md:flex-row gap-4 items-center justify-center">
    <button
      onClick={refreshData}
      className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center"
    >
      <i className="fas fa-sync-alt mr-2"></i> Refresh
    </button>
    <button
      onClick={exportData}
      className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center"
    >
      <i className="fas fa-file-export mr-2"></i> Export
    </button>
    <div className="text-sm">Last updated: {new Date().toLocaleString()}</div>
    <div className="relative flex-1 max-w-md">
      <input
        type="text"
        placeholder="Search by address/name..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="bg-gray-600 text-white p-2 rounded-lg w-full pl-10 focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500"></i>
    </div>
  </div>
);

export default ControlRow;
