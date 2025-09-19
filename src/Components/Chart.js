import React, { Component } from 'react';
import Highcharts from 'highcharts'
// import './Chart.css';

class Chart extends Component {

  constructor (props) {
    super(props);
    this.state = {
      ticker: null,
      chart: {
        Response: "no",
        Data: []
      },
      time_series: []
    }
  }

  _chartOptions(data, movingAvg20, movingAvg50, rsiData){

    const chartColor = this.props.chartColor;

    return (
      {
        credits: false,
        chart: {
          height: '300px',
          zoomType: 'x',
          backgroundColor: '#303032'
        },
        title: {
          text: ''
        },
        subtitle: {
          text: ""
        },
        xAxis: {
          lineColor: "#777",
          tickColor: '#777',
          gridLineColor: '#777',
          type: 'datetime',
          labels:{
            style: {
              color: '#777'
            }
          }
        },
        yAxis: [{
          min: 0,
          gridLineColor: '#777',
          title: {
            text: 'Price',
            style: {
              color: '#777'
            }
          },
          labels:{
            style: {
              color: '#777'
            }
          }
        }, {
          title: {
            text: 'RSI',
            style: {
              color: '#ffd93d'
            }
          },
          labels: {
            style: {
              color: '#ffd93d'
            }
          },
          min: 0,
          max: 100,
          opposite: true,
          gridLineWidth: 0
        }],
        legend: {
          enabled: true,
          itemStyle: {
            color: '#ccc'
          }
        },
        tooltip: {
          backgroundColor: '#2d2d2d',
          borderColor: '#555',
          style: {
            color: '#fff'
          }
        },
        plotOptions: {
          area: {
            color: chartColor,
            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stops: [
                [0, chartColor],
                [1, Highcharts.Color(chartColor).setOpacity(0).get('rgba')]
              ]
            },
            marker: {
              radius: 2
            },
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 3
              }
            },
            threshold: null
          },
          line: {
            marker: {
              enabled: false
            },
            lineWidth: 1
          }
        },
        series: [{
          type: 'area',
          name: this.props.ticker.toUpperCase() + ' Price',
          data: data,
          yAxis: 0
        }, {
          type: 'line',
          name: 'MA20',
          data: movingAvg20,
          color: '#ff9500',
          yAxis: 0
        }, {
          type: 'line',
          name: 'MA50',
          data: movingAvg50,
          color: '#0ea5e9',
          yAxis: 0
        }, {
          type: 'line',
          name: 'RSI',
          data: rsiData,
          color: '#ffd93d',
          yAxis: 1
        }]
      }
    )
  }

  //Destroy chart before unmount.
  componentWillUnmount () {
    this.chart && this.chart.destroy();
  }

  calculateMovingAverage(data, period) {
    return data.map((point, index) => {
      if (index < period - 1) return [point[0], null];
      
      const sum = data.slice(index - period + 1, index + 1)
        .reduce((acc, curr) => acc + curr[1], 0);
      const average = sum / period;
      
      return [point[0], average];
    }).filter(point => point[1] !== null);
  }

  calculateRSI(data, period = 14) {
    if (data.length < period + 1) return [];
    
    const changes = [];
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i][1] - data[i - 1][1]);
    }
    
    const rsiData = [];
    for (let i = period; i < changes.length; i++) {
      const recentChanges = changes.slice(i - period, i);
      const gains = recentChanges.filter(change => change > 0);
      const losses = recentChanges.filter(change => change < 0).map(loss => Math.abs(loss));
      
      const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
      const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
      
      if (avgLoss === 0) {
        rsiData.push([data[i + 1][0], 100]);
      } else {
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        rsiData.push([data[i + 1][0], rsi]);
      }
    }
    
    return rsiData;
  }

  _fetchChartData (coin, exchangeRate) {
    const ticker = coin.toUpperCase();
    // all incoming data set to USD
    const currency = "USD"; //currency.toUpperCase();
    const endpoint = 'https://min-api.cryptocompare.com/data/histoday?aggregate=1&e=CCCAGG&extraParams=CryptoCompare&fsym='+ ticker +'&limit=365&tryConversion=false&tsym=' + currency;

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((res)=>{

        if (res.Response === "Success") {
          const highcharts_data = res.Data.map(function (day) {
            // highcharts wants timestamp in miliseconds
            // https://jsfiddle.net/zyqav14L/
            var fixDate = day.time * 1000;
            // adjust closing price with exchange rate
            var closingPrice = day.close * exchangeRate;
            return [fixDate, closingPrice];
          })
          
          // Calculate technical indicators
          const movingAvg20 = this.calculateMovingAverage(highcharts_data, 20);
          const movingAvg50 = this.calculateMovingAverage(highcharts_data, 50);
          const rsiData = this.calculateRSI(highcharts_data);
          
          const nextState = {
            ticker: ticker,
            chart: res,
            time_series: highcharts_data
          }
          // set chart options to render
          this.chart = new Highcharts["Chart"](
            "chart_container",
            this._chartOptions(highcharts_data, movingAvg20, movingAvg50, rsiData)
          );
          this.setState(nextState);
        } else {
          // chart failed to load
          // set array empty then chart.destroy()
          this.setState({time_series: []});
          this.chart && this.chart.destroy();
        }
      })
      .catch((e) => {
        console.warn('Failed to load chart data', e);
        this.setState({time_series: []});
        this.chart && this.chart.destroy();
      })
  }

  componentDidMount() {
    this._fetchChartData(this.props.ticker, this.props.exchangeRate);
  }

  render () {
    return (
      <div>
        <div id="chart_container"></div>
      </div>
    )
  }
}

export default Chart;
