import { getArticlesByWeek, getAllArticles } from '@/lib/contentProvider';
import ArticleCard from '@/components/content/ArticleCard';
import type { Article } from '@/lib/contentProvider';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PregnancyByWeekPageProps {
  params: {
    week: string; // Week number from the URL
  };
}

// This function tells Next.js what dynamic routes to pre-render at build time.
// It's optional. Here, we could pre-render for weeks 1-40.
export async function generateStaticParams() {
  // Create params for weeks 1 through 40
  const weekParams = Array.from({ length: 40 }, (_, i) => ({
    week: (i + 1).toString(),
  }));

  // Optionally, get all articles and find unique weeks mentioned in weekRange
  // to be more precise about which pages to generate based on content.
  // const articles = await getAllArticles();
  // const uniqueWeeks = new Set<string>();
  // articles.forEach(article => {
  //   for (let w = article.weekRange[0]; w <= article.weekRange[1]; w++) {
  //     uniqueWeeks.add(w.toString());
  //   }
  // });
  // const articleBasedWeekParams = Array.from(uniqueWeeks).map(w => ({ week: w }));

  return weekParams; // Or articleBasedWeekParams if preferred
}

export async function generateMetadata(
  { params }: PregnancyByWeekPageProps
): Promise<Metadata> {
  const weekNumber = parseInt(params.week, 10);

  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 42) { // Max reasonable week
    return {
      title: 'Invalid Week',
      description: 'The specified pregnancy week is invalid.',
    };
  }

  return {
    title: `Pregnancy Week ${weekNumber} | Articles & Information`,
    description: `Find articles and information relevant to week ${weekNumber} of pregnancy.`,
  };
}

export default async function PregnancyByWeekPage({ params }: PregnancyByWeekPageProps) {
  const weekNumberStr = params.week;
  const weekNumber = parseInt(weekNumberStr, 10);

  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 42) { // Validate week range (e.g., 1-42)
    notFound(); // Or display a message about invalid week
  }

  const articles: Article[] = await getArticlesByWeek(weekNumber);

  const prevWeek = weekNumber > 1 ? weekNumber - 1 : null;
  const nextWeek = weekNumber < 42 ? weekNumber + 1 : null; // Assuming 42 as a practical upper limit

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-indigo-800 tracking-tight">
        Pregnancy: Week {weekNumber}
      </h1>
      
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-10 p-4 bg-indigo-50 rounded-lg">
        {prevWeek ? (
          <Link href={`/pregnancy-by-week/${prevWeek}`} legacyBehavior>
            <a className="px-6 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors text-sm sm:text-base">
              &larr; Week {prevWeek}
            </a>
          </Link>
        ) : (
          <span className="px-6 py-2 text-gray-400 bg-gray-200 rounded-md cursor-not-allowed text-sm sm:text-base">&larr; Week 0</span>
        )}
        <span className="text-lg font-semibold text-indigo-700">Currently Viewing: Week {weekNumber}</span>
        {nextWeek ? (
          <Link href={`/pregnancy-by-week/${nextWeek}`} legacyBehavior>
            <a className="px-6 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors text-sm sm:text-base">
              Week {nextWeek} &rarr;
            </a>
          </Link>
        ) : (
          <span className="px-6 py-2 text-gray-400 bg-gray-200 rounded-md cursor-not-allowed text-sm sm:text-base">Week {weekNumber + 1} &rarr;</span>
        )}
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">No specific articles found for week {weekNumber}.</p>
          <p className="mt-2 text-gray-500">
            You can still <Link href="/articles" legacyBehavior><a className="text-indigo-600 hover:underline">browse all articles</a></Link>.
          </p>
        </div>
      )}
    </div>
  );
}
