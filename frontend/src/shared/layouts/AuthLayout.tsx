import { Outlet } from 'react-router-dom';
import { AuthHeader } from '../components/Header';

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
