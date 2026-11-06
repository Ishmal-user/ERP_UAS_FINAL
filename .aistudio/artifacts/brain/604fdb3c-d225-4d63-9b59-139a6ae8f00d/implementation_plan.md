# ARSITEKTUR & TRACEABILITY MATRIX LENGKAP
## HOTEL ARUNIKA SENJA ERP — LUXURY BOUTIQUE HOSPITALITY
**Referensi Utama:** Dokumen Silabus Dosen `24SI1 - Group 04 - Hospitality.pdf` (34 Halaman)

---

### 1. PEMAHAMAN TUGAS & KONTEKS BISNIS

* **Nama Perusahaan:** Hotel Arunika Senja
* **Tahun Berdiri:** 2021 | **Lokasi:** Jakarta Pusat, Indonesia | **Karyawan:** 18 orang
* **Kapasitas Properti:** Tepat 8 Kamar Butik (4 Superior @Rp550.000/malam, 4 Deluxe @Rp750.000/malam)
* **Lokasi Persediaan:**
  1. `WH-JKT`: Gudang Pusat (Gudang penerimaan barang, stok besar)
  2. `MB-JKT`: Pantry Minibar (Stok siap konsumsi tamu kamar)
* **Karakteristik Unik:**
  - Kapasitas kamar dikelola berbasis **room-night** `[check-in, check-out)` tanpa malam checkout, **BUKAN** sebagai SKU stok fisik.
  - Pemisahan finansial mutlak antara **Layanan Jasa Kamar & Minibar Inap (PBJT Hotel 10%, Akun 2160)** dengan **Penjualan Barang Korporat B2B Mandiri (PPN Efektif 11%, DPP 11/12, Akun 2150/1300)**.
  - Alur **Order-to-Cash (O2C)** dan **Procure-to-Pay (P2P)** terintegrasi penuh ke General Ledger double-entry otomatis yang seimbang (Debit = Kredit).

---

### 2. MATRIKS TRACEABILITY: 20 STAKEHOLDER RULES (SR-01 s.d. SR-20)

