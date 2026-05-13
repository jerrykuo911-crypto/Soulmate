import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Soul Mate · 心靈伴侶',
  description: '你的專屬心靈伴侶，隨時傾聽你的心聲',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="font-sans">{children}</body>
    </html>
  );
}
