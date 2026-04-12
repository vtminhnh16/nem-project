import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Nem Exam Practice",
  description: "Trình tạo bài thi học kỳ bằng AI cho các bé",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${nunito.variable} h-full antialiased`}
    >
      <body style={{ fontFamily: 'var(--font-nunito), sans-serif' }} className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
