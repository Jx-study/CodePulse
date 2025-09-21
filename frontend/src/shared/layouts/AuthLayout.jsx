import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthHeader } from '../components';

function AuthLayout() {
  return (
    <>
      <AuthHeader />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default AuthLayout;
