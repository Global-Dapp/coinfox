// Technical Indicators Utility Functions

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} data - Array of price values
 * @param {number} period - Period for moving average
 * @returns {number} - Moving average value
 */
export function calculateSMA(data, period) {
  if (!data || data.length < period) return 0;

  const slice = data.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array} data - Array of price values
 * @param {number} period - Period for moving average
 * @returns {number} - EMA value
 */
export function calculateEMA(data, period) {
  if (!data || data.length === 0) return 0;
  if (data.length < period) return data[data.length - 1] || 0;

  const multiplier = 2 / (period + 1);
  let ema = data[0];

  for (let i = 1; i < data.length; i++) {
    ema = data[i] * multiplier + ema * (1 - multiplier);
  }

  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} prices - Array of price values
 * @param {number} period - Period for RSI calculation (default 14)
 * @returns {number} - RSI value (0-100)
 */
export function calculateRSI(prices, period = 14) {
  if (!prices || prices.length < period + 1) return 50; // Neutral RSI

  const gains = [];
  const losses = [];

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  if (gains.length < period) return 50;

  // Calculate average gains and losses
  let avgGain =
    gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
  let avgLoss =
    losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

  // Apply smoothing for subsequent periods
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return Math.round(rsi * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate mock historical portfolio values for technical analysis
 * @param {Object} coinz - Portfolio coins
 * @param {Object} marketData - Market data
 * @param {number} exchangeRate - Exchange rate
 * @param {number} days - Number of days of historical data
 * @returns {Array} - Array of portfolio values over time
 */
export function generatePortfolioHistoricalData(
  coinz,
  marketData,
  exchangeRate,
  days = 30
) {
  if (!coinz || !marketData || Object.keys(coinz).length === 0) {
    return [];
  }

  // Calculate current portfolio value
  const currentValue = Object.keys(coinz).reduce((total, coin) => {
    const holding = Number(coinz[coin].hodl || 0);
    const price =
      (marketData[coin] &&
        marketData[coin].ticker &&
        Number(marketData[coin].ticker.price) * exchangeRate) ||
      0;
    return total + holding * price;
  }, 0);

  if (currentValue === 0) return [];

  // Generate mock historical data with realistic variance
  const historicalValues = [];

  for (let i = days - 1; i >= 0; i--) {
    // Create more realistic price movements
    const daysFactor = i / days;
    const randomWalk = Math.sin(daysFactor * Math.PI * 2) * 0.1; // Cyclical component
    const trend = daysFactor * 0.05; // Slight upward trend
    const noise = (Math.random() - 0.5) * 0.08; // Random noise

    const variance = randomWalk + trend + noise;
    const historicalValue = currentValue * (1 + variance);

    historicalValues.push(Math.max(0, historicalValue));
  }

  return historicalValues;
}

/**
 * Generate RSI historical data for charting
 * @param {Object} coinz - Portfolio coins
 * @param {Object} marketData - Market data
 * @param {number} exchangeRate - Exchange rate
 * @param {number} days - Number of days of historical data
 * @returns {Array} - Array of RSI values over time with timestamps
 */
export function generateRSIHistoricalData(
  coinz,
  marketData,
  exchangeRate,
  days = 30
) {
  const portfolioData = generatePortfolioHistoricalData(
    coinz,
    marketData,
    exchangeRate,
    days
  );

  if (portfolioData.length < 15) {
    return [];
  }

  const rsiData = [];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  // Calculate RSI for each day (need at least 15 days for RSI calculation)
  for (let i = 14; i < portfolioData.length; i++) {
    const priceSlice = portfolioData.slice(0, i + 1);
    const rsi = calculateRSI(priceSlice, 14);
    const timestamp = now - (portfolioData.length - 1 - i) * dayInMs;

    rsiData.push([timestamp, rsi]);
  }

  return rsiData;
}

/**
 * Calculate portfolio technical indicators
 * @param {Object} coinz - Portfolio coins
 * @param {Object} marketData - Market data
 * @param {number} exchangeRate - Exchange rate
 * @returns {Object} - Technical indicators object
 */
export function calculatePortfolioTechnicalIndicators(
  coinz,
  marketData,
  exchangeRate
) {
  const historicalData = generatePortfolioHistoricalData(
    coinz,
    marketData,
    exchangeRate,
    30
  );

  if (historicalData.length === 0) {
    return {
      sma7: 0,
      sma30: 0,
      ema7: 0,
      ema30: 0,
      rsi: 50,
      trend: "neutral",
    };
  }

  const sma7 = calculateSMA(historicalData, 7);
  const sma30 = calculateSMA(historicalData, 30);
  const ema7 = calculateEMA(historicalData, 7);
  const ema30 = calculateEMA(historicalData, 30);
  const rsi = calculateRSI(historicalData, 14);

  // Determine trend based on moving averages
  let trend = "neutral";
  const currentValue = historicalData[historicalData.length - 1];

  if (currentValue > sma7 && sma7 > sma30) {
    trend = "bullish";
  } else if (currentValue < sma7 && sma7 < sma30) {
    trend = "bearish";
  }

  return {
    sma7: Math.round(sma7 * 100) / 100,
    sma30: Math.round(sma30 * 100) / 100,
    ema7: Math.round(ema7 * 100) / 100,
    ema30: Math.round(ema30 * 100) / 100,
    rsi: rsi,
    trend: trend,
    currentValue: currentValue,
  };
}

/**
 * Get RSI interpretation
 * @param {number} rsi - RSI value
 * @returns {Object} - RSI interpretation with status and color
 */
export function getRSIInterpretation(rsi) {
  if (rsi >= 70) {
    return {
      status: "Overbought",
      color: "#ff4757",
      signal: "Consider taking profits",
    };
  } else if (rsi <= 30) {
    return {
      status: "Oversold",
      color: "#21ce99",
      signal: "Potential buying opportunity",
    };
  } else {
    return {
      status: "Neutral",
      color: "#ffd93d",
      signal: "Hold current position",
    };
  }
}

/**
 * Get moving average trend interpretation
 * @param {string} trend - Trend direction
 * @returns {Object} - Trend interpretation
 */
export function getTrendInterpretation(trend) {
  switch (trend) {
    case "bullish":
      return {
        status: "Bullish",
        color: "#21ce99",
        icon: "fa-arrow-up",
        signal: "Upward momentum",
      };
    case "bearish":
      return {
        status: "Bearish",
        color: "#ff4757",
        icon: "fa-arrow-down",
        signal: "Downward pressure",
      };
    default:
      return {
        status: "Neutral",
        color: "#ffd93d",
        icon: "fa-arrow-right",
        signal: "Sideways movement",
      };
  }
}
