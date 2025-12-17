import { NextResponse } from "next/server";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("rss-feed");

// Your RSS feed URL - update this with your actual feed URL
const RSS_FEED_URL =
  process.env.RSS_FEED_URL || "https://blog.yourdomain.com/rss";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    // Fetch the RSS feed
    const response = await fetch(RSS_FEED_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }

    const xmlText = await response.text();

    // Parse RSS XML
    const items = parseRssFeed(xmlText);

    return NextResponse.json({ items });
  } catch (error) {
    logger.error("Error fetching RSS feed", { error });
    return NextResponse.json(
      { items: [], error: "Failed to fetch news feed" },
      { status: 500 },
    );
  }
}

function parseRssFeed(xmlText: string) {
  const items: Array<{
    title: string;
    link: string;
    pubDate: string;
    description: string;
    category?: string;
  }> = [];

  try {
    // Simple regex-based XML parsing for RSS
    // For production, consider using a proper XML parser library
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const matches = xmlText.matchAll(itemRegex);

    for (const match of matches) {
      const itemXml = match[1];

      const title = extractTag(itemXml, "title");
      const link = extractTag(itemXml, "link");
      const pubDate = extractTag(itemXml, "pubDate");
      const description = extractTag(itemXml, "description");
      const category = extractTag(itemXml, "category");

      if (title && link && pubDate) {
        items.push({
          title: cleanText(title),
          link: cleanText(link),
          pubDate,
          description: cleanText(description) || "",
          category: category ? cleanText(category) : undefined,
        });
      }
    }
  } catch (error) {
    logger.error("Error parsing RSS feed", { error });
  }

  return items;
}

function extractTag(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = xml.match(regex);
  return match ? match[1] : "";
}

function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}
