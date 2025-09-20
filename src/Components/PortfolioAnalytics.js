import React, { useState } from "react";
import styled from "styled-components";
import { $currencySymbol, $numberWithCommas } from "../Utils/Helpers";
import ChartPortfolioValue from "./ChartPortfolioValue";
import ChartRSI from "./ChartRSI";
import {
  calculatePortfolioTechnicalIndicators,
  getRSIInterpretation,
  getTrendInterpretation,
} from "../Utils/technicalIndicators";

const Container = styled.div`
  padding: 20px;
  color: #fff;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const Card = styled.div`
  background: linear-gradient(
    135deg,
    rgba(33, 206, 153, 0.1),
    rgba(0, 0, 0, 0.2)
  );
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(33, 206, 153, 0.2);
  backdrop-filter: blur(10px);
`;

const MetricCard = styled(Card)`
  text-align: center;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(0, 0, 0, 0.1)
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #21ce99;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${(props) =>
    props.positive ? "#21ce99" : props.negative ? "#ff4757" : "#fff"};
`;

const MetricLabel = styled.div`
  font-size: 14px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PerformanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin: 16px 0;
`;

const TimeframeTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 12px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: ${(props) => (props.active ? "#21ce99" : "transparent")};
  color: ${(props) => (props.active ? "#fff" : "#aaa")};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.active ? "#21ce99" : "rgba(255, 255, 255, 0.1)"};
  }
`;

const CoinRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const CoinInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const CoinName = styled.span`
  font-weight: 600;
  color: #fff;
  font-size: 16px;
`;

const CoinAllocation = styled.span`
  font-size: 12px;
  color: #aaa;
`;

const CoinValue = styled.div`
  text-align: right;
`;

const CoinPrice = styled.div`
  font-weight: 600;
  color: #fff;
`;

const CoinChange = styled.div`
  font-size: 12px;
  color: ${(props) => (props.positive ? "#21ce99" : "#ff4757")};
`;

const RiskIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
`;

const RiskDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) =>
    props.level === "low"
      ? "#21ce99"
      : props.level === "medium"
      ? "#ffd93d"
      : "#ff4757"};
`;

