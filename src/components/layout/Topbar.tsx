import React from 'react';
import { Agent, UserInfo, ConnStatus } from '../../types';
import { Avatar } from '../common/Avatar';
import s from './Topbar.module.css';

const STATUS_LABEL: Record<ConnStatus,string> = {
  live:'● Live (.NET)', demo:'◎ Demo Mode', offline:'○ Offline', connecting:'… Connecting',
};

interface Props {
  agent: Agent; users: UserInfo[]; status: ConnStatus;
  apiKey: string; onOpenApiKey: () => void; onSignOut: () => void;
}

export const Topbar: React.FC<Props> = ({ agent, users, status, apiKey, onOpenApiKey, onSignOut }) => {
  const online = users.filter(u => u.isOnline).length;
  const idle   = users.filter(u => u.isOnline && (u.idleSeconds ?? 0) >= 60).length;
  const alerts = users.filter(u => u.hasAlert).length;
  const live   = status === 'live';
  const demo   = status === 'demo' || status === 'connecting';

  return (
    <header className={s.bar}>
      <div className={s.brand}>
        <div className={s.mark}>L</div>
        <div>
          <div className={s.name}>LogiPulse</div>
          <div className={s.sub}>Support Console</div>
        </div>
      </div>

      <div className={s.center}>
        <Chip color="green" label="Online"  val={online}/>
        {idle   > 0 && <Chip color="amber" label="Idle"   val={idle}/>}
        {alerts > 0 && <Chip color="red"   label="Alerts" val={alerts}/>}
      </div>

      <div className={s.right}>
        <span className={`${s.conn} ${live ? s.live : demo ? s.demo : s.offline}`}>
          {STATUS_LABEL[status]}
        </span>
        <button className={`${s.apiBtn} ${apiKey ? s.apiBtnOn : ''}`} onClick={onOpenApiKey}>
          {apiKey ? '🤖 LLM ✓' : '🤖 Add API Key'}
        </button>
        <div className={s.pill}>
          <Avatar name={agent.name} userId={agent.id} size={26} fontSize={10} customColor={agent.color}/>
          <span className={s.agentName}>{agent.name}</span>
        </div>
        <button className={s.signOut} onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  );
};

const DOT_CLR: Record<string,string> = { green:'var(--green)', amber:'var(--amber)', red:'var(--red)' };
const VAL_CLR: Record<string,string> = { green:'var(--green)', amber:'var(--amber)', red:'var(--red)' };
const BDR_CLR: Record<string,string> = { green:'var(--green-ring)', amber:'var(--amber-ring)', red:'var(--red-ring)' };

const Chip: React.FC<{ color:string; label:string; val:number }> = ({ color, label, val }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:20,
    fontFamily:'var(--f-mono)', fontSize:10, fontWeight:500, background:'var(--bg-raised)',
    border:`1px solid ${BDR_CLR[color]}` }}>
    <span style={{ width:6, height:6, borderRadius:'50%', background:DOT_CLR[color],
      animation:'pulseDot 2s ease-in-out infinite', flexShrink:0 }}/>
    <span style={{ color:'var(--tx-muted)' }}>{label}</span>
    <strong style={{ color:VAL_CLR[color] }}>{val}</strong>
  </span>
);
