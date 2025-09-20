import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import Highcharts from "highcharts";
import { generateRSIHistoricalData } from "../Utils/technicalIndicators";

const Container = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 20px 0;
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

const ChartContainer = styled.div`
  height: 300px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  position: relative;
`;

const PlaceholderText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #aaa;
  font-style: italic;
  text-align: center;
`;

const Legend = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 12px;
  color: #aaa;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 2px;
  background: ${(props) => props.color};
`;

const ChartRSI = ({
  coinz = {},
  marketData = {},
  currency = "USD",
  exchangeRate = 1,
}) => {
  const [activeTimeframe, setActiveTimeframe] = useState("30d");
  const chartRef = useRef(null);

  const generateRSIData = useCallback(
    (timeframe) => {
      const days = {
        "14d": 14,
        "30d": 30,
        "60d": 60,
        "90d": 90,
      };

      return generateRSIHistoricalData(
        coinz,
        marketData,
        exchangeRate,
        days[timeframe] || 30
      );
    },
    [coinz, marketData, exchangeRate]
  );

  const chartOptions = useCallback(
    (data) => ({
      chart: {
        type: "line",
        backgroundColor: "transparent",
        height: 300,
        spacing: [10, 10, 15, 10],
      },
      title: {
        text: null,
      },
      xAxis: {
        type: "datetime",
        lineColor: "#444",
        tickColor: "#444",
        gridLineColor: "#333",
        labels: {
          style: { color: "#aaa" },
        },
      },
      yAxis: {
        title: { text: null },
        gridLineColor: "#333",
        min: 0,
        max: 100,
        labels: {
          style: { color: "#aaa" },
        },
        plotBands: [
          {
            from: 70,
            to: 100,
            color: "rgba(255, 71, 87, 0.1)",
            label: {
              text: "Overbought",
              style: { color: "#ff4757", fontSize: "10px" },
            },
          },
          {
            from: 0,
            to: 30,
            color: "rgba(33, 206, 153, 0.1)",
            label: {
              text: "Oversold",
              style: { color: "#21ce99", fontSize: "10px" },
            },
          },
        ],
        plotLines: [
          {
            value: 70,
            color: "#ff4757",
            width: 1,
            dashStyle: "Dash",
          },
          {
            value: 50,
            color: "#ffd93d",
            width: 1,
            dashStyle: "Dot",
          },
          {
            value: 30,
            color: "#21ce99",
            width: 1,
            dashStyle: "Dash",
          },
        ],
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        line: {
          marker: {
            enabled: false,
            states: {
              hover: { enabled: true, radius: 4 },
            },
          },
          lineWidth: 2,
          threshold: null,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "#21ce99",
        style: { color: "#fff" },
        formatter: function () {
          const date = new Date(this.x);
          const rsiValue = this.y.toFixed(1);
          let status = "Neutral";
          let color = "#ffd93d";

          if (rsiValue >= 70) {
            status = "Overbought";
            color = "#ff4757";
          } else if (rsiValue <= 30) {
            status = "Oversold";
            color = "#21ce99";
          }

          return `<b style="color: ${color}">RSI: ${rsiValue}</b><br/>
                  Status: ${status}<br/>
                  ${date.toLocaleDateString()}`;
        },
      },
      series: [
        {
          name: "RSI",
          data: data,
          color: "#21ce99",
          zones: [
            {
              value: 30,
              color: "#21ce99", // Oversold - green
            },
            {
              value: 70,
              color: "#ffd93d", // Neutral - yellow
            },
            {
              color: "#ff4757", // Overbought - red
            },
          ],
        },
      ],
      credits: { enabled: false },
    }),
    []
  );

  useEffect(() => {
    if (Object.keys(coinz).length > 0 && marketData) {
      const data = generateRSIData(activeTimeframe);

      // Destroy existing chart if it exists
      if (chartRef.current) {
        try {
          if (
            chartRef.current.destroy &&
            typeof chartRef.current.destroy === "function"
          ) {
            chartRef.current.destroy();
          }
        } catch (error) {
          console.warn("RSI Chart destroy error:", error);
        }
        chartRef.current = null;
      }

      // Check if container exists and data is available
      const container = document.getElementById("rsi-chart");
      if (container && data.length > 0) {
        try {
          const options = chartOptions(data);
          if (options && typeof options === "object") {
            const newChart = Highcharts.chart("rsi-chart", options);
            if (newChart && newChart.destroy) {
              chartRef.current = newChart;
            }
          }
        } catch (error) {
          console.warn("RSI Chart creation error:", error);
        }
      }
    }
  }, [
    activeTimeframe,
    coinz,
    marketData,
    currency,
    exchangeRate,
    generateRSIData,
    chartOptions,
  ]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.destroy();
        } catch (error) {
          console.warn("RSI Component unmount chart cleanup error:", error);
        }
        chartRef.current = null;
      }
    };
  }, []);

  const timeframes = [
    { key: "14d", label: "14D" },
    { key: "30d", label: "30D" },
    { key: "60d", label: "60D" },
    { key: "90d", label: "90D" },
  ];

  const hasData = Object.keys(coinz).length > 0;
  const rsiData = hasData ? generateRSIData(activeTimeframe) : [];

  return (
    <Container>
      <Title>
        <i className="fa fa-line-chart" aria-hidden="true"></i>
        RSI (Relative Strength Index)
      </Title>

      <Legend>
        <LegendItem>
          <LegendColor color="#21ce99" />
          <span>Oversold (&lt; 30)</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#ffd93d" />
          <span>Neutral (30-70)</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#ff4757" />
          <span>Overbought (&gt; 70)</span>
        </LegendItem>
      </Legend>

      <TimeframeTabs>
        {timeframes.map(({ key, label }) => (
          <Tab
            key={key}
            active={activeTimeframe === key}
            onClick={() => setActiveTimeframe(key)}
          >
            {label}
          </Tab>
        ))}
      </TimeframeTabs>

      <ChartContainer>
        {hasData && rsiData.length > 0 ? (
          <div id="rsi-chart" style={{ height: "100%", width: "100%" }} />
        ) : (
          <PlaceholderText>
            {hasData
              ? "Insufficient data for RSI calculation (need 15+ days)"
              : "Add coins to your portfolio to see RSI analysis"}
          </PlaceholderText>
        )}
      </ChartContainer>
    </Container>
  );
};

export default ChartRSI;
