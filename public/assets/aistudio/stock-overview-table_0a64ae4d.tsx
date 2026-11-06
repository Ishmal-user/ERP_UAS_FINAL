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
  // Calculate totals
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
    <div>
      <h2>Stock Overview</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #000', backgroundColor: '#f5f5f5' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>SKU</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Nama</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Unit</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>WH-JKT</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>MB-JKT</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>MB Reserved</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>MB Available</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Total</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Cost Price</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>Nilai</th>
          </tr>
        </thead>
        <tbody>
          {enrichedData.map((item) => (
            <tr key={item.code} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{item.code}</td>
              <td style={{ padding: '8px' }}>{item.name}</td>
              <td style={{ padding: '8px' }}>{item.unit}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{item.wh_jkt_on_hand.toLocaleString('id-ID')}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{item.mb_jkt_on_hand.toLocaleString('id-ID')}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{item.mb_jkt_reserved.toLocaleString('id-ID')}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>{item.mbAvailable.toLocaleString('id-ID')}</td>
              <td style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>{item.total.toLocaleString('id-ID')}</td>
              <td style={{ textAlign: 'right', padding: '8px' }}>Rp{item.cost_price.toLocaleString('id-ID')}</td>
              <td style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>Rp{item.value.toLocaleString('id-ID')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid #000', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
            <td colSpan={7} style={{ textAlign: 'right', padding: '8px' }}>Total:</td>
            <td style={{ textAlign: 'right', padding: '8px' }}>{totalUnits.toLocaleString('id-ID')}</td>
            <td style={{ textAlign: 'right', padding: '8px' }}></td>
            <td style={{ textAlign: 'right', padding: '8px' }}>Rp{totalValue.toLocaleString('id-ID')}</td>
          </tr>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <td colSpan={9} style={{ textAlign: 'right', padding: '8px' }}>Nilai WH-JKT:</td>
            <td style={{ textAlign: 'right', padding: '8px' }}>Rp{whValue.toLocaleString('id-ID')}</td>
          </tr>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <td colSpan={9} style={{ textAlign: 'right', padding: '8px' }}>Nilai MB-JKT:</td>
            <td style={{ textAlign: 'right', padding: '8px' }}>Rp{mbValue.toLocaleString('id-ID')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
