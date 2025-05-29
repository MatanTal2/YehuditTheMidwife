import Link from 'next/link';
import type { Article } from '@/lib/contentProvider'; // Assuming Article type is exported

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  // Create a short snippet from the body
  const snippet = article.body.length > 100 
    ? article.body.substring(0, 100) + '...' 
    : article.body;

  return (
    <Link href={`/articles/${article.id}`} legacyBehavior>
      <a className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 transition-colors duration-150 ease-in-out">
        <h3 className="mb-2 text-2xl font-bold tracking-tight text-indigo-700 hover:text-indigo-800">
          {article.title}
        </h3>
        <p className="font-normal text-gray-700 mb-3">
          {snippet}
        </p>
        <div className="text-sm text-gray-500">
          <p>Applicable Weeks: {article.weekRange[0]} - {article.weekRange[1]}</p>
          {article.tags && article.tags.length > 0 && (
            <p className="mt-1">Tags: {article.tags.join(', ')}</p>
          )}
        </div>
      </a>
    </Link>
  );
};

export default ArticleCard;
