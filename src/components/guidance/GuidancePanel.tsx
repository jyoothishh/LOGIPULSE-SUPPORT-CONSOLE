import React, { useState, useEffect } from 'react';
import { UserInfo, UiElement, Toast } from '../../types';
import { FLOWS } from '../../constants';
import s from './GuidancePanel.module.css';

interface Props {
  user: UserInfo | null;
  uiElements: UiElement[];
  onSendFlow: (userId: string, flowId: string) => void;
  onSendHighlight: (userId: string, seq: string[], ms: number) => void;
  addToast: (t: Omit<Toast,'id'>) => void;
  /** Element ID selected from the UI Tree tab — auto-added to the highlight sequence. */
  pendingElementId?: string | null;
  onPendingElementConsumed?: () => void;
}

export const GuidancePanel: React.FC<Props> = ({
  user, uiElements, onSendFlow, onSendHighlight, addToast,
  pendingElementId, onPendingElementConsumed,
}) => {
  const [tab,    setTab]    = useState<'flows'|'highlight'>('flows');
  const [flowId, setFlowId] = useState<string|null>(null);
  const [seq,    setSeq]    = useState<string[]>([]);
  const [intMs,  setIntMs]  = useState(1800);

  // When an element is selected from the UI Tree, switch to highlight tab and add it
  useEffect(() => {
    if (pendingElementId) {
      setTab('highlight');
      setSeq(p => p.includes(pendingElementId) ? p : [...p, pendingElementId]);
      onPendingElementConsumed?.();
    }
  }, [pendingElementId, onPendingElementConsumed]);

  const toggleEl = (id: string) =>
    setSeq(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);

  if (!user) return (
    <div className={s.noUser}>
      <div className={s.noUserIco}>🧭</div>
      <div className={s.noUserTitle}>No User Selected</div>
      <div className={s.noUserSub}>Select a user from the left panel to send guided flows or highlight elements in their browser</div>
    </div>
  );

  return (
    <div className={s.panel}>
      <div className={s.subTabs}>
        <button className={`${s.stab} ${tab==='flows'?s.stabActive:''}`} onClick={()=>setTab('flows')}>📋 Guided Flows</button>
        <button className={`${s.stab} ${tab==='highlight'?s.stabActive:''}`} onClick={()=>setTab('highlight')}>✨ Highlight Steps</button>
      </div>

      <div className={s.body}>
        {tab==='flows' && <>
          <div className={s.sLabel}>Select a Flow</div>
          <div className={s.flowGrid}>
            {FLOWS.map(f=>(
              <div key={f.id} className={`${s.flowCard} ${flowId===f.id?s.flowActive:''}`} onClick={()=>setFlowId(flowId===f.id?null:f.id)}>
                <div className={s.flowIcon}>{f.icon}</div>
                <div className={s.flowTitle}>{f.title}</div>
                <div className={s.flowDesc}>{f.desc}</div>
                <div className={s.flowSteps}>{f.steps} steps</div>
              </div>
            ))}
          </div>
          {flowId && (
            <div className={s.sendBox}>
              <p>Server translates all step text to <strong>{user.lang}</strong> and highlights each UI element in the user's browser.</p>
              <button className={s.btnGreen} onClick={()=>{ onSendFlow(user.id,flowId); addToast({title:'🧭 Flow Sent',msg:`${FLOWS.find(f=>f.id===flowId)?.title} → ${user.name}`,icon:'📋',color:'green'}); setFlowId(null); }}>
                🚀 Send to {user.name}
              </button>
            </div>
          )}
        </>}

        {tab==='highlight' && <>
          <div className={s.sLabel}>Pick Elements in Order</div>
          <p className={s.hint}>Click to build a highlight sequence — each element glows gold in the user's browser.</p>
          <div className={s.chips}>
            {uiElements.map(el=>{
              const idx=seq.indexOf(el.id);
              return (
                <div key={el.id} className={`${s.chip} ${idx>=0?s.chipSel:''}`} onClick={()=>toggleEl(el.id)}>
                  {idx>=0 && <span className={s.chipNum}>{idx+1}</span>}
                  {el.label||el.id}
                </div>
              );
            })}
          </div>
          {seq.length>0 && <>
            <div className={s.sLabel} style={{marginTop:12}}>Sequence — {seq.length} steps</div>
            <div className={s.seqRow}>
              {seq.map((id,i)=>{
                const el=uiElements.find(e=>e.id===id);
                return <React.Fragment key={id}>
                  {i>0 && <span className={s.arr}>→</span>}
                  <div className={s.seqItem}><span className={s.seqNum}>{i+1}</span>{el?.label??id}</div>
                </React.Fragment>;
              })}
            </div>
            <div className={s.delayRow}>
              <span>Step delay:</span>
              <select value={intMs} onChange={e=>setIntMs(+e.target.value)}>
                <option value={800}>Fast (0.8s)</option>
                <option value={1800}>Normal (1.8s)</option>
                <option value={2500}>Slow (2.5s)</option>
                <option value={3500}>Very slow (3.5s)</option>
              </select>
            </div>
            <div className={s.actions}>
              <button className={s.btnGhost} onClick={()=>setSeq([])}>Clear</button>
              <button className={s.btnAmber} onClick={()=>{ onSendHighlight(user.id,seq,intMs); addToast({title:'✨ Highlights Sent',msg:`${seq.length} elements → ${user.name}`,icon:'🎯',color:'amber'}); setSeq([]); }}>
                ✨ Send to {user.name}
              </button>
            </div>
          </>}
        </>}
      </div>
    </div>
  );
};
