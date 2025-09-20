import React from 'react';
import styled from 'styled-components';
import { $currencySymbol, $numberWithCommas } from '../Utils/Helpers';

const Card = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(255,255,255,0.1);
  &:last-child { border-bottom: none; }
`;

const PortfolioAnalytics = ({ coinz = {}, marketData = {}, currency = 'USD', exchangeRate = 1 }) => {
  const symbol = $currencySymbol(currency);
  const rows = Object.keys(coinz).map(c => {
    const holding = Number(coinz[c].hodl || 0);
    const price = (marketData[c] && marketData[c].ticker && Number(marketData[c].ticker.price) * exchangeRate) || 0;
    const value = holding * price;
    return { coin: c.toUpperCase(), holding, price, value };
  }).sort((a, b) => b.value - a.value);

  return (
    <Card>
      <Title>Portfolio Analytics</Title>
      {rows.map(r => (
        <Row key={r.coin}>
          <span>{r.coin}</span>
          <span>{r.holding}</span>
          <span>{symbol}{$numberWithCommas(r.price.toFixed(2))}</span>
          <span>{symbol}{$numberWithCommas(r.value.toFixed(2))}</span>
        </Row>
      ))}
      {rows.length === 0 && <div style={{ color: '#aaa' }}>No data</div>}
    </Card>
  );
};

export default PortfolioAnalytics;
