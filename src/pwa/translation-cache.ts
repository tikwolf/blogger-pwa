const STORAGE_KEY = 'PLUS_UI_TRANSLATION_CACHE_V1';
const LANGUAGE_KEY = 'PLUS_UI_TRANSLATE';
const SCHEMA_VERSION = 1;
const MAX_ENTRIES = 12;
const MAX_TEXT_LENGTH = 200_000;
const TRANSLATED_CLASSES = ['translated-ltr', 'translated-rtl'] as const;

type TextEntry = { path: string; index: number; source: string; translated: string };
type TranslationSnapshot = { version: number; page: string; language: string; direction: 'ltr' | 'rtl' | 'auto'; entries: TextEntry[]; updatedAt: number };
type SnapshotStore = Record<string, TranslationSnapshot>;

function isExcluded(element: Element | null): boolean {
  return Boolean(element?.closest('script, style, noscript, textarea, input, select, button, [contenteditable="true"], [data-community-root], .community, #community, .goog-te-banner-frame'));
}

function getPageKey(): string {
  return document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || `${location.pathname}${location.search}`;
}

function getRoots(): Element[] {
  const roots = [
    document.querySelector<HTMLElement>('#Blog1'),
    document.querySelector<HTMLElement>('#Blog01'),
    document.querySelector<HTMLElement>('header'),
    document.querySelector<HTMLElement>('nav'),
    document.querySelector<HTMLElement>('main'),
  ].filter((root): root is HTMLElement => Boolean(root));
  return [...new Set(roots)];
}

function getPath(node: Node): string {
  const parts: number[] = [];
  let current: Node | null = node;
  while (current?.parentNode) {
    const parent = current.parentNode;
    parts.unshift(Array.prototype.indexOf.call(parent.childNodes, current));
    if (parent === document.body) break;
    current = parent;
  }
  return parts.join('.');
}

function getNodeByPath(path: string): Node | null {
  let current: Node = document.body;
  for (const part of path.split('.')) {
    const index = Number(part);
    if (!Number.isInteger(index) || !current.childNodes[index]) return null;
    current = current.childNodes[index];
  }
  return current;
}

function collectTextNodes(): Text[] {
  const nodes: Text[] = [];
  const seen = new Set<Node>();
  for (const root of getRoots()) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode() as Text | null;
    while (current) {
      const value = current.nodeValue?.trim() || '';
      if (value && current.parentElement && !isExcluded(current.parentElement) && !seen.has(current)) {
        nodes.push(current);
        seen.add(current);
      }
      current = walker.nextNode() as Text | null;
    }
  }
  return nodes;
}

function readStore(): SnapshotStore {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as SnapshotStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: SnapshotStore): void {
  try {
    const entries = Object.entries(store).sort((a, b) => b[1].updatedAt - a[1].updatedAt).slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Offline translation is an optional enhancement; storage failures must be harmless.
  }
}

function getDirection(): 'ltr' | 'rtl' | 'auto' {
  const direction = document.documentElement.dir;
  return direction === 'ltr' || direction === 'rtl' ? direction : 'auto';
}

function hasTranslatedClass(): boolean {
  return TRANSLATED_CLASSES.some((className) => document.documentElement.classList.contains(className));
}

function captureSnapshot(language: string, sourceByPath: Map<string, string>): void {
  const entries: TextEntry[] = [];
  for (const node of collectTextNodes()) {
    const path = getPath(node);
    const source = sourceByPath.get(path) || '';
    const translated = node.nodeValue?.trim() || '';
    if (source && translated && source !== translated) entries.push({ path, index: 0, source, translated });
  }
  if (!entries.length || entries.reduce((total, entry) => total + entry.translated.length, 0) > MAX_TEXT_LENGTH) return;

  const store = readStore();
  store[`${getPageKey()}::${language}`] = {
    version: SCHEMA_VERSION,
    page: getPageKey(),
    language,
    direction: getDirection(),
    entries,
    updatedAt: Date.now(),
  };
  writeStore(store);
}

function restoreSnapshot(language: string): boolean {
  const snapshot = readStore()[`${getPageKey()}::${language}`];
  if (!snapshot || snapshot.version !== SCHEMA_VERSION || snapshot.page !== getPageKey()) return false;

  let restored = 0;
  for (const entry of snapshot.entries) {
    const node = getNodeByPath(entry.path);
    if (node?.nodeType !== Node.TEXT_NODE || isExcluded(node.parentElement)) continue;
    const current = node.nodeValue?.trim() || '';
    if (current === entry.source) {
      node.nodeValue = node.nodeValue?.replace(current, entry.translated) || entry.translated;
      restored += 1;
    }
  }
  if (restored) {
    document.documentElement.dir = snapshot.direction === 'auto' ? '' : snapshot.direction;
    document.documentElement.classList.remove('translated-ltr', 'translated-rtl');
    document.documentElement.classList.add(snapshot.direction === 'rtl' ? 'translated-rtl' : 'translated-ltr');
  }
  return restored > 0;
}

export function initializeOfflineTranslationCache(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !document.body) return;

  let sourceByPath = new Map<string, string>();
  let saveTimer: number | undefined;
  let lastLanguage = '';

  const getLanguage = (): string => {
    try {
      return localStorage.getItem(LANGUAGE_KEY) || '';
    } catch {
      return '';
    }
  };

  const scheduleCapture = (): void => {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      const language = getLanguage();
      if (language && language !== 'ar' && hasTranslatedClass()) captureSnapshot(language, sourceByPath);
    }, 700);
  };

  sourceByPath = new Map(collectTextNodes().map((node) => [getPath(node), node.nodeValue?.trim() || '']));
  lastLanguage = getLanguage();
  if (lastLanguage && lastLanguage !== 'ar') restoreSnapshot(lastLanguage);

  const observer = new MutationObserver(() => {
    const language = getLanguage();
    if (language !== lastLanguage) lastLanguage = language;
    if (hasTranslatedClass()) scheduleCapture();
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'dir'] });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener('pagehide', scheduleCapture, { passive: true });
}
