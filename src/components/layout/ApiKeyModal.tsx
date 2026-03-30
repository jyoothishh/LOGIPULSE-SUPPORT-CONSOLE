import React, { useState } from 'react';
import { testApiKey } from '../../services/translation';
import s from './ApiKeyModal.module.css';

interface Props { currentKey: string; onSave: (key: string) => void; onClose: () => void; }

export const ApiKeyModal: React.FC<Props> = ({ currentKey, onSave, onClose }) => {
  const [key,     setKey]     = useState(currentKey);
  const [testing, setTesting] = useState(false);
  const [result,  setResult]  = useState<'ok'|'fail'|null>(null);

  const test = async () => {
    if (!key.trim()) return;
    setTesting(true); setResult(null);
    setResult(await testApiKey(key) ? 'ok' : 'fail');
    setTesting(false);
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={e=>e.stopPropagation()}>
        <div className={s.title}>🤖 Claude API Key</div>
        <p className={s.desc}>Translates your English replies into the user's native language in real time. Completely optional — the console works without it.</p>

        <div className={s.compare}>
          <div className={s.cWith}>
            <div className={s.cLabel} style={{color:'var(--green)'}}>🤖 With API Key</div>
            <ul><li>Any phrase translated</li><li>Context-aware phrasing</li><li>Logistics terminology</li><li>All 5 languages</li></ul>
          </div>
          <div className={s.cWithout}>
            <div className={s.cLabel} style={{color:'var(--amber)'}}>📖 Without Key</div>
            <ul><li>Common phrases only</li><li>Instant, no API call</li><li>Fully offline</li><li>Good for basics</li></ul>
          </div>
        </div>

        <div className={s.fieldLabel}>API Key</div>
        <div className={s.fieldRow}>
          <input className={s.input} type="password" placeholder="sk-ant-api03-… (leave blank to disable)"
            value={key} onChange={e=>{setKey(e.target.value);setResult(null);}} autoFocus/>
          <button className={s.testBtn} disabled={!key.trim()||testing} onClick={test}>
            {testing ? '…' : 'Test'}
          </button>
        </div>
        {result==='ok'   && <div className={s.ok}>✓ Key valid — LLM translation ready</div>}
        {result==='fail' && <div className={s.fail}>✗ Test failed — check key and try again</div>}
        {key && !result  && <div className={s.hint}>Hit "Test" to verify before saving</div>}

        <div className={s.footer}>
          <button className={s.clearBtn} onClick={()=>{setKey('');setResult(null);}}>Clear Key</button>
          <div style={{display:'flex',gap:6}}>
            <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={s.saveBtn} onClick={()=>onSave(key.trim())}>
              {key.trim() ? 'Save & Enable' : 'Continue Without Key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
