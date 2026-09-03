import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orchestrate — AI Workflow Builder",
  description:
    "A professional AI workflow orchestration builder for designing, connecting and running AI pipelines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}
