import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@shared/context/useAuth';
import { HelmetProvider } from 'react-helmet-async';

const AuthLayout = lazy(() => import('@app/layouts/AuthLayout'));
const AppLayout = lazy(() => import('@app/layouts/AppLayout'));
const Landing = lazy(() => import('@features/landing/pages/Landing'));
const Login = lazy(() => import('@features/auth/pages/Login'));
const Register = lazy(() => import('@features/auth/pages/Register'));
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
const PublicProfile = lazy(() => import('@features/profile/pages/PublicProfile'));
const SharedMediaPreview = lazy(() => import('@features/media/pages/SharedMediaPreview'));

const RouteFallback = () => (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-violet-500">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600/30 border-t-violet-400" />
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-violet-500">Carregando...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/app" /> : <Landing />} />
        
        <Route path="/share/:type/:id" element={<SharedMediaPreview />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/email-change-pending" element={<EmailChangePending />} />
          <Route path="/email-change-complete" element={<EmailChangeComplete />} />
        </Route>

        <Route path="/app" element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          
          <Route path="feed" element={<Feed />} />
          <Route path="profile/:username" element={<PublicProfile />} /> 

          <Route path="lists" element={<MyLists />} />
          <Route path="lists/:username/:listId" element={<ListDetails />} />
          
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="roulette" element={<MovieRoulette />} />
          
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
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  );
}