| Rule ID | Stakeholder & Pernyataan Kunci | Aturan Bisnis & Batasan Sistem | Fitur & Test Terkait |
| :--- | :--- | :--- | :--- |
| **SR-01** | **Nadhira Pramesti (Owner):** "Tamu VIP dapat diterima walau kamar tampak penuh." | Front Desk dapat reservasi kamar penuh hanya dengan otorisasi Owner; riwayat persetujuan tercatat di audit log. | `F-17` \| `T-32` |
| **SR-02** | **Bima Wicaksono (Front Desk):** "Satu kamar untuk satu tamu per malam." | Larangan double-booking pada interval room-night yang sama; ketersediaan dihitung per malam. | `F-16, F-17` \| `T-29, T-31, T-32` |
| **SR-03** | **Laras Putri (Sales):** "Invoice korporat keluar saat SO disetujui." | *Ditolak oleh sistem:* Invoice barang persediaan **hanya boleh** diterbitkan setelah barang fisik terkirim (Delivered Qty). | `F-05, F-10` \| `T-09, T-20, T-21` |
| **SR-04** | **Arief Santosa (Finance):** "Piutang hanya sebesar barang terkirim." | Customer Invoice barang persediaan hanya diposting untuk `Delivered Qty - Previously Invoiced Qty > 0`. | `F-10` \| `T-20, T-21` |
| **SR-05** | **Wira Mahendra (Procurement):** "Vendor minta tagih 100% PO." | *Ditolak oleh sistem:* Vendor Bill dibatasi 3-way match hanya pada kuantitas yang lulus inspeksi (`Accepted Qty`). | `F-11, F-13` \| `T-16, T-22, T-23` |
| **SR-06** | **Arief Santosa (Finance):** "Jangan akui utang atas barang ditolak." | Vendor Bill tidak boleh melebihi `Accepted Qty` pada Receipt yang belum ditagih; selisih tetap di outstanding PO. | `F-12, F-13` \| `T-18, T-19, T-22, T-23` |
| **SR-07** | **Bima Wicaksono (Front Desk):** "Minibar dicatat walau sistem nol." | *Ditolak oleh sistem:* Konsumsi minibar wajib memvalidasi `Available Qty = On Hand - Reserved` di `MB-JKT`. | `F-18` \| `T-33, T-34` |
| **SR-08** | **Santi Kusuma (Warehouse):** "Stok negatif bukan solusi." | Semua pengeluaran barang dan transfer dibatasi `Available Qty`; sistem menolak stok negatif. | `F-03, F-08, F-18, F-21` \| `T-06, T-13, T-15, T-34` |
| **SR-09** | **Laras Putri (Sales):** "Diskon wajar maks 10%, harga locked." | Diskon barang maksimal 10%; harga terkunci pasca-konfirmasi SO; perubahan harus melalui pembatalan & re-order. | `F-06` \| `T-10, T-11` |
| **SR-10** | **Arief Santosa (Finance):** "Batas kredit hitung pesanan aktif." | `Eksposur Kredit = AR Belum Lunas + Nilai Bruto SO Aktif Belum Ditagih + Nilai Bruto SO Baru`. Tolak jika > Limit. | `F-02, F-07` \| `T-04, T-11` |
| **SR-11** | **Santi Kusuma (Warehouse):** "Pengiriman parsial harus jelas." | Delivery Order boleh parsial; sisa menjadi Backorder otomatis; COGS dibukukan sekali saat status `Done`. | `F-08, F-09, F-14` \| `T-12, T-13` |
| **SR-12** | **Arief Santosa (Finance):** "Posting ganda/pincang dilarang." | Setiap posting memakai nomor unik; jurnal seimbang Debit = Kredit; pemanggilan berulang bersifat idempoten. | `F-14, F-23` \| `T-27, T-28` |
| **SR-13** | **Arief Santosa (Finance):** "Pisahkan PBJT hotel dan PPN B2B." | Folio kamar & minibar menginap dikenakan PBJT 10% (Akun 2160); penjualan barang B2B dikenakan PPN efektif 11%. | `F-10, F-13, F-19` \| `T-20, T-33, T-35` |
| **SR-14** | **Arief Santosa (Finance):** "Cicilan diterima, sisa piutang presisi." | Register payment mengizinkan pembayaran `0 < Nominal <= Residual`; tolak overpayment; residual update presisi. | `F-15` \| `T-24, T-25, T-26` |
| **SR-15** | **Santi Kusuma (Warehouse):** "Barang retur diverifikasi dahulu." | Retur penjualan <= kuantitas terkirim belum diretur; Credit Note menurunkan piutang; COGS dibalik. | `F-20` \| `T-36, T-37` |
| **SR-16** | **Santi Kusuma (Warehouse):** "Transfer minibar transparan 2 lokasi." | Transfer `WH-JKT -> MB-JKT` memotong asal dan menambah tujuan; total unit dan nilai aset perusahaan tidak berubah. | `F-03, F-21` \| `T-05, T-14, T-15` |
| **SR-17** | **Nadhira Pramesti (Owner):** "Audit trail siapa ubah apa." | RBAC 4 peran wajib (Sales, Warehouse/HK, Finance, Front Desk) + Owner; mutasi mencatat actor, time, old/new value. | `F-01, F-02, F-04, F-23` \| `T-01, T-02, T-04, T-08, T-39` |
| **SR-18** | **Nadhira Pramesti (Owner):** "KPI harus bisa ditelusuri ke sumber." | Dashboard menghitung angka dari transaksi Posted; setiap KPI dapat diklik untuk drilldown ke dokumen sumber. | `F-04, F-22, F-23` \| `T-38, T-39` |
| **SR-19** | **Bima Wicaksono (Front Desk):** "Tarif kamar tetap sejak booking." | Tarif kamar freeze saat Confirmed (Deluxe Rp750k, Superior Rp550k); perubahan jadwal wajib reschedule tercatat. | `F-17, F-19` \| `T-31, T-32, T-35` |
| **SR-20** | **Santi Kusuma (Warehouse):** "Checkout kamar otomatis Dirty." | Checkout otomatis ubah kamar menjadi Dirty; hanya peran Housekeeping yang berhak mengubah Dirty -> Ready. | `F-16, F-19` \| `T-29, T-30, T-33` |

