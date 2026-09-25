import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CommuteLens — Hyderabad Multi-Modal Commute & Climate Comfort Planner',
  description:
    'Choose Hyderabad bus–metro–walk journeys by travel duration, fare, India-specific CO₂e, outdoor pollution exposure, and heat/rain comfort—with intelligent departure recommendations.',
  keywords: [
    'Hyderabad metro',
    'TGSRTC bus route',
    'HMRL metro timetable',
    'transit carbon calculator',
    'climate comfort commute',
    'clean air commute Hyderabad'
  ],
  authors: [{ name: 'CommuteLens Team' }]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Google 4-Color Accent Bar */}
        <div style={{
          height: '4px',
          width: '100%',
          background: 'linear-gradient(90deg, #4285F4 0% 25%, #EA4335 25% 50%, #FBBC05 50% 75%, #34A853 75% 100%)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }} />
        {children}
      </body>
    </html>
  );
}
