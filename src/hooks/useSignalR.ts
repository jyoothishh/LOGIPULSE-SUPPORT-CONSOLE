import { useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { Agent, UserInfo, FeedEvent, ChatMessage, UiElement, ConnStatus } from '../types';
import { HUB_URL, SEED_ELEMENTS, DEMO_USERS, LANG_FLAGS, LANG_NAMES } from '../constants';

const uid = () => Math.random().toString(36).slice(2, 10);

// Map LP event types to severity
const severityMap: Record<string, 'info' | 'warning' | 'error'> = {
  EVENT_CLICK:               'info',
  EVENT_UPLOAD_START:        'info',
  EVENT_UPLOAD_FAIL:         'error',
  EVENT_IMPORT_RETRY:        'warning',
  EVENT_WIZARD_STUCK:        'warning',
  EVENT_BACK_FORWARD_REPEAT: 'warning',
  EVENT_SCREEN_HOLD:         'warning',
};

const needsAttentionSet = new Set([
  'EVENT_UPLOAD_FAIL','EVENT_IMPORT_RETRY','EVENT_WIZARD_STUCK','EVENT_BACK_FORWARD_REPEAT',
]);

export function useSignalR(agent: Agent | null) {
  const connRef = useRef<signalR.HubConnection | null>(null);

  const [status,     setStatus]     = useState<ConnStatus>('connecting');
  const [users,      setUsers]      = useState<UserInfo[]>([]);
  const [events,     setEvents]     = useState<FeedEvent[]>([]);
  const [chats,      setChats]      = useState<Record<string, ChatMessage[]>>({});
  const [unread,     setUnread]     = useState<Record<string, number>>({});
  const [uiElements, setUiElements] = useState<UiElement[]>(SEED_ELEMENTS);

  const unreadRef = useRef<Record<string, number>>({});

  const pushEvent = useCallback((ev: FeedEvent) => {
    setEvents(p => [ev, ...p].slice(0, 500));
  }, []);

  const pushChat = useCallback((userId: string, msg: ChatMessage) => {
    setChats(p => ({ ...p, [userId]: [...(p[userId] ?? []), msg].slice(-150) }));
    unreadRef.current[userId] = (unreadRef.current[userId] ?? 0) + 1;
    setUnread({ ...unreadRef.current });
  }, []);

  const clearUnread = useCallback((userId: string) => {
    unreadRef.current[userId] = 0;
    setUnread({ ...unreadRef.current });
  }, []);

  useEffect(() => {
    if (!agent) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl("http://192.168.1.42:5000/hubs/support")
      .withAutomaticReconnect([0, 1000, 3000, 5000, 15000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conn.on('ReceiveMessage', (msg: any) => {
      switch (msg.type) {
        case 'LoginSuccess': setStatus('live'); break;

        case 'UserList':
          setUsers((msg.users ?? []).filter((u: UserInfo) => u.role === 0 || (u.role as any) === 'user'));
          break;

        case 'UserJoined':
          if (msg.user?.role === 0 || msg.user?.role === 'user') {
            setUsers(p => [msg.user, ...p.filter((u: UserInfo) => u.id !== msg.user.id)]);
            pushEvent({
              id:uid(), type:'user_joined', userId:msg.user.id, userName:msg.user.name,
              detail:`Connected · ${LANG_FLAGS[msg.user.lang]??'🌐'} ${LANG_NAMES[msg.user.lang]??msg.user.lang}`,
              ts:new Date()
            });
          }
          break;

        case 'UserLeft':
          setUsers(p => p.filter((u: UserInfo) => u.id !== msg.userId));
          pushEvent({ id:uid(), type:'user_left', userId:msg.userId, userName:msg.userName, detail:'Disconnected', ts:new Date() });
          break;

        case 'ActivityEvent':
          setUsers(p => p.map((u: UserInfo) => u.id === msg.userId
            ? { ...u, currentPage: msg.page ?? u.currentPage }
            : u));
          pushEvent({
            id:uid(), type:msg.event, eventType: msg.eventType,
            userId:msg.userId, userName:msg.userName,
            detail:msg.detail, page:msg.page, elementId:msg.elementId,
            clickCount:msg.clickCount, metadata: msg.metadata,
            ts:new Date()
          });
          if (msg.event === 'user_chat') {
            pushChat(msg.userId, { id:uid(), dir:'in', from:msg.userName, text:msg.detail ?? '', ts:new Date() });
          }
          break;

        // ── Rich tracked event (from TrackEvent hub method) ──────────────────
        case 'TrackedEvent': {
          const evType  = msg.eventType as string;
          const sev     = (msg.severity ?? severityMap[evType] ?? 'info') as 'info'|'warning'|'error';
          const needsAt = msg.needsAttention ?? needsAttentionSet.has(evType);

          if (needsAt) {
            setUsers(p => p.map((u: UserInfo) => u.id === msg.userId
              ? { ...u, hasAlert: true }
              : u));
          }

          pushEvent({
            id:uid(), type:'tracked_event',
            eventType: evType,
            severity: sev,
            needsAttention: needsAt,
            userId:msg.userId, userName:msg.userName,
            detail: buildTrackedDetail(msg),
            page:msg.page, elementId:msg.elementId,
            metadata: msg.metadata,
            ts:new Date()
          });
          break;
        }

        case 'StuckAlert':
          setUsers(p => p.map((u: UserInfo) => u.id === msg.userId
            ? { ...u, hasAlert:true, stuckReason:msg.reason, idleSeconds:msg.idleSeconds ?? u.idleSeconds }
            : u));
          pushEvent({
            id:uid(), type: msg.reason === 'LongIdle' ? 'idle_alert' : 'stuck_alert',
            userId:msg.userId, userName:msg.userName, detail:msg.description,
            page:msg.page, elementId:msg.elementId, clickCount:msg.clickCount,
            idleSeconds:msg.idleSeconds, reason:msg.reason, severity:'warning',
            needsAttention:true, ts:new Date()
          });
          break;

        case 'UiTree':
          if (Array.isArray(msg.elements) && msg.elements.length > 0) setUiElements(msg.elements);
          break;
      }
    });

    conn.onreconnecting(() => setStatus('connecting'));
    conn.onreconnected(() => {
      setStatus('live');
      conn.invoke('Login', { type:'Login', userId:agent.id, userName:agent.name, lang:'en', role:'backOffice' });
    });
    conn.onclose(() => setStatus('offline'));

    conn.start()
      .then(() => {
        connRef.current = conn;
        conn.invoke('Login', { type:'Login', userId:agent.id, userName:agent.name, lang:'en', role:'backOffice' });
      })
      .catch(() => {
        setStatus('demo');
        setUsers(DEMO_USERS);
        pushEvent({ id:uid(), type:'info', userId:'sys', userName:'System',
          detail:`Demo mode — .NET server not reachable at ${HUB_URL}`, ts:new Date() });
      });

    connRef.current = conn;

    const ping = setInterval(() => {
      if (connRef.current?.state === signalR.HubConnectionState.Connected)
        connRef.current.invoke('Ping').catch(() => {});
    }, 25000);

    return () => { clearInterval(ping); conn.stop(); };
  }, [agent?.id]); // eslint-disable-line

  const invoke = useCallback(async (method: string, payload?: unknown) => {
    const c = connRef.current;
    if (c?.state === signalR.HubConnectionState.Connected) {
      try { await c.invoke(method, payload); return true; }
      catch (e) { console.error(`[Hub] ${method}:`, e); }
    }
    return false;
  }, []);

  const sendAgentChat = useCallback((targetUserId: string, text: string) =>
    invoke('AgentChat', { type:'AgentChat', agentId:agent?.id, agentName:agent?.name, targetUserId, text }), [invoke, agent]);

  const sendFlow = useCallback((targetUserId: string, flowId: string) =>
    invoke('SendFlow', { type:'SendFlow', agentId:agent?.id, targetUserId, flowId }), [invoke, agent]);

  const sendHighlight = useCallback((targetUserId: string, sequence: string[], intervalMs = 1800) =>
    invoke('SendHighlight', { type:'SendHighlight', agentId:agent?.id, targetUserId, sequence, intervalMs }), [invoke, agent]);

  return { status, users, events, chats, unread, uiElements, clearUnread, pushChat, pushEvent, sendAgentChat, sendFlow, sendHighlight };
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function buildTrackedDetail(msg: Record<string,unknown>): string {
  const evType = msg.eventType as string;
  const meta   = msg.metadata as Record<string,unknown> | undefined;
  switch (evType) {
    case 'EVENT_CLICK':               return `Clicked "${msg.elementLabel ?? msg.elementId}" on ${msg.page}`;
    case 'EVENT_UPLOAD_START':        return `Upload started: ${meta?.fileName ?? 'file'} on ${msg.page}`;
    case 'EVENT_UPLOAD_FAIL':         return `Upload FAILED: ${meta?.fileName ?? 'file'} — ${meta?.error ?? 'unknown error'}`;
    case 'EVENT_IMPORT_RETRY':        return `Import retry on ${msg.page} (${meta?.context ?? ''})`;
    case 'EVENT_WIZARD_STUCK':        return `Wizard stuck at step "${meta?.stepLabel ?? meta?.stepIndex}" on ${msg.page}`;
    case 'EVENT_BACK_FORWARD_REPEAT': return `Back/forward repeat: ${(meta?.recentRoutes as string[])?.slice(-3).join(' ↔ ') ?? msg.page}`;
    case 'EVENT_SCREEN_HOLD':         return `Screen hold ${meta?.durationSeconds ?? 45}s on ${msg.page}`;
    default:                          return (msg.detail as string) ?? evType;
  }
}
