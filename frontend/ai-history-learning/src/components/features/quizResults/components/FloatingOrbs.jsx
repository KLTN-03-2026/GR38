// ==========================================
// FLOATING ORBS - Các vòng tròn nền nổi animated
// ==========================================
export default function FloatingOrbs({ color }) {
  const orbs = [
    { s: 130, top: "-30px",   left: "-40px",  op: 0.09, d: 6 },
    { s: 90,  top: "0px",     right: "-25px", op: 0.07, d: 8 },
    { s: 70,  bottom: "10px", left: "10px",   op: 0.06, d: 7 },
    { s: 110, bottom: "-20px", right: "0px",  op: 0.07, d: 9 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: 24 }}>
      {orbs.map((o, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: o.s,
            height: o.s,
            borderRadius: "50%",
            background: color,
            opacity: o.op,
            top: o.top,
            left: o.left,
            right: o.right,
            bottom: o.bottom,
            animation: `orbFloat ${o.d}s ${i * 0.4}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}