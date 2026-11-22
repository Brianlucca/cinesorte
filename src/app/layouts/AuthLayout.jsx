import { Outlet, useLocation } from 'react-router-dom';
import SiteFooter from '@shared/components/layout/SiteFooter';

export default function AuthLayout() {
  const location = useLocation();

  return (
    <main key={location.pathname} className="h-screen w-full overflow-y-scroll bg-[#111216] text-white [scrollbar-gutter:stable] selection:bg-violet-500/30 selection:text-violet-200">
      <Outlet />
      <SiteFooter />
    </main>
  );
}
