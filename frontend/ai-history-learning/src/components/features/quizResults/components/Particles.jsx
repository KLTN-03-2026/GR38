// ==========================================
// PARTICLES - Hiệu ứng pháo hoa khi đạt >= 80%
// ==========================================
export default function Particles({ active }) {
  if (!active) return null;

  const items = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * 360;
    const dist  = 55 + (i % 3) * 25;
    const size  = 4 + (i % 4);
    const cols  = ["#F26739", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"];
    return { angle, dist, size, col: cols[i % cols.length], delay: (i * 0.03).toFixed(2) };
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {items.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: i % 4 === 0 ? "2px" : "50%",
              background: p.col,
              top: "50%",
              left: "50%",
              "--tx": `${Math.cos(rad) * p.dist}px`,
              "--ty": `${Math.sin(rad) * p.dist}px`,
              animation: `burst 1.4s ${p.delay}s cubic-bezier(0.22,1,0.36,1) both`,
            }}
          />
        );
      })}
    </div>
  );
}