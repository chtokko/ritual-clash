"use client"

// AsciiArt — "m ASCII", made with the 21st.dev ASCII editor and baked
// to its exact rendered output (looping video + poster). Zero dependencies:
// one <video> that fills its parent. Drop it behind or inside your content:
// <div className="relative h-96"><AsciiArt className="absolute inset-0" /></div>
// Remix the source recipe (styles, animation, palette) in the editor:
// https://21st.dev/community/ascii/editor?from=bd6a3328-5a24-4464-83da-c3180c9be0fe
export function AsciiArt({ className }: { className?: string }) {
  return (
    <video
      className={className}
      src={"https://assets.21st.dev/ascii-recipes/videos/user_30XIKFZ370uhAIEjYnAUVACE5e3/851b50a4-33f7-4d6e-9a4f-d7da96d31784.mp4"}
      poster={"https://assets.21st.dev/ascii-recipes/thumbnails/user_30XIKFZ370uhAIEjYnAUVACE5e3/8974edf8-1ee2-4400-8fa6-a0a41bdd6d59.webp"}
      autoPlay
      loop
      muted
      playsInline
      aria-label={"m ASCII — animated ASCII art"}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  )
}
