import { useParams } from 'react-router-dom';
import { usePublicProfileLogic } from '../../hooks/usePublicProfileLogic';
import PublicProfileHeader from '../../components/profile/PublicProfileHeader';
import ReviewsList from '../../components/profile/ReviewsList';
import { MessageSquare, Ghost } from 'lucide-react';

export default function PublicProfile() {
  const { username } = useParams();
  const { profile, reviews, isFollowing, loading, compatibility, actions } = usePublicProfileLogic(username);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-zinc-950">
        <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return (
    <div className="h-screen flex flex-col items-center justify-center text-center bg-zinc-950">
        <div className="bg-zinc-900 p-6 rounded-full mb-6 border border-zinc-800">
            <Ghost size={48} className="text-zinc-600" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Usuário não encontrado</h2>
        <p className="text-zinc-500 text-lg">O perfil que você procura não está disponível.</p>
    </div>
  );

  return (
    <div className="bg-zinc-950 min-h-screen pb-32">
      <PublicProfileHeader 
        user={profile} 
        isFollowing={isFollowing} 
        onFollow={actions.handleFollow} 
        compatibility={compatibility}
      />
      
      <div className="max-w-6xl mx-auto px-6 space-y-8 mt-12">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="p-2 bg-violet-600/10 text-violet-500 rounded-lg">
                  <MessageSquare size={24} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Atividade Recente</h3>
          </div>
          <ReviewsList reviews={reviews} />
      </div>
    </div>
  );
}