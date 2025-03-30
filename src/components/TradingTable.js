import React, { useRef, useEffect, useState } from "react";
import Chart from "chart.js/auto";

const TradingTable = ({
  data,
  marketPrices,
  filters,
  sort = { column: "profitPercent", order: "desc" }, // Default value
  setSort,
  currentPage,
  setCurrentPage,
  showNotification,
  setPopup,
}) => {
  const chartRefs = useRef({});
  const chartInstances = useRef({});
  const [expandedRows, setExpandedRows] = useState(new Set());
  const rowsPerPage = 10;

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observers = {};

    Object.entries(data).forEach(([address, { profitHistory }]) => {
      const ctx = chartRefs.current[address]?.getContext("2d");
      if (ctx) {
        if (chartInstances.current[address])
          chartInstances.current[address].destroy();
        chartInstances.current[address] = new Chart(ctx, {
          type: "line",
          data: {
            labels: profitHistory.map((point) =>
              new Date(point.time).toLocaleDateString("en-GB")
            ),
            datasets: [
              {
                label: "Profit %",
                data: profitHistory.map((point) => point.profitPercent),
                borderColor: "#ec4899",
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
              },
            ],
          },
          options: {
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            scales: { x: { display: false }, y: { display: false } },
            animation: false,
          },
        });

        observers[address] = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            chartInstances.current[address].update();
            observers[address].disconnect();
          }
        }, observerOptions);
        observers[address].observe(chartRefs.current[address]);
      }
    });

    return () => {
      Object.values(chartInstances.current).forEach((chart) =>
        chart?.destroy()
      );
      Object.values(observers).forEach((observer) => observer.disconnect());
    };
  }, [data]);

  const toggleExpand = (address) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(address)) newExpanded.delete(address);
      else newExpanded.add(address);
      return newExpanded;
    });
  };

  const copyTrade = (address) => {
    navigator.clipboard.writeText(address);
    showNotification(
      `Started copy trading for ${address.slice(0, 4)}...${address.slice(-4)}`
    );
  };

  const copyTicker = (ticker) => {
    navigator.clipboard.writeText(ticker);
    showNotification(`Copied ticker: ${ticker}`);
  };

  const sortedData = Object.entries(data)
    .map(([address, entry]) => ({ address, ...entry }))
    .filter(
      (entry) =>
        (!filters.search ||
          entry.address.toLowerCase().includes(filters.search.toLowerCase())) &&
        entry.trades.length >= filters.minTrades &&
        entry.profitPercent >= filters.minProfit &&
        entry.totalVolume >= filters.minVolume
    )
    .sort((a, b) => {
      let valA = a[sort.column],
        valB = b[sort.column];
      if (sort.column === "address")
        return sort.order === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      if (sort.column === "profit30d" || sort.column === "apr") {
        if (valA === null && valB === null) return 0;
        if (valA === null) return sort.order === "asc" ? 1 : -1;
        if (valB === null) return sort.order === "asc" ? -1 : 1;
      }
      if (sort.column === "trades") {
        valA = a.trades.length;
        valB = b.trades.length;
      }
      return sort.order === "asc" ? valA - valB : valB - valA;
    });

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex-1">
      <div className="bg-gray-700 p-4 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-3"></th>
              <th
                className="p-3 cursor-pointer"
                onClick={() =>
                  setSort({
                    column: "address",
                    order:
                      sort.column === "address" && sort.order === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Address/Name{" "}
                {sort.column === "address" &&
                  (sort.order === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-3 cursor-pointer"
                onClick={() =>
                  setSort({
                    column: "profitPercent",
                    order:
                      sort.column === "profitPercent" && sort.order === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Profit %{" "}
                {sort.column === "profitPercent" &&
                  (sort.order === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-3 cursor-pointer"
                onClick={() =>
                  setSort({
                    column: "apr",
                    order:
                      sort.column === "apr" && sort.order === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                APR{" "}
                {sort.column === "apr" && (sort.order === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-3 cursor-pointer"
                onClick={() =>
                  setSort({
                    column: "profit30d",
                    order:
                      sort.column === "profit30d" && sort.order === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                30d Profit %{" "}
                {sort.column === "profit30d" &&
                  (sort.order === "asc" ? "▲" : "▼")}
              </th>
              <th className="p-3">Profit Chart</th>
              <th
                className="p-3 cursor-pointer"
                onClick={() =>
                  setSort({
                    column: "trades",
                    order:
                      sort.column === "trades" && sort.order === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Trades{" "}
                {sort.column === "trades" && (sort.order === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="p-3 cursor-pointer"
                onClick={() =>
                  setSort({
                    column: "totalVolume",
                    order:
                      sort.column === "totalVolume" && sort.order === "asc"
                        ? "desc"
                        : "asc",
                  })
                }
              >
                Volume (BTC){" "}
                {sort.column === "totalVolume" &&
                  (sort.order === "asc" ? "▲" : "▼")}
              </th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <React.Fragment key={item.address}>
                <tr className="border-t border-gray-600 hover:bg-gray-600">
                  <td className="p-3">
                    <i
                      className={`fas fa-chevron-${
                        expandedRows.has(item.address) ? "up" : "down"
                      } text-pink-500 cursor-pointer`}
                      onClick={() => toggleExpand(item.address)}
                    />
                  </td>
                  <td className="p-3">
                    <span
                      className="text-pink-500 cursor-pointer hover:text-pink-400"
                      onClick={() =>
                        setPopup({
                          type: "trades",
                          data: { address: item.address, runes: item.runes },
                        })
                      }
                    >
                      {item.address.slice(0, 4)}...{item.address.slice(-4)}
                    </span>
                  </td>
                  <td
                    className={`p-3 ${
                      item.profitPercent >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {item.profitPercent.toFixed(2)}%
                  </td>
                  <td
                    className={`p-3 ${
                      item.apr >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {item.apr.toFixed(2)}%
                  </td>
                  <td
                    className={`p-3 ${
                      item.profit30d !== null
                        ? item.profit30d >= 0
                          ? "text-green-400"
                          : "text-red-400"
                        : ""
                    }`}
                  >
                    {item.profit30d !== null
                      ? `${item.profit30d.toFixed(2)}%`
                      : "N/A"}
                  </td>
                  <td className="p-3">
                    <canvas
                      ref={(el) => (chartRefs.current[item.address] = el)}
                      width="250"
                      height="50"
                      onClick={() =>
                        setPopup({
                          type: "chart",
                          data: {
                            address: item.address,
                            profitHistory: item.profitHistory,
                          },
                        })
                      }
                    />
                  </td>
                  <td className="p-3">{item.trades.length}</td>
                  <td className="p-3">{item.totalVolume.toFixed(4)}</td>
                  <td className="p-3 flex space-x-2 justify-center">
                    <button
                      onClick={() => copyTrade(item.address)}
                      className="text-pink-500 hover:text-pink-400"
                      title="Copy Trade"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                    <button
                      onClick={() =>
                        setPopup({
                          type: "chart",
                          data: {
                            address: item.address,
                            profitHistory: item.profitHistory,
                          },
                        })
                      }
                      className="text-pink-500 hover:text-pink-400"
                      title="View Chart"
                    >
                      <i className="fas fa-chart-line"></i>
                    </button>
                  </td>
                </tr>
                {expandedRows.has(item.address) && (
                  <tr className="bg-gray-600">
                    <td colSpan="9" className="p-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold mb-2">
                          Trade Details
                        </h4>
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-700">
                              <th className="p-2">Rune</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Rune Amount</th>
                              <th className="p-2">BTC Amount</th>
                              <th className="p-2">Price (sats)</th>
                              <th className="p-2">Profit %</th>
                              <th className="p-2">Copy Trade</th>
                              <th className="p-2">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.trades
                              .sort(
                                (a, b) =>
                                  new Date(b.createdAt) - new Date(a.createdAt)
                              )
                              .map((trade, idx) => {
                                const profitPercent =
                                  trade.mode === "buy"
                                    ? marketPrices[trade.runeTicker] &&
                                      trade.btcAmount / trade.runeAmount
                                      ? (
                                          (marketPrices[trade.runeTicker] /
                                            (trade.btcAmount /
                                              trade.runeAmount) -
                                            1) *
                                          100
                                        ).toFixed(2)
                                      : "N/A"
                                    : trade.profitPercent
                                    ? trade.profitPercent.toFixed(2)
                                    : "N/A";
                                const profitColor =
                                  profitPercent === "N/A"
                                    ? ""
                                    : profitPercent >= 0
                                    ? "text-green-400"
                                    : "text-red-400";
                                return (
                                  <tr
                                    key={idx}
                                    className="border-t border-gray-700"
                                  >
                                    <td className="p-2">
                                      <span
                                        className="text-pink-500 cursor-pointer hover:text-pink-400"
                                        onClick={() =>
                                          copyTicker(trade.runeTicker)
                                        }
                                      >
                                        {trade.runeTicker}
                                      </span>
                                    </td>
                                    <td className="p-2">
                                      {trade.mode.charAt(0).toUpperCase() +
                                        trade.mode.slice(1)}
                                    </td>
                                    <td className="p-2">{trade.runeAmount}</td>
                                    <td className="p-2">
                                      {(trade.btcAmount / 1e8).toFixed(4)}
                                    </td>
                                    <td className="p-2">
                                      {(
                                        trade.btcAmount / trade.runeAmount
                                      ).toFixed(2)}
                                    </td>
                                    <td className={`p-2 ${profitColor}`}>
                                      {profitPercent}%
                                    </td>
                                    <td className="p-2">
                                      {trade.copyTrade === 1 ? "Yes" : "No"}
                                    </td>
                                    <td className="p-2">
                                      {new Date(
                                        trade.createdAt
                                      ).toLocaleString()}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-700 p-4 rounded-lg shadow mt-4 flex justify-center items-center gap-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <span>{`${currentPage} / ${totalPages}`}</span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default TradingTable;
