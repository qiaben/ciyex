import React from 'react';


const HistoryClaims: React.FC = () => {
  // Sample data for demonstration
  const claims = [
    { patient: 'Ann Chelbus', claimNo: '#6044', carrier: 'AFLAC', status: 'sent', date: '09/04/2025' },
    { patient: 'Merve Silapar', claimNo: '#1280', carrier: 'Meritian Health', status: 'sent', date: '04/29/2025' },
  ];

  return (
    <div>
      <h2>History Claims</h2>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Claim #</th>
            <th>Carrier</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim, idx) => (
            <tr key={idx}>
              <td>{claim.patient}</td>
              <td>{claim.claimNo}</td>
              <td>{claim.carrier}</td>
              <td>{claim.status}</td>
              <td>{claim.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryClaims;
