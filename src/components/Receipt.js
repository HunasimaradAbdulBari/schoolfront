import React from 'react';

const Receipt = ({ student, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!student) return null;

  return (
    <div className="receipt-overlay">
      <div className="receipt-modal">
        <div className="receipt-header">
          <h2>Payment Receipt</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="receipt-content">
          <div className="receipt-school-info">
            <h3>ASTRA PRESCHOOL</h3>
            <p>5th Cross, Ganesh Temple Road, Sadashiv Nagar, Tumkur - 572101</p>
            <p>Phone: 9008887230</p>
          </div>
          
          <div className="receipt-details">
            <div className="receipt-row">
              <span>Student Name:</span>
              <span>{student.name}</span>
            </div>
            <div className="receipt-row">
              <span>Class:</span>
              <span>{student.class}</span>
            </div>
            <div className="receipt-row">
              <span>Fee Paid:</span>
              <span>₹{student.feePaid}</span>
            </div>
            <div className="receipt-row">
              <span>Balance:</span>
              <span>₹{student.balance}</span>
            </div>
            <div className="receipt-row">
              <span>Date:</span>
              <span>{new Date(student.date).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="receipt-footer">
            <p>Thank you for your payment!</p>
            <p>Receipt generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div className="receipt-actions">
          <button onClick={handlePrint} className="print-btn">Print Receipt</button>
          <button onClick={onClose} className="close-receipt-btn">Close</button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;