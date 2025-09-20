import React, { Component } from "react";
import Highcharts from "highcharts";
import { $currencySymbol } from "../Utils/Helpers";
// import './Chart.css';

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ticker: null,
      chart: {
        Response: "no",
        Data: [],
      },
      time_series: [],
      selectedRange: "1D", // Default to 1 day
    };
  }

  _chartOptions(data) {
    const chartColor = this.props.chartColor;
    const currencySymbol = $currencySymbol(this.props.currency || "USD").trim();

    return {
      credits: false,
      chart: {
        height: "200px",
        zoomType: "x",
        backgroundColor: "#303032",
      },
      title: {
        text: "",
      },
      subtitle: {
        text: "",
      },
      xAxis: {
        lineColor: "#777",
        tickColor: "#777",
        gridLineColor: "#777",
        type: "datetime",
        labels: {
          style: {
            color: "#777",
          },
        },
      },
      yAxis: {
        min: 0,
        gridLineColor: "#777",
        title: {
          text: "",
        },
        labels: {
          style: {
            color: "#777",
          },
          formatter: function () {
            return currencySymbol + this.value.toFixed(2);
          },
        },
      },
      tooltip: {
        backgroundColor: "#1f1f1f",
        borderColor: "#777",
        style: {
          color: "#fff",
        },
        formatter: function () {
          return `<b>${this.series.name}</b><br/>
                  ${Highcharts.dateFormat("%A, %b %e, %Y", this.x)}<br/>
                  ${currencySymbol}${this.y.toFixed(2)}`;
        },
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        area: {
          color: chartColor,
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, chartColor],
              [1, Highcharts.Color(chartColor).setOpacity(0).get("rgba")],
            ],
          },
          marker: {
            radius: 2,
          },
          lineWidth: 2,
          states: {
            hover: {
              lineWidth: 3,
            },
          },
          threshold: null,
        },
      },
      series: [
        {
          type: "area",
          name: `${this.props.ticker}/${currencySymbol}`,
          data: data,
        },
      ],
    };
  }

  //Destroy chart before unmount.
  componentWillUnmount() {
    if (this.chart) {
      try {
        // Check if chart has destroy method and is not already destroyed
        if (this.chart.destroy && typeof this.chart.destroy === "function") {
          this.chart.destroy();
        }
      } catch (error) {
        console.warn("Chart destroy error:", error);
      }
    }
  }

  _fetchChartData(coin, exchangeRate, timeRange = "1D") {
    const ticker = coin.toUpperCase();
    // all incoming data set to USD
    const currency = "USD"; //currency.toUpperCase();

    let endpoint;

    // Configure endpoint and limit based on time range
    switch (timeRange) {
      case "1H":
        endpoint = `https://min-api.cryptocompare.com/data/histominute?aggregate=1&e=CCCAGG&extraParams=CryptoCompare&fsym=${ticker}&limit=60&tryConversion=false&tsym=${currency}`;
        break;
      case "1D":
        endpoint = `https://min-api.cryptocompare.com/data/histohour?aggregate=1&e=CCCAGG&extraParams=CryptoCompare&fsym=${ticker}&limit=24&tryConversion=false&tsym=${currency}`;
        break;
      case "7D":
        endpoint = `https://min-api.cryptocompare.com/data/histohour?aggregate=6&e=CCCAGG&extraParams=CryptoCompare&fsym=${ticker}&limit=28&tryConversion=false&tsym=${currency}`;
        break;
      case "30D":
        endpoint = `https://min-api.cryptocompare.com/data/histoday?aggregate=1&e=CCCAGG&extraParams=CryptoCompare&fsym=${ticker}&limit=30&tryConversion=false&tsym=${currency}`;
        break;
      case "1Y":
        endpoint = `https://min-api.cryptocompare.com/data/histoday?aggregate=1&e=CCCAGG&extraParams=CryptoCompare&fsym=${ticker}&limit=365&tryConversion=false&tsym=${currency}`;
        break;
      default:
        endpoint = `https://min-api.cryptocompare.com/data/histohour?aggregate=1&e=CCCAGG&extraParams=CryptoCompare&fsym=${ticker}&limit=24&tryConversion=false&tsym=${currency}`;
    }

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((res) => {
        if (res.Response === "Success") {
          const highcharts_data = res.Data.map(function (day) {
            // highcharts wants timestamp in miliseconds
            // https://jsfiddle.net/zyqav14L/
            var fixDate = day.time * 1000;
            // adjust closing price with exchange rate
            var closingPrice = day.close * exchangeRate;
            return [fixDate, closingPrice];
          });
          const nextState = {
            ticker: ticker,
            chart: res,
            time_series: highcharts_data,
          };
          // set chart options to render
          this.chart = new Highcharts["Chart"](
            "chart_container",
            this._chartOptions(highcharts_data)
          );
          this.setState(nextState);
        } else {
          // chart failed to load
          // set array empty then chart.destroy()
          this.setState({ time_series: [] });
          this.chart && this.chart.destroy();
        }
      })
      .catch((e) => {
        console.warn("Failed to load chart data", e);
        this.setState({ time_series: [] });
        this.chart && this.chart.destroy();
      });
  }

  componentDidMount() {
    this._fetchChartData(
      this.props.ticker,
      this.props.exchangeRate,
      this.state.selectedRange
    );
  }

  handleRangeChange = (range) => {
    this.setState({ selectedRange: range });
    this._fetchChartData(this.props.ticker, this.props.exchangeRate, range);
  };

  render() {
    const timeRanges = [
      { label: "1H", value: "1H" },
      { label: "24H", value: "1D" },
      { label: "7D", value: "7D" },
      { label: "30D", value: "30D" },
      { label: "1Y", value: "1Y" },
    ];

    return (
      <div>
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "12px",
            justifyContent: "center",
            padding: "8px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "8px",
          }}
        >
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => this.handleRangeChange(range.value)}
              style={{
                background:
                  this.state.selectedRange === range.value
                    ? "linear-gradient(135deg, #21ce99, #00d4aa)"
                    : "transparent",
                color:
                  this.state.selectedRange === range.value ? "#fff" : "#aaa",
                border:
                  this.state.selectedRange === range.value
                    ? "none"
                    : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all 0.2s ease",
                minWidth: "40px",
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
        <div id="chart_container"></div>
      </div>
    );
  }
}

export default Chart;
