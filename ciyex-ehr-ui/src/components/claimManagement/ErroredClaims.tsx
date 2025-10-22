import React from 'react';

const ErroredClaims: React.FC = () => {
  // Sample data for demonstration
  const claims = [
    { patient: 'Arnold Lopez', claimNo: '#27760', carrier: 'Delta Dental of New Jersey', status: 'error', message: 'Returned as errored' },
    { patient: 'Cynthia White', claimNo: '#27843', carrier: 'UMR', status: 'error', message: 'Returned as errored' },
  ];

  return (
    <div>
      <h2>Errored Claims</h2>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Claim #</th>
            <th>Carrier</th>
            <th>Status</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim, idx) => (
            <tr key={idx}>
              <td>{claim.patient}</td>
              <td>{claim.claimNo}</td>
              <td>{claim.carrier}</td>
              <td>{claim.status}</td>
              <td>{claim.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ErroredClaims;
