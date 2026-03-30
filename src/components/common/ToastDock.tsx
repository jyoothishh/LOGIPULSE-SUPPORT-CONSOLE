import React from 'react';
import { Toast } from '../../types';

const COLOR_BORDER: Record<string,string> = {
  amber:'var(--amber-ring)', green:'var(--green-ring)', red:'var(--red-ring)', blue:'rgba(56,189,248,0.3)',
};

interface Props { toasts: Toast[]; onDismiss: (id: string) => void; }

export const ToastDock: React.FC<Props> = ({ toasts, onDismiss }) => (
  <div style={{ position:'fixed', bottom:16, right:16, display:'flex', flexDirection:'column-reverse',
    gap:7, zIndex:9999, pointerEvents:'none', width:280 }}>
    {toasts.map(t => (
      <div key={t.id} onClick={() => onDismiss(t.id)}
        style={{ background:'var(--bg-float)', borderRadius:'var(--r2)', padding:'10px 13px',
          border:`1px solid ${COLOR_BORDER[t.color]}`, boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
          display:'flex', gap:9, alignItems:'flex-start', pointerEvents:'all', cursor:'pointer',
          animation:'slideIn 0.22s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
        {t.icon && <span style={{ fontSize:15, flexShrink:0, marginTop:1 }}>{t.icon}</span>}
        <div>
          <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{t.title}</div>
          {t.msg && <div style={{ fontSize:11, color:'var(--tx-secondary)', lineHeight:1.4 }}>{t.msg}</div>}
        </div>
      </div>
    ))}
  </div>
);
