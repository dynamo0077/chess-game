import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chess Arena - Online & Offline Chess Game',
  description: 'Play chess with friends online or offline. Full chess rules with undo and rematch features.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
