import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#f1f8f1,#e0f0e0)", color: "#173b20" }}>
        <div style={{ fontSize: 40, color: "#2d7439", marginBottom: 20 }}>{site.name}</div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.1 }}>{site.tagline}</div>
      </div>
    ),
    size,
  );
}
