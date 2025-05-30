import { getArticleById, getAllArticles } from '@/lib/contentProvider';
import ArticleDetail from '@/components/content/ArticleDetail';
import type { Article } from '@/lib/contentProvider';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';

interface ArticlePageProps {
  params: {
    articleId: string;
  };
}

// This function tells Next.js what dynamic routes to pre-render at build time.
// It's optional but good for SEO and performance for common articles.
export async function generateStaticParams() {
  const articles: Article[] = await getAllArticles();
  return articles.map(article => ({
    articleId: article.id,
  }));
}

// Function to generate dynamic metadata for the page
export async function generateMetadata(
  { params }: ArticlePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const article: Article | undefined = await getArticleById(params.articleId);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The article you are looking for does not exist.',
    };
  }

  // Optionally, you can extend metadata from parent
  // const previousImages = (await parent).openGraph?.images || []

  return {
    title: `${article.title} | Pregnancy Guide`,
    description: article.body.substring(0, 160) + '...', // Create a short description
    openGraph: {
      title: article.title,
      description: article.body.substring(0, 160) + '...',
      // images: ['/some-specific-article-image.jpg', ...previousImages], // If you have images
    },
  };
}


export default async function SingleArticlePage({ params }: ArticlePageProps) {
  const articleId = params.articleId;
  const article: Article | undefined = await getArticleById(articleId);

  if (!article) {
    notFound(); // This will render the nearest not-found.tsx page or a default Next.js 404 page
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ArticleDetail article={article} />
    </div>
  );
}