---

### 3. ARSITEKTUR SISTEM & STRUKTUR TABEL (ERD)

Aplikasi dibangun dengan arsitektur modular enterprise:
1. **Presentation Layer:** Next.js / React dengan Tailwind CSS, Odoo 17 Web Layout (Navbar, Sidebar, Breadcrumb, Kanban, Form, List, Status Bar, Log Notes).
2. **Business Engine & Transaction Layer:**
   - **Order-to-Cash Engine:** Quoting, Price Locking, Credit Exposure Guard, Inventory Reservation.
   - **Procure-to-Pay Engine:** Vendor Pricelist Enforcement, 3-Way Match, GRNI Interim Clearing.
   - **Hospitality PMS Engine:** Room-Night Availability Matrix, Minibar Billing, PBJT Calculation.
   - **Accounting & Ledger Engine:** Double-entry journal builder, Idempotency Token Guard.
3. **Audit & Compliance Service:** Immutable Audit Log mencatat `actor_id`, `timestamp`, `action`, `doc_no`, `old_value`, `new_value`.

```
+-------------------------------------------------------------------------------------------------+
|                                      DATASET MASTER BASELINE                                    |
+-------------------------------------------------------------------------------------------------+
| [contacts_customers] C01 s.d. C06 (PT Nusantara Event, PT Seruni Travel, Ratna Prawira, dll.)   |
| [contacts_vendors]   V01 s.d. V04 (PT Tirta Distribusi, PT Camilan Nusantara, dll.)            |
| [products]           15 SKUs (MB-WTR-330, MB-SODA-CAN, ..., HK-LINEN-SET)                       |
| [warehouses_locations] WH-JKT (Gudang Pusat), MB-JKT (Pantry Minibar)                          |
| [opening_stock]      1.086 Unit = Rp14.102.000 (WH: Rp11.785.000, MB: Rp2.317.000)             |
| [chart_of_accounts]  16 Akun (1000 Bank s.d. 5400 Selisih Persediaan)                          |
| [hotel_rooms]        8 Kamar (R101-R108; R104 Dirty; B00003 Confirmed di R102)                  |
| [existing_documents] L00004 (Lead), SO00007 (SO), PO00007 (PO), B00003 (Booking)                |
+-------------------------------------------------------------------------------------------------+
```

---

### 4. PETA 18 LAYAR WIREFRAME ODOO 17 (S-01 s.d. S-18)

