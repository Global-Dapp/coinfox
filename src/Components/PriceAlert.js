import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  ALERT_TYPE,
  ALERT_STATUS,
  addAlert,
  getAllAlerts,
  saveAllAlerts,
  makeAlert,
} from "../Utils/alertHelpers";
import { $numberWithCommas, $currencySymbol } from "../Utils/Helpers";

const Container = styled.div`
  margin-top: 16px;
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  color: #fff;
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
`;

const Form = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
`;

const Select = styled.select`
  background: #2a2a2a;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 10px;
  border-radius: 8px;
`;

const Input = styled.input`
  background: #2a2a2a;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 10px;
  border-radius: 8px;
  width: 140px;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`;

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AlertItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  font-size: 14px;
`;

const Status = styled.span`
  color: ${(p) =>
    p.status === ALERT_STATUS.TRIGGERED
      ? "#ffd93d"
      : p.status === ALERT_STATUS.DISMISSED
      ? "#aaa"
      : "#21ce99"};
`;

const SmallBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
`;

const PriceAlert = ({ coin, currency }) => {
  const [type, setType] = useState(ALERT_TYPE.ABOVE);
  const [target, setTarget] = useState("");
  const [alerts, setAlerts] = useState([]);

  const symbol = $currencySymbol(currency || "USD");

  const load = async () => {
    const all = await getAllAlerts();
    setAlerts(all.filter((a) => a.coin === coin.toLowerCase()));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [coin]);

  const handleAdd = async () => {
    const value = Number(target);
    if (!value) return;
    const alert = makeAlert({ coin, type, target: value });
    await addAlert(alert);
    setTarget("");
    await load();
  };

  const remove = async (id) => {
    const all = await getAllAlerts();
    const next = all.filter((a) => a.id !== id);
    await saveAllAlerts(next);
    await load();
  };

  return (
    <Container>
      <Title>Price Alerts</Title>
      <Form>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value={ALERT_TYPE.ABOVE}>Above</option>
          <option value={ALERT_TYPE.BELOW}>Below</option>
        </Select>
        <Input
          type="number"
          placeholder={`${symbol} Target`}
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <Button onClick={handleAdd}>Add Alert</Button>
      </Form>

      <AlertList>
        {alerts.map((a) => (
          <AlertItem key={a.id}>
            <span>
              {a.type} {symbol}
              {$numberWithCommas(a.target)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Status status={a.status}>{a.status}</Status>
              <SmallBtn onClick={() => remove(a.id)}>Remove</SmallBtn>
            </span>
          </AlertItem>
        ))}
        {alerts.length === 0 && (
          <div style={{ color: "#aaa" }}>No alerts yet</div>
        )}
      </AlertList>
    </Container>
  );
};

export default PriceAlert;
