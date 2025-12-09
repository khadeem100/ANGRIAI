import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AxiomWebVitals } from "next-axiom";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics as DubAnalytics } from "@dub/analytics/react";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import type { WebApplication, WithContext } from "schema-dts";
import "../styles/globals.css";
import { PostHogPageview, PostHogProvider } from "@/providers/PostHogProvider";
import { env } from "@/env";
import { GlobalProviders } from "@/providers/GlobalProviders";
import { UTM } from "@/app/utm";
import { startupImage } from "@/app/startup-image";
import { Toaster } from "@/components/Toast";

const aeonikFont = localFont({
  src: "../styles/aeonik-medium.woff",
  variable: "--font-title",
  preload: true,
  display: "swap",
});
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"], // font-normal, font-medium, font-semibold, font-bold
  display: "swap",
});

const title = "Angri - #1 AI Email Assistent | Bereik Inbox Zero";
const description =
  "Stop met verdrinken in e-mail. Angri gebruikt geavanceerde AI om je inbox te organiseren, e-mails automatisch te beantwoorden en spam te verwijderen.";

// JSON-LD structured data
const jsonLd: WithContext<WebApplication> = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Angri AI",
  url: env.NEXT_PUBLIC_BASE_URL || "https://angri.nl",
  description: description,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web Browser",
  inLanguage: "nl-NL",
  offers: {
    "@type": "Offer",
    price: "0.00",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "AI Email Assistent",
    "Slimme Antwoordsuggesties",
    "Automatisch Uitschrijven",
    "Koude Email Blokkering",
    "Privacy Vriendelijk (SOC 2)",
    "Gmail & Outlook Integratie",
  ],
  publisher: {
    "@type": "Organization",
    name: "Tynktech",
    url: "https://www.tynktech.nl",
    logo: {
      "@type": "ImageObject",
      url: `${env.NEXT_PUBLIC_BASE_URL || "https://angri.nl"}/icon.png`,
    },
    sameAs: [
      "https://x.com/inboxzero_ai",
      "https://github.com/khadeem100/inbox-zero",
    ],
  },
};

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s | Angri AI",
  },
  description,
  keywords: [
    "AI email",
    "Inbox Zero",
    "Email productivity",
    "Angri",
    "Tynktech",
  ],
  openGraph: {
    title,
    description,
    siteName: "Angri AI",
    type: "website",
    locale: "nl_NL",
    url: "https://angri.nl",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@inboxzero_ai",
  },
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
  // issues with robots.txt: https://github.com/vercel/next.js/issues/58615#issuecomment-1852457285
  robots: {
    index: true,
    follow: true,
  },
  // pwa
  applicationName: "Angri AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Angri AI",
    startupImage,
  },
  formatDetection: {
    telephone: false,
  },
  // safe area for iOS PWA
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "white-translucent",
  },
};

export const viewport = {
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`h-full ${env.NEXT_PUBLIC_USE_AEONIK_FONT ? aeonikFont.variable : ""} ${geist.variable} font-sans antialiased`}
      >
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify on controlled object is safe
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <PostHogProvider>
          <Suspense>
            <PostHogPageview />
          </Suspense>
          <GlobalProviders>
            {children}
            <Toaster closeButton richColors theme="light" visibleToasts={9} />
          </GlobalProviders>
        </PostHogProvider>
        <Analytics />
        <AxiomWebVitals />
        <UTM />
        <SpeedInsights />
        {env.NEXT_PUBLIC_DUB_REFER_DOMAIN && (
          <DubAnalytics
            apiHost="/_proxy/dub"
            scriptProps={{ src: "/_proxy/dub/script.js" }}
            domainsConfig={{ refer: env.NEXT_PUBLIC_DUB_REFER_DOMAIN }}
          />
        )}
        {env.NEXT_PUBLIC_GTM_ID ? (
          <GoogleTagManager gtmId={env.NEXT_PUBLIC_GTM_ID} />
        ) : null}
      </body>
    </html>
  );
}
