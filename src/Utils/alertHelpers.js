import { isUserSignedIn, getFile, putFile } from "blockstack";

const GAIA_FILE = "coinfox.json";

export const ALERT_STATUS = {
  ACTIVE: "Active",
  TRIGGERED: "Triggered",
  DISMISSED: "Dismissed",
};

export const ALERT_TYPE = {
  ABOVE: "Above",
  BELOW: "Below",
};

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  }
}

async function readGaia() {
  try {
    const decrypt = true;
    const data = await getFile(GAIA_FILE, decrypt);
    if (!data) return { coinz: {}, pref: { currency: "USD" }, alerts: [] };
    const parsed = safeParse(data);
    return {
      coinz: parsed.coinz || {},
      pref: parsed.pref || { currency: "USD" },
      alerts: parsed.alerts || [],
    };
  } catch (e) {
    return { coinz: {}, pref: { currency: "USD" }, alerts: [] };
  }
}

async function writeGaia(payload) {
  const encrypt = true;
  await putFile(GAIA_FILE, JSON.stringify(payload), encrypt);
}

function readLocal() {
  const coinz = localStorage.coinz ? safeParse(localStorage.coinz) : {};
  const pref = localStorage.pref
    ? safeParse(localStorage.pref)
    : { currency: "USD" };
  const alerts = localStorage.alerts ? safeParse(localStorage.alerts) : [];
  return { coinz, pref, alerts };
}

function writeLocal(payload) {
  if (payload.coinz)
    localStorage.setItem("coinz", JSON.stringify(payload.coinz));
  if (payload.pref) localStorage.setItem("pref", JSON.stringify(payload.pref));
  localStorage.setItem("alerts", JSON.stringify(payload.alerts || []));
}

export async function getAllAlerts() {
  if (isUserSignedIn()) {
    const data = await readGaia();
    return data.alerts || [];
  }
  const { alerts } = readLocal();
  return alerts || [];
}

export async function saveAllAlerts(alerts) {
  if (isUserSignedIn()) {
    const data = await readGaia();
    await writeGaia({ ...data, alerts });
  } else {
    const data = readLocal();
    writeLocal({ ...data, alerts });
  }
  return alerts;
}

export function makeAlert({ coin, type, target }) {
  return {
    id: `${coin}-${Date.now()}`,
    coin: coin.toLowerCase(),
    type, // 'Above' | 'Below'
    target: Number(target),
    status: ALERT_STATUS.ACTIVE,
    createdAt: Date.now(),
    triggeredAt: null,
  };
}

export async function addAlert(alert) {
  const alerts = await getAllAlerts();
  alerts.push(alert);
  await saveAllAlerts(alerts);
  return alert;
}

export async function updateAlertStatus(id, status) {
  const alerts = await getAllAlerts();
  const next = alerts.map((a) =>
    a.id === id
      ? {
          ...a,
          status,
          triggeredAt:
            status === ALERT_STATUS.TRIGGERED ? Date.now() : a.triggeredAt,
        }
      : a
  );
  await saveAllAlerts(next);
  return next.find((a) => a.id === id);
}

export async function dismissAlert(id) {
  return updateAlertStatus(id, ALERT_STATUS.DISMISSED);
}

export function getPriceForCoin(marketData, coin, exchangeRate = 1) {
  const t = coin.toLowerCase();
  const price =
    (marketData &&
      marketData[t] &&
      marketData[t].ticker &&
      marketData[t].ticker.price) ||
    0;
  return Number(price) * Number(exchangeRate || 1);
}

export async function evaluateAlerts({
  marketData,
  exchangeRate = 1,
  onTrigger,
}) {
  const alerts = await getAllAlerts();
  if (!alerts || alerts.length === 0) return [];

  let changed = false;
  const nextAlerts = alerts.map((a) => {
    if (a.status !== ALERT_STATUS.ACTIVE) return a;
    const price = getPriceForCoin(marketData, a.coin, exchangeRate);
    if (!price) return a;
    const hit =
      (a.type === ALERT_TYPE.ABOVE && price >= a.target) ||
      (a.type === ALERT_TYPE.BELOW && price <= a.target);
    if (hit) {
      changed = true;
      const updated = {
        ...a,
        status: ALERT_STATUS.TRIGGERED,
        triggeredAt: Date.now(),
      };
      if (onTrigger) {
        try {
          onTrigger(updated, price);
        } catch (e) {}
      }
      return updated;
    }
    return a;
  });

  if (changed) await saveAllAlerts(nextAlerts);
  return nextAlerts;
}
