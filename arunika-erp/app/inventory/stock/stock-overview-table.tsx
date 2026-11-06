'use client';

type StockItem = {
  code: string;
  name: string;
  unit: string;
  cost_price: number;
  wh_jkt_on_hand: number;
  mb_jkt_on_hand: number;
  mb_jkt_reserved: number;
};

type Props = {
  stockData: StockItem[];
};

export default function StockOverviewTable({ stockData }: Props) {
  let totalUnits = 0;
  let totalValue = 0;
  let whValue = 0;
  let mbValue = 0;

  const enrichedData = stockData.map((item) => {
    const mbAvailable = item.mb_jkt_on_hand - item.mb_jkt_reserved;
    const total = item.wh_jkt_on_hand + item.mb_jkt_on_hand;
    const value = total * item.cost_price;

    totalUnits += total;
    totalValue += value;
    whValue += item.wh_jkt_on_hand * item.cost_price;
    mbValue += item.mb_jkt_on_hand * item.cost_price;

    return {
      ...item,
      mbAvailable,
      total,
      value,
    };
  });

  return (
    <div className="space-y-6">
      {/* 4 Kartu KPI Ringkasan Stok Baseline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase">Total Unit Stok</div>
          <div className="text-xl font-bold text-[#0B2342] mt-1 font-mono">
            {totalUnits.toLocaleString('id-ID')} unit
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Semua SKU & Lokasi</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase">Total Nilai Persediaan</div>
          <div className="text-xl font-bold text-[#D8AD43] mt-1 font-mono">
            Rp{totalValue.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Baseline: Rp14.102.000</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase">Nilai Gudang (WH-JKT)</div>
          <div className="text-xl font-bold text-[#0B2342] mt-1 font-mono">
            Rp{whValue.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Baseline: Rp11.785.000</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="text-[11px] font-bold text-neutral-400 uppercase">Nilai Minibar (MB-JKT)</div>
          <div className="text-xl font-bold text-[#0B2342] mt-1 font-mono">
            Rp{mbValue.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Baseline: Rp2.317.000</div>
        </div>
      </div>

      {/* Tabel Data Persediaan */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-[#0B2342]">Daftar 15 SKU Persediaan</h2>
          <span className="text-xs text-neutral-500">Lokasi: WH-JKT & MB-JKT</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-neutral-200 text-[#0B2342] font-semibold">
                <th className="py-3 px-3.5">SKU</th>
                <th className="py-3 px-3.5">Nama Produk</th>
                <th className="py-3 px-3.5">Unit</th>
                <th className="py-3 px-3.5 text-right">WH-JKT</th>
                <th className="py-3 px-3.5 text-right">MB-JKT</th>
                <th className="py-3 px-3.5 text-right text-amber-700">MB Reserved</th>
                <th className="py-3 px-3.5 text-right text-emerald-700">MB Available</th>
                <th className="py-3 px-3.5 text-right font-bold">Total</th>
                <th className="py-3 px-3.5 text-right">Cost Price</th>
                <th className="py-3 px-3.5 text-right font-bold">Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {enrichedData.map((item) => (
                <tr key={item.code} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-2.5 px-3.5 font-mono font-bold text-[#0B2342]">{item.code}</td>
                  <td className="py-2.5 px-3.5 text-neutral-800">{item.name}</td>
                  <td className="py-2.5 px-3.5 text-neutral-500">{item.unit}</td>
                  <td className="py-2.5 px-3.5 text-right font-mono">{item.wh_jkt_on_hand.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3.5 text-right font-mono">{item.mb_jkt_on_hand.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-amber-700 font-medium">
                    {item.mb_jkt_reserved > 0 ? item.mb_jkt_reserved.toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-emerald-700 font-semibold">
                    {item.mbAvailable.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold text-neutral-900">
                    {item.total.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-neutral-600">
                    Rp{item.cost_price.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#0B2342]">
                    Rp{item.value.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#FAF9F6] border-t-2 border-[#0B2342] font-bold text-[#0B2342]">
                <td colSpan={7} className="py-3 px-3.5 text-right">TOTAL KESELURUHAN:</td>
                <td className="py-3 px-3.5 text-right font-mono text-sm">{totalUnits.toLocaleString('id-ID')}</td>
                <td></td>
                <td className="py-3 px-3.5 text-right font-mono text-sm text-[#D8AD43]">
                  Rp{totalValue.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
