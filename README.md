# MakerVolt 메이커볼트 — 아두이노 쇼핑몰

아두이노 보드·센서·모듈을 파는 쇼핑몰입니다. Next.js 16, Supabase, 토스페이먼츠(테스트 모드)로 만들었습니다.

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

`.env.local`에 Supabase 주소와 공개 키, 토스 테스트 클라이언트 키가 들어 있습니다.
테스트 계정 정보는 저장소에 올리지 않았습니다(로컬 `supabase/seed/test-accounts.md`).

## 구성

| 영역 | 내용 |
|---|---|
| Supabase 프로젝트 | `arduino-shop` (ap-northeast-2, ref `xyadjephgznrdekesqfp`) |
| DB | `supabase/migrations/` — 테이블, RLS, 주문·결제 함수 |
| 시드 | `supabase/seed/` — 카테고리 6개, 상품 24개(디바이스마트 판매가 기준), 이미지 출처 |
| 결제 승인 | Edge Function `payments-confirm` (`supabase/functions/`) |
| 이미지 | `public/images/` — 무료 라이선스 실사 사진, 출처는 `/credits` 페이지 |

### 주문·결제 흐름

1. 주문서에서 `create_order` 함수 호출 → DB 가격으로 금액 계산, `pending` 주문 생성
2. 토스 결제창 → 성공 시 `/checkout/success`로 이동
3. Edge Function이 주문 금액 검증 → 토스 결제 승인 API 호출 → `finalize_payment`로 재고 차감·상태 변경(한 트랜잭션)
4. 재고 부족 등으로 확정에 실패하면 토스 결제를 자동 취소

### 페이지

- 쇼핑: `/`, `/products`, `/categories/[slug]`, `/products/[slug]`(리뷰 포함), `/search`, `/cart`, `/checkout`
- 회원: `/login`, `/signup`, `/mypage`(주문 내역·상세), `/mypage/addresses`, `/mypage/profile`
- 관리자: `/admin`(대시보드), `/admin/orders`(상태 변경), `/admin/products`(등록·수정·이미지 업로드), `/admin/inventory`

## 운영 전에 할 일

- [ ] **토스 시크릿 키 등록**: 지금은 토스 문서에 공개된 테스트 키로 동작합니다. Supabase 대시보드 → Edge Functions → Secrets에 `TOSS_SECRET_KEY`를 등록하고 `.env.local`의 `NEXT_PUBLIC_TOSS_CLIENT_KEY`도 내 상점 키로 바꾸세요.
- [ ] **이메일 인증**: 데모용으로 가입 즉시 인증되도록 `auto_confirm_email` 트리거를 넣었습니다. 실제 운영에서는 트리거를 지우고 Supabase Auth의 이메일 인증을 쓰세요.
- [ ] **테스트 계정 정리**: 개발용 관리자·구매자 계정의 비밀번호를 바꾸거나 삭제하세요.
- [ ] **환불**: 관리자가 결제 완료 주문을 취소해도 카드 환불은 자동으로 되지 않습니다(토스 취소 API 연동 필요).
- [ ] Supabase Auth의 유출 비밀번호 차단(Leaked password protection) 켜기
