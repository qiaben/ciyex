import React from 'react';


const UnclaimedClaims: React.FC = () => {
  // Sample data for demonstration
  const claims = [
    { patient: 'Aadhya Kamath', claimNo: '#8047', carrier: 'MetLife', status: 'unclaimed' },
    { patient: 'Jacob Crotty', claimNo: '#8959', carrier: 'Delta Dental of New Jersey', status: 'unclaimed' },
  ];

  return (
    <div>
      <h2>Unclaimed Claims</h2>
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

export default UnclaimedClaims;
