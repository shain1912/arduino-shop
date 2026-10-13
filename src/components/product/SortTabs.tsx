import Link from "next/link";
import { SORT_OPTIONS, type SortKey } from "@/lib/data";

export default function SortTabs({
  current,
  basePath,
  extraParams = {},
}: {
  current: SortKey;
  basePath: string;
  extraParams?: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {(Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => {
        const params = new URLSearchParams({ ...extraParams, sort: key });
        const active = key === current;
        return (
          <Link
            key={key}
            href={`${basePath}?${params.toString()}`}
            className={active ? "font-semibold text-brand-700" : "text-muted hover:text-ink"}
            scroll={false}
          >
            {SORT_OPTIONS[key].label}
          </Link>
        );
      })}
    </div>
  );
}
