# RSS Feed Setup Guide

## Overview
An RSS feed card has been added to the main dashboard to display news and updates about your application. Users will see the latest 5 posts from your RSS feed.

## Setup Instructions

### 1. Add RSS Feed URL to Environment Variables

Add this to your `.env` file:

```bash
RSS_FEED_URL=https://yourblog.com/rss
```

### 2. Recommended RSS Feed Tools

Here are the best tools to create and manage your RSS feed:

#### **Option 1: Ghost (Recommended) 🌟**
- **Website**: https://ghost.org
- **Why**: Professional blogging platform with built-in RSS
- **Pricing**: Self-hosted (free) or hosted ($9-$199/month)
- **RSS URL**: `https://yourblog.com/rss`
- **Features**:
  - Built-in RSS feed
  - SEO optimized
  - Newsletter integration
  - Modern editor
  - Categories/tags support

#### **Option 2: WordPress**
- **Website**: https://wordpress.org
- **Why**: Most popular CMS with automatic RSS
- **Pricing**: Free (self-hosted) or WordPress.com ($4-$45/month)
- **RSS URL**: `https://yourblog.com/feed`
- **Features**:
  - Automatic RSS generation
  - Thousands of plugins
  - Easy to use
  - Large community

#### **Option 3: Medium**
- **Website**: https://medium.com
- **Why**: Simple, no setup required
- **Pricing**: Free
- **RSS URL**: `https://medium.com/feed/@yourusername`
- **Features**:
  - Zero setup
  - Built-in audience
  - Clean design
  - Free to use

#### **Option 4: Substack**
- **Website**: https://substack.com
- **Why**: Newsletter + blog in one
- **Pricing**: Free (10% fee on paid subscriptions)
- **RSS URL**: `https://yourname.substack.com/feed`
- **Features**:
  - Newsletter + RSS
  - Email subscribers
  - Monetization options
  - Simple interface

#### **Option 5: Static Site Generators**

**Hugo** (https://gohugo.io)
- Free, fast static site generator
- Built-in RSS support
- RSS URL: `https://yoursite.com/index.xml`

**Jekyll** (https://jekyllrb.com)
- GitHub Pages compatible
- Automatic RSS with jekyll-feed plugin
- RSS URL: `https://yoursite.com/feed.xml`

**Astro** (https://astro.build)
- Modern static site builder
- RSS plugin available
- RSS URL: Customizable

#### **Option 6: Headless CMS**

**Strapi** (https://strapi.io)
- Open-source headless CMS
- RSS plugin available
- Self-hosted or cloud

**Contentful** (https://contentful.com)
- Headless CMS with API
- Can generate RSS via API
- Free tier available

### 3. RSS Feed Format

Your RSS feed should follow this XML structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Your App Updates</title>
    <link>https://yourapp.com</link>
    <description>Latest news and updates</description>
    <item>
      <title>New Feature: Integration Marketplace</title>
      <link>https://yourapp.com/blog/integration-marketplace</link>
      <description>We've launched a new integration marketplace...</description>
      <pubDate>Mon, 16 Dec 2024 10:00:00 GMT</pubDate>
      <category>Feature</category>
    </item>
    <item>
      <title>Performance Improvements</title>
      <link>https://yourapp.com/blog/performance-update</link>
      <description>Dashboard loading is now 50% faster...</description>
      <pubDate>Fri, 13 Dec 2024 14:30:00 GMT</pubDate>
      <category>Update</category>
    </item>
  </channel>
</rss>
```

### 4. Quick Start with Ghost (Recommended)

1. **Sign up for Ghost**:
   ```bash
   # Self-hosted option
   npm install ghost-cli@latest -g
   ghost install local
   ```

2. **Create your blog posts** in Ghost admin panel

3. **Get your RSS URL**: `https://yourblog.ghost.io/rss`

4. **Add to .env**:
   ```bash
   RSS_FEED_URL=https://yourblog.ghost.io/rss
   ```

### 5. Testing Your RSS Feed

Test your RSS feed before adding it:

1. Visit your RSS URL in a browser
2. You should see XML content
3. Use an RSS validator: https://validator.w3.org/feed/

### 6. Publishing Updates

To publish a new update:

1. Write your blog post in your chosen platform
2. Publish it
3. The RSS feed updates automatically
4. Your dashboard will show the update within 1 hour (cache time)

### 7. Customization

You can customize the RSS feed card by editing:
- `/root/inbox-zero/apps/web/app/(app)/[emailAccountId]/dashboard/RssFeedCard.tsx`

Options to customize:
- Number of items shown (currently 5)
- Card styling
- Date format
- Add images
- Change layout

### 8. API Endpoint

The RSS feed is fetched via:
- **Endpoint**: `/api/rss-feed`
- **Cache**: 1 hour
- **File**: `/root/inbox-zero/apps/web/app/api/rss-feed/route.ts`

## Best Practices

1. **Post Regularly**: Keep users engaged with weekly or bi-weekly updates
2. **Use Categories**: Tag posts as "Feature", "Update", "Bug Fix", etc.
3. **Keep Descriptions Short**: 1-2 sentences work best
4. **Include Links**: Always link to full blog post
5. **Use Clear Titles**: Make it obvious what the update is about

## Example Content Ideas

- New feature announcements
- Performance improvements
- Bug fixes
- Security updates
- Integration additions
- Tips and tricks
- Product roadmap updates
- Company news

## Support

If you need help setting up your RSS feed, the Ghost documentation is excellent:
https://ghost.org/docs/

For RSS feed format questions:
https://www.rssboard.org/rss-specification
