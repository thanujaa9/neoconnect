import './globals.css';

export const metadata = {
  title: 'NeoConnect',
  description: 'Staff Feedback & Complaint Management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}