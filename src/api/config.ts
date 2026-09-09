/**
 * Base URL of the Django backend.
 *
 * Using the machine's LAN IP (not `localhost`) so this works from a physical
 * phone running Expo Go, as long as the phone is on the same Wi-Fi network as
 * this computer. If your computer's IP changes (new network, DHCP renewal),
 * update it here — find it with `ipconfig` (Windows) and look for the IPv4
 * address of your Wi-Fi adapter.
 */
export const API_BASE_URL = 'http://192.168.1.20:8000/api';
