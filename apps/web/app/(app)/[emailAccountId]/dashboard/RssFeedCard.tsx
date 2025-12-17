"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RssIcon, ExternalLinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RssFeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  category?: string;
}

export function RssFeedCard() {
  const [feedItems, setFeedItems] = useState<RssFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRssFeed() {
      try {
        const response = await fetch("/api/rss-feed");
        if (!response.ok) throw new Error("Failed to fetch RSS feed");
        const data = await response.json();
        setFeedItems(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load news");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRssFeed();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RssIcon className="h-5 w-5" />
            Latest Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || feedItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RssIcon className="h-5 w-5" />
            Latest Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {error || "No updates available at the moment"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RssIcon className="h-5 w-5" />
          Latest Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedItems.slice(0, 5).map((item, index) => (
            <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold leading-tight hover:text-primary transition-colors">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {item.title}
                      </a>
                    </h4>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.pubDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ExternalLinkIcon className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
