import { Agent, FlowDef, UiElement, UserInfo } from './types';

// export const HUB_URL    = process.env.REACT_APP_HUB_URL ?? 'http://localhost:5000/hubs/support';

export const HUB_URL = 'https://bnwzme2c17.execute-api.ap-south-1.amazonaws.com/dev';
export const HUB_API_KEY  = 'J03DsugWIp8jOhJmrjJCh5Z6d1FqBZ0z5Wqy6GRm';
  
export const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

export const AGENTS: Agent[] = [
  { id:'agent-1', name:'Sarah Chen',   initials:'SC', role:'Senior Support', color:'#F5A623' },
  { id:'agent-2', name:'Marcus Webb',  initials:'MW', role:'Support Lead',   color:'#22C55E' },
  { id:'agent-3', name:'Priya Sharma', initials:'PS', role:'Support Agent',  color:'#38BDF8' },
  { id:'agent-4', name:'Tom Kowalski', initials:'TK', role:'Support Agent',  color:'#A78BFA' },
];

// ── Flows: IDs match GuidanceFlowRegistry.cs exactly ────────────────────────
// Server translates all step text to the user's language automatically.
export const FLOWS: FlowDef[] = [
  // Shipment
  { id:'create_shipment',  icon:'📦', title:'Create Shipment',    desc:'Step-by-step new shipment creation',   steps:5 },
  { id:'explore_shipment', icon:'🔍', title:'Open Shipment',      desc:'Find and open an existing shipment',   steps:3 },
  { id:'shipment_payment', icon:'💳', title:'Shipment Payment',   desc:'Navigate to payment for a shipment',   steps:2 },
  { id:'shipment_invoice', icon:'📄', title:'Invoice & Bill',     desc:'Open invoice and bill screen',         steps:2 },
  { id:'upload_document',  icon:'⬆️', title:'Upload Document',    desc:'Attach a document to a shipment',      steps:3 },
  // Job
  { id:'create_job',       icon:'🗂', title:'Create Job',         desc:'Create a new job order',               steps:4 },
  // Customer
  { id:'create_customer',  icon:'👤', title:'Add Customer',       desc:'Create a new customer profile',        steps:2 },
  // Finance
  { id:'view_accounting',  icon:'📊', title:'Accounting',         desc:'Navigate to the Accounting module',    steps:1 },
  { id:'view_payment',     icon:'💰', title:'Payment',            desc:'Navigate to the Payment module',       steps:1 },
  // Logistics
  { id:'customs_clearance',icon:'🛃', title:'Customs Clearance',  desc:'Open customs clearance + documents',   steps:2 },
  { id:'create_pickup',    icon:'🚚', title:'Create Pickup',      desc:'Create a new pickup order',            steps:1 },
  { id:'create_delivery',  icon:'📬', title:'Create Delivery',    desc:'Create a new delivery',                steps:1 },
];

