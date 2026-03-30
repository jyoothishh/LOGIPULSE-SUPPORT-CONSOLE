import React from 'react';
import { FeedEvent } from '../../types';
import s from './ActivityFeed.module.css';

// ── Event meta definitions ──────────────────────────────────────────────────
const META: Record<string,{icon:string;bg:string;color:string;label?:string}> = {
  page_visit:             {icon:'📍',bg:'rgba(56,189,248,0.12)',  color:'#38BDF8'},
  element_click:          {icon:'👆',bg:'rgba(167,139,250,0.12)', color:'#A78BFA'},
  user_chat:              {icon:'💬',bg:'rgba(56,189,248,0.12)',  color:'#38BDF8'},
  stuck_alert:            {icon:'⚠️',bg:'rgba(244,63,94,0.15)',   color:'#F43F5E'},
  idle_alert:             {icon:'⏱', bg:'rgba(245,166,35,0.15)',  color:'#F5A623'},
  user_joined:            {icon:'🟢',bg:'rgba(34,197,94,0.12)',   color:'#22C55E'},
  user_left:              {icon:'⚫',bg:'rgba(100,116,139,0.12)', color:'#64748B'},
  agent_sent:             {icon:'📤',bg:'rgba(245,166,35,0.12)',  color:'#F5A623'},
  flow_sent:              {icon:'🧭',bg:'rgba(34,197,94,0.12)',   color:'#22C55E'},
  highlight_sent:         {icon:'✨',bg:'rgba(245,166,35,0.12)',  color:'#F5A623'},
  info:                   {icon:'ℹ️',bg:'rgba(100,116,139,0.12)', color:'#64748B'},
  // TrackedEvent subtypes
  tracked_event:          {icon:'📡',bg:'rgba(100,116,139,0.10)', color:'#94A3B8'},
  EVENT_CLICK:            {icon:'👆',bg:'rgba(167,139,250,0.10)', color:'#A78BFA',label:'Click'},
  EVENT_UPLOAD_START:     {icon:'⬆️',bg:'rgba(56,189,248,0.10)', color:'#38BDF8',label:'Upload'},
  EVENT_UPLOAD_FAIL:      {icon:'❌',bg:'rgba(244,63,94,0.18)',   color:'#F43F5E',label:'Upload Fail'},
  EVENT_IMPORT_RETRY:     {icon:'🔄',bg:'rgba(245,166,35,0.15)',  color:'#F5A623',label:'Import Retry'},
  EVENT_WIZARD_STUCK:     {icon:'🧩',bg:'rgba(245,166,35,0.15)',  color:'#F5A623',label:'Wizard Stuck'},
  EVENT_BACK_FORWARD_REPEAT:{icon:'↔️',bg:'rgba(245,166,35,0.12)',color:'#FBBF24',label:'Back/Forward'},
  EVENT_SCREEN_HOLD:      {icon:'⏳',bg:'rgba(245,166,35,0.12)',  color:'#FBBF24',label:'Screen Hold'},
};

const severityBorder: Record<string, string> = {
  error:   '#F43F5E',
  warning: '#F5A623',
  info:    'transparent',
};

const describe = (ev: FeedEvent): string | undefined => {
  if (ev.type === 'tracked_event' && ev.eventType) return ev.detail;
  return ({
    page_visit:    `navigated to ${ev.page ?? ev.detail}`,
    element_click: `clicked ${ev.elementId}${(ev.clickCount??0)>1?` ×${ev.clickCount}`:''}`,
    user_chat:     `said: "${(ev.detail??'').slice(0,90)}"`,
    stuck_alert:   ev.detail,
    idle_alert:    ev.detail,
    user_joined:   ev.detail ?? 'connected',
    user_left:     'disconnected',
    agent_sent:    ev.detail,
    flow_sent:     `guidance flow: ${ev.detail}`,
    highlight_sent:ev.detail,
    info:          ev.detail,
  } as Record<string,string|undefined>)[ev.type] ?? ev.detail;
};

const getMeta = (ev: FeedEvent) => {
  if (ev.type === 'tracked_event' && ev.eventType && META[ev.eventType]) return META[ev.eventType];
  return META[ev.type] ?? META.info;
};

const fmt = (d:Date) => d.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',second:'2-digit'});

export const ActivityFeed: React.FC<{events:FeedEvent[];selectedUserName?:string}> = ({events,selectedUserName}) => (
  <div className={s.feed}>
    {events.length===0
      ? <div className={s.empty}><div className={s.emptyIco}>📊</div><div>{selectedUserName?`No activity for ${selectedUserName}`:'Waiting for user activity…'}</div></div>
      : events.map(ev => {
          const m = getMeta(ev);
          const border = ev.severity ? severityBorder[ev.severity] : 'transparent';
          const isAlert = ev.needsAttention || ev.type === 'stuck_alert' || ev.type === 'idle_alert';
          return (
            <div key={ev.id} className={`${s.row} ${isAlert?s.rowAlert:''}`}
              style={{ background:m.bg, borderLeft:`3px solid ${border === 'transparent' ? m.color : border}` }}>
              <span className={s.icon}>{m.icon}</span>
              <div className={s.body}>
                <div className={s.header}>
                  <span className={s.user}>{ev.userName}</span>
                  {(m.label || ev.eventType) && (
                    <span className={s.badge} style={{background:m.color+'22',color:m.color,border:`1px solid ${m.color}44`}}>
                      {m.label ?? ev.eventType}
                    </span>
                  )}
                  {ev.page && <span className={s.page}>{ev.page}</span>}
                  {isAlert && <span className={s.alertBadge}>⚠ Needs attention</span>}
                </div>
                <div className={s.desc} style={{color:m.color+'CC'}}>{describe(ev)}</div>
                {ev.elementId && ev.type !== 'tracked_event' && (
                  <div className={s.meta}>element: <code>{ev.elementId}</code></div>
                )}
                {ev.type==='tracked_event' && ev.elementId && (
                  <div className={s.meta}>element: <code>{ev.elementId}</code>{ev.metadata && Object.entries(ev.metadata).slice(0,3).map(([k,v])=>(
                    <span key={k}> · {k}: <code>{String(v)}</code></span>
                  ))}</div>
                )}
              </div>
              <span className={s.ts}>{fmt(ev.ts)}</span>
            </div>
          );
        })
    }
  </div>
);
