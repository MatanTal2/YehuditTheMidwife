'use client';

import { useUserStore } from '@/store/useUserStore';
import { addFavoriteArticle, removeFavoriteArticle } from '@/lib/firebase/firestore';
import { useState, useEffect } from 'react';

interface FavoriteArticleButtonProps {
  articleId: string;
}

const FavoriteArticleButton: React.FC<FavoriteArticleButtonProps> = ({ articleId }) => {
  const { 
    uid, 
    isLoggedIn, 
    favoriteArticleIds, 
    addFavoriteId: addFavoriteToStore, 
    removeFavoriteId: removeFavoriteFromStore,
    setUserDataLoading, // To indicate background activity
    setUserDataError,
    clearUserDataError,
  } = useUserStore((state) => ({
    uid: state.uid,
    isLoggedIn: state.isLoggedIn,
    favoriteArticleIds: state.favoriteArticleIds,
    addFavoriteId: state.addFavoriteId,
    removeFavoriteId: state.removeFavoriteId,
    setUserDataLoading: state.setUserDataLoading,
    setUserDataError: state.setUserDataError,
    clearUserDataError: state.clearUserDataError,
  }));

  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Local loading for button action

  useEffect(() => {
    setIsFavorite(favoriteArticleIds.includes(articleId));
  }, [favoriteArticleIds, articleId]);

  const handleToggleFavorite = async () => {
    if (!uid || !isLoggedIn) {
      // This button should ideally not be shown or be disabled if not logged in.
      // If it is shown, perhaps prompt to log in.
      setUserDataError("Please log in to save favorites.");
      return;
    }

    clearUserDataError();
    setIsLoading(true);
    setUserDataLoading(true); // Indicate global user data operation

    try {
      if (isFavorite) {
        await removeFavoriteArticle(uid, articleId);
        removeFavoriteFromStore(articleId);
      } else {
        await addFavoriteArticle(uid, articleId);
        addFavoriteToStore(articleId);
      }
      setIsFavorite(!isFavorite); // Optimistic update of local state
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      setUserDataError(error.message || "Failed to update favorites.");
      // Revert optimistic update if error
      // setIsFavorite(isFavorite); // This would revert, but might be confusing.
      // Better to rely on useEffect to sync with store state if store is source of truth.
    } finally {
      setIsLoading(false);
      setUserDataLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null; // Or a disabled button, or a "Login to favorite" prompt
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isFavorite 
                    ? 'bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-300' 
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-300'}`}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isLoading ? (isFavorite ? 'Removing...' : 'Adding...') : (isFavorite ? '★ Unfavorite' : '☆ Favorite')}
    </button>
  );
};

export default FavoriteArticleButton;
