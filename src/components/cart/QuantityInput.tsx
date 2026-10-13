"use client";

export default function QuantityInput({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const set = (v: number) => onChange(Math.max(1, Math.min(v, max)));
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-line bg-white">
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={value <= 1}
        className="h-9 w-9 text-lg text-muted hover:bg-surface disabled:opacity-40"
        aria-label="수량 줄이기"
      >
        −
      </button>
      <input
        type="number"
        min={1}
        max={max}
        value={value}
        onChange={(e) => set(Number(e.target.value) || 1)}
        className="h-9 w-12 border-x border-line text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="수량"
      />
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={value >= max}
        className="h-9 w-9 text-lg text-muted hover:bg-surface disabled:opacity-40"
        aria-label="수량 늘리기"
      >
        +
      </button>
    </div>
  );
}
