import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PortfolioAnalytics from '../Components/PortfolioAnalytics';
import PriceAlert from '../Components/PriceAlert';
import { translationStrings } from '../Utils/i18n';

const AnalyticsPageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
`;

const NavigationBar = styled.div`
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled(Link)`
  background: rgba(255,255,255,0.1);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  padding: 8px 16px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255,255,255,0.2);
    text-decoration: none;
    color: white;
  }
`;

const PageTitle = styled.h1`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavButton = styled.button`
  background: ${props => props.primary ? 'linear-gradient(135deg, #21ce99, #00d4aa)' : 'rgba(255,255,255,0.1)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.primary ? 'rgba(33, 206, 153, 0.3)' : 'rgba(255,255,255,0.1)'};
  }
`;

const TabNavigation = styled.div`
  display: flex;
  gap: 4px;
  padding: 0 24px 0 24px;
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const Tab = styled.button`
  background: ${props => props.active ? 'rgba(33, 206, 153, 0.1)' : 'transparent'};
  color: ${props => props.active ? '#21ce99' : '#aaa'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#21ce99' : 'transparent'};
  padding: 16px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.active ? '#21ce99' : 'white'};
    background: rgba(255,255,255,0.05);
  }
`;

const ContentContainer = styled.div`
  padding: 0;
`;

const AlertsSection = styled.div`
  padding: 24px;
`;

const AlertsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
`;

const EmptyAlertsState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const CreateAlertButton = styled.button`
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 206, 153, 0.3);
  }
`;

const ExportSection = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ExportCard = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
`;

const ExportTitle = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const ExportDescription = styled.p`
  color: #aaa;
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const ExportButton = styled.button`
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 206, 153, 0.3);
  }
`;

const string = translationStrings();

class Analytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'overview',
      selectedCoin: null
    };
  }

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab });
  };

  handleExportPortfolio = () => {
    const { coinz, marketData, exchangeRate, currency } = this.props;
    
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        currency: currency || 'USD',
        exchangeRate,
        portfolio: Object.keys(coinz || {}).map(coin => {
          const coinData = marketData && marketData[coin];
          const price = coinData && coinData.ticker ? coinData.ticker.price * exchangeRate : 0;
          const hodl = coinz[coin].hodl;
          const costBasis = coinz[coin].cost_basis;
          const currentValue = price * hodl;
          const totalCost = costBasis * hodl;
          const performance = totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0;
          
          return {
            coin: coin.toUpperCase(),
            quantity: hodl,
            costBasis,
            currentPrice: price,
            currentValue,
            totalCost,
            performance: performance.toFixed(2) + '%'
          };
        })
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coinfox-portfolio-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export portfolio:', error);
      alert('Failed to export portfolio data');
    }
  };

  handleExportCSV = () => {
    const { coinz, marketData, exchangeRate, currency } = this.props;
    
    try {
      const headers = ['Coin', 'Quantity', 'Cost Basis', 'Current Price', 'Current Value', 'Performance'];
      const rows = Object.keys(coinz || {}).map(coin => {
        const coinData = marketData && marketData[coin];
        const price = coinData && coinData.ticker ? coinData.ticker.price * exchangeRate : 0;
        const hodl = coinz[coin].hodl;
        const costBasis = coinz[coin].cost_basis;
        const currentValue = price * hodl;
        const totalCost = costBasis * hodl;
        const performance = totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0;
        
        return [
          coin.toUpperCase(),
          hodl,
          costBasis.toFixed(2),
          price.toFixed(2),
          currentValue.toFixed(2),
          performance.toFixed(2) + '%'
        ];
      });

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coinfox-portfolio-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV data');
    }
  };

  renderOverviewTab = () => {
    return (
      <PortfolioAnalytics
        coinz={this.props.coinz}
        marketData={this.props.marketData}
        exchangeRate={this.props.exchangeRate}
        currency={this.props.currency}
      />
    );
  };

  renderAlertsTab = () => {
    const { coinz } = this.props;
    const coins = coinz ? Object.keys(coinz) : [];

    if (coins.length === 0) {
      return (
        <AlertsSection>
          <EmptyAlertsState>
            <EmptyIcon>🚨</EmptyIcon>
            <h3>No Coins in Portfolio</h3>
            <p>Add some coins to your portfolio to set up price alerts.</p>
            <CreateAlertButton as={Link} to="/">
              Add Coins to Portfolio
            </CreateAlertButton>
          </EmptyAlertsState>
        </AlertsSection>
      );
    }

    return (
      <AlertsSection>
        <AlertsGrid>
          {coins.map(coin => (
            <PriceAlert
              key={coin}
              coin={coin}
              marketData={this.props.marketData}
              exchangeRate={this.props.exchangeRate}
              currency={this.props.currency}
            />
          ))}
        </AlertsGrid>
      </AlertsSection>
    );
  };

  renderExportsTab = () => {
    return (
      <ExportSection>
        <ExportCard>
          <ExportTitle>📊 Portfolio Report (JSON)</ExportTitle>
          <ExportDescription>
            Download a comprehensive JSON report of your portfolio including current values, 
            performance metrics, and detailed coin information. Perfect for backup or analysis.
          </ExportDescription>
          <ExportButton onClick={this.handleExportPortfolio}>
            Download JSON Report
          </ExportButton>
        </ExportCard>

        <ExportCard>
          <ExportTitle>📈 Portfolio Data (CSV)</ExportTitle>
          <ExportDescription>
            Export your portfolio data in CSV format for use in spreadsheet applications. 
            Includes coin quantities, costs, current values, and performance percentages.
          </ExportDescription>
          <ExportButton onClick={this.handleExportCSV}>
            Download CSV Data
          </ExportButton>
        </ExportCard>

        <ExportCard>
          <ExportTitle>🔗 Share Portfolio</ExportTitle>
          <ExportDescription>
            Generate a shareable link to your portfolio performance (without sensitive data). 
            Perfect for sharing with friends or on social media.
          </ExportDescription>
          <ExportButton onClick={() => alert('Feature coming soon!')}>
            Generate Share Link
          </ExportButton>
        </ExportCard>
      </ExportSection>
    );
  };

  render() {
    const { activeTab } = this.state;
    const { language } = this.props;

    return (
      <AnalyticsPageContainer>
        <NavigationBar>
          <NavLeft>
            <BackButton to="/">
              <span>←</span>
              Back to Portfolio
            </BackButton>
            <PageTitle>Advanced Analytics</PageTitle>
          </NavLeft>
          
          <NavRight>
            <NavButton onClick={() => window.location.reload()}>
              Refresh Data
            </NavButton>
            <NavButton primary as={Link} to="/menu">
              Settings
            </NavButton>
          </NavRight>
        </NavigationBar>

        <TabNavigation>
          <Tab 
            active={activeTab === 'overview'} 
            onClick={() => this.handleTabChange('overview')}
          >
            📊 Overview
          </Tab>
          <Tab 
            active={activeTab === 'alerts'} 
            onClick={() => this.handleTabChange('alerts')}
          >
            🚨 Price Alerts
          </Tab>
          <Tab 
            active={activeTab === 'exports'} 
            onClick={() => this.handleTabChange('exports')}
          >
            📤 Export & Share
          </Tab>
        </TabNavigation>

        <ContentContainer>
          {activeTab === 'overview' && this.renderOverviewTab()}
          {activeTab === 'alerts' && this.renderAlertsTab()}
          {activeTab === 'exports' && this.renderExportsTab()}
        </ContentContainer>
      </AnalyticsPageContainer>
    );
  }
}

export default Analytics;
