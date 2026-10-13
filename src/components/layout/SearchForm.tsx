import Form from "next/form";

export default function SearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <Form action="/search" className="relative min-w-0 flex-1 sm:max-w-md">
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="상품명 검색 (예: 우노, 초음파, 서보)"
        className="input rounded-full bg-surface pr-10"
        aria-label="상품 검색"
      />
      <button
        type="submit"
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-muted hover:text-brand-600"
        aria-label="검색"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>
    </Form>
  );
}
