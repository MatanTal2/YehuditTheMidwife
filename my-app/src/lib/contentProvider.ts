import fs from 'fs/promises'; // Using fs.promises for async file operations
import path from 'path';

export interface Article {
  id: string;
  title: string;
  body: string;
  weekRange: [number, number];
  tags: string[];
  createdAt: string; // ISO date string
}

// Path to the JSON file, assuming CWD is the project root ('my-app')
// In Next.js, `process.cwd()` usually points to the project root.
const articlesFilePath = path.join(process.cwd(), 'src', 'data', 'articles.json');

let articlesCache: Article[] | null = null;

/**
 * Reads and parses articles.json. Implements in-memory caching.
 */
async function loadArticles(): Promise<Article[]> {
  if (articlesCache) {
    return articlesCache;
  }
  try {
    const fileData = await fs.readFile(articlesFilePath, 'utf-8');
    const jsonData = JSON.parse(fileData) as Article[];
    articlesCache = jsonData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest first
    return articlesCache;
  } catch (error) {
    console.error("Failed to load or parse articles.json:", error);
    // In a real app, you might want to throw the error or handle it more gracefully
    // For this example, we'll return an empty array if loading fails.
    return [];
  }
}

/**
 * Gets all articles, sorted by creation date (newest first).
 */
export async function getAllArticles(): Promise<Article[]> {
  return await loadArticles();
}

/**
 * Gets a single article by its ID.
 */
export async function getArticleById(id: string): Promise<Article | undefined> {
  const articles = await loadArticles();
  return articles.find(article => article.id === id);
}

/**
 * Gets all articles relevant to a specific week number.
 * An article is relevant if the given week falls within its weekRange (inclusive).
 */
export async function getArticlesByWeek(weekNumber: number): Promise<Article[]> {
  const articles = await loadArticles();
  const numericWeekNumber = Number(weekNumber); // Ensure weekNumber is a number

  if (isNaN(numericWeekNumber)) {
    console.warn(`Invalid weekNumber provided: ${weekNumber}. Returning no articles.`);
    return [];
  }
  
  return articles.filter(article => 
    numericWeekNumber >= article.weekRange[0] && numericWeekNumber <= article.weekRange[1]
  );
}

/**
 * (Optional) Utility to get all unique tags from articles.
 */
export async function getAllTags(): Promise<string[]> {
  const articles = await loadArticles();
  const allTags = new Set<string>();
  articles.forEach(article => {
    article.tags.forEach(tag => allTags.add(tag));
  });
  return Array.from(allTags).sort();
}

/**
 * (Optional) Gets all articles that include a specific tag.
 */
export async function getArticlesByTag(tag: string): Promise<Article[]> {
    const articles = await loadArticles();
    return articles.filter(article => article.tags.includes(tag));
}

// Note: For a client-side only data source (e.g., if this file was in `public` and fetched with `fetch`),
// the `fs` module wouldn't be available. This implementation assumes server-side data fetching
// or build-time data fetching (like with `getStaticProps` in older Next.js or RSCs now).
// Since Next.js App Router components are server components by default, `fs` can be used.
