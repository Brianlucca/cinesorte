import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

const AuthLayout = lazy(() => import('./components/layout/AuthLayout'));
const AppLayout = lazy(() => import('./components/layout/AppLayout'));
const Landing = lazy(() => import('./views/Landing'));
const Login = lazy(() => import('./views/auth/Login'));
const Register = lazy(() => import('./views/auth/Register'));
const VerifyEmail = lazy(() => import('./views/auth/VerifyEmail'));
const Dashboard = lazy(() => import('./views/app/Dashboard'));
const MediaDetails = lazy(() => import('./views/app/MediaDetails'));
const SeasonDetails = lazy(() => import('./views/app/SeasonDetails'));
const EpisodeDetails = lazy(() => import('./views/app/EpisodeDetails'));
const PersonDetails = lazy(() => import('./views/app/PersonDetails'));
const Profile = lazy(() => import('./views/app/Profile'));
const MyLists = lazy(() => import('./views/app/MyLists'));
const ListDetails = lazy(() => import('./views/app/ListDetails'));
const Settings = lazy(() => import('./views/app/Settings'));
const MovieRoulette = lazy(() => import('./views/app/MovieRoulette'));
const Feed = lazy(() => import('./views/app/Feed'));
const PublicProfile = lazy(() => import('./views/app/PublicProfile'));
const SharedMediaPreview = lazy(() => import('./views/app/SharedMediaPreview'));

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
