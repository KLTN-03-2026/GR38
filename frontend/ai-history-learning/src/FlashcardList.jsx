import images from "./images";

export default function FlashcardList() {
  return (
    <div style={styles.grid}>
      {images.map((item) => (
        <div key={item.id} style={styles.card}>
          <div style={styles.thumb}>
            <span style={styles.aiBadge}>✦ AI</span>
            <img
              src={item.image}
              alt={item.title}
              style={styles.img}
            />
          </div>
          <div style={styles.body}>
            <p style={styles.title}>{item.title}</p>
            <p style={styles.date}>{item.date}</p>
            <div style={styles.meta}>
              <span style={styles.badge}>{item.cards} Thẻ học</span>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${item.progress}%`,
                  }}
                />
              </div>
              <span style={styles.pct}>{item.progress}%</span>
            </div>
            <button style={styles.btn}>Xem chi tiết</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
    padding: "16px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  thumb: {
    position: "relative",
    width: "100%",
    height: "160px",
    background: "#f97c4a",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  aiBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    background: "#7f77dd",
    color: "#fff",
    fontSize: "11px",
    padding: "3px 8px",
    borderRadius: "20px",
    zIndex: 2,
  },
  body: {
    padding: "12px 14px",
  },
  title: {
    fontSize: "14px",
    fontWeight: "500",
    margin: "0 0 4px",
    color: "#1a1a1a",
  },
  date: {
    fontSize: "12px",
    color: "#888",
    margin: "0 0 8px",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  badge: {
    background: "#378add",
    color: "#fff",
    fontSize: "11px",
    padding: "3px 8px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },
  progressBar: {
    flex: 1,
    height: "4px",
    background: "#e5e5e5",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#378add",
    borderRadius: "2px",
  },
  pct: {
    fontSize: "11px",
    color: "#888",
  },
  btn: {
    width: "100%",
    padding: "9px",
    background: "#e55a2b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
};