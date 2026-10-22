import "./globals.css";

export const metadata = {
  title: "Tartan Tickets | Campus events",
  description: "Browse upcoming student club events.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
