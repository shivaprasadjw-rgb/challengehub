import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Sports India Events",
    template: "%s | Sports India Events",
  },
  description: "Browse, register and track sports tournaments across India. Search by sport, city, venue or Tournament ID.",
  openGraph: {
    title: "Sports India Events",
    description: "Browse, register and track sports tournaments across India.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <main className="container-responsive mt-6 mb-12">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