* **S-01: Beranda dan App Switcher (F-01)** — Menu launcher modular 7 area kerja, filter role RBAC, dan logo Arunika Senja.
* **S-02: Pelanggan dan Ketentuan Kredit (F-02, F-07)** — Form profil pelanggan, credit limit, payment terms, dan riwayat eksposur.
* **S-03: Master Barang dan Varian (F-03)** — Tabel 15 SKU, unit of measure, standard cost, sales price, dan stok per lokasi.
* **S-04: Pipeline Prospek CRM (F-04)** — Kanban board 4 tahapan (New, Qualified, Proposition, Won) dengan audit trail pemindahan lead.
* **S-05: Quotation dan Sales Order (F-05, F-06, F-07)** — Form penawaran B2B, batas diskon 10%, cek limit kredit, dan penguncian harga.
* **S-06: Delivery dan Backorder (F-08, F-09, F-14)** — Dokumen pengeluaran barang, pengiriman parsial, pembentukan backorder, dan COGS.
* **S-07: Stock Overview dan Transfer (F-08, F-21)** — Matriks stok On Hand, Reserved, Available per lokasi serta transfer WH-JKT -> MB-JKT.
* **S-08: RFQ dan Purchase Order (F-11)** — Form pengadaan barang, harga terkunci dari vendor pricelist, dan kalkulasi PPN 11%.
* **S-09: Receipt dan Inspeksi Kualitas (F-12, F-14)** — Form penerimaan barang fisik gudang dengan pemisahan Accepted vs Rejected Qty.
* **S-10: Customer Invoice (F-10)** — Faktur penjualan barang berbasis Delivered Qty dengan PPN efektif 11%.
* **S-11: Vendor Bill (F-13)** — Tagihan pemasok berbasis 3-way match (PO -> Receipt Accepted -> Bill) dengan penutupan Stock Interim.
* **S-12: Register Payment (F-15)** — Modal penerimaan/pembayaran cicilan, validasi anti-overpayment, dan update residual kas bank.
* **S-13: Journal Entries dan General Ledger (F-14, F-23)** — Buku besar transaksi, jurnal double-entry otomatis yang seimbang, dan trace idempoten.
* **S-14: Room Board dan Housekeeping (F-16)** — Denah visual 8 kamar butik dengan foto interior, indikator Ready/Dirty, dan aksi kebersihan.
* **S-15: Booking Tamu dan Tarif (F-17)** — Form reservasi interval room-night [check-in, check-out), tarif beku, dan proteksi benturan jadwal.
* **S-16: Guest Folio, Check-in dan Check-out (F-18, F-19)** — Folio tagihan kamar, integrasi konsumsi minibar MB-JKT, PBJT 10%, dan auto-dirty.
* **S-17: Sales Return dan Credit Note (F-20)** — Pengembalian barang retur, pembalikan COGS, penerbitan Credit Note, dan penyesuaian piutang.
* **S-18: Dashboard Transaksional & Audit Log (F-22, F-23)** — KPI pendapatan, laba kotor, piutang, okupansi dengan drilldown ke dokumen sumber.

---

### 5. CHECKLIST 39 SKENARIO PENJAMINAN MUTU (T-01 s.d. T-39)

