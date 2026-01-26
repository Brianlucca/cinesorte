import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

export function useReviewLike(review) {
  const { user } = useAuth()
  const toast = useToast()

  const [isLiked, setIsLiked] = useState(!!review.isLikedByCurrentUser)
  const [likesCount, setLikesCount] = useState(review.likesCount ?? 0)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    setIsLiked(!!review.isLikedByCurrentUser)
    setLikesCount(review.likesCount ?? 0)
  }, [review.id, review.isLikedByCurrentUser, review.likesCount])

  const toggleLike = async () => {
    if (!user || isProcessing) {
      if (!user) toast.error('Login necessário', 'Entre para curtir.')
      return
    }

    const prevLiked = isLiked
    const prevCount = likesCount

    const nextLiked = !prevLiked
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1)

    setIsLiked(nextLiked)
    setLikesCount(nextCount)
    setIsProcessing(true)

    try {
      if (nextLiked) {
        await api.post(`/social/reviews/${review.id}/like`)
      } else {
        await api.delete(`/social/reviews/${review.id}/like`)
      }
    } catch {
      setIsLiked(prevLiked)
      setLikesCount(prevCount)
      toast.error('Erro', 'Não foi possível completar a ação.')
    } finally {
      setIsProcessing(false)
    }
  }

  return { isLiked, likesCount, toggleLike, isProcessing }
}
