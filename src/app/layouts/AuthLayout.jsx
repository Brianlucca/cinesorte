import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <main className="h-screen w-full overflow-y-scroll bg-[#111216] text-white [scrollbar-gutter:stable] selection:bg-violet-500/30 selection:text-violet-200">
      <Outlet />
    </main>
  );
}
