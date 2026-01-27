import { useState, useEffect } from 'react';
import { getPublicProfile, getUserReviews, followUser, unfollowUser, checkFollowStatus, getProfileStats, getMatchPercentage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function usePublicProfileLogic(username) {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [compatibility, setCompatibility] = useState(0);
  
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileData, reviewsData] = await Promise.all([
            getPublicProfile(username),
            getUserReviews(username)
        ]);
        
        if (profileData && profileData.uid) {
            const stats = await getProfileStats(profileData.uid);
            
            profileData.followersCount = stats.followersCount;
            profileData.followingCount = stats.followingCount;
            
            profileData.xp = stats.totalXp || stats.xp || 0;
            profileData.levelProgress = stats.xp || 0; 
            
            profileData.totalXp = stats.totalXp || 0;
            profileData.level = stats.level || 1;
            profileData.levelTitle = stats.levelTitle;
            profileData.trophies = stats.trophies || [];

            if (user) {
                const [followStatus, matchData] = await Promise.all([
                    checkFollowStatus(profileData.uid),
                    getMatchPercentage(profileData.uid)
                ]);
                
                setIsFollowing(followStatus.isFollowing);
                setCompatibility(matchData.percentage || 0);
            }
        }

        setProfile(profileData);
        setReviews(reviewsData);

      } catch (error) {
        toast.error('Erro', 'Não foi possível carregar o perfil.');
      } finally {
        setLoading(false);
      }
    };

    if (username) loadData();
  }, [username, user]);

  const handleFollow = async () => {
    if (!profile?.uid) return;

    const previousState = isFollowing;
    setIsFollowing(!previousState); 

    setProfile(prev => ({
        ...prev,
        followersCount: previousState ? (prev.followersCount - 1) : (prev.followersCount + 1)
    }));

    try {
      if (previousState) {
        await unfollowUser(profile.uid);
        toast.info('Deixou de seguir', `Você não está mais seguindo ${profile.name}.`);
      } else {
        await followUser(profile.uid);
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
    loading,
    compatibility,
    actions: {
        handleFollow
    }
  };
}