// ── Seed element tree: Logipulse LP_ prefix IDs ──────────────────────────────
// These are shown before the live Angular app sends its UiTreeSnapshot.
// All IDs match the [lpUiElement] attributes in the Logipulse Angular templates.
// Route paths match the Logipulse Angular router (/logipulse/*).
export const SEED_ELEMENTS: UiElement[] = [
  // Sidebar navigation (auto-generated from menu, ID = LP_NAV_<menuShortName>)
  { id:'LP_NAV_SHIPMENT',         label:'Shipments',              route:'/logipulse/shipment',         elementType:'a' },
  { id:'LP_NAV_PICKUP',           label:'Pickup',                 route:'/logipulse/pickup',           elementType:'a' },
  { id:'LP_NAV_DELIVERY',         label:'Delivery',               route:'/logipulse/delivery',         elementType:'a' },
  { id:'LP_NAV_ACCOUNTING',       label:'Accounting',             route:'/logipulse/accounting',       elementType:'a' },
  { id:'LP_NAV_PAYMENT',          label:'Payment',                route:'/logipulse/payment',          elementType:'a' },
  { id:'LP_NAV_CRM',              label:'CRM',                    route:'/logipulse/crm',              elementType:'a' },
  { id:'LP_NAV_CUSTOMER',         label:'Customer',               route:'/logipulse/customer',         elementType:'a' },
  { id:'LP_NAV_SETTINGS',         label:'Settings',               route:'/logipulse/settings',         elementType:'a' },
  { id:'LP_NAV_CUSTOMS_CLEARANCE',label:'Customs Clearance',      route:'/logipulse/customs-clearance',elementType:'a' },

  // Shipment list
  { id:'LP_SHIP_NEW_BTN',         label:'New Shipment',           route:'/logipulse/shipment',         elementType:'button' },
  { id:'LP_SHIP_EXPLORE_BTN',     label:'Explore Shipment',       route:'/logipulse/shipment',         elementType:'div'    },
  { id:'LP_SHIP_PAYMENT_BTN',     label:'Shipment Payment',       route:'/logipulse/shipment',         elementType:'div'    },
  { id:'LP_SHIP_ITEMS_BTN',       label:'Shipment Items',         route:'/logipulse/shipment',         elementType:'div'    },
  { id:'LP_SHIP_CANCEL_BTN',      label:'Cancel Shipment',        route:'/logipulse/shipment',         elementType:'div'    },
  { id:'LP_SHIP_INVOICE_BTN',     label:'Invoice & Bill',         route:'/logipulse/shipment',         elementType:'div'    },
  { id:'LP_SHIP_DELETE_BTN',      label:'Delete Shipment',        route:'/logipulse/shipment',         elementType:'div'    },

  // Shipment details
  { id:'LP_SHIP_SAVE_BTN',        label:'Save Shipment',          route:'/logipulse/shipment/details', elementType:'div'    },
  { id:'LP_SHIP_UPDATE_BTN',      label:'Update Shipment',        route:'/logipulse/shipment/details', elementType:'div'    },
  { id:'LP_SHIP_DOC_UPLOAD',      label:'Upload Document',        route:'/logipulse/shipment/details', elementType:'div'    },
  { id:'LP_SHIP_ATTACHMENT_UPLOAD',label:'Upload Attachment',     route:'/logipulse/shipment/details', elementType:'div'    },
  { id:'LP_WIZ_SHIPMENT_DETAILS', label:'Shipment Details Panel', route:'/logipulse/shipment/details', elementType:'div'    },

  // Job
  { id:'LP_JOB_SAVE_BTN',         label:'Save Job',               route:'/logipulse/job/details',      elementType:'span'   },
  { id:'LP_JOB_UPDATE_BTN',       label:'Update Job',             route:'/logipulse/job/details',      elementType:'span'   },
  { id:'LP_JOB_DOC_UPLOAD',       label:'Upload Job Document',    route:'/logipulse/job/details',      elementType:'div'    },
  { id:'LP_JOB_ATTACHMENT_UPLOAD',label:'Upload Job Attachment',  route:'/logipulse/job/details',      elementType:'div'    },
  { id:'LP_WIZ_JOB_DETAILS',      label:'Job Details Panel',      route:'/logipulse/job/details',      elementType:'div'    },

  // Customer
  { id:'LP_CUSTOMER_SAVE_BTN',    label:'Save Customer',          route:'/logipulse/customer',         elementType:'span'   },
  { id:'LP_CUSTOMER_UPDATE_BTN',  label:'Update Customer',        route:'/logipulse/customer',         elementType:'span'   },
  { id:'LP_CUSTOMER_DOC_UPLOAD',  label:'Upload Customer Doc',    route:'/logipulse/customer',         elementType:'div'    },
  { id:'LP_CUSTOMER_ATTACHMENT_UPLOAD', label:'Upload Attachment', route:'/logipulse/customer',        elementType:'div'    },
  { id:'LP_CUSTOMER_PERSON_SAVE_BTN',   label:'Save Customer Person', route:'/logipulse/customer',    elementType:'span'   },
  { id:'LP_CUSTOMER_PERSON_UPDATE_BTN', label:'Update Customer Person', route:'/logipulse/customer',  elementType:'span'   },

  // Application / Customs
  { id:'LP_APPLICATION_DOC_UPLOAD', label:'Upload Application Doc', route:'/logipulse/customs-clearance', elementType:'div' },
];

