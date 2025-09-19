import { putFile, getFile, isUserSignedIn } from 'blockstack';

// Alert storage key
const ALERT_STORAGE_KEY = 'coinfox-alerts.json';

// Alert types
export const ALERT_TYPES = {
  ABOVE: 'above',
  BELOW: 'below'
};

// Alert status
export const ALERT_STATUS = {
  ACTIVE: 'active',
  TRIGGERED: 'triggered',
  DISMISSED: 'dismissed'
};

/**
 * Create a new price alert
 * @param {string} coin - Coin ticker symbol
 * @param {string} type - Alert type (above/below)
 * @param {number} targetPrice - Target price threshold
 * @param {string} currency - Currency for the target price
 * @returns {Object} Alert object
 */
export function createAlert(coin, type, targetPrice, currency = 'USD') {
  return {
    id: `${coin}_${type}_${targetPrice}_${Date.now()}`,
    coin: coin.toLowerCase(),
    type,
    targetPrice: parseFloat(targetPrice),
    currency: currency.toUpperCase(),
    status: ALERT_STATUS.ACTIVE,
    createdAt: new Date().toISOString(),
    triggeredAt: null,
    message: `${coin.toUpperCase()} ${type === ALERT_TYPES.ABOVE ? 'above' : 'below'} ${targetPrice} ${currency}`
  };
}

/**
 * Get all alerts from storage
 * @returns {Promise<Array>} Array of alerts
 */
export async function getAlerts() {
  try {
    if (isUserSignedIn()) {
      const decrypt = true;
      const alertData = await getFile(ALERT_STORAGE_KEY, decrypt);
      return alertData ? JSON.parse(alertData) : [];
    } else {
      const alertData = localStorage.getItem('coinAlerts');
      return alertData ? JSON.parse(alertData) : [];
    }
  } catch (error) {
    console.warn('Failed to load alerts:', error);
    return [];
  }
}

/**
 * Save alerts to storage
 * @param {Array} alerts - Array of alert objects
 * @returns {Promise<boolean>} Success status
 */
export async function saveAlerts(alerts) {
  try {
    if (isUserSignedIn()) {
      const encrypt = true;
      await putFile(ALERT_STORAGE_KEY, JSON.stringify(alerts), encrypt);
    } else {
      localStorage.setItem('coinAlerts', JSON.stringify(alerts));
    }
    return true;
  } catch (error) {
    console.error('Failed to save alerts:', error);
    return false;
  }
}

/**
 * Add a new alert
 * @param {Object} alert - Alert object
 * @returns {Promise<boolean>} Success status
 */
export async function addAlert(alert) {
  try {
    const alerts = await getAlerts();
    alerts.push(alert);
    return await saveAlerts(alerts);
  } catch (error) {
    console.error('Failed to add alert:', error);
    return false;
  }
}

/**
 * Remove an alert by ID
 * @param {string} alertId - Alert ID
 * @returns {Promise<boolean>} Success status
 */
export async function removeAlert(alertId) {
  try {
    const alerts = await getAlerts();
    const filteredAlerts = alerts.filter(alert => alert.id !== alertId);
    return await saveAlerts(filteredAlerts);
  } catch (error) {
    console.error('Failed to remove alert:', error);
    return false;
  }
}

/**
 * Update alert status
 * @param {string} alertId - Alert ID
 * @param {string} status - New status
 * @returns {Promise<boolean>} Success status
 */
export async function updateAlertStatus(alertId, status) {
  try {
    const alerts = await getAlerts();
    const alertIndex = alerts.findIndex(alert => alert.id === alertId);
    
    if (alertIndex !== -1) {
      alerts[alertIndex].status = status;
      if (status === ALERT_STATUS.TRIGGERED) {
        alerts[alertIndex].triggeredAt = new Date().toISOString();
      }
      return await saveAlerts(alerts);
    }
    return false;
  } catch (error) {
    console.error('Failed to update alert status:', error);
    return false;
  }
}

/**
 * Get alerts for a specific coin
 * @param {string} coin - Coin ticker symbol
 * @returns {Promise<Array>} Array of alerts for the coin
 */
export async function getAlertsForCoin(coin) {
  try {
    const alerts = await getAlerts();
    return alerts.filter(alert => alert.coin === coin.toLowerCase());
  } catch (error) {
    console.error('Failed to get alerts for coin:', error);
    return [];
  }
}

/**
 * Get active alerts
 * @returns {Promise<Array>} Array of active alerts
 */
