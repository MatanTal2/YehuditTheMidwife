import type { Article } from '@/lib/contentProvider';
import Link from 'next/link';
import FavoriteArticleButton from './FavoriteArticleButton'; // Import the button

interface ArticleDetailProps {
  article: Article;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article }) => {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="prose prose-indigo lg:prose-xl max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <header className="mb-8 border-b pb-4">
        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-800 sm:text-5xl">
            {article.title}
          </h1>
          <div className="ml-4 mt-1 flex-shrink-0">
            <FavoriteArticleButton articleId={article.id} />
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-500">
          <p>Applicable for Pregnancy Weeks: {article.weekRange[0]} - {article.weekRange[1]}</p>
          <p>Published on: {formattedDate}</p>
        </div>
      </header>
      <div className="text-gray-700 leading-relaxed">
        {/* Using dangerouslySetInnerHTML for demonstration if body contains HTML.
            If body is plain text, just {article.body} is fine and safer.
            For production, sanitize HTML if it comes from untrusted sources. */}
        {article.body.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">{paragraph}</p>
        ))}
      </div>
      {article.tags && article.tags.length > 0 && (
        <footer className="mt-10 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Related Topics:</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <Link href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`} key={tag} legacyBehavior>
                <a className="px-3 py-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-full hover:bg-indigo-200 transition-colors">
                  {tag}
                </a>
              </Link>
            ))}
          </div>
        </footer>
      )}
      <div className="mt-8">
       <Link href="/articles" legacyBehavior>
         <a className="text-indigo-600 hover:text-indigo-800 hover:underline">
           &larr; Back to All Articles
         </a>
       </Link>
     </div>
    </article>
  );
};

export default ArticleDetail;
