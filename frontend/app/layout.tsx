import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduCast — Turn Homework into Podcast Videos",
  description:
    "Upload any school homework and get an AI-generated educational podcast video that explains every concept from scratch.",
  openGraph: {
    title: "EduCast",
    description: "Turn your homework into an educational podcast video with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1f1a14",
              color: "#fdf6e3",
              border: "1px solid rgba(232,168,56,0.15)",
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
