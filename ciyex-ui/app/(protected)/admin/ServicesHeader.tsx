// This is a client component because it might use client-side hooks or features.
"use client";

import React from 'react';

const ServicesHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Services Management</h1>
        <p className="text-gray-500">Manage and view statistics for services</p>
      </div>
      {/* Add any header actions like Add New Service button here */}
      {/* <Button>Add New Service</Button> */}
    </div>
  );
};

export default ServicesHeader; 