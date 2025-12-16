# Deep Dive: Workforce Subdomains Architecture

## Executive Summary
Yes, it is entirely possible to host specialized Agent Dashboards on dedicated subdomains (e.g., `cs.angri.nl`, `marketing.angri.nl`) while keeping the entire codebase within the existing Next.js monorepo.

This architecture is often called "Multi-Tenancy" or "Wildcard Subdomains" and is a standard pattern in modern Next.js applications (similar to Vercel Platforms).

---

## 🏗️ Architecture Blueprint

### 1. Routing Strategy (Middleware)
Instead of having separate deployments, we use **Next.js Middleware** to intercept every request.
-   The user visits `cs.angri.nl`.
-   Middleware detects the hostname.
-   Middleware silently **rewrites** the URL to `/agents/customer-service` (internal route).
-   The user sees the URL as `cs.angri.nl`, but Next.js renders the specific agent page.

### 2. Shared Authentication (SSO)
Currently, cookies are likely set for the exact domain (`app.angri.nl`). For a user to log in once and access `cs.angri.nl` without re-logging:
-   We must configure the **Session Cookie** to be set on the root domain: `.angri.nl`.
-   This allows the session token to be readable across `app.`, `cs.`, and `marketing.` subdomains.

### 3. Specialized Layouts
By rewriting to distinct internal routes (e.g., `app/(agents)/customer-service`), we can define a completely unique `layout.tsx` for each agent.
-   **Customer Service**: Focus on Inbox, Ticket Queues, SLA timers.
-   **Marketing**: Focus on Analytics, Campaign Calendars, A/B Test results.

---

## 🛠️ Implementation Plan

### Step 1: Create Middleware
We need to create `apps/web/middleware.ts` to handle the routing logic.

```typescript
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const url = req.nextUrl;

  // Define your domains
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "angri.nl";
  
  // Check if we are on a subdomain
  // e.g. hostname = "cs.angri.nl" -> subdomain = "cs"
  const currentHost = hostname.replace(`.${ROOT_DOMAIN}`, "");

  // 1. Customer Service Subdomain
  if (currentHost === "cs") {
    // Rewrite all requests to the internal agent route
    url.pathname = `/agents/customer-service${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2. Marketing Subdomain
  if (currentHost === "marketing") {
    url.pathname = `/agents/marketing${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Default: Continue as normal
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)"],
};
```

### Step 2: Configure Shared Cookies
We need to update `apps/web/utils/auth.ts` to ensure cookies are accessible everywhere.

```typescript
// apps/web/utils/auth.ts

export const betterAuthConfig = betterAuth({
  // ...
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30,
    },
    // ADD THIS:
    cookie: {
      domain: process.env.NODE_ENV === "production" ? ".angri.nl" : undefined // or ".localhost"
    }
  },
  // ...
});
```

### Step 3: Deployment (Vercel/DNS)
1.  Add a **Wildcard Domain** in Vercel: `*.angri.nl`.
2.  Point the CNAME/A Record in your DNS provider to Vercel.
3.  The Middleware will handle the rest.

---

## ✅ Feasibility Assessment
-   **Effort**: Medium. Requires moving some files and setting up middleware.
-   **Risk**: Low. It uses standard Next.js primitives.
-   **Benefit**: High. It creates a dedicated, immersive experience for each "Employee" role, making the AI feel more like a specialized tool than just a tab.

## 🚀 Next Actions
If you approve, I can:
1.  Create the `middleware.ts` file.
2.  Set up the folder structure `app/(agents)/...`.
3.  Update the Auth configuration.
