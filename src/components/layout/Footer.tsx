import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface text-sm text-muted">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <p className="text-base font-extrabold text-brand-600">MakerVolt 메이커볼트</p>
          <p className="mt-2 leading-relaxed">
            아두이노 보드와 센서, 전자부품을 판매하는 데모 쇼핑몰입니다.
            <br />
            결제는 토스페이먼츠 테스트 모드로 동작하며 실제 청구되지 않습니다.
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink">고객센터</p>
          <p className="mt-2">평일 10:00 ~ 17:00 (점심 12:00 ~ 13:00)</p>
          <p>주말·공휴일 휴무</p>
        </div>
        <div>
          <p className="font-semibold text-ink">안내</p>
          <ul className="mt-2 space-y-1">
            <li>30,000원 이상 무료배송 (미만 3,000원)</li>
            <li>
              <Link href="/credits" className="hover:text-brand-700 hover:underline">
                이미지 출처 및 라이선스
              </Link>
            </li>
            <li>상품 가격은 디바이스마트 판매가를 참고했습니다.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs">© 2026 MakerVolt. Demo project.</div>
    </footer>
  );
}
