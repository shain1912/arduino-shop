# 아두이노 쇼핑몰 — 프로젝트 계획

## 1. 목표

아두이노 보드·센서·모듈·키트를 파는 온라인 쇼핑몰.
일반 쇼핑몰 기능에 더해, 메이커가 부품을 고를 때 필요한 **스펙·호환성·자료(데이터시트, 예제 코드)** 를 한곳에서 볼 수 있게 한다.

## 2. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js (App Router) + TypeScript | SSR로 상품 페이지 SEO 확보, 프론트·API를 한 프로젝트에서 관리 |
| 스타일 | Tailwind CSS + shadcn/ui | 빠른 UI 구성, 일관된 컴포넌트 |
| DB·인증·스토리지 | Supabase (Postgres, Auth, Storage) | 이미 MCP 연결됨. RLS로 권한 관리, 상품 이미지·데이터시트 저장 |
| 결제 | 토스페이먼츠 | 국내 카드·간편결제 지원, 테스트 키로 개발 가능 |
| 상태 관리 | Zustand (장바구니) | 가볍고 비로그인 장바구니를 localStorage에 유지하기 쉬움 |
| 배포 | Vercel | Next.js 기본 배포 환경, MCP 연결됨 |

## 3. 기능 범위

### MVP (1차)
- **상품**: 카테고리별 목록, 검색, 상세(이미지·가격·재고·스펙)
- **회원**: 이메일 가입/로그인(Supabase Auth), 배송지 관리
- **장바구니**: 비로그인 시 localStorage, 로그인 시 DB에 동기화
- **주문·결제**: 주문서 작성 → 토스페이먼츠 결제 → 결제 승인 → 주문 완료
- **마이페이지**: 주문 내역, 주문 상세, 배송 상태
- **관리자**: 상품 등록/수정, 재고 관리, 주문 상태 변경

### 아두이노 특화 (2차)
- **스펙 필터**: 동작 전압(3.3V/5V), 통신 방식(I2C/SPI/UART), 핀 수 등으로 필터링
- **호환성 표시**: "이 센서와 호환되는 보드" / "이 보드에 쓸 수 있는 실드"
- **자료실**: 상품별 데이터시트(PDF)·핀맵·예제 코드 링크
- **프로젝트 키트**: "스마트 화분 만들기" 같은 프로젝트 단위로 필요한 부품 한 번에 담기
- **리뷰·Q&A**

### 이후 (3차)
- 쿠폰·적립금, 대량 구매(교육기관) 견적 요청, 재입고 알림

## 4. 페이지 구성

| 경로 | 화면 |
|---|---|
| `/` | 메인 (추천 상품, 카테고리, 프로젝트 키트) |
| `/categories/[slug]` | 카테고리별 상품 목록 + 필터 |
| `/products/[slug]` | 상품 상세 |
| `/search?q=` | 검색 결과 |
| `/cart` | 장바구니 |
| `/checkout` | 주문서 작성·결제 |
| `/checkout/success`, `/checkout/fail` | 결제 결과 |
| `/login`, `/signup` | 로그인·회원가입 |
| `/mypage`, `/mypage/orders/[id]`, `/mypage/addresses` | 마이페이지 |
| `/admin/products`, `/admin/orders`, `/admin/inventory` | 관리자 |

## 5. DB 스키마 초안 (Supabase)

```
profiles        id(=auth.users), name, phone, role('customer'|'admin')
addresses       id, user_id, recipient, phone, zipcode, address1, address2, is_default
categories      id, parent_id, name, slug, sort_order
products        id, category_id, name, slug, description, price, sale_price,
                stock, specs(jsonb), is_active, created_at
product_images  id, product_id, url, sort_order
product_docs    id, product_id, type('datasheet'|'pinout'|'example'), title, url
compatibility   product_id, compatible_product_id, note          -- 2차
kits            id, name, slug, description                       -- 2차
kit_items       kit_id, product_id, quantity                      -- 2차
cart_items      id, user_id, product_id, quantity
orders          id, user_id, order_no, status, total_amount, shipping_fee,
                recipient, phone, address, memo, created_at
order_items     id, order_id, product_id, name_snapshot, price_snapshot, quantity
payments        id, order_id, payment_key, method, amount, status, approved_at, raw(jsonb)
reviews         id, product_id, user_id, rating, content, created_at  -- 2차
```

