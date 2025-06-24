import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { ElabNavbar } from '@/components/elab/ElabNavbar';
import TestCatalog from '@/components/elab/TestCatalog';
import CartDropdown from '@/components/elab/CartDropdown';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';

const Index = async () => {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const isPatient = await checkRole('PATIENT');
  
  if (!isPatient) {
    redirect('/');
  }

  return ( 
    <div className="ml-14 lg:ml-[5rem] xl:ml-[6rem] transition-all duration-300 flex flex-col min-w-0 min-h-screen">
      <ElabNavbar />
      <div className="fixed top-0 left-0 h-screen w-14 lg:w-[5rem] xl:w-[6rem] hover:w-[14%] md:hover:w-[8%] lg:hover:w-[16%] xl:hover:w-[14%] z-20 transition-all duration-300 ease-in-out flex flex-col justify-between border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Sidebar />
      </div>
      <div className="flex min-h-screen relative">
          <TestCatalog />
      </div>
    </div>
  );
};

export default Index;
