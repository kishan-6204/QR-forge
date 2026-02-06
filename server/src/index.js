import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import QRCode from 'qrcode';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: '*'
  })
);
app.use(express.json({ limit: '2mb' }));

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const validators = {
  url: ({ url }) => {
    if (!url || !isValidUrl(url)) {
      return 'Please provide a valid URL including http:// or https://';
    }
    return null;
  },
  text: ({ text }) => {
    if (!text?.trim()) {
      return 'Text content cannot be empty';
    }
    return null;
  },
  phone: ({ phone }) => {
    if (!phone?.trim() || !/^\+?[0-9\s()-]{6,20}$/.test(phone)) {
      return 'Please provide a valid phone number';
    }
    return null;
  },
  email: ({ email, subject = '', body = '' }) => {
    if (!email || !isValidEmail(email)) {
      return 'Please provide a valid email address';
    }
    if (subject.length > 150) {
      return 'Email subject is too long';
    }
    if (body.length > 2000) {
      return 'Email body is too long';
    }
    return null;
  },
  wifi: ({ ssid, password = '', security = 'WPA' }) => {
    if (!ssid?.trim()) {
      return 'Wi-Fi SSID is required';
    }
    const allowed = ['WPA', 'WEP', 'nopass'];
    if (!allowed.includes(security)) {
      return 'Invalid Wi-Fi security type';
    }
    if (security !== 'nopass' && password.length < 8) {
      return 'Password must be at least 8 characters for secured networks';
    }
    return null;
  },
  maps: ({ location }) => {
    if (!location?.trim()) {
      return 'Google Maps link or query is required';
    }
    return null;
  }
};

const buildPayload = (type, data) => {
  switch (type) {
    case 'url':
      return data.url;
    case 'text':
      return data.text;
    case 'phone':
      return `tel:${data.phone}`;
    case 'email': {
      const params = new URLSearchParams();
      if (data.subject) params.set('subject', data.subject);
      if (data.body) params.set('body', data.body);
      const query = params.toString();
      return `mailto:${data.email}${query ? `?${query}` : ''}`;
    }
    case 'wifi':
      return `WIFI:T:${data.security};S:${data.ssid};P:${data.password || ''};;`;
    case 'maps':
      return /^https?:\/\//i.test(data.location)
        ? data.location
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location)}`;
    default:
      return null;
  }
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'QR Forge API' });
});

app.post('/api/generate', async (req, res) => {
  const { type, data, options = {} } = req.body || {};

  if (!type || !validators[type]) {
    return res.status(400).json({ error: 'Unsupported QR type' });
  }

  const error = validators[type](data || {});
  if (error) {
    return res.status(400).json({ error });
  }

  const payload = buildPayload(type, data);
  if (!payload) {
    return res.status(400).json({ error: 'Unable to build QR payload' });
  }

  const size = Number(options.size) || 512;
  const width = Number.isFinite(size) ? Math.min(1024, Math.max(256, size)) : 512;

  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width,
      color: {
        dark: options.darkColor || '#111827',
        light: options.lightColor || '#ffffff'
      }
    });

    return res.json({ image: dataUrl, payload });
  } catch (generationError) {
    return res.status(500).json({ error: 'Failed to generate QR code', details: generationError.message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`QR Forge API running on port ${PORT}`);
});
