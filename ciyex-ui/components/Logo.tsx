import Link from 'next/link';
import React from 'react';

export default function Logo({ className = '', logoClassName = '' }: { className?: string; logoClassName?: string }) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <img src="/logo.png" alt="OurTopClinic logo" className={`w-auto ${logoClassName}`} />
    </Link>
  );
} 