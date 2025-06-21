"use client"
import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';

const EgoisticNavbar = () => {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');


  if (isAdminPage ) {
    return null; 
  }

  return <Navbar />;
};

export default EgoisticNavbar;
