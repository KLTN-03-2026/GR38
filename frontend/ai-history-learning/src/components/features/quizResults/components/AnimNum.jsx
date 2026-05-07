import { useState, useEffect } from "react";

// ==========================================
// ANIM NUM - Số đếm tăng dần có animation
// ==========================================
export default function AnimNum({ to }) {
  const [v, setV] = useState(0);

  useEffect(() => {
    let c = 0;
    const t = setInterval(() => {
      c += Math.ceil(to / 30) || 1;
      if (c >= to) { setV(to); clearInterval(t); }
      else setV(c);
    }, 20);
    return () => clearInterval(t);
  }, [to]);

  return <>{v}</>;
}