- 주문 상태: `pending` → `paid` → `preparing` → `shipped` → `delivered` (+ `cancelled`, `refunded`)
- `order_items`에 상품명·가격을 스냅샷으로 저장 (나중에 상품 가격이 바뀌어도 주문 기록 유지)
- 재고 차감은 결제 승인 시점에 DB 함수(트랜잭션)로 처리해 동시 주문 시 초과 판매 방지
- RLS: 상품·카테고리는 전체 읽기, 장바구니·주문·배송지는 본인만, 쓰기는 admin만

## 6. 진행 단계

| 단계 | 작업 | 산출물 |
|---|---|---|
| 0 | 프로젝트 세팅 | Next.js·Tailwind·Supabase 클라이언트 설정, 폴더 구조 |
| 1 | DB 구축 | 마이그레이션, RLS 정책, 시드 데이터(샘플 상품 20~30개) |
| 2 | 상품 조회 | 메인, 카테고리 목록, 상품 상세, 검색 |
| 3 | 회원 | 가입·로그인·로그아웃, 미들웨어로 보호 경로 처리 |
| 4 | 장바구니 | 담기·수량 변경·삭제, 로그인 시 병합 |
| 5 | 주문·결제 | 주문서, 토스페이먼츠 연동(테스트 키), 결제 승인 API, 재고 차감 |
| 6 | 마이페이지 | 주문 내역·상세, 배송지 관리 |
| 7 | 관리자 | 상품 CRUD, 이미지 업로드, 주문 상태 변경 |
| 8 | 배포 | Vercel 배포, 환경 변수, 도메인 |
| 9 | 2차 기능 | 스펙 필터, 호환성, 자료실, 키트, 리뷰 |

## 7. 폴더 구조

```
electric/
├── docs/                       기획·설계 문서
├── public/images/              정적 이미지 (로고, 배너)
├── supabase/
│   ├── migrations/             테이블·RLS·DB 함수 SQL
│   └── seed/                   샘플 상품·카테고리 데이터
├── src/
│   ├── app/                    라우트 (Next.js App Router)
│   │   ├── (shop)/             고객용 화면 — URL에 (shop)은 안 붙음
│   │   │   ├── categories/[slug]/
│   │   │   ├── products/[slug]/
│   │   │   ├── search/
│   │   │   ├── cart/
│   │   │   └── checkout/ (success/, fail/)
│   │   ├── (auth)/             login/, signup/
│   │   ├── mypage/             orders/[id]/, addresses/
│   │   ├── admin/              products/, orders/, inventory/
│   │   └── api/payments/confirm/   토스 결제 승인 API
│   ├── components/
│   │   ├── ui/                 버튼·인풋 등 공통 (shadcn/ui)
│   │   ├── layout/             헤더·푸터·네비게이션
│   │   ├── product/            상품 카드·갤러리·스펙 표
│   │   ├── cart/  checkout/  admin/
│   ├── lib/
│   │   ├── supabase/           서버·브라우저용 클라이언트
│   │   ├── payments/           토스페이먼츠 연동
│   │   └── utils/              가격 포맷 등
│   ├── hooks/                  커스텀 훅
│   ├── stores/                 Zustand 스토어 (장바구니)
│   └── types/                  DB 타입 (Supabase 생성), 공통 타입
└── tests/
```

## 8. 진행 현황 (2026-10-13)

- 완료: 0~7단계(세팅, DB, 상품, 회원, 장바구니, 결제, 마이페이지, 관리자), 2차 중 리뷰
- 결정한 것: 이름 MakerVolt(메이커볼트), Supabase 새 프로젝트 `arduino-shop`, 3만 원 이상 무료배송(미만 3,000원), 소셜 로그인은 제외
- 남은 것: 배포(8단계), 스펙 필터·호환성·자료실·프로젝트 키트(2차), 토스 실키 등록

## 9. 정해야 할 것 (초기 메모)

- [ ] 쇼핑몰 이름·로고·브랜드 컬러
- [ ] 사용할 Supabase 프로젝트 (새로 만들지, 기존 것을 쓸지)
- [ ] 배송비 정책 (예: 3만 원 이상 무료)
- [ ] 초기 상품 데이터 출처 (직접 입력 / 엑셀 일괄 등록)
- [ ] 소셜 로그인(카카오·네이버) 1차 포함 여부
