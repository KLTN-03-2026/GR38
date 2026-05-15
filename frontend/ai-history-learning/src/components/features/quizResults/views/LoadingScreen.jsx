// ==========================================
// LOADING SCREEN - Màn hình chờ ban đầu
// ==========================================
export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F4F6FB",
    }}>
      <div style={{
        width: 24, height: 24,
        border: "3px solid #F26739",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
    </div>
  );
}