import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navigation from "./components/Navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Navigation />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
