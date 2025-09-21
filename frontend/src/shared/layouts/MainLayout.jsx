import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainHeader, Footer } from '../components';

function MainLayout() {
  return (
    <>
      <MainHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default MainLayout;
