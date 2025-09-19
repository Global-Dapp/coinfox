import React, { Component } from 'react';
import styled from 'styled-components';
import Highcharts from 'highcharts';
import { calculatePortfolioAnalytics } from '../Utils/alertHelpers';
import { $currencySymbol, $numberWithCommas } from '../Utils/Helpers';

const AnalyticsContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: #aaa;
  margin: 0;
  font-size: 16px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const MetricCard = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    border-color: rgba(33, 206, 153, 0.3);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const MetricTitle = styled.h3`
  color: #aaa;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.color || 'linear-gradient(135deg, #21ce99, #00d4aa)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
`;

const MetricValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${props => props.isPositive ? '#21ce99' : '#ff6b6b'};
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
`;

const ChartTitle = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
`;

const PerformanceSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const PerformanceCard = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
`;

const PerformanceTitle = styled.h4`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CoinPerformanceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const CoinName = styled.span`
  color: white;
  font-weight: 500;
`;

const PerformanceValue = styled.span`
  color: ${props => props.isPositive ? '#21ce99' : '#ff6b6b'};
  font-weight: 600;
`;

const RiskIndicator = styled.div`
  background: ${props => {
    if (props.level === 'low') return 'linear-gradient(135deg, #21ce99, #00d4aa)';
    if (props.level === 'medium') return 'linear-gradient(135deg, #ffd93d, #ffed4e)';
    return 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
  }};
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`;

const DiversificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DiversificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

const DiversificationBar = styled.div`
  width: 60px;
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
`;

const DiversificationFill = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  border-radius: 2px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const TimeButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #21ce99, #00d4aa)' : 'rgba(255,255,255,0.1)'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #21ce99, #00d4aa)' : 'rgba(255,255,255,0.2)'};
  }
