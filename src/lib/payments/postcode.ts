"use client";

// 카카오(다음) 우편번호 서비스 — 무료, 키 불필요
// https://postcode.map.daum.net/guide

type PostcodeResult = { zonecode: string; roadAddress: string; jibunAddress: string; buildingName: string };

declare global {
  interface Window {
    daum?: { Postcode: new (opts: { oncomplete: (data: PostcodeResult) => void }) => { open: () => void } };
  }
}

const SCRIPT_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function loadScript(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("우편번호 서비스를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
}

export async function openPostcode(onSelect: (zipcode: string, address: string) => void) {
  await loadScript();
  new window.daum!.Postcode({
    oncomplete(data) {
      const address = data.roadAddress || data.jibunAddress;
      onSelect(data.zonecode, data.buildingName ? `${address} (${data.buildingName})` : address);
    },
  }).open();
}