export const LANG_NAMES: Record<string,string> = {
  en:'English', es:'Español', fr:'Français', ar:'العربية', zh:'中文', de:'Deutsch', ml:'മലയാളം'
};
export const LANG_FLAGS: Record<string,string> = {
  en:'🇬🇧', es:'🇪🇸', fr:'🇫🇷', ar:'🇸🇦', zh:'🇨🇳', de:'🇩🇪', ml:'🇮🇳'
};

// Demo users shown when server is offline (BroadcastChannel / offline mode).
// role is the string "user" matching server's camelCase JsonStringEnumConverter.
export const DEMO_USERS: UserInfo[] = [
  { id:'user-1', name:'Maria Garcia',    lang:'es', role:'user' as any, isOnline:true,  currentPage:'Shipments', currentRoute:'/logipulse/shipment', idleSeconds:0,  hasAlert:false, totalClicks:14, lastActivity:null },
  { id:'user-2', name:'Jean Dupont',     lang:'fr', role:'user' as any, isOnline:true,  currentPage:'Dashboard', currentRoute:'/logipulse/dashboard', idleSeconds:82, hasAlert:true,  totalClicks:3,  lastActivity:null, stuckReason:'LongIdle' },
  { id:'user-3', name:'Ahmed Al-Rashid', lang:'ar', role:'user' as any, isOnline:true,  currentPage:'Accounting',currentRoute:'/logipulse/accounting', idleSeconds:15, hasAlert:false, totalClicks:9,  lastActivity:null },
  { id:'user-4', name:'Li Wei',          lang:'zh', role:'user' as any, isOnline:false, currentPage:'Customer',  currentRoute:'/logipulse/customer',  idleSeconds:0,  hasAlert:false, totalClicks:6,  lastActivity:null },
];

export const BUILTIN_TR: Record<string,Record<string,string>> = {
  es: {
    'Hello! How can I help you today?': '¡Hola! ¿Cómo puedo ayudarte hoy?',
    'I can help you with that!': '¡Puedo ayudarte con eso!',
    'Let me guide you step by step.': 'Déjame guiarte paso a paso.',
    'Thank you for your patience.': 'Gracias por su paciencia.',
    'Are you still there?': '¿Sigues ahí?',
    'I can see you are having trouble. Let me help!': '¡Veo que tienes problemas. Déjame ayudarte!',
  },
  fr: {
    'Hello! How can I help you today?': 'Bonjour ! Comment puis-je vous aider ?',
    'I can help you with that!': 'Je peux vous aider avec ça !',
    'Let me guide you step by step.': 'Laissez-moi vous guider étape par étape.',
    'Thank you for your patience.': 'Merci pour votre patience.',
    'Are you still there?': 'Êtes-vous encore là ?',
  },
  ar: {
    'Hello! How can I help you today?': 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
    'I can help you with that!': 'يمكنني مساعدتك في ذلك!',
    'Thank you for your patience.': 'شكراً لصبرك.',
    'Are you still there?': 'هل لا تزال هنا؟',
  },
  zh: {
    'Hello! How can I help you today?': '你好！今天我能帮助你什么？',
    'I can help you with that!': '我可以帮助你！',
    'Thank you for your patience.': '感谢您的耐心。',
    'Are you still there?': '您还在吗？',
  },
  de: {
    'Hello! How can I help you today?': 'Hallo! Wie kann ich Ihnen heute helfen?',
    'I can help you with that!': 'Ich kann Ihnen dabei helfen!',
    'Thank you for your patience.': 'Vielen Dank für Ihre Geduld.',
  },
  ml: {
    'Hello! How can I help you today?': 'ഹലോ! ഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാൻ കഴിയും?',
    'I can help you with that!': 'എനിക്ക് അതിൽ നിങ്ങളെ സഹായിക്കാൻ കഴിയും!',
    'Thank you for your patience.': 'ക്ഷമക്ക് നന്ദി.',
  },
};
