import React, { useState } from 'react';
import { api } from '../services/api';
import '../styles/UpiPayment.css';

const UpiPayment = ({ student, onClose, onPaymentComplete }) => {
  const [qrCode, setQrCode] = useState(null);
  const [upiUrl, setUpiUrl] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [amount, setAmount] = useState(student.balance || 0);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Amount selection, 2: QR display, 3: Confirmation
  const [upiTransactionId, setUpiTransactionId] = useState('');

  const handleAmountSelection = (selectedAmount) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setAmount(parseInt(value) || 0);
    }
  };

  const generateQR = async () => {
    if (amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > student.balance) {
      setError(`Amount cannot exceed pending balance of ₹${student.balance}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/payments/generate-qr', {
        studentId: student._id,
        amount: amount,
        purpose: `School Fee Payment - ${student.name}`
      });

      if (response.data.success) {
        setQrCode(response.data.qrImage);
        setUpiUrl(response.data.upiUrl);
        setPaymentId(response.data.paymentId);
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to generate QR code');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate payment QR');
      console.error('QR generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpiAppLaunch = (app) => {
    const appUrls = {
      gpay: `tez://upi/pay?${upiUrl.split('?')[1]}`,
      phonepe: `phonepe://pay?${upiUrl.split('?')[1]}`,
      paytm: `paytmmp://pay?${upiUrl.split('?')[1]}`,
      bhim: `bhim://pay?${upiUrl.split('?')[1]}`
    };

    // Try to launch the app
    window.location.href = appUrls[app] || upiUrl;
    
    // Fallback to generic UPI URL after a short delay
    setTimeout(() => {
      window.location.href = upiUrl;
    }, 1000);
  };

  const confirmPayment = async () => {
    if (!upiTransactionId.trim()) {
      setError('Please enter the UPI transaction ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/payments/confirm', {
        paymentId: paymentId,
        upiTransactionId: upiTransactionId.trim()
      });

      if (response.data.success) {
        setStep(4); // Success step
        setTimeout(() => {
          onPaymentComplete();
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to confirm payment');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to confirm payment');
      console.error('Payment confirmation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const predefinedAmounts = [100, 250, 500, 1000, student.balance];
  const uniqueAmounts = [...new Set(predefinedAmounts.filter(amt => amt > 0))];

  return (
    <div className="upi-payment-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Pay School Fees</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="student-info">
          <h3>{student.name}</h3>
          <p>ID: {student.studentId} | Class: {student.class}</p>
          <p>Pending Balance: <strong>₹{student.balance}</strong></p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Step 1: Amount Selection */}
        {step === 1 && (
          <div className="amount-selection">
            <h4>Select Amount to Pay</h4>
            
            <div className="predefined-amounts">
              {uniqueAmounts.map(amt => (
                <button
                  key={amt}
                  className={`amount-btn ${amount === amt ? 'active' : ''}`}
                  onClick={() => handleAmountSelection(amt)}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="custom-amount">
              <label>Or enter custom amount:</label>
              <input
                type="text"
                placeholder="Enter amount"
                value={customAmount}
                onChange={handleCustomAmount}
                className="amount-input"
              />
            </div>

            <div className="selected-amount">
              <p>Amount to pay: <strong>₹{amount}</strong></p>
            </div>

            <button
              className="generate-qr-btn"
              onClick={generateQR}
              disabled={loading || amount <= 0}
            >
              {loading ? 'Generating...' : 'Generate Payment QR'}
            </button>
          </div>
        )}

        {/* Step 2: QR Code Display */}
        {step === 2 && (
          <div className="qr-display">
            <h4>Scan QR Code to Pay</h4>
            
            <div className="qr-container">
              <img src={qrCode} alt="UPI QR Code" className="qr-image" />
            </div>

            <p className="qr-instructions">
              Scan with any UPI app like GPay, PhonePe, Paytm, or BHIM
            </p>

            <div className="upi-apps">
              <h5>Or click to open in app:</h5>
              <div className="app-buttons">
                <button 
                  className="app-btn gpay-btn"
                  onClick={() => handleUpiAppLaunch('gpay')}
                >
                  Google Pay
                </button>
                <button 
                  className="app-btn phonepe-btn"
                  onClick={() => handleUpiAppLaunch('phonepe')}
                >
                  PhonePe
                </button>
                <button 
                  className="app-btn paytm-btn"
                  onClick={() => handleUpiAppLaunch('paytm')}
                >
                  Paytm
                </button>
                <button 
                  className="app-btn bhim-btn"
                  onClick={() => handleUpiAppLaunch('bhim')}
                >
                  BHIM
                </button>
              </div>
            </div>

            <div className="payment-details">
              <p><strong>Amount:</strong> ₹{amount}</p>
              <p><strong>Payee:</strong> Astra Preschool</p>
              <p><strong>Purpose:</strong> School Fee - {student.name}</p>
            </div>

            <button
              className="payment-done-btn"
              onClick={() => setStep(3)}
            >
              I have made the payment
            </button>

            <button
              className="back-btn"
              onClick={() => setStep(1)}
            >
              Change Amount
            </button>
          </div>
        )}

        {/* Step 3: Payment Confirmation */}
        {step === 3 && (
          <div className="payment-confirmation">
            <h4>Confirm Your Payment</h4>
            
            <div className="confirmation-info">
              <p>Amount Paid: <strong>₹{amount}</strong></p>
              <p>Student: <strong>{student.name}</strong></p>
            </div>

            <div className="transaction-id-input">
              <label>Enter UPI Transaction ID *</label>
              <input
                type="text"
                placeholder="e.g., 123456789012"
                value={upiTransactionId}
                onChange={(e) => setUpiTransactionId(e.target.value)}
                className="transaction-input"
              />
              <small>
                You can find this in your UPI app's transaction history or payment confirmation message
              </small>
            </div>

            <div className="confirmation-actions">
              <button
                className="confirm-payment-btn"
                onClick={confirmPayment}
                disabled={loading || !upiTransactionId.trim()}
              >
                {loading ? 'Confirming...' : 'Confirm Payment'}
              </button>

              <button
                className="back-btn"
                onClick={() => setStep(2)}
              >
                Back to QR
              </button>
            </div>

            <div className="help-text">
              <p><strong>Note:</strong> Your payment will be verified by the school administration. You will receive a confirmation SMS once verified.</p>
            </div>
          </div>
        )}

        {/* Step 4: Success Message */}
        {step === 4 && (
          <div className="payment-success">
            <div className="success-icon">✅</div>
            <h4>Payment Submitted Successfully!</h4>
            <div className="success-details">
              <p>Amount: <strong>₹{amount}</strong></p>
              <p>Student: <strong>{student.name}</strong></p>
              <p>Transaction ID: <strong>{upiTransactionId}</strong></p>
            </div>
            <p className="success-message">
              Your payment has been submitted for verification. You will receive a confirmation SMS once the school administration verifies your payment.
            </p>
            <div className="success-note">
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>School will verify your payment within 24 hours</li>
                <li>You'll receive a confirmation SMS</li>
                <li>Updated balance will reflect in your dashboard</li>
                <li>You can download the receipt from payment history</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpiPayment;
