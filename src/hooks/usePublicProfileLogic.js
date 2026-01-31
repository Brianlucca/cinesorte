import { useState, useEffect } from 'react';
import { 
    getPublicProfile, 
    getUserReviews, 
    followUser, 
    unfollowUser, 
    checkFollowStatus,
    getMatchPercentage 
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function usePublicProfileLogic(username) {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followsYou, setFollowsYou] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [compatibility, setCompatibility] = useState(0);
  
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [profileData, reviewsData] = await Promise.all([
            getPublicProfile(username),
            getUserReviews(username)
        ]);
        
        if (!isMounted) return;

        if (profileData) {
            const formattedProfile = {
                ...profileData,
                createdAt: profileData.createdAt && profileData.createdAt._seconds 
                    ? new Date(profileData.createdAt._seconds * 1000) 
                    : new Date(profileData.createdAt || Date.now()),
                trophies: profileData.trophies || []
            };

            if (user && user.username !== username) {
                try {
                    const [followStatus, matchData] = await Promise.all([
                        checkFollowStatus(username),
                        getMatchPercentage(username)
                    ]);
                    
                    if (isMounted) {
                        setIsFollowing(followStatus.isFollowing);
                        setFollowsYou(followStatus.followsYou);
                        setCompatibility(matchData.percentage || 0);
                    }
                } catch (err) {
                }
            }

            setProfile(formattedProfile);
            setReviews(reviewsData);
        }

      } catch (error) {
        if (isMounted) {
            toast.error('Erro', 'Perfil não encontrado ou erro de conexão.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (username) loadData();

    return () => { isMounted = false; };
  }, [username, user?.username]); 

  const handleFollow = async () => {
    if (!username || !user) return;

    const previousState = isFollowing;
    setIsFollowing(!previousState); 

    setProfile(prev => ({
        ...prev,
        followersCount: previousState ? (prev.followersCount - 1) : (prev.followersCount + 1)
    }));

    try {
      if (previousState) {
        await unfollowUser(username);
        toast.info('Deixou de seguir', `Você não está mais seguindo ${profile.name}.`);
      } else {
        await followUser(username);
        toast.success('Seguindo', `Você agora segue ${profile.name}!`);
      }
    } catch (error) {
      setIsFollowing(previousState);
      setProfile(prev => ({
        ...prev,
        followersCount: previousState ? (prev.followersCount + 1) : (prev.followersCount - 1)
      }));
      toast.error('Erro', 'Não foi possível realizar a ação.');
    }
  };

  return {
    profile,
    reviews,
    isFollowing,
    followsYou,
    loading,
    compatibility,
    actions: { handleFollow }
  };
}