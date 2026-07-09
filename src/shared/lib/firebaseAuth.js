const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let googleScriptPromise;

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Não foi possível carregar o Google.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Não foi possível carregar o Google.'));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

export async function signInWithGoogle() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Login com Google ainda não está configurado.');
  }

  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      prompt: 'select_account',
      error_callback: () => {
        reject(new Error('Não foi possível abrir o Google. Verifique pop-ups e tente novamente.'));
      },
      callback: (response) => {
        if (response?.access_token) {
          resolve(response.access_token);
          return;
        }

        reject(new Error('Não foi possível entrar com Google.'));
      },
    });

    tokenClient.requestAccessToken();
  });
}
