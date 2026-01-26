import { Heart } from 'lucide-react'
import { useReviewLike } from '../../hooks/useReviewLike'

export default function ReviewLikeButton({ review }) {
  const { isLiked, likesCount, toggleLike, isProcessing } = useReviewLike(review)

  return (
    <button
      onClick={toggleLike}
      disabled={isProcessing}
      className={`pointer-events-auto group flex items-center gap-1.5 transition-all duration-300 ${
        isProcessing ? 'opacity-70 cursor-wait' : 'cursor-pointer hover:scale-105'
      }`}
      title={isLiked ? 'Descurtir' : 'Curtir'}
    >
      <div
        className={`p-2 rounded-full transition-colors ${
          isLiked
            ? 'bg-red-500/10 text-red-600'
            : 'bg-transparent text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-300'
        }`}
      >
        <Heart
          size={20}
          className={`transition-all duration-300 ${
            isLiked ? 'fill-red-600 scale-110' : 'fill-transparent'
          }`}
        />
      </div>

      {likesCount > 0 && (
        <span
          className={`text-sm font-bold transition-colors ${
            isLiked
              ? 'text-red-500'
              : 'text-zinc-500 group-hover:text-zinc-300'
          }`}
        >
          +{likesCount}
        </span>
      )}
    </button>
  )
}
