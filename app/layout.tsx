import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Zenith - Scroll-Driven Automotive Experience',
  description: 'An ultra-premium, scroll-driven interactive hero section animation and showcase for a futuristic electric supercar.',
  openGraph: {
    title: 'Zenith - Scroll-Driven Automotive Experience',
    description: 'An ultra-premium, scroll-driven interactive hero section animation and showcase for a futuristic electric supercar.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zenith - Scroll-Driven Automotive Experience',
    description: 'An ultra-premium, scroll-driven interactive hero section animation and showcase for a futuristic electric supercar.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
