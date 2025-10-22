import React from 'react';

const UnsentClaims: React.FC = () => {
  // Sample data for demonstration
  const claims = [
    { patient: 'Melissa Zablatzky', claimNo: '#28243', carrier: 'Delta Dental of Wisconsin', status: 'readyForSubmission' },
    { patient: 'Puneet Sandhu', claimNo: '#28241', carrier: 'Guardian Life Insurance Co. of America', status: 'readyForSubmission' },
  ];

  return (
    <div>
      <h2>Unsent Claims</h2>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Claim #</th>
            <th>Carrier</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim, idx) => (
            <tr key={idx}>
              <td>{claim.patient}</td>
              <td>{claim.claimNo}</td>
              <td>{claim.carrier}</td>
              <td>{claim.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UnsentClaims;
