(() => {
  'use strict';

  const ENDPOINT = 'https://jmyqvrvrguhfujgombqe.supabase.co/functions/v1/nizam';
  let activeController = null;

  window.NizamApi = {
    async askNizam(prompt) {
      const normalizedPrompt = String(prompt || '').trim();
      if (!normalizedPrompt) return '';

      if (activeController) activeController.abort();
      const controller = new AbortController();
      activeController = controller;

      try {
        const url = new URL(ENDPOINT);
        url.searchParams.set('prompt', normalizedPrompt);
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Nizam API request failed');
        const payload = await response.json();
        if (typeof payload.reply !== 'string') throw new Error('Nizam API response was invalid');
        return payload.reply;
      } finally {
        if (activeController === controller) activeController = null;
      }
    }
  };
})();
