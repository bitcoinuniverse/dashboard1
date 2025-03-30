import React, { useState, useEffect } from "react";
import Header from "./components/header";
import Stats from "./components/Stats";
import Filters from "./components/Filters";
import ControlRow from "./components/ControlRow";
import TradingTable from "./components/TradingTable";
import TraderOfTheDay from "./components/TraderOfTheDay";
import PromoSection from "./components/PromoSection";
import Footer from "./components/Footer";
import BitcoinLogo from "./components/BitcoinLogo";
import BackToTop from "./components/BackToTop";
import Loading from "./components/Loading";
import Notification from "./components/Notification";
import TradesPopup from "./components/TradesPopup";
import ActivityPopup from "./components/ActivityPopup";

const BASE_API_URL = "https://apiv2.bitcoinuniverse.io/bot/swapHistory";
const MARKET_API_URL = "https://api.bestinslot.xyz/v3/runes/market_info";
const API_KEY = "5b619ec3-44f9-4c69-98f0-ca59dec8da61";
const SATOSHIS_PER_BTC = 1e8;

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    message: "",
    show: false,
  });
  const [addressData, setAddressData] = useState({});
  const [marketPrices, setMarketPrices] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    minTrades: 0,
    minProfit: -10,
    minVolume: 0,
  });
  const [sort, setSort] = useState({ column: "profitPercent", order: "desc" }); // Verified: sort is initialized here
  const [currentPage, setCurrentPage] = useState(1);
  const [popup, setPopup] = useState({ type: null, data: null });

  const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  const fetchMarketPrice = async (runeName) => {
    try {
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const response = await fetchWithTimeout(
        `${proxyUrl}${MARKET_API_URL}?rune_name=${encodeURIComponent(
          runeName
        )}`,
        { headers: { "x-api-key": API_KEY, Accept: "application/json" } }
      );
      if (!response.ok)
        throw new Error(`Proxy error! Status: ${response.status}`);
      const data = await response.json();
      return data.data.min_listed_unit_price_in_sats;
    } catch (error) {
      console.error(`Error fetching market price for ${runeName}:`, error);
      return null;
    }
  };

  const fetchAllMarketPrices = async (runes) => {
    const uniqueRunes = [...new Set(runes)];
    const pricePromises = uniqueRunes.map((rune) =>
      fetchMarketPrice(rune).then((price) => ({ rune, price }))
    );
    const results = await Promise.all(pricePromises);
    const prices = {};
    results.forEach(({ rune, price }) => {
      if (price !== null) prices[rune] = price / SATOSHIS_PER_BTC;
    });
    setMarketPrices(prices);
  };

  const calculateState = (trades, marketPrices, calculateHistory = false) => {
    const state = {
      holdings: {},
      realizedProfit: 0,
      totalBuyCosts: 0,
      profitHistory: calculateHistory ? [] : null,
      trades,
      runes: {},
    };
    trades.forEach((trade) => {
      const rune = trade.runeTicker;
      state.runes[rune] = state.runes[rune] || [];
      state.runes[rune].push(trade);
      if (trade.mode === "buy") {
        const price = trade.btcAmount / trade.runeAmount;
        state.holdings[rune] = state.holdings[rune] || [];
        state.holdings[rune].push({ amount: trade.runeAmount, price });
        state.totalBuyCosts += trade.btcAmount;
      } else if (trade.mode === "sell") {
        const sellPrice = trade.btcAmount / trade.runeAmount;
        let sellAmount = trade.runeAmount;
        let realizedProfitForTrade = 0;
        let totalCostForTrade = 0;
        while (sellAmount > 0 && state.holdings[rune]?.length > 0) {
          const lot = state.holdings[rune][0];
          if (lot.amount > sellAmount) {
            realizedProfitForTrade += (sellPrice - lot.price) * sellAmount;
            totalCostForTrade += lot.price * sellAmount;
            lot.amount -= sellAmount;
            sellAmount = 0;
          } else {
            realizedProfitForTrade += (sellPrice - lot.price) * lot.amount;
            totalCostForTrade += lot.price * lot.amount;
            sellAmount -= lot.amount;
            state.holdings[rune].shift();
          }
        }
        if (sellAmount > 0) realizedProfitForTrade += sellPrice * sellAmount;
        state.realizedProfit += realizedProfitForTrade;
        trade.profitPercent =
          totalCostForTrade > 0
            ? (sellPrice / (totalCostForTrade / trade.runeAmount) - 1) * 100
            : 0;
      }
      if (calculateHistory) {
        let unrealizedProfit = 0;
        for (const r in state.holdings) {
          if (marketPrices[r]) {
            state.holdings[r].forEach(
              (lot) =>
                (unrealizedProfit += (marketPrices[r] - lot.price) * lot.amount)
            );
          }
        }
        const totalProfit = state.realizedProfit + unrealizedProfit;
        const profitPercent =
          state.totalBuyCosts > 0
            ? (totalProfit / state.totalBuyCosts) * 100
            : 0;
        state.profitHistory.push({ time: trade.createdAt, profitPercent });
      }
    });
    let unrealizedProfit = 0;
    for (const r in state.holdings) {
      if (marketPrices[r]) {
        state.holdings[r].forEach(
          (lot) =>
            (unrealizedProfit += (marketPrices[r] - lot.price) * lot.amount)
        );
      }
    }
    const totalProfit = state.realizedProfit + unrealizedProfit;
    const profitPercent =
      state.totalBuyCosts > 0 ? (totalProfit / state.totalBuyCosts) * 100 : 0;
    return { ...state, totalProfit, profitPercent };
  };

  const fetchAllTradeData = async () => {
    setLoading(true);
    try {
      let allTrades = [];
      let offset = 0;
      const limit = 50;
      let total = 0;

      do {
        const response = await fetchWithTimeout(
          `${BASE_API_URL}?offset=${offset}&limit=${limit}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const { data, total: apiTotal } = await response.json();
        if (!Array.isArray(data))
          throw new Error("Invalid data format from API");
        if (total === 0) total = apiTotal || 0;
        allTrades = allTrades.concat(data);
        offset += limit;
      } while (allTrades.length < total && data.length === limit);

      allTrades.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const uniqueRunes = [
        ...new Set(allTrades.map((trade) => trade.runeTicker)),
      ];
      await fetchAllMarketPrices(uniqueRunes);

      const addressStates = {};
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

      allTrades.forEach((trade) => {
        const { address, runeTicker: rune } = trade;
        addressStates[address] = addressStates[address] || {
          holdings: {},
          realizedProfit: 0,
          totalBuyCosts: 0,
          profitHistory: [],
          trades: [],
          realizedProfit30d: 0,
          totalCost30d: 0,
          holdings30d: {},
          totalBuyCosts30d: 0,
          realizedProfit12m: 0,
          totalBuyCosts12m: 0,
          holdings12m: {},
        };
        const state = addressStates[address];
        if (trade.mode === "buy") {
          const price = trade.btcAmount / trade.runeAmount;
          state.holdings[rune] = state.holdings[rune] || [];
          state.holdings[rune].push({ amount: trade.runeAmount, price });
          state.totalBuyCosts += trade.btcAmount;
          if (new Date(trade.createdAt) >= thirtyDaysAgo) {
            state.holdings30d[rune] = state.holdings30d[rune] || [];
            state.holdings30d[rune].push({ amount: trade.runeAmount, price });
            state.totalBuyCosts30d += trade.btcAmount;
          }
          if (new Date(trade.createdAt) >= oneYearAgo) {
            state.holdings12m[rune] = state.holdings12m[rune] || [];
            state.holdings12m[rune].push({ amount: trade.runeAmount, price });
            state.totalBuyCosts12m += trade.btcAmount;
          }
        } else if (trade.mode === "sell") {
          const sellPrice = trade.btcAmount / trade.runeAmount;
          let sellAmount = trade.runeAmount;
          let realizedProfitForTrade = 0;
          let totalCostForTrade = 0;
          while (sellAmount > 0 && state.holdings[rune]?.length > 0) {
            const lot = state.holdings[rune][0];
            if (lot.amount > sellAmount) {
              realizedProfitForTrade += (sellPrice - lot.price) * sellAmount;
              totalCostForTrade += lot.price * sellAmount;
              lot.amount -= sellAmount;
              sellAmount = 0;
            } else {
              realizedProfitForTrade += (sellPrice - lot.price) * lot.amount;
              totalCostForTrade += lot.price * lot.amount;
              sellAmount -= lot.amount;
              state.holdings[rune].shift();
            }
          }
          state.realizedProfit += realizedProfitForTrade;
          if (new Date(trade.createdAt) >= thirtyDaysAgo) {
            state.realizedProfit30d += realizedProfitForTrade;
            state.totalCost30d += totalCostForTrade;
          }
          if (new Date(trade.createdAt) >= oneYearAgo)
            state.realizedProfit12m += realizedProfitForTrade;
          trade.profitPercent =
            totalCostForTrade > 0
              ? (sellPrice / (totalCostForTrade / trade.runeAmount) - 1) * 100
              : 0;
        }
        state.trades.push(trade);
      });

      const newAddressData = {};
      Object.entries(addressStates).forEach(([address, state]) => {
        const calculatedState = calculateState(
          state.trades,
          marketPrices,
          true
        );
        const runes = {};
        state.trades.forEach((trade) => {
          const rune = trade.runeTicker;
          runes[rune] = runes[rune] || [];
          runes[rune].push(trade);
        });
        const profit30dState = calculateState(
          state.trades.filter((t) => new Date(t.createdAt) >= thirtyDaysAgo),
          marketPrices
        );
        const profit12mState = calculateState(
          state.trades.filter((t) => new Date(t.createdAt) >= oneYearAgo),
          marketPrices
        );
        const profit30d =
          profit30dState.totalBuyCosts > 0
            ? (profit30dState.totalProfit / profit30dState.totalBuyCosts) * 100
            : null;
        const profit12m =
          profit12mState.totalBuyCosts > 0
            ? (profit12mState.totalProfit / profit12mState.totalBuyCosts) * 100
            : 0;
        const apr =
          profit30d !== null ? Math.max(profit30d * 12, profit12m) : profit12m;
        newAddressData[address] = {
          trades: state.trades,
          totalVolume: state.trades
            .filter((t) => t.mode === "buy")
            .reduce((sum, t) => sum + t.btcAmount / SATOSHIS_PER_BTC, 0),
          profitPercent: calculatedState.profitPercent,
          profitHistory: calculatedState.profitHistory,
          runes,
          profit30d,
          apr,
        };
      });
      setAddressData(newAddressData);
    } catch (error) {
      console.error("Error fetching trade data:", error);
      showNotification("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTradeData();
  }, []);

  const showNotification = (message) => {
    setNotification({ message, show: true });
    setTimeout(() => setNotification({ message: "", show: false }), 2000);
  };

  const exportData = () => {
    const headers = [
      "Address",
      "Profit %",
      "APR",
      "30-day Profit %",
      "Trades",
      "Total Volume (BTC)",
    ];
    const rows = Object.entries(addressData).map(([address, data]) => [
      address,
      data.profitPercent.toFixed(2),
      data.apr.toFixed(2),
      data.profit30d !== null ? data.profit30d.toFixed(2) : "N/A",
      data.trades.length,
      data.totalVolume.toFixed(4),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "universe_leaderboard.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Debugging: Log sort to verify it's defined
  console.log("sort in App:", sort);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-800 text-white" : "bg-gray-900 text-gray-200"
      } transition-colors duration-300 relative`}
    >
      <BitcoinLogo />
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <BackToTop />
      {loading && <Loading />}
      <Notification message={notification.message} show={notification.show} />
      <main className="container mx-auto px-4 py-8">
        <Stats data={addressData} />
        <Filters filters={filters} setFilters={setFilters} />
        <ControlRow
          filters={filters}
          setFilters={setFilters}
          refreshData={fetchAllTradeData}
          exportData={exportData}
        />
        <div className="flex flex-col lg:flex-row gap-8">
          <TradingTable
            data={addressData}
            marketPrices={marketPrices}
            filters={filters}
            sort={sort} // Verified: sort is passed here
            setSort={setSort} // Verified: setSort is passed here
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            showNotification={showNotification}
            setPopup={setPopup}
          />
          <TraderOfTheDay
            data={addressData}
            setPopup={setPopup}
            showNotification={showNotification}
          />
        </div>
        <PromoSection />
      </main>
      {popup.type === "trades" && (
        <TradesPopup
          data={popup.data}
          marketPrices={marketPrices}
          closePopup={() => setPopup({ type: null, data: null })}
          showNotification={showNotification}
        />
      )}
      {popup.type === "chart" && (
        <ActivityPopup
          data={popup.data}
          closePopup={() => setPopup({ type: null, data: null })}
        />
      )}
      <Footer />
    </div>
  );
}

export default App;
