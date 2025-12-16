import { type NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname (e.g. cs.angri.nl or cs.localhost:3000)
  const hostname = req.headers.get("host") || "";

  // Define the root domain
  // In production: "angri.nl"
  // In development: "localhost:3000" or similar
  // We strip the port if present for simpler matching in some cases,
  // but for localhost usually we want to know it's localhost
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "angri.nl";

  // Clean hostname to get the subdomain
  // Case 1: cs.angri.nl -> cs
  // Case 2: cs.localhost:3000 -> cs
  // Case 3: angri.nl -> ""
  // Case 4: localhost:3000 -> ""

  let currentHost = hostname.replace(`.${ROOT_DOMAIN}`, "");

  // Remove port if it exists (for local dev scenarios like cs.localhost:3000)
  if (currentHost.includes(":")) {
    currentHost = currentHost.split(":")[0];
  }

  // If we are on the root domain (or localhost with no subdomain), do nothing
  // Note: if hostname equals ROOT_DOMAIN exactly, replace results in hostname, so check that too
  if (hostname === ROOT_DOMAIN || currentHost === hostname) {
    return NextResponse.next();
  }

  // 1. Customer Service Subdomain ("cs")
  if (currentHost === "cs") {
    // Rewrite logic:
    // cs.angri.nl/ -> /agents/customer-service/
    // cs.angri.nl/some-path -> /agents/customer-service/some-path
    url.pathname = `/agents/customer-service${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2. Marketing Subdomain ("marketing")
  if (currentHost === "marketing") {
    url.pathname = `/agents/marketing${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Default behavior
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, svg, etc.
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};
