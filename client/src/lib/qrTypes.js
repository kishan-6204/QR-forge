export const qrTypes = [
  { key: 'url', label: 'Website URL', hint: 'Share links instantly' },
  { key: 'text', label: 'Plain Text', hint: 'Notes, messages, and more' },
  { key: 'phone', label: 'Phone Number', hint: 'Tap-to-call QR' },
  { key: 'email', label: 'Email Address', hint: 'Pre-fill recipient and message' },
  { key: 'wifi', label: 'Wi-Fi', hint: 'Connect to network quickly' },
  { key: 'maps', label: 'Google Maps', hint: 'Location links and search queries' }
];

export const initialState = {
  url: { url: '' },
  text: { text: '' },
  phone: { phone: '' },
  email: { email: '', subject: '', body: '' },
  wifi: { ssid: '', password: '', security: 'WPA' },
  maps: { location: '' }
};
