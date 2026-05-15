import React, { useState } from "react";

const ConceptInputDialog = ({ isOpen, onClose, onSubmit, T }) => {
  const [value, setValue] = useState("");
  if (!isOpen) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: T.surface, padding: 24, borderRadius: 16, width: '100%', maxWidth: 400, border: `1px solid ${T.chatBorder}` }}>
        <h3 style={{ color: T.titleColor, marginTop: 0 }}>Giải thích khái niệm</h3>
        <p style={{ color: T.subColor, fontSize: 13 }}>Bạn muốn AI giải thích khái niệm nào trong tài liệu?</p>
        <input 
          autoFocus
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.inputBorder}`, background: T.inputBg, color: T.titleColor, marginBottom: 16, boxSizing: 'border-box' }}
          placeholder="Ví dụ: Quang hợp, Lạm phát..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Hủy</button>
          <button 
            onClick={() => { onSubmit(value); setValue(""); onClose(); }}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer' }}
          >Xác nhận</button>
        </div>
      </div>
    </div>
  );
};

export default ConceptInputDialog;