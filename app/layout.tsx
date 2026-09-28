import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jishin Bijumon George | PCB Designer & Embedded Systems Engineer',
  description: 'Portfolio of Jishin Bijumon George — PCB Design, Embedded Systems, IoT, and Hardware Product Development.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
