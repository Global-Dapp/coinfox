import React from 'react';
import styled from 'styled-components';
import PortfolioAnalytics from '../Components/PortfolioAnalytics';

const Container = styled.div`
  padding: 24px;
`;

const Analytics = (props) => {
  const { coinz, marketData, currency, exchangeRate } = props;
  return (
    <Container>
      <PortfolioAnalytics
        coinz={coinz}
        marketData={marketData}
        currency={currency}
        exchangeRate={exchangeRate}
      />
    </Container>
  );
};

export default Analytics;
