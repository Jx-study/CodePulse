import { Outlet } from 'react-router-dom';
import { AuthHeader } from '../components/Header';
import styles from "./Layout.module.scss";

function AuthLayout() {
  return (
    <div className={styles.layout}>
      <AuthHeader />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;
