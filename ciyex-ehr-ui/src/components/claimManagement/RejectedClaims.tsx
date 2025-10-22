import React from 'react';

const RejectedClaims: React.FC = () => {
  // Sample data for demonstration
  const claims = [
    { patient: 'Roger Rook', claimNo: '#3943', carrier: 'Blue Cross Blue Shield FEP', status: 'rejected', reason: 'Returned as rejected' },
    { patient: 'Advik Kamath', claimNo: '#8045', carrier: 'MetLife', status: 'rejected', reason: 'Returned as rejected' },
  ];

  return (
    <div>
      <h2>Rejected Claims</h2>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Claim #</th>
            <th>Carrier</th>
            <th>Status</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim, idx) => (
            <tr key={idx}>
              <td>{claim.patient}</td>
              <td>{claim.claimNo}</td>
              <td>{claim.carrier}</td>
              <td>{claim.status}</td>
              <td>{claim.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RejectedClaims;
