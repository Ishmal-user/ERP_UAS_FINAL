import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hotel Arunika Senja ERP",
  description: "Boutique Hospitality & Supply Chain Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1E293B] antialiased">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-[#0B2342] text-white shadow-md border-b border-[#1E3A5F]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full bg-[#D8AD43] flex items-center justify-center text-[#0B2342] font-bold text-sm tracking-wider shadow-sm">
                AS
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight group-hover:text-[#D8AD43] transition-colors">
                  Hotel Arunika Senja
                </div>
                <div className="text-[10px] text-neutral-300 tracking-wider uppercase">
                  Hospitality ERP
                </div>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
              <Link
                href="/"
                className="px-2.5 py-1.5 rounded-lg text-neutral-200 hover:text-white hover:bg-[#173B65] transition-colors"
              >
                App Hub
              </Link>
              <Link
                href="/master-data"
                className="px-2.5 py-1.5 rounded-lg text-[#D8AD43] font-bold hover:text-white hover:bg-[#173B65] transition-colors"
              >
                Master Data
              </Link>
              <Link
                href="/front-desk"
                className="px-2.5 py-1.5 rounded-lg text-neutral-200 hover:text-white hover:bg-[#173B65] transition-colors"
              >
                Front Desk
              </Link>
              <Link
                href="/bookings"
                className="px-2.5 py-1.5 rounded-lg text-neutral-200 hover:text-white hover:bg-[#173B65] transition-colors"
              >
                Bookings
              </Link>
              <Link
                href="/sales"
                className="px-2.5 py-1.5 rounded-lg text-neutral-200 hover:text-white hover:bg-[#173B65] transition-colors"
              >
                Sales
              </Link>
              <Link
                href="/inventory/stock"
                className="px-2.5 py-1.5 rounded-lg text-neutral-200 hover:text-white hover:bg-[#173B65] transition-colors"
              >
                Stock
              </Link>
              <Link
                href="/purchase"
                className="px-2.5 py-1.5 rounded-lg text-neutral-200 hover:text-white hover:bg-[#173B65] transition-colors"
              >
                Purchase
              </Link>
              <Link
                href="/receipts"
                className="px-2.5 py-1.5 rounded-lg text-neutral-200 hover:text-white hover:bg-[#173B65] transition-colors"
              >
                Receipts
              </Link>
              <Link
                href="/invoicing"
                className="px-2.5 py-1.5 rounded-lg text-neutral-200 hover:text-white hover:bg-[#173B65] transition-colors"
              >
                Invoicing
              </Link>
              <Link
                href="/accounting"
                className="px-2.5 py-1.5 rounded-lg text-neutral-200 hover:text-white hover:bg-[#173B65] transition-colors"
              >
                Accounting
              </Link>
            </nav>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white">Nadhira Pramesti</div>
                <div className="text-[10px] text-[#D8AD43] font-medium">Owner / Administrator</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#173B65] border border-[#D8AD43]/50 flex items-center justify-center text-xs font-bold text-[#D8AD43]">
                NP
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
