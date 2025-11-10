import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskManager Pro",
  description: "Task management application with AWS Cognito authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
