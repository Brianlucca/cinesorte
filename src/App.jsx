import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthLayout from './components/layout/AuthLayout';
import AppLayout from './components/layout/AppLayout';

import Landing from './views/Landing';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import VerifyEmail from './views/auth/VerifyEmail';
import Dashboard from './views/app/Dashboard';
import Search from './views/app/Search';
import MediaDetails from './views/app/MediaDetails';
import SeasonDetails from './views/app/SeasonDetails';
import EpisodeDetails from './views/app/EpisodeDetails';
import PersonDetails from './views/app/PersonDetails';
import Profile from './views/app/Profile';
import MyLists from './views/app/MyLists';
import ListDetails from './views/app/ListDetails';
import Settings from './views/app/Settings';
import MovieRoulette from './views/app/MovieRoulette';
import Feed from './views/app/Feed';
import PublicProfile from './views/app/PublicProfile';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-violet-500">Carregando...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/app" /> : <Landing />} />
      
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

        <Route path="search" element={<Search />} />
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}