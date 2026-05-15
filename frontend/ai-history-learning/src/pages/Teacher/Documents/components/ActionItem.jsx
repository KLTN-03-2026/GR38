function ActionItem({ Icon, label, grad, onClick, T }) {
  return (
    <button onClick={onClick} className="chatai-action"
      style={{ width:"100%", display:"flex", alignItems:"center", gap:9,
        padding:"7px 8px", borderRadius:8, cursor:"pointer",
        border:"none", background:"transparent", transition:"background 0.15s" }}>
      <div style={{ width:26, height:26, borderRadius:7, background:grad, flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={12} style={{ color:"#fff" }}/>
      </div>
      <span style={{ fontSize:11.5, color:T.sbDim, fontWeight:400 }}>{label}</span>
    </button>
  );
}

export default ActionItem;