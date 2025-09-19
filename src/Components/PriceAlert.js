import React, { Component } from 'react';
import styled from 'styled-components';
import { 
  createAlert, 
  addAlert, 
  removeAlert, 
  getAlertsForCoin, 
  ALERT_TYPES, 
  ALERT_STATUS 
} from '../Utils/alertHelpers';
import { $currencySymbol, $numberWithCommas } from '../Utils/Helpers';
import { showNotification } from './Notifications';

const AlertContainer = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const AlertTitle = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AlertIcon = styled.span`
  font-size: 20px;
`;

const AlertForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 120px;
  gap: 12px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #aaa;
  font-size: 14px;
  font-weight: 500;
`;

const Select = styled.select`
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #21ce99;
  }
  
  option {
    background: #2d2d2d;
    color: white;
  }
`;

const Input = styled.input`
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #21ce99;
  }
  
  &::placeholder {
    color: #666;
  }
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  height: fit-content;
  align-self: end;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 206, 153, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AlertItem = styled.div`
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255,255,255,0.1);
`;

const AlertInfo = styled.div`
  flex: 1;
`;

const AlertMessage = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const AlertMeta = styled.div`
  color: #aaa;
  font-size: 12px;
`;

const AlertStatus = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 12px;
  
  ${props => {
    switch (props.status) {
      case ALERT_STATUS.ACTIVE:
        return 'background: rgba(33, 206, 153, 0.2); color: #21ce99;';
      case ALERT_STATUS.TRIGGERED:
        return 'background: rgba(255, 193, 7, 0.2); color: #ffc107;';
      case ALERT_STATUS.DISMISSED:
        return 'background: rgba(108, 117, 125, 0.2); color: #6c757d;';
      default:
        return 'background: rgba(255,255,255,0.1); color: #aaa;';
    }
  }}
`;

const RemoveButton = styled.button`
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 107, 107, 0.3);
  }
`;

const CurrentPriceInfo = styled.div`
  background: rgba(33, 206, 153, 0.1);
  border: 1px solid rgba(33, 206, 153, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  text-align: center;
`;

const CurrentPriceLabel = styled.div`
  color: #aaa;
  font-size: 12px;
  margin-bottom: 4px;
`;

const CurrentPriceValue = styled.div`
  color: #21ce99;
  font-size: 18px;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

class PriceAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alerts: [],
      alertType: ALERT_TYPES.ABOVE,
      targetPrice: '',
      loading: false,
      loadingAlerts: true
    };
  }

  async componentDidMount() {
    await this.loadAlerts();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.coin !== this.props.coin) {
      await this.loadAlerts();
    }
  }

  loadAlerts = async () => {
    try {
      this.setState({ loadingAlerts: true });
      const alerts = await getAlertsForCoin(this.props.coin);
      this.setState({ alerts, loadingAlerts: false });
    } catch (error) {
      console.error('Failed to load alerts:', error);
      this.setState({ loadingAlerts: false });
    }
  };

  handleAddAlert = async () => {
    const { coin, currency = 'USD' } = this.props;
    const { alertType, targetPrice } = this.state;

    if (!targetPrice || isNaN(parseFloat(targetPrice))) {
      showNotification('error', 'Please enter a valid target price');
      return;
    }

    try {
      this.setState({ loading: true });
      
      const alert = createAlert(coin, alertType, parseFloat(targetPrice), currency);
      const success = await addAlert(alert);
      
      if (success) {
        showNotification('success', 'Alert created successfully');
        this.setState({ targetPrice: '' });
        await this.loadAlerts();
      } else {
        showNotification('error', 'Failed to create alert');
      }
    } catch (error) {
      console.error('Failed to add alert:', error);
      showNotification('error', 'Failed to create alert');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleRemoveAlert = async (alertId) => {
    try {
      const success = await removeAlert(alertId);
      if (success) {
        showNotification('info', 'Alert removed');
        await this.loadAlerts();
      } else {
        showNotification('error', 'Failed to remove alert');
      }
    } catch (error) {
      console.error('Failed to remove alert:', error);
      showNotification('error', 'Failed to remove alert');
    }
  };

  formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  getCurrentPrice = () => {
    const { marketData, coin, exchangeRate = 1 } = this.props;
    if (!marketData || !marketData[coin] || !marketData[coin].ticker) {
      return null;
    }
    return marketData[coin].ticker.price * exchangeRate;
  };

  render() {
    const { coin, currency = 'USD' } = this.props;
    const { alerts, alertType, targetPrice, loading, loadingAlerts } = this.state;
    const curSymbol = $currencySymbol(currency);
    const currentPrice = this.getCurrentPrice();

    return (
      <AlertContainer>
        <AlertHeader>
          <AlertTitle>
            <AlertIcon>🚨</AlertIcon>
            Price Alerts for {coin.toUpperCase()}
          </AlertTitle>
        </AlertHeader>

        {currentPrice && (
          <CurrentPriceInfo>
            <CurrentPriceLabel>Current Price</CurrentPriceLabel>
            <CurrentPriceValue>
              {curSymbol}{$numberWithCommas(currentPrice.toFixed(2))}
            </CurrentPriceValue>
          </CurrentPriceInfo>
        )}

        <AlertForm>
          <FormGroup>
            <Label>Alert Type</Label>
            <Select
              value={alertType}
              onChange={(e) => this.setState({ alertType: e.target.value })}
            >
              <option value={ALERT_TYPES.ABOVE}>Price Above</option>
              <option value={ALERT_TYPES.BELOW}>Price Below</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Target Price ({currency})</Label>
            <Input
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => this.setState({ targetPrice: e.target.value })}
              placeholder="Enter target price"
            />
          </FormGroup>
          
          <AddButton
            onClick={this.handleAddAlert}
            disabled={loading || !targetPrice}
          >
            {loading ? 'Adding...' : 'Add Alert'}
          </AddButton>
        </AlertForm>

        <AlertList>
          {loadingAlerts ? (
            <div style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>
              Loading alerts...
            </div>
          ) : alerts.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔕</div>
              <div>No alerts set for {coin.toUpperCase()}</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Create your first alert to get notified when the price reaches your target
              </div>
            </EmptyState>
          ) : (
            alerts.map((alert) => (
              <AlertItem key={alert.id}>
                <AlertInfo>
                  <AlertMessage>{alert.message}</AlertMessage>
                  <AlertMeta>
                    Created {this.formatDate(alert.createdAt)}
                    {alert.triggeredAt && ` • Triggered ${this.formatDate(alert.triggeredAt)}`}
                  </AlertMeta>
                </AlertInfo>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <AlertStatus status={alert.status}>
                    {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                  </AlertStatus>
                  <RemoveButton onClick={() => this.handleRemoveAlert(alert.id)}>
                    Remove
                  </RemoveButton>
                </div>
              </AlertItem>
            ))
          )}
        </AlertList>
      </AlertContainer>
    );
  }
}

export default PriceAlert;