`;

class PortfolioAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      analytics: null,
      selectedTimeRange: '7d',
      loading: true
    };
    this.diversificationChartRef = React.createRef();
    this.performanceChartRef = React.createRef();
  }

  componentDidMount() {
    this.calculateAnalytics();
    this.renderCharts();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.coinz !== this.props.coinz ||
      prevProps.marketData !== this.props.marketData ||
      prevProps.exchangeRate !== this.props.exchangeRate
    ) {
      this.calculateAnalytics();
      this.renderCharts();
    }
  }

  componentWillUnmount() {
    if (this.diversificationChart) {
      this.diversificationChart.destroy();
    }
    if (this.performanceChart) {
      this.performanceChart.destroy();
    }
  }

  calculateAnalytics = () => {
    const { coinz, marketData, exchangeRate } = this.props;
    
    if (!coinz || !marketData || Object.keys(coinz).length === 0) {
      this.setState({ analytics: null, loading: false });
      return;
    }

    const analytics = calculatePortfolioAnalytics(coinz, marketData, exchangeRate);
    this.setState({ analytics, loading: false });
  };

  renderCharts = () => {
    const { analytics } = this.state;
    if (!analytics || !analytics.diversification) return;

    // Render diversification pie chart
    this.renderDiversificationChart();
    
    // Render performance chart
    this.renderPerformanceChart();
  };

  renderDiversificationChart = () => {
    const { analytics } = this.state;
    if (!analytics || !this.diversificationChartRef.current) return;

    const data = analytics.diversification.map(item => ({
      name: item.coin,
      y: item.percentage,
      value: item.value
    }));

    const options = {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        height: 300
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      tooltip: {
        backgroundColor: '#2d2d2d',
        borderColor: '#555',
        style: {
          color: '#fff'
        },
        formatter: function() {
          return `<b>${this.point.name}</b><br/>
                  ${this.point.y.toFixed(1)}%<br/>
                  ${$currencySymbol(this.props?.currency || 'USD')}${$numberWithCommas(this.point.value?.toFixed(2) || '0')}`;
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: '#ccc',
              fontSize: '12px'
            }
          },
          colors: [
            '#21ce99', '#00d4aa', '#1a4d2e', '#0ea5e9', '#8b5cf6',
            '#f59e0b', '#ef4444', '#10b981', '#f97316', '#6366f1'
          ]
        }
      },
      series: [{
        name: 'Portfolio',
        colorByPoint: true,
        data: data
      }]
    };

    this.diversificationChart = new Highcharts.Chart(
      this.diversificationChartRef.current,
      options
    );
  };

  renderPerformanceChart = () => {
    const { analytics } = this.state;
    if (!analytics || !this.performanceChartRef.current) return;

    // Generate sample historical data for demonstration
    const data = this.generateSamplePerformanceData();

    const options = {
      chart: {
        type: 'area',
        backgroundColor: 'transparent',
        height: 300
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        labels: {
          style: {
            color: '#777'
          }
        },
        lineColor: '#777',
        tickColor: '#777'
      },
      yAxis: {
        title: {
          text: 'Value',
          style: {
            color: '#777'
          }
        },
        labels: {
          style: {
            color: '#777'
          }
        },
        gridLineColor: '#333'
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
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              [0, Highcharts.Color('#21ce99').setOpacity(0.3).get('rgba')],
              [1, Highcharts.Color('#21ce99').setOpacity(0).get('rgba')]
            ]
          },
          marker: {
            radius: 2
          },
          lineWidth: 2,
          color: '#21ce99',
          states: {
            hover: {
              lineWidth: 3
            }
          }
        }
      },
      series: [{
        name: 'Portfolio Value',
        data: data
      }]
    };

    this.performanceChart = new Highcharts.Chart(
      this.performanceChartRef.current,
      options
    );
  };

  generateSamplePerformanceData = () => {
    const { analytics } = this.state;
    if (!analytics) return [];

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const data = [];
    const currentValue = analytics.totalValue;
    
    // Generate 30 days of sample data
    for (let i = 29; i >= 0; i--) {
      const timestamp = now - (i * dayMs);
      // Add some random variation to simulate historical performance
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const value = currentValue * (1 + variation * (i / 30));
      data.push([timestamp, value]);
    }
    
    return data;
  };

  getRiskLevel = (riskScore) => {
    if (riskScore <= 30) return { level: 'low', text: 'Low Risk' };
    if (riskScore <= 60) return { level: 'medium', text: 'Medium Risk' };
    return { level: 'high', text: 'High Risk' };
  };

  formatPercentage = (value) => {
    const isPositive = value >= 0;
    return (
      <PerformanceValue isPositive={isPositive}>
        {isPositive ? '+' : ''}{value.toFixed(2)}%
      </PerformanceValue>
    );
  };

  render() {
    const { currency = 'USD' } = this.props;
    const { analytics, loading, selectedTimeRange } = this.state;
    const curSymbol = $currencySymbol(currency);

    if (loading) {
      return (
        <AnalyticsContainer>
          <div style={{ textAlign: 'center', color: '#aaa', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3>Loading Analytics...</h3>
          </div>
        </AnalyticsContainer>
      );
    }

    if (!analytics || analytics.coinCount === 0) {
      return (
        <AnalyticsContainer>
          <Header>
            <Title>Portfolio Analytics</Title>
            <Subtitle>Advanced insights and performance metrics</Subtitle>
          </Header>
          
          <EmptyState>
            <EmptyIcon>📈</EmptyIcon>
            <h3>No Portfolio Data</h3>
            <p>Add some coins to your portfolio to see detailed analytics and insights.</p>
          </EmptyState>
        </AnalyticsContainer>
      );
    }

    const riskInfo = this.getRiskLevel(analytics.riskScore);

    return (
      <AnalyticsContainer>
        <Header>
          <Title>Portfolio Analytics</Title>
          <Subtitle>Advanced insights and performance metrics</Subtitle>
        </Header>

        <MetricsGrid>
          <MetricCard>
            <MetricHeader>
              <MetricTitle>Total Portfolio Value</MetricTitle>
              <MetricIcon>💰</MetricIcon>
            </MetricHeader>
            <MetricValue>{curSymbol}{$numberWithCommas(analytics.totalValue.toFixed(2))}</MetricValue>
            <MetricChange isPositive={analytics.returnPercentage >= 0}>
              {analytics.returnPercentage >= 0 ? '↗' : '↘'} {this.formatPercentage(analytics.returnPercentage)} overall
            </MetricChange>
          </MetricCard>

          <MetricCard>
            <MetricHeader>
              <MetricTitle>Daily Change</MetricTitle>
              <MetricIcon color={analytics.dailyChange >= 0 ? 'linear-gradient(135deg, #21ce99, #00d4aa)' : 'linear-gradient(135deg, #ff6b6b, #ff8e8e)'}>
                📊
              </MetricIcon>
            </MetricHeader>
            <MetricValue style={{ color: analytics.dailyChange >= 0 ? '#21ce99' : '#ff6b6b' }}>
              {analytics.dailyChange >= 0 ? '+' : ''}{analytics.dailyChange.toFixed(2)}%
            </MetricValue>
            <MetricChange isPositive={analytics.dailyChange >= 0}>
              {analytics.dailyChange >= 0 ? '↗' : '↘'} Since yesterday
            </MetricChange>
          </MetricCard>

          <MetricCard>
            <MetricHeader>
              <MetricTitle>Risk Level</MetricTitle>
              <MetricIcon color={
                riskInfo.level === 'low' ? 'linear-gradient(135deg, #21ce99, #00d4aa)' :
                riskInfo.level === 'medium' ? 'linear-gradient(135deg, #ffd93d, #ffed4e)' :
                'linear-gradient(135deg, #ff6b6b, #ff8e8e)'
              }>⚠️</MetricIcon>
            </MetricHeader>
            <MetricValue style={{ fontSize: '24px' }}>
              <RiskIndicator level={riskInfo.level}>
                {riskInfo.text}
              </RiskIndicator>
            </MetricValue>
            <MetricChange isPositive={riskInfo.level === 'low'}>
              Score: {analytics.riskScore}/100
            </MetricChange>
          </MetricCard>

          <MetricCard>
            <MetricHeader>
              <MetricTitle>Diversification</MetricTitle>
              <MetricIcon color="linear-gradient(135deg, #6c5ce7, #a29bfe)">🎯</MetricIcon>
            </MetricHeader>
            <MetricValue>{analytics.coinCount}</MetricValue>
            <MetricChange isPositive={analytics.coinCount >= 5}>
              {analytics.coinCount >= 5 ? '↗' : '↘'} {analytics.coinCount >= 5 ? 'Well diversified' : 'Consider diversifying'}
            </MetricChange>
          </MetricCard>
        </MetricsGrid>

        <ChartsSection>
          <ChartCard>
            <ChartTitle>Portfolio Performance</ChartTitle>
            <TimeRangeSelector>
              {['7d', '30d', '90d', '1y'].map(range => (
                <TimeButton
                  key={range}
                  active={selectedTimeRange === range}
                  onClick={() => this.setState({ selectedTimeRange: range })}
                >
                  {range}
                </TimeButton>
              ))}
            </TimeRangeSelector>
            <div ref={this.performanceChartRef} style={{ height: '300px' }}></div>
          </ChartCard>
          
          <ChartCard>
            <ChartTitle>Asset Allocation</ChartTitle>
            <div ref={this.diversificationChartRef} style={{ height: '300px' }}></div>
          </ChartCard>
        </ChartsSection>

        <PerformanceSection>
          <PerformanceCard>
            <PerformanceTitle>
              🏆 Best Performers
            </PerformanceTitle>
            {analytics.bestPerformer ? (
              <DiversificationList>
                <CoinPerformanceItem>
                  <CoinName>{analytics.bestPerformer.coin}</CoinName>
                  {this.formatPercentage(analytics.bestPerformer.returnPercentage)}
                </CoinPerformanceItem>
                {analytics.diversification.slice(0, 3).map(coin => (
                  <CoinPerformanceItem key={coin.coin}>
                    <CoinName>{coin.coin}</CoinName>
                    <span style={{ color: '#aaa', fontSize: '14px' }}>
                      {coin.percentage.toFixed(1)}% allocation
                    </span>
                  </CoinPerformanceItem>
                ))}
              </DiversificationList>
            ) : (
              <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                No performance data available
              </div>
            )}
          </PerformanceCard>

          <PerformanceCard>
            <PerformanceTitle>
              📊 Portfolio Breakdown
            </PerformanceTitle>
            <DiversificationList>
              {analytics.diversification.slice(0, 5).map(item => (
                <DiversificationItem key={item.coin}>
                  <div>
                    <CoinName>{item.coin}</CoinName>
                    <div style={{ fontSize: '12px', color: '#aaa' }}>
                      {curSymbol}{$numberWithCommas(item.value.toFixed(2))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#aaa', minWidth: '40px' }}>
                      {item.percentage.toFixed(1)}%
                    </span>
                    <DiversificationBar>
                      <DiversificationFill percentage={item.percentage} />
                    </DiversificationBar>
                  </div>
                </DiversificationItem>
              ))}
            </DiversificationList>
          </PerformanceCard>
        </PerformanceSection>
      </AnalyticsContainer>
    );
  }
}

export default PortfolioAnalytics;