const PortfolioAnalytics = ({
  coinz = {},
  marketData = {},
  currency = "USD",
  exchangeRate = 1,
}) => {
  const [activeTimeframe, setActiveTimeframe] = useState("24h");

  const symbol = $currencySymbol(currency);

  // Calculate portfolio metrics
  const calculateMetrics = () => {
    const coins = Object.keys(coinz).map((coin) => {
      const holding = Number(coinz[coin].hodl || 0);
      const costBasis = Number(coinz[coin].cost_basis || 0);
      const totalCost = holding * costBasis;

      const currentPrice =
        (marketData[coin] &&
          marketData[coin].ticker &&
          Number(marketData[coin].ticker.price) * exchangeRate) ||
        0;
      const currentValue = holding * currentPrice;

      const profitLoss = currentValue - totalCost;
      const profitLossPercent =
        totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

      return {
        coin: coin.toUpperCase(),
        holding,
        costBasis,
        totalCost,
        currentPrice,
        currentValue,
        profitLoss,
        profitLossPercent,
        allocation: 0, // Will calculate below
      };
    });

    const totalValue = coins.reduce((sum, coin) => sum + coin.currentValue, 0);
    const totalCost = coins.reduce((sum, coin) => sum + coin.totalCost, 0);
    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercent =
      totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    // Calculate allocations
    coins.forEach((coin) => {
      coin.allocation =
        totalValue > 0 ? (coin.currentValue / totalValue) * 100 : 0;
    });

    return {
      coins: coins.sort((a, b) => b.currentValue - a.currentValue),
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercent,
    };
  };

  const metrics = calculateMetrics();
  const technicalIndicators = calculatePortfolioTechnicalIndicators(
    coinz,
    marketData,
    exchangeRate
  );
  const rsiInterpretation = getRSIInterpretation(technicalIndicators.rsi);
  const trendInterpretation = getTrendInterpretation(technicalIndicators.trend);

  // Calculate diversification score (0-100)
  const calculateDiversification = () => {
    const allocations = metrics.coins.map((coin) => coin.allocation);
    const maxAllocation = Math.max(...allocations);

    if (allocations.length <= 1) return 0;
    if (maxAllocation > 80) return 20; // Highly concentrated
    if (maxAllocation > 60) return 40; // Moderately concentrated
    if (maxAllocation > 40) return 60; // Somewhat diversified
    if (maxAllocation > 25) return 80; // Well diversified
    return 100; // Highly diversified
  };

  // Calculate risk level
  const calculateRiskLevel = () => {
    const volatility = Math.abs(metrics.totalProfitLossPercent);
    if (volatility < 10) return "low";
    if (volatility < 25) return "medium";
    return "high";
  };

  const diversificationScore = calculateDiversification();
  const riskLevel = calculateRiskLevel();

  const bestPerformer =
    metrics.coins.length > 0
      ? metrics.coins.reduce((best, coin) =>
          coin.profitLossPercent > best.profitLossPercent ? coin : best
        )
      : null;

  const worstPerformer =
    metrics.coins.length > 0
      ? metrics.coins.reduce((worst, coin) =>
          coin.profitLossPercent < worst.profitLossPercent ? coin : worst
        )
      : null;

  return (
    <Container>
      {/* Performance Overview */}
      <Grid>
        <MetricCard>
          <MetricLabel>Total Portfolio Value</MetricLabel>
          <MetricValue>
            {symbol}
            {$numberWithCommas(metrics.totalValue.toFixed(2))}
          </MetricValue>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Total Profit/Loss</MetricLabel>
          <MetricValue
            positive={metrics.totalProfitLoss >= 0}
            negative={metrics.totalProfitLoss < 0}
          >
            {metrics.totalProfitLoss >= 0 ? "+" : ""}
            {symbol}
            {$numberWithCommas(Math.abs(metrics.totalProfitLoss).toFixed(2))}
          </MetricValue>
          <MetricLabel>
            {metrics.totalProfitLossPercent >= 0 ? "+" : ""}
            {metrics.totalProfitLossPercent.toFixed(2)}%
          </MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Diversification Score</MetricLabel>
          <MetricValue positive={diversificationScore > 60}>
            {diversificationScore}/100
          </MetricValue>
          <MetricLabel>
            {diversificationScore > 80
              ? "Excellent"
              : diversificationScore > 60
              ? "Good"
              : diversificationScore > 40
              ? "Fair"
              : "Poor"}
          </MetricLabel>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Risk Assessment</MetricLabel>
          <RiskIndicator>
            <RiskDot level={riskLevel} />
            <MetricValue style={{ fontSize: "18px", margin: 0 }}>
              {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
            </MetricValue>
          </RiskIndicator>
        </MetricCard>
      </Grid>

      {/* Performance Tracking */}
      <Card>
        <Title>
          <i className="fa fa-chart-line" aria-hidden="true"></i>
          Portfolio Performance
        </Title>

        <TimeframeTabs>
          {["24h", "7d", "30d"].map((timeframe) => (
            <Tab
              key={timeframe}
              active={activeTimeframe === timeframe}
              onClick={() => setActiveTimeframe(timeframe)}
            >
              {timeframe}
            </Tab>
          ))}
        </TimeframeTabs>

        <ChartPortfolioValue
          coinz={coinz}
          marketData={marketData}
          currency={currency}
          exchangeRate={exchangeRate}
        />
      </Card>

      {/* RSI Chart */}
      <ChartRSI
        coinz={coinz}
        marketData={marketData}
        currency={currency}
        exchangeRate={exchangeRate}
      />

      {/* Best/Worst Performers */}
      <Grid>
        <Card>
          <Title>
            <i className="fa fa-trophy" aria-hidden="true"></i>
            Best Performer
          </Title>
          {bestPerformer ? (
            <CoinRow>
              <CoinInfo>
                <CoinName>{bestPerformer.coin}</CoinName>
                <CoinAllocation>
                  {bestPerformer.allocation.toFixed(1)}% of portfolio
                </CoinAllocation>
              </CoinInfo>
              <CoinValue>
                <CoinPrice>
                  {symbol}
                  {$numberWithCommas(bestPerformer.currentValue.toFixed(2))}
                </CoinPrice>
                <CoinChange positive={bestPerformer.profitLossPercent >= 0}>
                  {bestPerformer.profitLossPercent >= 0 ? "+" : ""}
                  {bestPerformer.profitLossPercent.toFixed(2)}%
                </CoinChange>
              </CoinValue>
            </CoinRow>
          ) : (
            <div style={{ color: "#aaa", textAlign: "center" }}>
              No data available
            </div>
          )}
        </Card>

        <Card>
          <Title>
            <i className="fa fa-chart-down" aria-hidden="true"></i>
            Worst Performer
          </Title>
          {worstPerformer ? (
            <CoinRow>
              <CoinInfo>
                <CoinName>{worstPerformer.coin}</CoinName>
                <CoinAllocation>
                  {worstPerformer.allocation.toFixed(1)}% of portfolio
                </CoinAllocation>
              </CoinInfo>
              <CoinValue>
                <CoinPrice>
                  {symbol}
                  {$numberWithCommas(worstPerformer.currentValue.toFixed(2))}
                </CoinPrice>
                <CoinChange positive={worstPerformer.profitLossPercent >= 0}>
                  {worstPerformer.profitLossPercent >= 0 ? "+" : ""}
                  {worstPerformer.profitLossPercent.toFixed(2)}%
                </CoinChange>
              </CoinValue>
            </CoinRow>
          ) : (
            <div style={{ color: "#aaa", textAlign: "center" }}>
              No data available
            </div>
          )}
        </Card>
      </Grid>

      {/* Portfolio Composition */}
      <Card>
        <Title>
          <i className="fa fa-pie-chart" aria-hidden="true"></i>
          Portfolio Composition
        </Title>

        {metrics.coins.map((coin) => (
          <CoinRow key={coin.coin}>
            <CoinInfo>
              <CoinName>{coin.coin}</CoinName>
              <CoinAllocation>
                {coin.holding} coins • {coin.allocation.toFixed(1)}% allocation
              </CoinAllocation>
            </CoinInfo>
            <CoinValue>
              <CoinPrice>
                {symbol}
                {$numberWithCommas(coin.currentValue.toFixed(2))}
              </CoinPrice>
              <CoinChange positive={coin.profitLossPercent >= 0}>
                {coin.profitLossPercent >= 0 ? "+" : ""}
                {coin.profitLossPercent.toFixed(2)}%
              </CoinChange>
            </CoinValue>
          </CoinRow>
        ))}

        {metrics.coins.length === 0 && (
          <div style={{ color: "#aaa", textAlign: "center", padding: "20px" }}>
            No coins in portfolio
          </div>
        )}
      </Card>

      {/* Technical Analysis */}
      <Card>
        <Title>
          <i className="fa fa-signal" aria-hidden="true"></i>
          Technical Indicators
        </Title>

        <PerformanceGrid>
          <MetricCard style={{ minHeight: "auto", padding: "16px" }}>
            <MetricLabel>Moving Average (7d)</MetricLabel>
            <MetricValue
              style={{ fontSize: "16px", color: trendInterpretation.color }}
            >
              {symbol}
              {$numberWithCommas(technicalIndicators.sma7.toFixed(2))}
            </MetricValue>
            <MetricLabel>
              <i
                className={`fa ${trendInterpretation.icon}`}
                aria-hidden="true"
              ></i>
              {" " + trendInterpretation.status}
            </MetricLabel>
          </MetricCard>

          <MetricCard style={{ minHeight: "auto", padding: "16px" }}>
            <MetricLabel>Moving Average (30d)</MetricLabel>
            <MetricValue style={{ fontSize: "16px" }}>
              {symbol}
              {$numberWithCommas(technicalIndicators.sma30.toFixed(2))}
            </MetricValue>
            <MetricLabel>Long-term trend</MetricLabel>
          </MetricCard>

          <MetricCard style={{ minHeight: "auto", padding: "16px" }}>
            <MetricLabel>RSI (14-period)</MetricLabel>
            <MetricValue
              style={{ fontSize: "16px", color: rsiInterpretation.color }}
            >
              {technicalIndicators.rsi.toFixed(1)}
            </MetricValue>
            <MetricLabel>{rsiInterpretation.status}</MetricLabel>
          </MetricCard>

          <MetricCard style={{ minHeight: "auto", padding: "16px" }}>
            <MetricLabel>Volatility Index</MetricLabel>
            <MetricValue style={{ fontSize: "16px" }}>
              {Math.abs(metrics.totalProfitLossPercent).toFixed(1)}%
            </MetricValue>
            <MetricLabel>Portfolio volatility</MetricLabel>
          </MetricCard>

          <MetricCard style={{ minHeight: "auto", padding: "16px" }}>
            <MetricLabel>EMA (7d)</MetricLabel>
            <MetricValue style={{ fontSize: "16px" }}>
              {symbol}
              {$numberWithCommas(technicalIndicators.ema7.toFixed(2))}
            </MetricValue>
            <MetricLabel>Exponential MA</MetricLabel>
          </MetricCard>

          <MetricCard style={{ minHeight: "auto", padding: "16px" }}>
            <MetricLabel>Market Signal</MetricLabel>
            <MetricValue
              style={{ fontSize: "14px", color: rsiInterpretation.color }}
            >
              {rsiInterpretation.signal}
            </MetricValue>
            <MetricLabel>Based on RSI</MetricLabel>
          </MetricCard>
        </PerformanceGrid>

        {/* Technical Indicators Explanation */}
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "8px",
          }}
        >
          <h4
            style={{ margin: "0 0 12px 0", color: "#21ce99", fontSize: "14px" }}
          >
            Technical Analysis Summary
          </h4>
          <div
            style={{
              display: "grid",
              gap: "8px",
              fontSize: "13px",
              color: "#aaa",
            }}
          >
            <div>
              <strong>Moving Averages:</strong> {trendInterpretation.signal} -
              7d MA helps identify short-term trends
            </div>
            <div>
              <strong>RSI Signal:</strong> {rsiInterpretation.signal} - Values
              above 70 suggest overbought, below 30 suggest oversold
            </div>
            <div>
              <strong>Trend Direction:</strong>{" "}
              {technicalIndicators.sma7 > technicalIndicators.sma30
                ? "Short-term MA above long-term MA (bullish signal)"
                : technicalIndicators.sma7 < technicalIndicators.sma30
                ? "Short-term MA below long-term MA (bearish signal)"
                : "MAs are converging (neutral)"}
            </div>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default PortfolioAnalytics;
