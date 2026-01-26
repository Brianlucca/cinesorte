import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <main className="min-h-screen w-full bg-zinc-950 text-white selection:bg-violet-500/30 selection:text-violet-200">
      <Outlet />
    </main>
  );
}