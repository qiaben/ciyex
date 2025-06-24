import React from 'react';

type AdminRouteProps = {
  children: React.ReactNode;
};

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // Remove localStorage admin check and always allow access for now
  return <>{children}</>;
}; 