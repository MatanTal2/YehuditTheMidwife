'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { getUserData, createUserDocument } from '@/lib/firebase/firestore'; // Firestore functions
import { getAllArticles, Article } from '@/lib/contentProvider'; // To get article details for favorites

import DueDateForm from '@/components/dashboard/DueDateForm';
import Checklist from '@/components/dashboard/Checklist';
import Link from 'next/link';
import AuthStateInitializer from '@/components/auth/AuthStateInitializer'; // Ensure auth listener is active

// Helper function to calculate current pregnancy week
const calculatePregnancyWeek = (dueDate: Date | null): number | null => {
  if (!dueDate) return null;
  const today = new Date();
  // Due date is typically 40 weeks from LMP.
  // Pregnancy week is calculated from LMP (Last Menstrual Period).
  // Estimated LMP = Due Date - 280 days (40 weeks)
  const estimatedLMP = new Date(dueDate.getTime() - 280 * 24 * 60 * 60 * 1000);
  const diffInMilliseconds = today.getTime() - estimatedLMP.getTime();
  const weeks = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 7));
  return weeks >= 0 ? weeks + 1 : null; // Weeks are 1-indexed
};

export default function DashboardPage() {
  const router = useRouter();
  const { 
    isLoggedIn, 
    isLoading: authIsLoading, // Auth loading
    uid, 
    email,
    dueDate, 
    favoriteArticleIds, 
    setUserData, 
    setUserDataLoading,
    userDataLoading, // User data specific loading
    userDataError,
    setUserDataError,
    clearUserDataError,
  } = useUserStore((state) => ({
    isLoggedIn: state.isLoggedIn,
    isLoading: state.isLoading,
    uid: state.uid,
    email: state.email,
    dueDate: state.dueDate,
    favoriteArticleIds: state.favoriteArticleIds,
    setUserData: state.setUserData,
    setUserDataLoading: state.setUserDataLoading,
    userDataLoading: state.userDataLoading,
    userDataError: state.userDataError,
    setUserDataError: state.setUserDataError,
    clearUserDataError: state.clearUserDataError,
  }));

  // State for favorite articles details
  const [favoriteArticlesDetails, setFavoriteArticlesDetails] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // Effect to fetch user data from Firestore when UID is available and data hasn't been loaded
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (uid && !dueDate && favoriteArticleIds.length === 0) { // Fetch only if not already populated
        setUserDataLoading(true);
        clearUserDataError();
        try {
          let data = await getUserData(uid);
          if (!data) {
            console.log(`Dashboard: No user data found for ${uid}, attempting to create document.`);
            // This scenario should ideally be handled by the auth listener creating the doc.
            // However, as a fallback:
            if (email) { // We need email to create the document meaningfully
                 await createUserDocument(uid, email);
                 data = await getUserData(uid); // Fetch again
            } else {
                throw new Error("Cannot create user document without email.");
            }
          }
          if (data) {
            setUserData(data); // This will update dueDate, favoriteArticleIds, checklistItems in store
          } else {
             console.warn("Dashboard: User data still not found after attempting creation.");
             setUserDataError("Could not load user profile. Please try again later.");
          }
        } catch (error: any) {
          console.error("Dashboard: Error fetching user data:", error);
          setUserDataError(error.message || "Failed to load dashboard data.");
        } finally {
          setUserDataLoading(false);
        }
      }
    };

    if (isLoggedIn && uid) {
      fetchDashboardData();
    }
  }, [uid, isLoggedIn, setUserData, setUserDataLoading, setUserDataError, clearUserDataError, email, dueDate, favoriteArticleIds]);

  // Effect to redirect if not logged in
  useEffect(() => {
    if (!authIsLoading && !isLoggedIn) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isLoggedIn, authIsLoading, router]);

  // Effect to fetch details of favorite articles
  useEffect(() => {
    const fetchFavoriteArticlesDetails = async () => {
      if (favoriteArticleIds.length > 0) {
        setArticlesLoading(true);
        try {
          const allArticles = await getAllArticles(); // Inefficient if many articles; better to have getArticlesByIds
          const favs = allArticles.filter(article => favoriteArticleIds.includes(article.id));
          setFavoriteArticlesDetails(favs);
        } catch (error) {
          console.error("Error fetching favorite article details:", error);
          // Handle error (e.g., set an error state)
        } finally {
          setArticlesLoading(false);
        }
      } else {
        setFavoriteArticlesDetails([]); // Clear if no IDs
      }
    };
    fetchFavoriteArticlesDetails();
  }, [favoriteArticleIds]);


  // Loading states
  if (authIsLoading || (!isLoggedIn && !userDataError)) { // Show loading if auth is pending or redirecting
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
        <p className="text-gray-700 text-lg">Loading your dashboard...</p>
        {/* Add a spinner or skeleton loader here */}
      </div>
    );
  }
  
  if (!isLoggedIn) { // Should be caught by useEffect redirect, but as a fallback
     return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
        <p className="text-red-600 text-lg">Please log in to view your dashboard.</p>
        <Link href="/login?redirect=/dashboard" legacyBehavior>
            <a className="mt-4 px-6 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">Login</a>
        </Link>
      </div>
    );
  }
  
  const currentWeek = calculatePregnancyWeek(dueDate);

  return (
    <>
      <AuthStateInitializer /> {/* Ensures auth listener is definitely active */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-indigo-800 tracking-tight">
            Welcome to Your Dashboard{email ? `, ${email.split('@')[0]}` : ''}!
          </h1>
          {currentWeek !== null && (
            <p className="mt-3 text-2xl text-pink-600 font-semibold">
              You are in Week {currentWeek} of your pregnancy.
            </p>
          )}
           {dueDate && (
            <p className="mt-1 text-md text-gray-600">
              Estimated Due Date: {dueDate.toLocaleDateString()}
            </p>
          )}
        </header>

        {userDataError && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center" role="alert">
            <span className="font-medium">Error:</span> {userDataError}
          </div>
        )}
        
        {userDataLoading && !dueDate && ( // Show loading only if primary data (like due date) isn't there yet
             (<div className="text-center py-10">
               <p className="text-gray-600">Loading your personalized information...</p>
             </div>)
             (<div className="text-center py-10">
               <p className="text-gray-600">Loading your personalized information...</p>
             </div>)
        )}

        <section id="due-date-section" className="bg-white p-6 rounded-lg shadow-lg">
          <DueDateForm />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section id="favorites-section" className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6">Your Favorite Articles</h2>
            {articlesLoading && <p className="text-gray-500">Loading favorite articles...</p>}
            {!articlesLoading && favoriteArticlesDetails.length > 0 ? (
              <ul className="space-y-3">
                {favoriteArticlesDetails.map(article => (
                  <li key={article.id} className="pb-2 border-b border-gray-200 last:border-b-0">
                    <Link href={`/articles/${article.id}`} legacyBehavior>
                      <a className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium">
                        {article.title}
                      </a>
                    </Link>
                     <p className="text-xs text-gray-500">Weeks: {article.weekRange[0]}-{article.weekRange[1]}</p>
                  </li>
                ))}
              </ul>
            ) : (
              !articlesLoading && <p className="text-gray-500">You haven't saved any favorite articles yet. Explore articles and click the '☆ Favorite' button to save them here!</p>
            )}
             <Link href="/articles" legacyBehavior>
                <a className="mt-6 inline-block text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                    Browse All Articles &rarr;
                </a>
            </Link>
          </section>

          <section id="checklist-section" className="bg-white p-6 rounded-lg shadow-lg">
             <h2 className="text-2xl font-bold text-indigo-700 mb-6">Your Personal Checklist</h2>
            <Checklist />
          </section>
        </div>
      </div>
    </>
  );
}