1. `T-01`: Masuk sebagai Sales -> 7 menu/area referensi tersaji sesuai hak akses.
2. `T-02`: Masuk sebagai Front Desk -> coba akses/post jurnal Finance -> Ditolak dan diaudit.
3. `T-03`: Buka profil C04 -> Limit Rp8.000.000, Net 30, Kota Jakarta terlihat presisi.
4. `T-04`: Front Desk coba edit credit limit C04 menjadi Rp9.000.000 -> Ditolak kontrol RBAC.
5. `T-05`: Tampilkan MB-WTR-330 -> WH 120, MB 30, Total 150, Cost Rp6.000, Valuasi Rp900.000.
6. `T-06`: Coba buat produk baru dengan SKU duplikat MB-WTR-330 -> Ditolak validasi unik.
7. `T-07`: Buka lead L00004 milik C02 -> Berada di tahap New dengan estimasi Rp1.200.000.
8. `T-08`: Pindah L00004 dari New ke Won -> Tercatat perubahan tahap dan nama aktor di log.
9. `T-09`: Buat quote C04 (10 air @Rp18k + 5 soda @Rp25k) -> Subtotal Rp305.000, PPN Rp33.550, Total Rp338.550.
10. `T-10`: Di quote C04, coba diskon 15% -> Ditolak batas 10%; coba edit harga pasca-Confirmed -> Ditolak.
11. `T-11`: C02 minta 15 set linen @Rp210k -> Gross Rp3.496.500 melebihi credit limit Rp3.000.000 -> Ditolak.
12. `T-12`: Validasi kirim 6 air + 3 soda -> Backorder 4 air + 2 soda, COGS Rp66.000, stok WH air 114, soda 67.
13. `T-13`: Coba kirim 200 air dari WH-JKT (stok 120) -> Ditolak kontrol anti-stok negatif.
14. `T-14`: Transfer 8 air WH-JKT ke MB-JKT -> WH 112, MB 38, Total 150 unit, Available MB 34.
15. `T-15`: Coba transfer 40 soda dari MB-JKT (available hanya 18) -> Ditolak sistem.
16. `T-16`: Buat PO V01 (20 air @Rp6k + 10 soda @Rp10k) -> DPP Rp220.000, PPN Rp24.200, Total Rp244.200.
17. `T-17`: Pada PO terkonfirmasi, paksa ubah harga beli -> Ditolak penguncian harga PO.
18. `T-18`: Terima barang PO T-16 (18 air + 8 soda diterima, 2 reject) -> Nilai diterima Rp188.000.
19. `T-19`: Coba masukkan accepted 21 air pada baris pesanan 20 -> Ditolak validasi kuantitas.
20. `T-20`: Buat Customer Invoice atas delivery parsial T-12 -> DPP Rp183.000, PPN Rp20.130, Total Rp203.130.
21. `T-21`: Buat invoice atas SO yang belum terkirim -> Ditolak penagihan barang belum terkirim.
22. `T-22`: Posting Vendor Bill atas barang diterima T-18 -> DPP Rp188.000, PPN Rp20.680, Total Rp208.680.
23. `T-23`: Usulkan bill 100% PO saat ada barang rejected -> Ditolak selisih Rp35.520.
24. `T-24`: Terima cicilan pelanggan Rp100.000 -> Bank naik Rp100k, AR residual Rp103.130, status Partially Paid.
25. `T-25`: Coba input pembayaran pelanggan Rp210.000 pada sisa Rp203.130 -> Ditolak overpayment.
26. `T-26`: Bayar lunas Vendor Bill Rp208.680 -> AP residual Rp0, Bank turun menjadi Rp29.791.320.
27. `T-27`: Periksa General Ledger rantai sales -> Debit COGS Rp66k / Kredit Persediaan Rp66k, Debit AR Rp203.130.
28. `T-28`: Eksekusi ulang posting invoice/payment yang sama -> Ditolak idempotency guard (tidak ada double-post).
29. `T-29`: Buka Room Board 24-10-2026 -> 1 kamar dipesan (B00003 di R102), 7 kamar tersedia (termasuk R104).
30. `T-30`: Front Desk coba ubah R104 Dirty -> Ready -> Ditolak otorisasi (wajib Housekeeping).
31. `T-31`: Pesan R103 Deluxe 27-29 Okt untuk C03 -> 2 malam Rp1.500.000, estimasi PBJT Rp150.000, total Rp1.650.000.
32. `T-32`: Coba pesan R102 tanggal 25-26 Okt saat B00003 masih aktif -> Ditolak benturan kalender room-night.
33. `T-33`: Check-in R103, konsumsi minibar 2 air + 1 soda, Checkout -> Kamar Rp1.5M + Minibar Rp61k + PBJT Rp156.100 = Rp1.717.100. COGS Minibar Rp22.000, R103 berubah status menjadi Dirty.
34. `T-34`: Coba catat konsumsi 31 air minibar (stok on hand 30, reserved 4) -> Ditolak stok tidak cukup.
35. `T-35`: Coba checkout booking sebelum status Checked In -> Ditolak validasi alur lifecycle.
36. `T-36`: Retur 1 botol air dari delivery T-24 -> Credit Note Rp19.980, AR turun menjadi Rp83.150, persediaan +Rp6.000, COGS -Rp6.000.
37. `T-37`: Minta retur 6 air saat sisa barang terkirim belum diretur hanya 5 -> Ditolak batas kuantitas.
38. `T-38`: Buka Dashboard filter Posted -> Revenue Rp183.000, COGS Rp66.000, Piutang Rp103.130, Kas Masuk Rp100.000.
39. `T-39`: Klik KPI revenue -> Drilldown ke SO, DO, Invoice, Payment, dan satu entri audit posting idempoten.
