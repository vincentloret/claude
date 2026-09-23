import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#436833",
          fontSize: 103,
        }}
      >
        🍲
      </div>
    ),
    { width: 192, height: 192 }
  );
}
