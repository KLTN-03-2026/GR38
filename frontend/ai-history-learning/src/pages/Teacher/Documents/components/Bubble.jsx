import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { GRAD } from "../constants/chatConstants";
import { IconThumbUp, IconCopy, IconRefresh, IconBot } from "../icons";
import ActionBadge from "./ActionBadge";

export default function Bubble({ msg, dark, T }) {
  const [copied, setCopied] = useState(false);
  const isAI = msg.sender === "ai";

  const handleCopy = () => {
    navigator.clipboard?.writeText(msg.text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="chatai-msg" style={{
      display: "flex", gap: 10,
      flexDirection: isAI ? "row" : "row-reverse",
      alignItems: "flex-end",
    }}>
      {isAI && (
        <div style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: GRAD.indigo,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IconBot size={14} style={{ color: "#fff" }}/>
        </div>
      )}

      <div style={{ maxWidth: "72%" }}>
        <div style={{
          padding: "11px 14px", borderRadius: 16, fontSize: 13, lineHeight: 1.7,
          ...(isAI
            ? { background: T.msgAiBg, border: `0.5px solid ${T.msgAiBorder}`, color: T.msgAiColor, borderBottomLeftRadius: 4 }
            : { background: GRAD.user, color: "#fff", borderBottomRightRadius: 4 }),
        }}>
          {msg.type === "action-result" && msg.actionLabel && (
            <ActionBadge label={msg.actionLabel} dark={dark} />
          )}

          {isAI ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p style={{ margin: "0 0 8px 0", color: T.msgAiColor }}>{children}</p>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: 700, color: T.msgAiColor }}>{children}</strong>
                ),
                em: ({ children }) => (
                  <em style={{ fontStyle: "italic", color: T.msgAiColor }}>{children}</em>
                ),
                ul: ({ children }) => (
                  <ul style={{ margin: "4px 0 8px 0", paddingLeft: 18, color: T.msgAiColor }}>{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol style={{ margin: "4px 0 8px 0", paddingLeft: 18, color: T.msgAiColor }}>{children}</ol>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: 3, color: T.msgAiColor }}>{children}</li>
                ),
                h1: ({ children }) => (
                  <h1 style={{ fontSize: 15, fontWeight: 700, margin: "10px 0 6px", color: T.msgAiColor }}>{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{ fontSize: 14, fontWeight: 700, margin: "8px 0 5px", color: T.msgAiColor }}>{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ fontSize: 13, fontWeight: 600, margin: "6px 0 4px", color: T.msgAiColor }}>{children}</h3>
                ),
                code: ({ inline, children }) => inline ? (
                  <code style={{
                    fontSize: 12, padding: "1px 5px", borderRadius: 4,
                    background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)",
                    color: T.msgAiColor, fontFamily: "monospace",
                  }}>{children}</code>
                ) : (
                  <pre style={{
                    fontSize: 12, padding: "10px 12px", borderRadius: 8, overflowX: "auto",
                    background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                    color: T.msgAiColor, fontFamily: "monospace", margin: "6px 0",
                  }}><code>{children}</code></pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote style={{
                    borderLeft: "3px solid #5b5ef4", paddingLeft: 10,
                    margin: "6px 0", color: T.subColor, fontStyle: "italic",
                  }}>{children}</blockquote>
                ),
                hr: () => (
                  <hr style={{ border: "none", borderTop: `0.5px solid ${T.msgAiBorder}`, margin: "8px 0" }}/>
                ),
              }}
            >
              {msg.text}
            </ReactMarkdown>
          ) : (
            <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
          )}
        </div>

        {isAI && (
          <div style={{ display: "flex", gap: 5, marginTop: 5, paddingLeft: 2 }}>
            {[
              { label: "Hữu ích",                              icon: <IconThumbUp size={10}/> },
              { label: copied ? "Đã sao chép" : "Sao chép",   icon: <IconCopy    size={10}/>, onClick: handleCopy },
              { label: "Tạo lại",                              icon: <IconRefresh size={10}/> },
            ].map(({ label, icon, onClick }) => (
              <button key={label} onClick={onClick} className="chatai-fbtn"
                style={{
                  "--fbtn-hover": dark ? "#252535" : "#f3f4f6",
                  display: "flex", alignItems: "center", gap: 3, fontSize: 10,
                  color: T.subColor, padding: "3px 7px", borderRadius: 6,
                  border: `0.5px solid ${T.btnBorder}`, background: T.btnBg,
                  cursor: "pointer", transition: "background 0.15s",
                }}>
                {icon}{label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{
        fontSize: 10, color: T.timeColor, alignSelf: "flex-end",
        paddingBottom: 2, flexShrink: 0, marginBottom: isAI ? 22 : 0,
      }}>
        {new Date(msg.ts || Date.now()).toLocaleTimeString("vi", { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}