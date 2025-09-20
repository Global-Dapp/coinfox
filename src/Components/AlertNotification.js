import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ALERT_STATUS, getAllAlerts, dismissAlert } from '../Utils/alertHelpers';

const Wrap = styled.div`
  margin: 12px 0 0 0;
`;

const Item = styled.div`
  background: rgba(255, 217, 61, 0.1);
  border: 1px solid rgba(255, 217, 61, 0.4);
  color: #fff;
  padding: 10px 12px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Btn = styled.button`
  background: transparent;
  color: #ffd93d;
  border: 1px solid rgba(255,217,61,0.6);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
`;

const AlertNotification = () => {
  const [triggered, setTriggered] = useState([]);
  const [active, setActive] = useState([]);

  const refresh = async () => {
    const alerts = await getAllAlerts();
    setTriggered(alerts.filter(a => a.status === ALERT_STATUS.TRIGGERED));
    setActive(alerts.filter(a => a.status === ALERT_STATUS.ACTIVE));
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, []);

  const onDismiss = async (id) => {
    await dismissAlert(id);
    await refresh();
  };

  if (triggered.length === 0 && active.length === 0) return null;

  return (
    <Wrap>
      {active.length > 0 && (
        <Item style={{ background: 'rgba(33, 206, 153, 0.08)', borderColor: 'rgba(33,206,153,0.4)' }}>
          <span>Active Alerts: {active.map(a => `${a.coin.toUpperCase()} ${a.type} ${a.target}`).join(', ')}</span>
        </Item>
      )}
      {triggered.map(a => (
        <Item key={a.id}>
          <span>Alert Triggered: {a.coin.toUpperCase()} {a.type} {a.target}</span>
          <Btn onClick={() => onDismiss(a.id)}>Dismiss</Btn>
        </Item>
      ))}
    </Wrap>
  );
};

export default AlertNotification;
