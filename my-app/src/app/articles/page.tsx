import { getAllArticles } from '@/lib/contentProvider';
import ArticleCard from '@/components/content/ArticleCard';
import type { Article } from '@/lib/contentProvider'; // For type hinting

// This page will be a Server Component by default in the App Router.
export default async function AllArticlesPage() {
  const articles: Article[] = await getAllArticles();

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">All Articles</h1>
        <p className="text-gray-600">No articles found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-12 text-indigo-800 tracking-tight">
        Explore All Our Articles
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

// Optional: Metadata for the page
export const metadata = {
  title: 'All Articles | Pregnancy Guide',
  description: 'Browse all articles related to pregnancy, childbirth, and early parenthood.',
};
