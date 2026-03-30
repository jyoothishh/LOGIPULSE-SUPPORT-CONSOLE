import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Agent, ChatMessage, FeedEvent, Toast, UserInfo } from './types';
import { FLOWS, LANG_NAMES } from './constants';
import { useSignalR } from './hooks/useSignalR';
import { useToasts } from './hooks/useToasts';
import { Topbar } from './components/layout/Topbar';
import { LoginScreen } from './components/layout/LoginScreen';
import { ApiKeyModal } from './components/layout/ApiKeyModal';
import { UserList } from './components/users/UserList';
import { ActivityFeed } from './components/activity/ActivityFeed';
import { GuidancePanel } from './components/guidance/GuidancePanel';
import { ChatPanel } from './components/chat/ChatPanel';
import { UiTreeViewer } from './components/uitree/UiTreeViewer';
import { ToastDock } from './components/common/ToastDock';

const uid = () => Math.random().toString(36).slice(2, 10);

type MainTab = 'activity' | 'guidance' | 'uitree';

export function App() {
  // ── All state at top — no early returns before hooks ──────────────────────
  const [agent,        setAgent]        = useState<Agent | null>(null);
  const [apiKey,       setApiKey]       = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [mainTab,      setMainTab]      = useState<MainTab>('activity');

  const { toasts, addToast, dismiss } = useToasts();

  const {
    status, users, events, chats, unread, uiElements,
    clearUnread, pushChat, pushEvent,
    sendAgentChat, sendFlow, sendHighlight,
  } = useSignalR(agent);

  // Toast on new stuck/idle/tracked alerts
  const prevAlertCount = useRef(0);
  useEffect(() => {
    const alerts = events.filter(e =>
      e.type === 'stuck_alert' || e.type === 'idle_alert' ||
      (e.type === 'tracked_event' && e.needsAttention)
    );
    if (alerts.length > prevAlertCount.current) {
      const newest = alerts[0];
      if (newest) {
        const isIdle = newest.type === 'idle_alert';
        const evLabel = newest.eventType ? ` [${newest.eventType}]` : '';
        addToast({
          title: isIdle
            ? `⏱ Idle: ${newest.userName}`
            : newest.type === 'tracked_event'
              ? `📡 ${newest.userName}${evLabel}`
              : `⚠ Stuck: ${newest.userName}`,
          msg:   newest.detail,
          icon:  isIdle ? '⏱' : newest.type === 'tracked_event' ? '📡' : '⚠️',
          color: isIdle ? 'amber' : newest.severity === 'error' ? 'red' : 'amber',
        });
      }
    }
    prevAlertCount.current = alerts.length;
  }, [events, addToast]);

  // Clear unread when user is selected
  useEffect(() => { if (selectedId) clearUnread(selectedId); }, [selectedId, chats, clearUnread]);

  // Derived values
  const selectedUser  = useMemo(() => users.find(u => u.id === selectedId) ?? null, [users, selectedId]);
  const selectedChats = useMemo(() => selectedId ? (chats[selectedId] ?? []) : [], [chats, selectedId]);
  const visibleEvents = useMemo(() => selectedId ? events.filter(e => e.userId === selectedId) : events, [events, selectedId]);

  // Alert counts
  const alertCount    = useMemo(() => users.filter(u => u.hasAlert).length, [users]);
  const trackedCount  = useMemo(() => events.filter(e => e.type==='tracked_event' && e.needsAttention).length, [events]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogin = useCallback((a: Agent, key: string) => {
    setAgent(a);
    setApiKey(key);
  }, []);

  const handleSignOut = useCallback(() => setAgent(null), []);

  const handleSaveKey = useCallback((k: string) => {
    setApiKey(k);
    setShowKeyModal(false);
  }, []);

  const handleSendChat = useCallback(async (user: UserInfo, text: string, translated: string, usedLLM: boolean) => {
    if (!user) return;
    await sendAgentChat(user.id, text);
    pushChat(user.id, {
      id:uid(), dir:'out', from:agent?.name ?? 'Agent',
      text, translated, usedLLM, ts:new Date(),
    } as ChatMessage);
    pushEvent({ id:uid(), type:'agent_sent', userId:user.id, userName:user.name,
      detail:`[${agent?.name}] ${text}`, ts:new Date() } as FeedEvent);
    addToast({ title:'✅ Message sent', msg:`→ ${user.name} (${LANG_NAMES[user.lang]??user.lang})`,
      icon:'✉️', color:'green' });
  }, [sendAgentChat, pushChat, pushEvent, addToast, agent]);

  const handleSendFlow = useCallback((userId: string, flowId: string) => {
    sendFlow(userId, flowId);
    const u = users.find(x => x.id === userId);
    const f = FLOWS.find(x => x.id === flowId);
    pushChat(userId, { id:uid(), dir:'sys', from:'System', text:`📋 Guidance flow sent: "${f?.title}"`, ts:new Date() } as ChatMessage);
    pushEvent({ id:uid(), type:'flow_sent', userId, userName:u?.name??userId, detail:flowId, ts:new Date() } as FeedEvent);
  }, [sendFlow, users, pushChat, pushEvent]);

  const handleSendHighlight = useCallback((userId: string, seq: string[], ms: number) => {
    sendHighlight(userId, seq, ms);
    const u = users.find(x => x.id === userId);
    pushChat(userId, { id:uid(), dir:'sys', from:'System', text:`✨ Highlighted: ${seq.slice(0,4).join(' → ')}${seq.length>4?'…':''}`, ts:new Date() } as ChatMessage);
    pushEvent({ id:uid(), type:'highlight_sent', userId, userName:u?.name??userId, detail:`${seq.length} elements highlighted`, ts:new Date() } as FeedEvent);
  }, [sendHighlight, users, pushChat, pushEvent]);

  const [pendingElementId, setPendingElementId] = useState<string | null>(null);

  // Handle element selected from UI tree → switch to guidance tab and pre-select the element
  const handleTreeElementSelect = useCallback((id: string) => {
    setPendingElementId(id);
    setMainTab('guidance');
  }, []);

  // ── Render: Login gate ────────────────────────────────────────────────────
  if (!agent) {
    return (
      <>
        <LoginScreen onLogin={handleLogin}/>
        <ToastDock toasts={toasts} onDismiss={dismiss}/>
      </>
    );
  }

  // ── Tab definitions ───────────────────────────────────────────────────────
  const TABS: { id: MainTab; icon: string; label: string; badge?: number }[] = [
    { id:'activity',  icon:'📊', label:'Activity',  badge: Math.min(events.length,99) },
    { id:'guidance',  icon:'🧭', label:'Guidance'  },
    { id:'uitree',    icon:'🌳', label:'UI Tree',   badge: uiElements.length },
  ];

  // ── Render: Main Console ──────────────────────────────────────────────────
  return (
    <div style={{ display:'grid', gridTemplateColumns:'var(--sidebar-w) 1fr var(--chat-w)', gridTemplateRows:'var(--topbar-h) 1fr', height:'100vh', width:'100vw' }}>

      <Topbar agent={agent} users={users} status={status} apiKey={apiKey}
        onOpenApiKey={() => setShowKeyModal(true)} onSignOut={handleSignOut}/>

      {/* Left sidebar */}
      <UserList users={users} selectedId={selectedId} unread={unread} onSelect={setSelectedId}/>

      {/* Center */}
      <div style={{ display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg-void)', position:'relative' }}>
        {/* Grid texture */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(245,166,35,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(245,166,35,0.025) 1px,transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }}/>

        {/* Header */}
        <div style={{ position:'relative', zIndex:1, background:'var(--bg-base)', borderBottom:'1px solid var(--br-base)', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:'var(--f-display)', fontSize:14, fontWeight:700 }}>
              {selectedUser ? selectedUser.name : 'All Activity'}
            </div>
            <div style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--tx-muted)', marginTop:2, display:'flex', gap:8 }}>
              {selectedUser
                ? <><span>📍 {selectedUser.currentPage ?? 'Unknown'}</span><span>·</span><span>{selectedUser.totalClicks} clicks</span></>
                : <><span>{events.length} events</span><span>·</span><span>{users.filter(u=>u.isOnline).length} online</span>
                    {alertCount>0 && <span style={{color:'#F5A623'}}>· ⚠ {alertCount} alerts</span>}
                    {trackedCount>0 && <span style={{color:'#F43F5E'}}>· 📡 {trackedCount} needs attention</span>}
                  </>
              }
            </div>
          </div>
          {selectedUser && (
            <button onClick={() => setSelectedId(null)}
              style={{ padding:'5px 11px', fontSize:11, fontWeight:600, background:'transparent', border:'1px solid var(--br-base)', borderRadius:'var(--r)', color:'var(--tx-secondary)', cursor:'pointer' }}>
              ✕ Deselect
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ position:'relative', zIndex:1, display:'flex', background:'var(--bg-base)', borderBottom:'1px solid var(--br-base)', padding:'0 16px', flexShrink:0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setMainTab(tab.id)}
              style={{ padding:'9px 12px', fontFamily:'var(--f-display)', fontSize:11, fontWeight:600,
                color: mainTab===tab.id ? 'var(--amber)' : 'var(--tx-muted)',
                background:'transparent', border:'none',
                borderBottom: mainTab===tab.id ? '2px solid var(--amber)' : '2px solid transparent',
                cursor:'pointer', transition:'all 0.14s', display:'flex', alignItems:'center', gap:6 }}>
              {tab.icon} {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span style={{ padding:'1px 5px', background: mainTab===tab.id ? 'var(--amber-glow)' : 'var(--bg-raised)', borderRadius:8, fontSize:9, fontFamily:'var(--f-mono)', color: mainTab===tab.id ? 'var(--amber)' : 'var(--tx-muted)' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ position:'relative', zIndex:1, flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {mainTab === 'activity' && <ActivityFeed events={visibleEvents} selectedUserName={selectedUser?.name}/>}
          {mainTab === 'guidance' && (
            <GuidancePanel user={selectedUser} uiElements={uiElements}
              onSendFlow={handleSendFlow} onSendHighlight={handleSendHighlight}
              addToast={addToast as (t: Omit<Toast,'id'>) => void}
              pendingElementId={pendingElementId}
              onPendingElementConsumed={() => setPendingElementId(null)}/>
          )}
          {mainTab === 'uitree' && (
            <UiTreeViewer elements={uiElements} onSelectElement={handleTreeElementSelect}/>
          )}
        </div>
      </div>

      {/* Right chat panel */}
      <ChatPanel user={selectedUser} messages={selectedChats} agent={agent}
        apiKey={apiKey} onSend={handleSendChat}/>

      <ToastDock toasts={toasts} onDismiss={dismiss}/>

      {showKeyModal && (
        <ApiKeyModal currentKey={apiKey} onSave={handleSaveKey} onClose={() => setShowKeyModal(false)}/>
      )}
    </div>
  );
}
