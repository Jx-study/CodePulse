import { Outlet, useLocation } from 'react-router-dom';
import { MainHeader } from '../components/Header';
import Footer from '../components/Footer';
import styles from './MainLayout.module.scss';

// 集中管理不显示 Footer 的路径配置
const NO_FOOTER_PATHS = [
  '/dashboard',
  '/tutorial',
];

function MainLayout() {
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER_PATHS.some(path => pathname.startsWith(path));

  return (
    <div className={styles.layout}>
      <MainHeader />
      <main className={styles.main}>
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default MainLayout;
