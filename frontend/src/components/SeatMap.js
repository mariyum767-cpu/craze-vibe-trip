'use client';

export default function SeatMap({ seats, selected, onToggle }) {
  const rows = {};
  seats.forEach((s) => {
    const rowNum = s.seat_number.slice(1);
    if (!rows[rowNum]) rows[rowNum] = {};
    rows[rowNum][s.seat_number[0]] = s;
  });
  const rowNumbers = Object.keys(rows).sort((a, b) => Number(a) - Number(b));

  function seatClass(seat) {
    if (!seat) return 'invisible';
    if (seat.status === 'booked') return 'bg-gray-400 text-white cursor-not-allowed';
    if (seat.status === 'blocked') return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    if (selected.includes(seat.id)) return 'bg-red-500 text-white cursor-pointer scale-105';
    return 'bg-green-500 hover:bg-green-600 text-white cursor-pointer';
  }

  return (
    <div className="bg-stone-900 rounded-3xl p-6 max-w-sm mx-auto text-white">
      <div className="text-center text-xs mb-4 tracking-widest text-gray-400">FRONT</div>
      <div className="border-2 border-gray-600 rounded-3xl p-4 space-y-2">
        {rowNumbers.map((rn) => {
          const row = rows[rn];
          return (
            <div key={rn} className="flex items-center justify-center gap-2">
              <span className="w-4 text-xs text-gray-500">{rn}</span>
              {['A', 'B'].map((l) => (
                <button
                  key={l}
                  type="button"
                  disabled={!row[l] || row[l].status !== 'available' && !selected.includes(row[l]?.id)}
                  onClick={() => row[l] && onToggle(row[l])}
                  className={`w-9 h-9 rounded-md text-[10px] font-bold flex items-center justify-center transition ${seatClass(row[l])}`}
                >
                  {row[l]?.seat_number || ''}
                </button>
              ))}
              <span className="w-6"></span>
              {['C', 'D'].map((l) => (
                <button
                  key={l}
                  type="button"
                  disabled={!row[l] || (row[l].status !== 'available' && !selected.includes(row[l]?.id))}
                  onClick={() => row[l] && onToggle(row[l])}
                  className={`w-9 h-9 rounded-md text-[10px] font-bold flex items-center justify-center transition ${seatClass(row[l])}`}
                >
                  {row[l]?.seat_number || ''}
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <div className="text-center text-xs mt-4 tracking-widest text-gray-400">BACK</div>

      <div className="flex justify-center gap-4 mt-6 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block"></span> Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> Selected</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-400 inline-block"></span> Booked</span>
      </div>
    </div>
  );
}
