import React from "react";

const TradesPopup = ({ data, marketPrices, closePopup, showNotification }) => {
  const { address, runes } = data;

  const copyTicker = (ticker) => {
    navigator.clipboard.writeText(ticker);
    showNotification(`Copied ticker: ${ticker}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-pink-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            Trades for {address.slice(0, 4)}...{address.slice(-4)}
          </h3>
          <button
            onClick={closePopup}
            className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2">Rune</th>
              <th className="p-2">Type</th>
              <th className="p-2">Rune Amount</th>
              <th className="p-2">BTC Amount</th>
              <th className="p-2">Price (sats)</th>
              <th className="p-2">Copy Trade?</th>
              <th className="p-2">Profit %</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(runes)
              .flatMap(([rune, trades]) =>
                trades
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((trade) => ({ rune, trade }))
              )
              .map(({ rune, trade }, idx) => {
                const profitPercent =
                  trade.mode === "buy"
                    ? marketPrices[trade.runeTicker] &&
                      trade.btcAmount / trade.runeAmount
                      ? (
                          (marketPrices[trade.runeTicker] /
                            (trade.btcAmount / trade.runeAmount) -
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
                  <tr key={idx} className="border-t border-gray-600">
                    <td className="p-2">
                      <span
                        className="text-pink-500 cursor-pointer hover:text-pink-400"
                        onClick={() => copyTicker(rune)}
                      >
                        {rune}
                      </span>
                    </td>
                    <td className="p-2">
                      {trade.mode.charAt(0).toUpperCase() + trade.mode.slice(1)}
                    </td>
                    <td className="p-2">{trade.runeAmount}</td>
                    <td className="p-2">
                      {(trade.btcAmount / 1e8).toFixed(4)}
                    </td>
                    <td className="p-2">
                      {(trade.btcAmount / trade.runeAmount).toFixed(2)}
                    </td>
                    <td className="p-2">
                      {trade.copyTrade === 1 ? "Yes" : "No"}
                    </td>
                    <td className={`p-2 ${profitColor}`}>{profitPercent}%</td>
                    <td className="p-2">
                      {new Date(trade.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradesPopup;
