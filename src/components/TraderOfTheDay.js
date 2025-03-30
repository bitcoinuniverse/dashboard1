import React from "react";

const TraderOfTheDay = ({ data, setPopup, showNotification }) => {
  const topTrader = Object.entries(data).reduce(
    (max, [address, entry]) =>
      entry.profitPercent > (max.data?.profitPercent || -Infinity)
        ? { address, data: entry }
        : max,
    {}
  );

  if (!topTrader.address) return null;

  const { address, data: traderData } = topTrader; // Renamed 'data' to 'traderData' to avoid shadowing
  const trades = traderData.trades;
  const totalTrades = trades.length;
  const runeVolumes = {};
  trades.forEach((trade) => {
    runeVolumes[trade.runeTicker] =
      (runeVolumes[trade.runeTicker] || 0) + trade.btcAmount;
  });
  const topRune = Object.entries(runeVolumes).reduce(
    (max, [rune, volume]) =>
      volume > (max.volume || 0) ? { rune, volume } : max,
    { rune: "N/A", volume: 0 }
  );
  const profitableTrades = trades.filter(
    (trade) => trade.mode === "sell" && trade.profitPercent > 0
  ).length;
  const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;
  const avgTradeSize =
    totalTrades > 0
      ? trades.reduce((sum, trade) => sum + trade.btcAmount, 0) /
        totalTrades /
        1e8
      : 0;

  const copyTrade = () => {
    navigator.clipboard.writeText(address);
    showNotification(
      `Started copy trading for ${address.slice(0, 4)}...${address.slice(-4)}`
    );
  };

  return (
    <div className="lg:w-1/3 bg-gray-700 p-4 rounded-lg shadow border-2 border-pink-500">
      <h3 className="text-xl font-bold text-pink-500 mb-4 text-center">
        Trader of the Day
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-800 p-2 rounded text-center">
          <strong>Address</strong>
          <p
            className="text-pink-500 cursor-pointer hover:text-pink-400"
            onClick={() =>
              setPopup({
                type: "trades",
                data: { address, runes: traderData.runes },
              })
            }
          >
            {address.slice(0, 4)}...{address.slice(-4)}
          </p>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <strong>Profit %</strong>
          <p
            className={
              traderData.profitPercent >= 0 ? "text-green-400" : "text-red-400"
            }
          >
            {traderData.profitPercent.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <strong>Trades</strong>
          <p>{totalTrades}</p>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <strong>Volume</strong>
          <p>{traderData.totalVolume.toFixed(4)} BTC</p>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <strong>Top Rune</strong>
          <p>{`${topRune.rune} (${(topRune.volume / 1e8).toFixed(4)} BTC)`}</p>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <strong>Win Rate</strong>
          <p className={winRate >= 50 ? "text-green-400" : "text-red-400"}>
            {winRate.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <strong>Avg Trade</strong>
          <p>{avgTradeSize.toFixed(4)} BTC</p>
        </div>
        <button
          onClick={copyTrade}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg mt-2 w-full"
        >
          Copy Trade
        </button>
      </div>
    </div>
  );
};

export default TraderOfTheDay;
