import { ImageResponse } from "next/og";

export const alt = "Kikela, les vacances en famille, sans prise de tête";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ffdbcf 0%, #fff8f6 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 120,
            width: 120,
            borderRadius: 32,
            backgroundColor: "#a5492a",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            marginBottom: 32,
          }}
        >
          🏡
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 700,
            color: "#3b0a00",
            letterSpacing: -2,
          }}
        >
          Kikela
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 34,
            color: "#7a5a4e",
          }}
        >
          Les vacances en famille, sans prise de tête
        </div>
      </div>
    ),
    { ...size }
  );
}
