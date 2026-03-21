import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "NitiSetu — Regulatory Intelligence Platform",
  description: "Bridging Regulatory Intelligence | Acolyte AI × CDSCO-IndiaAI",
  icons: { icon: "/favicon.ico" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <QueryProvider>
          {children}
          <Toaster 
            theme="dark" 
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                color: '#E2E8F0',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px'
              }
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
