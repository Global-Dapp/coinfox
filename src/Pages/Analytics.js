import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import PortfolioAnalytics from "../Components/PortfolioAnalytics";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
`;

const Header = styled.div`
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  color: #fff;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled(Link)`
  color: #21ce99;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #21ce99;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #21ce99;
    color: #fff;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
`;

const Analytics = (props) => {
  const { coinz, marketData, currency, exchangeRate } = props;
  const home = props.blockstack ? "/blockstack" : "/";

  return (
    <Container>
      <Header>
        <Title>
          <i className="fa fa-chart-bar" aria-hidden="true"></i>
          Portfolio Analytics
        </Title>
        <BackButton to={home}>
          <i className="fa fa-arrow-left" aria-hidden="true"></i>
          Back to Portfolio
        </BackButton>
      </Header>

      <Content>
        <PortfolioAnalytics
          coinz={coinz}
          marketData={marketData}
          currency={currency}
          exchangeRate={exchangeRate}
        />
      </Content>
    </Container>
  );
};

export default Analytics;
