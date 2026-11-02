import './globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>orbit.</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230a0a0a'/%3E%3Ccircle cx='16' cy='16' r='6.5' fill='none' stroke='%23fff' stroke-width='1.8'/%3E%3Ccircle cx='23.5' cy='10' r='2.2' fill='%23fff'/%3E%3C/svg%3E" />
      </head>
      <body>{children}</body>
    </html>
  );
}