export async function getActiveAlerts() {
  try {
    const alerts = await getAlerts();
    return alerts.filter(alert => alert.status === ALERT_STATUS.ACTIVE);
  } catch (error) {
    console.error('Failed to get active alerts:', error);
    return [];
  }
}

/**
 * Check if price thresholds are met and trigger alerts
 * @param {Object} marketData - Current market data
 * @param {number} exchangeRate - Exchange rate for currency conversion
 * @returns {Promise<Array>} Array of triggered alerts
 */
export async function checkAlertTriggers(marketData, exchangeRate = 1) {
  try {
    const activeAlerts = await getActiveAlerts();
    const triggeredAlerts = [];

    for (const alert of activeAlerts) {
      const coinData = marketData[alert.coin];
      if (!coinData || !coinData.ticker) continue;

      const currentPrice = coinData.ticker.price * exchangeRate;
      let shouldTrigger = false;

      if (alert.type === ALERT_TYPES.ABOVE && currentPrice >= alert.targetPrice) {
        shouldTrigger = true;
      } else if (alert.type === ALERT_TYPES.BELOW && currentPrice <= alert.targetPrice) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        await updateAlertStatus(alert.id, ALERT_STATUS.TRIGGERED);
        triggeredAlerts.push({
          ...alert,
          currentPrice,
          status: ALERT_STATUS.TRIGGERED
        });
      }
    }

    return triggeredAlerts;
  } catch (error) {
    console.error('Failed to check alert triggers:', error);
    return [];
  }
}

/**
 * Calculate portfolio analytics
 * @param {Object} coinz - User's coin holdings
 * @param {Object} marketData - Current market data
 * @param {number} exchangeRate - Exchange rate for currency conversion
 * @returns {Object} Portfolio analytics data
 */
export function calculatePortfolioAnalytics(coinz, marketData, exchangeRate = 1) {
  if (!coinz || !marketData) {
    return {
      totalValue: 0,
      totalBasis: 0,
      totalReturn: 0,
      returnPercentage: 0,
      dailyChange: 0,
      bestPerformer: null,
      worstPerformer: null,
      diversification: [],
      riskScore: 0
    };
  }

  let totalValue = 0;
  let totalBasis = 0;
  let dailyChange = 0;
  const coinPerformances = [];
  const diversification = [];

  for (const coin in coinz) {
    const coinData = marketData[coin];
    if (!coinData || !coinData.ticker) continue;

    const price = coinData.ticker.price * exchangeRate;
    const hodl = coinz[coin].hodl;
    const costBasis = coinz[coin].cost_basis * exchangeRate;
    const coinValue = price * hodl;
    const coinBasis = costBasis * hodl;
    const coinReturn = coinValue - coinBasis;
    const coinReturnPercentage = coinBasis > 0 ? (coinReturn / coinBasis) * 100 : 0;
    const coinDailyChange = coinData.ticker.change || 0;

    totalValue += coinValue;
    totalBasis += coinBasis;
    dailyChange += (coinValue * coinDailyChange) / 100;

    coinPerformances.push({
      coin: coin.toUpperCase(),
      value: coinValue,
      returnPercentage: coinReturnPercentage,
      dailyChange: coinDailyChange
    });

    diversification.push({
      coin: coin.toUpperCase(),
      value: coinValue,
      percentage: 0 // Will be calculated after totalValue is known
    });
  }

  // Calculate diversification percentages
  diversification.forEach(item => {
    item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
  });

  const totalReturn = totalValue - totalBasis;
  const returnPercentage = totalBasis > 0 ? (totalReturn / totalBasis) * 100 : 0;
  const dailyChangePercentage = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0;

  // Find best and worst performers
  const sortedPerformances = coinPerformances.sort((a, b) => b.returnPercentage - a.returnPercentage);
  const bestPerformer = sortedPerformances[0] || null;
  const worstPerformer = sortedPerformances[sortedPerformances.length - 1] || null;

  // Calculate simple risk score based on portfolio concentration
  const maxAllocation = Math.max(...diversification.map(d => d.percentage));
  const riskScore = Math.min(100, maxAllocation + (diversification.length < 5 ? 20 : 0));

  return {
    totalValue,
    totalBasis,
    totalReturn,
    returnPercentage,
    dailyChange: dailyChangePercentage,
    bestPerformer,
    worstPerformer,
    diversification: diversification.sort((a, b) => b.value - a.value),
    riskScore: Math.round(riskScore),
    coinCount: Object.keys(coinz).length
  };
}
