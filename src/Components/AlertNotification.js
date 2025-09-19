import React, { Component } from 'react';
import styled from 'styled-components';
import { getActiveAlerts, updateAlertStatus, ALERT_STATUS } from '../Utils/alertHelpers';
import { $currencySymbol, $numberWithCommas } from '../Utils/Helpers';

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  
  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const NotificationItem = styled.div`
  background: linear-gradient(135deg, rgba(33, 206, 153, 0.9), rgba(0, 212, 170, 0.9));
  border-radius: 12px;
  padding: 16px;
  color: white;
  box-shadow: 0 4px 20px rgba(33, 206, 153, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NotificationIcon = styled.span`
  font-size: 16px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const NotificationMessage = styled.div`
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 8px;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const AlertSummaryContainer = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 16px;
`;

const AlertSummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const AlertSummaryTitle = styled.h4`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AlertCount = styled.span`
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  color: white;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
`;

const AlertSummaryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AlertSummaryItem = styled.div`
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  color: #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ViewAllButton = styled.button`
  background: none;
  border: 1px solid rgba(33, 206, 153, 0.5);
  color: #21ce99;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 8px;
  
  &:hover {
    background: rgba(33, 206, 153, 0.1);
    border-color: #21ce99;
  }
`;

class AlertNotification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      activeAlerts: []
    };
  }

  componentDidMount() {
    this.loadActiveAlerts();
    // Set up interval to check for triggered alerts
    this.alertCheckInterval = setInterval(this.checkTriggeredAlerts, 30000); // Check every 30 seconds
  }

  componentWillUnmount() {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }
  }

  loadActiveAlerts = async () => {
    try {
      const alerts = await getActiveAlerts();
      this.setState({ activeAlerts: alerts });
    } catch (error) {
      console.error('Failed to load active alerts:', error);
    }
  };

  checkTriggeredAlerts = async () => {
    // This would be called by the parent component when market data updates
    // For now, it's a placeholder for the real-time monitoring system
  };

  showAlertNotification = (alert, currentPrice) => {
    const notification = {
      id: `alert_${alert.id}_${Date.now()}`,
      type: 'alert',
      alert,
      currentPrice,
      timestamp: Date.now()
    };

    this.setState(prevState => ({
      notifications: [...prevState.notifications, notification]
    }));

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      this.dismissNotification(notification.id);
    }, 10000);
  };

  dismissNotification = (notificationId) => {
    this.setState(prevState => ({
      notifications: prevState.notifications.filter(n => n.id !== notificationId)
    }));
  };

  handleDismissAlert = async (alertId) => {
    try {
      await updateAlertStatus(alertId, ALERT_STATUS.DISMISSED);
      await this.loadActiveAlerts();
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  handleViewCoin = (coin) => {
    // Navigate to coin detail page
    window.location.href = `/coin/${coin}`;
  };

  formatCurrency = (amount, currency = 'USD') => {
    const symbol = $currencySymbol(currency);
    return `${symbol}${$numberWithCommas(amount.toFixed(2))}`;
  };

  render() {
    const { notifications, activeAlerts } = this.state;
    const { currency = 'USD' } = this.props;

    return (
      <>
        {/* Active Alerts Summary */}
        {activeAlerts.length > 0 && (
          <AlertSummaryContainer>
            <AlertSummaryHeader>
              <AlertSummaryTitle>
                <span>🚨</span>
                Active Price Alerts
              </AlertSummaryTitle>
              <AlertCount>{activeAlerts.length}</AlertCount>
            </AlertSummaryHeader>
            
            <AlertSummaryList>
              {activeAlerts.slice(0, 3).map(alert => (
                <AlertSummaryItem key={alert.id}>
                  <span>
                    {alert.coin.toUpperCase()} {alert.type} {this.formatCurrency(alert.targetPrice, alert.currency)}
                  </span>
                  <ActionButton
                    onClick={() => this.handleViewCoin(alert.coin)}
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    View
                  </ActionButton>
                </AlertSummaryItem>
              ))}
              
              {activeAlerts.length > 3 && (
                <AlertSummaryItem>
                  <span style={{ color: '#888' }}>
                    +{activeAlerts.length - 3} more alerts
                  </span>
                </AlertSummaryItem>
              )}
            </AlertSummaryList>
            
            <ViewAllButton onClick={() => window.location.href = '/menu'}>
              Manage All Alerts
            </ViewAllButton>
          </AlertSummaryContainer>
        )}

        {/* Notification Popups */}
        <NotificationContainer>
          {notifications.map(notification => {
            if (notification.type === 'alert') {
              const { alert, currentPrice } = notification;
              return (
                <NotificationItem key={notification.id}>
                  <NotificationHeader>
                    <NotificationTitle>
                      <NotificationIcon>🚨</NotificationIcon>
                      Price Alert Triggered!
                    </NotificationTitle>
                    <CloseButton onClick={() => this.dismissNotification(notification.id)}>
                      ✕
                    </CloseButton>
                  </NotificationHeader>
                  
                  <NotificationMessage>
                    {alert.coin.toUpperCase()} has {alert.type === 'above' ? 'risen above' : 'fallen below'} your target of {this.formatCurrency(alert.targetPrice, alert.currency)}
                    <br />
                    Current price: {this.formatCurrency(currentPrice, currency)}
                  </NotificationMessage>
                  
                  <NotificationActions>
                    <ActionButton onClick={() => this.handleDismissAlert(alert.id)}>
                      Dismiss
                    </ActionButton>
                    <ActionButton 
                      primary 
                      onClick={() => this.handleViewCoin(alert.coin)}
                    >
                      View Details
                    </ActionButton>
                  </NotificationActions>
                </NotificationItem>
              );
            }
            return null;
          })}
        </NotificationContainer>
      </>
    );
  }
}

// Export method to trigger notifications from parent components
export const triggerAlertNotification = (alertNotificationRef, alert, currentPrice) => {
  if (alertNotificationRef && alertNotificationRef.current) {
    alertNotificationRef.current.showAlertNotification(alert, currentPrice);
  }
};

export default AlertNotification;
