/**
 * Base URL of the Django backend.
 *
 * `localhost` works for the web build and simulators. To test on a physical
 * phone with Expo Go, this needs to point somewhere the phone can reach:
 *   - Same Wi-Fi as this computer: use its LAN IP (`ipconfig` → IPv4 of the
 *     Wi-Fi adapter), e.g. 'http://192.168.1.23:8001/api'.
 *   - Unreliable/no shared LAN (VPN, different networks): run a tunnel, e.g.
 *     `cloudflared tunnel --url http://localhost:8001` and use the printed
 *     https://*.trycloudflare.com URL. Note it changes every restart.
 */
export const API_BASE_URL = 'http://localhost:8001/api';
