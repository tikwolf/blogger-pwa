export function getOfflineHTML(title = 'Offline', headMetaTags = ''): string {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">

<head>
  <meta charset="UTF-8" />
  <meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport" />
  <meta content="IE=edge" http-equiv="X-UA-Compatible" />
  <meta name="color-scheme" content="light dark" />
  <title>${title}</title>

  ${headMetaTags}

  <style>
    :root {
      color-scheme: light dark;
      --offline-bg: #f6f7fb;
      --offline-surface: #ffffff;
      --offline-text: #20232a;
      --offline-muted: #697386;
      --offline-border: rgba(32, 35, 42, 0.12);
      --offline-accent: #2563eb;
      --offline-accent-text: #ffffff;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --offline-bg: #151619;
        --offline-surface: #22242a;
        --offline-text: #f4f5f7;
        --offline-muted: #b4b8c2;
        --offline-border: rgba(255, 255, 255, 0.14);
        --offline-accent: #8b7cf6;
        --offline-accent-text: #101116;
      }
    }

    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      min-width: 320px;
      min-height: 100vh;
      min-height: 100dvh;
      background: var(--offline-bg);
      color: var(--offline-text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      -webkit-tap-highlight-color: transparent;
    }

    .offline-wrapper {
      min-height: 100vh;
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 24px;
    }

    .offline-card {
      width: min(100%, 440px);
      padding: clamp(28px, 7vw, 48px) 24px 28px;
      text-align: center;
      background: var(--offline-surface);
      border: 1px solid var(--offline-border);
      border-radius: 24px;
      box-shadow: 0 16px 50px rgba(0, 0, 0, 0.08);
    }

    .offline-icon {
      width: 76px;
      height: 76px;
      margin: 0 auto 24px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--offline-bg);
      color: var(--offline-muted);
    }

    .offline-icon svg { width: 42px; height: 42px; }

    h1 {
      margin: 0;
      font-size: clamp(1.25rem, 4vw, 1.6rem);
      line-height: 1.4;
      font-weight: 750;
    }

    p {
      margin: 14px auto 0;
      max-width: 32ch;
      color: var(--offline-muted);
      font-size: 1rem;
      line-height: 1.7;
    }

    .offline-actions {
      display: flex;
      justify-content: center;
      margin-top: 28px;
    }

    button {
      min-height: 48px;
      padding: 0 24px;
      border: 0;
      border-radius: 999px;
      background: var(--offline-accent);
      color: var(--offline-accent-text);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    button:focus-visible {
      outline: 3px solid var(--offline-accent);
      outline-offset: 4px;
    }

    .offline-status {
      margin-top: 18px;
      font-size: 0.875rem;
      color: var(--offline-muted);
    }
  </style>
</head>

<body>
  <main class="offline-wrapper">
    <section class="offline-card" aria-labelledby="offline-title">
      <div class="offline-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 1l22 22" />
          <path d="M16.7 11.1A10.8 10.8 0 0 1 19 12.6" />
          <path d="M5 12.6a10.8 10.8 0 0 1 5.2-2.4" />
          <path d="M8.5 16.1a6 6 0 0 1 7 0" />
          <path d="M12 20h.01" />
        </svg>
      </div>
      <h1 id="offline-title" data-i18n="title">You are offline</h1>
      <p data-i18n="description">This page is not available right now. Check your connection and try again.</p>
      <div class="offline-actions">
        <button type="button" class="reload-button" data-i18n="retry">Try again</button>
      </div>
      <div class="offline-status" role="status" aria-live="polite" data-i18n="status">We will retry when your connection returns.</div>
    </section>
  </main>

  <script>
    (() => {
      const documentLanguage = (document.documentElement.lang || '').toLowerCase().split('-')[0];
      const browserLanguage = (navigator.languages?.[0] || navigator.language || '').toLowerCase().split('-')[0];
      const language = (documentLanguage && documentLanguage !== 'en' ? documentLanguage : browserLanguage || documentLanguage || 'en');
      const rtlLanguages = new Set(['ar', 'fa', 'he', 'ur']);
      const translations = {
        ar: { title: 'أنت غير متصل بالإنترنت', description: 'هذه الصفحة غير متاحة حاليًا. تحقق من اتصالك وحاول مرة أخرى.', retry: 'إعادة المحاولة', status: 'سنحاول مجددًا عند عودة الاتصال.' },
        en: { title: 'You are offline', description: 'This page is not available right now. Check your connection and try again.', retry: 'Try again', status: 'We will retry when your connection returns.' },
        fr: { title: 'Vous êtes hors ligne', description: 'Cette page est indisponible. Vérifiez votre connexion puis réessayez.', retry: 'Réessayer', status: 'Une nouvelle tentative sera effectuée au retour de la connexion.' },
        es: { title: 'Estás sin conexión', description: 'Esta página no está disponible. Comprueba tu conexión e inténtalo de nuevo.', retry: 'Reintentar', status: 'Lo intentaremos de nuevo cuando vuelva la conexión.' },
        de: { title: 'Du bist offline', description: 'Diese Seite ist momentan nicht verfügbar. Prüfe deine Verbindung und versuche es erneut.', retry: 'Erneut versuchen', status: 'Wir versuchen es erneut, sobald die Verbindung zurück ist.' },
        tr: { title: 'Çevrim dışısınız', description: 'Bu sayfa şu anda kullanılamıyor. Bağlantınızı kontrol edip tekrar deneyin.', retry: 'Tekrar dene', status: 'Bağlantı geri geldiğinde tekrar deneyeceğiz.' }
      };
      const text = translations[language] || translations.en;
      document.documentElement.lang = language;
      document.documentElement.dir = rtlLanguages.has(language) ? 'rtl' : 'ltr';
      document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (key && text[key]) element.textContent = text[key];
      });
      const reload = () => window.location.reload();
      document.querySelector('.reload-button')?.addEventListener('click', reload);
      window.addEventListener('online', reload, { once: true });
    })();
  </script>
</body>

</html>`;
}
