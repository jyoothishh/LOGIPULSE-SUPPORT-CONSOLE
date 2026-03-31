export enum ClientRole { User = 0, BackOffice = 1 }
export type StuckReason = 'RepeatedClicks' | 'LongIdle' | 'AiDetected';
export type ConnStatus  = 'connecting' | 'live' | 'demo' | 'offline';
export type ChatDir     = 'out' | 'in' | 'sys';
export type ToastColor  = 'amber' | 'green' | 'red' | 'blue';

// ── Event type constants (mirror Angular/server) ──────────────────────────────
export const LP_EVENT_TYPES = {
  CLICK:                'EVENT_CLICK',
  UPLOAD_START:         'EVENT_UPLOAD_START',
  UPLOAD_FAIL:          'EVENT_UPLOAD_FAIL',
  IMPORT_RETRY:         'EVENT_IMPORT_RETRY',
  WIZARD_STUCK:         'EVENT_WIZARD_STUCK',
  BACK_FORWARD_REPEAT:  'EVENT_BACK_FORWARD_REPEAT',
  SCREEN_HOLD:          'EVENT_SCREEN_HOLD',
} as const;

export type LpEventType = typeof LP_EVENT_TYPES[keyof typeof LP_EVENT_TYPES];

export type EventSeverity = 'info' | 'warning' | 'error';

export interface UserInfo {
  id: string;
  name: string;
  lang: string;
  role: ClientRole;
  isOnline: boolean;
  currentPage:  string | null;
  currentRoute: string | null;
  totalClicks:  number;
  idleSeconds:  number;
  lastActivity: string | null;
  hasAlert:     boolean;
  stuckReason?: StuckReason;
}

export interface UiElement {
  id: string; label: string;
  parent?: string | null; route?: string; elementType?: string;
}

export interface UiTreeNode extends UiElement {
  children: UiTreeNode[];
}

export interface Agent {
  id: string; name: string; initials: string; role: string; color: string; password: string;
}

export interface ChatMessage {
  id: string; dir: ChatDir; from: string;
  text: string; translated?: string; usedLLM?: boolean; ts: Date;
}

export interface FeedEvent {
  id: string; type: string;
  eventType?: string;            // LP_EVENT_TYPE e.g. EVENT_UPLOAD_FAIL
  severity?: EventSeverity;
  needsAttention?: boolean;
  userId: string; userName: string;
  detail?: string; page?: string; elementId?: string;
  clickCount?: number; idleSeconds?: number;
  reason?: StuckReason;
  metadata?: Record<string, unknown>;
  ts: Date;
}

export interface FlowDef {
  id: string; icon: string; title: string; desc: string; steps: number;
}

export interface Toast {
  id: string; title: string; msg?: string; icon?: string; color: ToastColor;
}
