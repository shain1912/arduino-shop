import type { Metadata } from "next";
import credits from "../../../../supabase/seed/image-credits.json";

export const metadata: Metadata = { title: "이미지 출처" };

type Credit = { file: string; title: string; author: string; license: string; source: string; note?: string };

export default function CreditsPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold">이미지 출처 및 라이선스</h1>
      <p className="mt-2 text-sm text-muted">
        이 사이트의 상품·배너 사진은 자유 라이선스(CC BY, CC BY-SA 등)로 공개된 사진을 사용했습니다. 일부 사진은
        같은 종류의 유사 제품 사진입니다.
      </p>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">사용 위치</th>
              <th className="px-4 py-3 font-medium">원본 · 저작자</th>
              <th className="px-4 py-3 font-medium">라이선스</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(credits as Credit[]).map((c) => (
              <tr key={c.file}>
                <td className="px-4 py-2.5 font-mono text-xs">{c.file.replace("/images/", "")}</td>
                <td className="px-4 py-2.5">
                  <a href={c.source} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                    {c.title}
                  </a>
                  <span className="block text-xs text-muted">{c.author}</span>
                  {c.note && <span className="block text-xs text-muted">※ {c.note}</span>}
                </td>
                <td className="px-4 py-2.5 text-xs">{c.license}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
