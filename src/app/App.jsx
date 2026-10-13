import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/context/useAuth';
import { HelmetProvider } from 'react-helmet-async';
import { WatchPartyBroadcastProvider } from '@features/watch-party/context/WatchPartyBroadcastContext';

const AuthLayout = lazy(() => import('@app/layouts/AuthLayout'));
const AppLayout = lazy(() => import('@app/layouts/AppLayout'));
const VerifyEmail = lazy(() => import('@features/auth/pages/VerifyEmail'));
const EmailChangeComplete = lazy(() => import('@features/auth/pages/EmailChangeComplete'));
const EmailChangePending = lazy(() => import('@features/auth/pages/EmailChangePending'));
const Dashboard = lazy(() => import('@features/dashboard/pages/Dashboard'));
const MediaDetails = lazy(() => import('@features/media/pages/MediaDetails'));
const SeasonDetails = lazy(() => import('@features/media/pages/SeasonDetails'));
const EpisodeDetails = lazy(() => import('@features/media/pages/EpisodeDetails'));
const PersonDetails = lazy(() => import('@features/people/pages/PersonDetails'));
const Profile = lazy(() => import('@features/profile/pages/Profile'));
const MyLists = lazy(() => import('@features/lists/pages/MyLists'));
const ListDetails = lazy(() => import('@features/lists/pages/ListDetails'));
const Settings = lazy(() => import('@features/settings/pages/Settings'));
const MovieRoulette = lazy(() => import('@features/roulette/pages/MovieRoulette'));
const Feed = lazy(() => import('@features/feed/pages/Feed'));
const WatchParty = lazy(() => import('@features/watch-party/pages/WatchParty'));
const WatchPartyRoom = lazy(() => import('@features/watch-party/pages/WatchPartyRoom'));
const PublicProfile = lazy(() => import('@features/profile/pages/PublicProfile'));
const SharedMediaPreview = lazy(() => import('@features/media/pages/SharedMediaPreview'));
const ExtensionConnect = lazy(() => import('@features/auth/pages/ExtensionConnect'));
const Privacy = lazy(() => import('@features/legal/pages/Privacy'));
const Terms = lazy(() => import('@features/legal/pages/Terms'));

const RouteFallback = () => (
  <div className="min-h-screen bg-[#111216] px-5 py-6" role="status" aria-label="Carregando página">
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-8 h-10 w-44 animate-pulse rounded-xl bg-white/[0.06]" />
      <div className="h-[48vh] min-h-72 animate-pulse rounded-3xl bg-white/[0.04]" />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="aspect-[2/3] animate-pulse rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen bg-[#111216] flex items-center justify-center text-violet-500">Carregando...</div>;
  if (user) return children;

  const params = new URLSearchParams({
    auth: 'login',
    redirect: `${location.pathname}${location.search}`,
  });
  return <Navigate to={`/?${params.toString()}`} replace />;
};

const LegacyAuthRedirect = ({ mode }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  params.set('auth', mode);
  return <Navigate to={`/?${params.toString()}`} replace state={location.state} />;
};

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
        
        <Route path="/share/:type/:id" element={<SharedMediaPreview />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/extension/connect" element={<PrivateRoute><ExtensionConnect /></PrivateRoute>} />
        
        <Route path="/login" element={<LegacyAuthRedirect mode="login" />} />
        <Route path="/register" element={<LegacyAuthRedirect mode="register" />} />

        <Route element={<AuthLayout />}>
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/email-change-pending" element={<EmailChangePending />} />
          <Route path="/email-change-complete" element={<EmailChangeComplete />} />
        </Route>

        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/" replace />} />

          <Route path="feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="watch-party" element={<PrivateRoute><WatchParty /></PrivateRoute>} />
          <Route path="watch-party/:roomId" element={<PrivateRoute><WatchPartyRoom /></PrivateRoute>} />
          <Route path="profile/:username" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />
          <Route path="lists" element={<PrivateRoute><MyLists /></PrivateRoute>} />
          <Route path="lists/:username/:listId" element={<PrivateRoute><ListDetails /></PrivateRoute>} />
          <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="roulette" element={<PrivateRoute><MovieRoulette /></PrivateRoute>} />

          <Route path="person/:id" element={<PersonDetails />} />
          <Route path="tv/:id/season/:seasonNumber/episode/:episodeNumber" element={<EpisodeDetails />} />
          <Route path="tv/:id/season/:seasonNumber" element={<SeasonDetails />} />
          <Route path=":type/:id" element={<MediaDetails />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <WatchPartyBroadcastProvider><AppRoutes /></WatchPartyBroadcastProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
