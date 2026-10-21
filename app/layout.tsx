import type { Metadata } from "next";
import "./globals.css";
import { EventsProvider } from "@/store/events-context";

export const metadata: Metadata = {
  title: "LIV DOT — Host Studio",
  description: "Manage your live events and broadcast readiness.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body suppressHydrationWarning><EventsProvider>{children}</EventsProvider></body></html>;
}
