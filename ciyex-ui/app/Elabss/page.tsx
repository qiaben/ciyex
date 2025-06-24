import React from 'react';
import Header from '@/components/Nav/page';
import { Sidebar } from '@/components/sidebar';
import TestCatalog from '@/components/elab/TestCatalog';

const Index = () => {
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <div className="flex-1 px-4 py-8 overflow-x-auto">
          <TestCatalog />
        </div>
      </div>
    </>
  );
};

export default Index;
