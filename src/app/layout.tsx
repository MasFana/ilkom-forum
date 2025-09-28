import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "../components/providers";
import Header from "../components/header";
import Footer from "../components/footer";

const poppins = Geist({
  subsets: ['latin'],
})
export const metadata: Metadata = {
  metadataBase: new URL("https://forum.fana.my.id"),
  title: {
    default: "Ilkom Forum",
    template: "%s • Ilkom Forum",
  },
  description: "Forum sederhana untuk berdiskusi Fasilkom. Made with ❤️ MasFana",
  applicationName: "Ilkom Forum",
  authors: [{ name: "Ilkom Forum" }],
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Ilkom Forum",
    description: "Forum sederhana untuk berdiskusi Fasilkom. Made with ❤️ MasFana",
    url: "/",
    siteName: "Ilkom Forum",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/favicon.ico",
        width: 256,
        height: 256,
        alt: "Ilkom Forum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ilkom Forum",
    description: "Forum sederhana untuk berdiskusi Fasilkom. Made with ❤️ MasFana",
    images: ["/favicon.ico"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={poppins.className}>
      {/* Apply poppins font globally */}
      <body className={`antialiased bg-background text-foreground min-h-screen`}>
        <Providers>
          <Header />
          <div className="mx-auto max-w-3xl min-h-screen">
            <main className="min-h-screen">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
