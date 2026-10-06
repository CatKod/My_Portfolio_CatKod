import type { Metadata } from 'next';
import './globals.css';
import PortfolioShell from '@/components/PortfolioShell';
import InitialLoader from '@/components/InitialLoader';
import DotField from '@/components/DotField';
import TargetCursor from '@/components/TargetCursor';
import { LanguageProvider } from '@/components/LanguageProvider';

export const metadata: Metadata = {
  title: 'Hoàng Kim Vĩnh | Portfolio 2026',
  description:
    'Portfolio 2026 cho Hoàng Kim Vĩnh (CatKod) — full-stack web developer với AI workflows, automation pipelines, và GIS tools.',
  authors: [{ name: 'Hoàng Kim Vĩnh' }],
  openGraph: {
    title: 'Hoàng Kim Vĩnh | Portfolio 2026',
    description: 'Full-stack web + AI + automation portfolio của Hoàng Kim Vĩnh.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <LanguageProvider>
          <main className="portfolio-root">
            <InitialLoader />
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
              <div className="spotlight" />
              <DotField />
            </div>
            <PortfolioShell>{children}</PortfolioShell>
            <TargetCursor />
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}