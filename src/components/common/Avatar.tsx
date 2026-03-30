import React from 'react';

const COLORS = ['#F5A623','#22C55E','#38BDF8','#A78BFA','#F43F5E','#FB923C'];

export function userColor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}

export function initials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();
}

interface Props {
  name: string; userId: string;
  size?: number; fontSize?: number;
  showStatus?: boolean; isOnline?: boolean;
  customColor?: string;
}

export const Avatar: React.FC<Props> = ({ name, userId, size=32, fontSize=11, showStatus, isOnline, customColor }) => {
  const col = customColor ?? userColor(userId);
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:col+'22', color:col,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--f-display)', fontSize, fontWeight:700, flexShrink:0, position:'relative' }}>
      {initials(name)}
      {showStatus && (
        <div style={{ position:'absolute', bottom:-1, right:-1, width:9, height:9, borderRadius:'50%',
          background: isOnline ? 'var(--green)' : '#374151', border:'2px solid var(--bg-base)' }}/>
      )}
    </div>
  );
};
