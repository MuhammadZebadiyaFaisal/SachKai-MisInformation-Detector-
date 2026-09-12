export default function TrustGauge({ score }: { score: number }) {
  const getColor = (val: number) => {
    if (val > 70) return 'text-emerald-500 border-emerald-500';
    if (val > 40) return 'text-amber-500 border-amber-500';
    return 'text-red-500 border-red-500';
  };

  return (
    <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-bold ${getColor(score)}`}>
      <span className="text-2xl">{score}%</span>
      <span className="text-[10px] uppercase text-neutral-400">Trust</span>
    </div>
  );
}