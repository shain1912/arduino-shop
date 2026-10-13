import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "메이커볼트 | 아두이노·센서·전자부품 쇼핑몰",
    template: "%s | 메이커볼트",
  },
  description: "아두이노 보드, 센서, 모터, 디스플레이, 입문 키트까지. 메이커를 위한 전자부품 쇼핑몰.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // 브라우저 확장 프로그램이 <html>에 속성을 추가해도 하이드레이션 경고가 나지 않게 한다
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
