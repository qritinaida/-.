import { GoogleUser } from '../types';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const CLIENT_ID_KEY = 'dms_google_client_id_v1';

// Default demo client ID (or custom entered by user)
export function getStoredGoogleClientId(): string {
  return localStorage.getItem(CLIENT_ID_KEY) || '';
}

export function saveStoredGoogleClientId(clientId: string): void {
  if (clientId) {
    localStorage.setItem(CLIENT_ID_KEY, clientId.trim());
  } else {
    localStorage.removeItem(CLIENT_ID_KEY);
  }
}

export function decodeGoogleJwt(token: string): {
  sub: string;
  name: string;
  email: string;
  picture: string;
  given_name?: string;
  family_name?: string;
} | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding Google JWT credential:', e);
    return null;
  }
}

export function initGoogleAuth(
  clientId: string,
  onSuccess: (user: GoogleUser) => void,
  buttonContainerId?: string
): boolean {
  if (!window.google?.accounts?.id || !clientId) {
    return false;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        const payload = decodeGoogleJwt(response.credential);
        if (payload) {
          const user: GoogleUser = {
            id: payload.sub,
            name: payload.name || payload.email.split('@')[0],
            email: payload.email,
            picture: payload.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name || payload.email)}`,
            role: payload.email.includes('admin') || payload.email.includes('owner') ? 'admin' : 'tenant',
            roomId: 'r-101',
            roomNumber: '101'
          };
          onSuccess(user);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    if (buttonContainerId) {
      const container = document.getElementById(buttonContainerId);
      if (container) {
        container.innerHTML = '';
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: 280,
          locale: 'th'
        });
      }
    }

    return true;
  } catch (e) {
    console.error('Failed to initialize Google GIS:', e);
    return false;
  }
}
