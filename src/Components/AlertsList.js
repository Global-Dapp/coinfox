import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ALERT_STATUS, getAllAlerts } from "../Utils/alertHelpers";
import { $numberWithCommas, $currencySymbol } from "../Utils/Helpers";

const Container = styled.div`
  margin: 20px 20px;
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  color: #fff;
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AlertsGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const CoinSection = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px;
`;

const CoinHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 6px;
  }
`;

const CoinHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CollapseIcon = styled.i`
  color: #aaa;
  font-size: 14px;
  transition: transform 0.2s ease;
  transform: ${(props) =>
    props.collapsed ? "rotate(-90deg)" : "rotate(0deg)"};

  &:hover {
    color: #21ce99;
  }
`;

const CoinName = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #21ce99;
  text-transform: uppercase;
`;

const AlertsCount = styled.span`
  background: rgba(33, 206, 153, 0.2);
  color: #21ce99;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const AlertItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertDetails = styled.span`
  color: #fff;
`;

const AlertStatus = styled.span`
  color: ${(props) =>
    props.status === ALERT_STATUS.ACTIVE
      ? "#21ce99"
      : props.status === ALERT_STATUS.TRIGGERED
      ? "#ffd93d"
      : "#aaa"};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const NoAlerts = styled.div`
  text-align: center;
  color: #aaa;
  padding: 20px;
  font-style: italic;
`;

const AlertsContainer = styled.div`
  overflow: hidden;
  transition: max-height 0.3s ease;
  max-height: ${(props) => (props.collapsed ? "0" : "1000px")};
`;

const AlertsList = ({ currency }) => {
  const [alertsByCoins, setAlertsByCoins] = useState({});
  const [loading, setLoading] = useState(true);
  const [collapsedCoins, setCollapsedCoins] = useState({});

  const symbol = $currencySymbol(currency || "USD").trim();

  const toggleCoinCollapse = (coin) => {
    setCollapsedCoins((prev) => ({
      ...prev,
      [coin]: !prev[coin],
    }));
  };

  const loadAlerts = async () => {
    try {
      const alerts = await getAllAlerts();

      // Group alerts by coin
      const grouped = alerts.reduce((acc, alert) => {
        const coin = alert.coin.toUpperCase();
        if (!acc[coin]) {
          acc[coin] = [];
        }
        acc[coin].push(alert);
        return acc;
      }, {});

      setAlertsByCoins(grouped);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load alerts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Container>
        <Title>
          <i className="fa fa-bell" aria-hidden="true"></i>
          My Price Alerts
        </Title>
        <NoAlerts>Loading alerts...</NoAlerts>
      </Container>
    );
  }

  const coinNames = Object.keys(alertsByCoins);

  if (coinNames.length === 0) {
    return (
      <Container>
        <Title>
          <i className="fa fa-bell" aria-hidden="true"></i>
          My Price Alerts
        </Title>
        <NoAlerts>
          No price alerts set up yet. Visit a coin page to create alerts.
        </NoAlerts>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        <i className="fa fa-bell" aria-hidden="true"></i>
        My Price Alerts
      </Title>
      <AlertsGrid>
        {coinNames.map((coin) => {
          const alerts = alertsByCoins[coin];
          const isCollapsed = collapsedCoins[coin] || false;

          return (
            <CoinSection key={coin}>
              <CoinHeader onClick={() => toggleCoinCollapse(coin)}>
                <CoinHeaderLeft>
                  <CollapseIcon
                    className="fa fa-chevron-down"
                    collapsed={isCollapsed}
                    aria-hidden="true"
                  />
                  <CoinName>{coin}</CoinName>
                </CoinHeaderLeft>
                <AlertsCount>
                  {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
                </AlertsCount>
              </CoinHeader>
              <AlertsContainer collapsed={isCollapsed}>
                {alerts.map((alert) => (
                  <AlertItem key={alert.id}>
                    <AlertDetails>
                      {alert.type} {symbol}
                      {$numberWithCommas(alert.target)}
                    </AlertDetails>
                    <AlertStatus status={alert.status}>
                      {alert.status}
                    </AlertStatus>
                  </AlertItem>
                ))}
              </AlertsContainer>
            </CoinSection>
          );
        })}
      </AlertsGrid>
    </Container>
  );
};

export default AlertsList;
