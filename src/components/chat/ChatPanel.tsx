import React, { useEffect, useRef, useState } from 'react';
import { Agent, ChatMessage, UserInfo } from '../../types';
import { LANG_FLAGS, LANG_NAMES } from '../../constants';
import { Avatar } from '../common/Avatar';
import { translateMessage } from '../../services/translation';
import s from './ChatPanel.module.css';

const fmt = (d:Date) => d.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
const uid = () => Math.random().toString(36).slice(2,10);

interface Props {
  user: UserInfo | null;
  messages: ChatMessage[];
  agent: Agent;
  apiKey: string;
  onSend: (user: UserInfo, english: string, translated: string, usedLLM: boolean) => void;
}

export const ChatPanel: React.FC<Props> = ({ user, messages, agent, apiKey, onSend }) => {
  const [text,  setText]  = useState('');
  const [busy,  setBusy]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const send = async () => {
    const t = text.trim();
    if (!t || !user || busy) return;
    setText('');
    setBusy(true);
    try {
      const { translated, usedLLM } = await translateMessage(t, user.lang, apiKey);
      onSend(user, t, translated, usedLLM);
    } finally { setBusy(false); }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const lang = user?.lang ?? 'en';

  if (!user) return (
    <div className={s.panel}>
      <div className={s.header}><div className={s.hTitle}>Conversation</div><div className={s.hSub}>Select a user to chat</div></div>
      <div className={s.empty}><div className={s.emptyIco}>💬</div><div className={s.emptyTxt}>No conversation open</div></div>
    </div>
  );

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <Avatar name={user.name} userId={user.id} size={28}/>
        <div>
          <div className={s.hTitle}>{user.name}</div>
          <div className={s.hSub}>{LANG_FLAGS[lang]} {LANG_NAMES[lang]} · {user.currentPage ?? 'Unknown'}</div>
        </div>
      </div>

      {(user.idleSeconds ?? 0) >= 60 && (
        <div className={s.idleBanner}>
          <span>⏱</span>
          <span>Idle {Math.floor((user.idleSeconds??0)/60)}m on <strong>{user.currentPage}</strong></span>
        </div>
      )}

      <div className={s.messages}>
        {messages.length === 0
          ? <div className={s.empty} style={{flex:1}}><div className={s.emptyIco}>💬</div><div className={s.emptyTxt}>Start the conversation</div></div>
          : messages.map(m => (
              <div key={m.id} className={`${s.wrap} ${s[m.dir]}`}>
                <div className={s.bubble}>
                  {m.text}
                  {m.translated && m.translated !== m.text && (
                    <div className={s.translation}>{m.usedLLM ? '🤖' : '📖'} {m.translated}</div>
                  )}
                </div>
                <div className={s.meta}>
                  <span className={`${s.tag} ${m.dir==='out'?s.tagAgent:m.dir==='sys'?s.tagSys:s.tagUser}`}>
                    {m.dir==='out' ? agent.name : m.dir==='sys' ? 'System' : m.from}
                  </span>
                  <span>{fmt(m.ts)}</span>
                  {m.usedLLM && <span className={s.tagLLM}>🤖 LLM</span>}
                </div>
              </div>
            ))
        }
        {busy && (
          <div className={s.translating}>
            <span className={s.dots}><span/><span/><span/></span>
            Translating to {LANG_NAMES[lang]}…
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div className={s.inputWrap}>
        <div className={s.inputBox}>
          <textarea rows={2} placeholder={`Type in English → ${LANG_NAMES[lang]}${apiKey?' (🤖 Claude)':' (built-in)'}`}
            value={text} onChange={e=>setText(e.target.value)} onKeyDown={onKey}/>
          <div className={s.inputFoot}>
            <div className={s.hint}>
              <span>{LANG_FLAGS[lang]}</span>
              <span>→ {LANG_NAMES[lang]}</span>
              {apiKey
                ? <span className={s.llmBadge}>🤖 Claude</span>
                : <span className={s.builtinBadge}>📖 built-in</span>}
            </div>
            <button className={s.sendBtn} disabled={!text.trim()||busy} onClick={send}>
              {LANG_FLAGS[lang]} Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
