import Link from "next/link";

export default function Home() {
  const apps = [
    {
      title: "Master Data Management",
      desc: "Single Source of Truth: Pelanggan (C01-C06), Vendor (V01-V04), 17 SKU Produk & Jasa, 8 Kamar, Gudang & Pajak.",
      badge: "Core · SSOT Hub",
      href: "/master-data",
      icon: "🗄️",
      tag: "Master Data",
      locked: false,
    },
    {
      title: "Front Desk & Rooms",
      desc: "Denah 8 kamar butik (Superior & Deluxe), okupansi room-night, dan sertifikasi kebersihan Housekeeping.",
      badge: "S-14 · T-29 / T-30",
      href: "/front-desk",
      icon: "🏨",
      tag: "Front Office",
      locked: false,
    },
    {
      title: "Bookings & Folio Checkout",
      desc: "Reservasi tamu, cek ketersediaan room-night, tagihan minibar MB-JKT, PBJT 10%, dan auto-dirty.",
      badge: "S-15 / S-16 · T-31..35",
      href: "/bookings",
      icon: "🛎️",
      tag: "Hospitality",
      locked: false,
    },
    {
      title: "Sales Quotations & CRM",
      desc: "Penawaran B2B, PPN 11%, batas diskon 10%, dan proteksi eksposur batas kredit (Credit Limit Guard).",
      badge: "S-02 / S-05 · T-09..11",
      href: "/sales",
      icon: "💼",
      tag: "Commercial",
      locked: false,
    },
    {
      title: "Stock Overview & Catalog",
      desc: "Monitoring 15 SKU, persediaan WH-JKT & MB-JKT, reserved, available, dan standard cost.",
      badge: "S-03 / S-07 · T-05 / T-06",
      href: "/inventory/stock",
      icon: "📦",
      tag: "Warehouse",
      locked: false,
    },
    {
      title: "Internal Stock Transfer",
      desc: "Mutasi persediaan transparan dari gudang pusat WH-JKT ke pantry minibar kamar MB-JKT.",
      badge: "S-07 · T-14 / T-15",
      href: "/inventory/transfer",
      icon: "🔄",
      tag: "Warehouse",
      locked: false,
    },
    {
      title: "Delivery & Backorders",
      desc: "Pengeluaran barang keluar gudang, pengiriman parsial, pembentukan backorder, dan pencatatan COGS.",
      badge: "S-06 · T-12 / T-13",
      href: "/inventory/delivery",
      icon: "🚚",
      tag: "Warehouse",
      locked: false,
    },
    {
      title: "Procurement & Purchase",
      desc: "Pembuatan PO otomatis dari pricelist vendor V01-V04, PPN 11%, dan proteksi tampering harga beli.",
      badge: "S-08 · T-16 / T-17",
      href: "/purchase",
      icon: "🛒",
      tag: "Procurement",
      locked: false,
    },
    {
      title: "Dock Receipts & 3-Way QC",
      desc: "Penerimaan barang masuk dock, inspeksi Accepted vs Rejected quantities, dan penutupan GRNI.",
      badge: "S-09 · T-18 / T-19",
      href: "/receipts",
      icon: "📥",
      tag: "Warehouse",
      locked: false,
    },
    {
      title: "Invoicing & Payments",
      desc: "Faktur pelanggan (Delivered Qty), Vendor Bills (3-Way Match), cicilan kas bank, dan retur Credit Note.",
      badge: "S-10..12, 17 · T-20..26, 36",
      href: "/invoicing",
      icon: "🧾",
      tag: "Finance",
      locked: false,
    },
    {
      title: "General Ledger & Journals",
      desc: "Buku besar double-entry mutlak seimbang Debit = Kredit, Chart of Accounts 16 akun, dan trace idempoten.",
      badge: "S-13 · T-27 / T-28",
      href: "/accounting",
      icon: "📑",
      tag: "Finance",
      locked: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Banner Selamat Datang */}
      <div className="bg-gradient-to-r from-[#0B2342] via-[#102A4C] to-[#0B2342] rounded-2xl p-6 sm:p-8 text-white shadow-sm border border-[#D8AD43]/30">
        <div className="max-w-3xl">
          <p className="text-[#D8AD43] text-xs font-bold tracking-widest uppercase">
            ARUNIKA SENJA · CENTRAL WORKSPACE (F-01)
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight mt-1">
            Hotel Arunika Senja ERP Management Hub
          </h1>
          <p className="text-neutral-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Sistem ERP terpadu manajemen hotel butik mewah 8 kamar: operasional Front Desk, reservasi tamu, logistik gudang, pengadaan barang, penagihan, dan akuntansi double-entry terintegrasi.
          </p>
        </div>
      </div>

      {/* Grid Menu Aplikasi */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0B2342]">
            Modul Aplikasi Terintegrasi (Semua Modul Aktif)
          </h2>
          <span className="text-xs font-mono text-neutral-400">
            10 Modul Lengkap · 39 Skenario Terverifikasi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {apps.map((app) => (
            <Link
              key={app.title}
              href={app.href}
              className="p-5 rounded-xl border bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-52 border-neutral-200 hover:border-[#D8AD43] group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{app.icon}</span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#FAF9F6] text-[#0B2342] border border-neutral-200">
                    {app.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0B2342] mb-1 group-hover:text-[#9A7A3E] transition-colors">
                  {app.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-snug line-clamp-2">
                  {app.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-between items-center text-[11px]">
                <span className="text-neutral-400 font-medium">{app.tag}</span>
                <span className="text-[#D8AD43] font-bold group-hover:translate-x-1 transition-transform">
                  Buka Modul →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
