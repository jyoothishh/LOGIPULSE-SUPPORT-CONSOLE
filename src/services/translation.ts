import { CLAUDE_API, BUILTIN_TR } from '../constants';

const LANG_FULL: Record<string,string> = {
  es:'Spanish (Español)', fr:'French (Français)',
  ar:'Arabic (العربية)',  zh:'Chinese Simplified (中文)',
};

export interface TrResult { translated: string; usedLLM: boolean; }

export async function translateMessage(text: string, lang: string, apiKey: string): Promise<TrResult> {
  if (!text.trim() || lang === 'en') return { translated: text, usedLLM: false };

  if (apiKey.trim().startsWith('sk-')) {
    try {
      const res = await fetch(CLAUDE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{ role:'user', content:
            `You are a translator for a logistics support team. Translate this English message to ${LANG_FULL[lang] ?? lang}.\nReturn ONLY the translation, no explanation.\n\nMessage: ${text}` }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const t = (data?.content?.[0]?.text as string)?.trim();
        if (t) return { translated: t, usedLLM: true };
      }
    } catch (e) { console.warn('[Translation] LLM failed:', e); }
  }

  return { translated: BUILTIN_TR[lang]?.[text] ?? text, usedLLM: false };
}

export async function testApiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':key, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:5, messages:[{ role:'user', content:'hi' }] }),
    });
    return res.ok;
  } catch { return false; }
}
