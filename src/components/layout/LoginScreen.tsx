import React, { useState } from 'react';
import { Agent } from '../../types';
import { AGENTS } from '../../constants';
import { testApiKey } from '../../services/translation';
import s from './LoginScreen.module.css';

interface Props { onLogin: (agent: Agent, apiKey: string) => void; }

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [agent,  setAgent]  = useState<Agent|null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('lp_ak') ?? '');
  const [testing,setTesting]= useState(false);
  const [testRes,setTestRes]= useState<'ok'|'fail'|null>(null);

  const tryTest = async () => {
    if (!apiKey.trim()) return;
    setTesting(true); setTestRes(null);
    setTestRes(await testApiKey(apiKey) ? 'ok' : 'fail');
    setTesting(false);
  };

  const submit = () => {
    if (!agent) return;
    if (apiKey) localStorage.setItem('lp_ak', apiKey);
    onLogin(agent, apiKey);
  };

  return (
    <div className={s.screen}>
      <div className={s.grid}/>
      <div className={s.glow}/>
      <div className={s.card}>
        <div className={s.brand}>
          <div className={s.mark}>L</div>
          <div><div className={s.brandName}>LogiPulse</div><div className={s.brandSub}>Support Console</div></div>
        </div>

        <h1 className={s.heading}>Sign in</h1>
        <p className={s.sub}>Choose your agent profile to open the console</p>

        <section className={s.section}>
          <div className={s.label}>Select Agent</div>
          <div className={s.agentGrid}>
            {AGENTS.map(a => (
              <div key={a.id} className={`${s.agentCard} ${agent?.id===a.id?s.agentActive:''}`} onClick={()=>setAgent(a)}>
                <div className={s.agentAvatar} style={{background:a.color}}>{a.initials}</div>
                <div className={s.agentName}>{a.name}</div>
                <div className={s.agentRole}>{a.role}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={s.section}>
          <div className={s.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span>Claude API Key</span>
            <span className={s.optionalBadge}>Optional</span>
          </div>

          <div className={s.keyCard}>
            <div className={s.keyCardBody}>
              <span style={{fontSize:18,flexShrink:0}}>🤖</span>
              <div>
                <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>Enable AI Translation</div>
                <div style={{fontSize:11,color:'var(--tx-secondary)',lineHeight:1.5}}>
                  Translates your replies into the user's language in real time.
                  <strong style={{color:'var(--tx-primary)'}}> Totally optional</strong> — built-in phrase translation works without a key.
                </div>
              </div>
            </div>
            <div className={s.keyCardCompare}>
              <div>✅ With key — full LLM translation for any message</div>
              <div>📖 Without key — common phrase dictionary</div>
            </div>
          </div>

          <div className={s.keyRow}>
            <input className={s.input} type="password" placeholder="sk-ant-api03-… (leave blank to skip)"
              value={apiKey} onChange={e=>{setApiKey(e.target.value);setTestRes(null);}}/>
            <button className={s.testBtn} disabled={!apiKey.trim()||testing} onClick={tryTest}>
              {testing ? '…' : 'Test'}
            </button>
          </div>
          {testRes==='ok'   && <div className={s.testOk}>✓ Key is valid — LLM translation ready</div>}
          {testRes==='fail' && <div className={s.testFail}>✗ Key test failed — check and try again</div>}
        </section>

        <button className={s.submit} disabled={!agent} onClick={submit}>
          {agent ? 'Open Console →' : 'Select an agent above'}
        </button>
        {agent && !apiKey && (
          <p className={s.skipNote}>Continuing without LLM translation — you can add a key inside the console anytime</p>
        )}
      </div>
    </div>
  );
};
