# Deep Dive: Workforce Subdomains Architecture (Self-Hosted)

## Executive Summary
You are hosting Inbox Zero on your own server using **Docker Compose** and **Nginx**.
Enabling specialized subdomains (e.g., `cs.angri.nl`, `marketing.angri.nl`) is **fully supported** by your current architecture.

The logic relies on **Next.js Middleware** to route traffic, which works independently of where it is hosted (Vercel, VPS, or bare metal), as long as the traffic reaches your container.

---

## 🏗️ Architecture Blueprint

### 1. DNS Configuration (Your Registrar)
You must point your subdomains to your server's IP address.
*   **A Record**: `angri.nl` -> `[Your Server IP]`
*   **CNAME/A Record**: `*.angri.nl` -> `[Your Server IP]` (Wildcard entry)
    *   *Alternatively, add specific CNAMEs for `cs`, `marketing`, etc.*

### 2. Nginx Configuration (Reverse Proxy)
Your current `nginx/nginx.conf` is already compatible!
It listens on port 80 and forwards traffic to the `web` container.
Crucially, it passes the original Host header:
```nginx
proxy_set_header Host $host;
```
This means if a user visits `cs.angri.nl`, the Next.js app inside the container receives "cs.angri.nl" as the host, allowing the Middleware to detect it.

### 3. Next.js Middleware (Routing)
Inside the `web` container, Next.js Middleware intercepts the request.
-   It reads the `Host` header (e.g., `cs.angri.nl`).
-   It **rewrites** the URL to the internal agent dashboard (e.g., `/agents/customer-service`).
-   This happens transparently on the server side; the URL in the browser remains `cs.angri.nl`.

---

## 🛠️ Implementation Plan

### Step 1: Create Middleware
Create `apps/web/middleware.ts` to handle the routing logic.

```typescript
import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const url = req.nextUrl;

  // Define your domains
  // In dev: localhost:3000, cs.localhost:3000
  // In prod: angri.nl, cs.angri.nl
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "angri.nl";
  
  // Check if we are on a subdomain
  // e.g. hostname = "cs.angri.nl" -> subdomain = "cs"
  // Note: Handle port numbers for local dev
  const currentHost = hostname
    .replace(`.${ROOT_DOMAIN}`, "")
    .replace(`:3000`, "");

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
Update `apps/web/utils/auth.ts` to ensure the session cookie works across all subdomains.

```typescript
// apps/web/utils/auth.ts

export const betterAuthConfig = betterAuth({
  // ...
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30,
    },
    cookie: {
      // Allow cookie sharing across subdomains
      // In production, this will set the cookie on ".angri.nl"
      domain: process.env.NODE_ENV === "production" ? ".angri.nl" : undefined 
    }
  },
  // ...
});
```

### Step 3: Docker & Environment
Ensure your `docker-compose.yml` passes the correct `NEXT_PUBLIC_ROOT_DOMAIN` to the container.

```yaml
  web:
    environment:
      NEXT_PUBLIC_BASE_URL: https://angri.nl
      NEXT_PUBLIC_ROOT_DOMAIN: angri.nl
```

---

## ✅ Feasibility Assessment
-   **Effort**: Medium.
-   **Risk**: Low. Nginx is already correctly configured to pass Host headers.
-   **Benefit**: High. Allows for a professional, multi-dashboard experience (CS, Marketing, HR) running from a single Docker container.

## 🚀 Next Actions
1.  Add `NEXT_PUBLIC_ROOT_DOMAIN` to your `.env`.
2.  Implement the `middleware.ts`.
3.  Update `utils/auth.ts`.
