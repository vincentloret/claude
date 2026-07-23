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
          backgroundColor: "#a5492a",
          fontSize: 104,
        }}
      >
        🏡
      </div>
    ),
    { width: 192, height: 192 }
  );
}
