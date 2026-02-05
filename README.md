# QR Forge

QR Forge is a production-ready full-stack QR Code Generator with a polished React + Tailwind frontend and Express backend API.

## Features

- Generate QR codes for:
  - Website URLs
  - Plain text / notes
  - Phone numbers
  - Email addresses (with subject/body)
  - Wi-Fi credentials (SSID, password, security)
  - Google Maps links or location queries
- Live QR preview
- Download as PNG
- Copy QR image to clipboard
- QR size selector (256/512/768)
- QR color picker
- Responsive modern glassmorphism UI
- Light / dark mode toggle with persistence
- Toast notifications, loading states, and robust validation
- REST API (`POST /api/generate`) returning base64 image

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide icons, React Hot Toast
- **Backend:** Node.js, Express, qrcode, dotenv, cors
- **Monorepo tooling:** concurrently

## Project Structure

```txt
QR-forge/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   └── ...
├── server/
│   ├── src/
│   └── ...
└── package.json
```

## Setup

### 1) Install dependencies

```bash
npm install
npm run install:all
```

### 2) Configure environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3) Run in development

```bash
npm run dev
```

This launches:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

## API

### `POST /api/generate`

**Request body**

```json
{
  "type": "wifi",
  "data": {
    "ssid": "Office-WiFi",
    "password": "strongpassword",
    "security": "WPA"
  },
  "options": {
    "size": 512,
    "darkColor": "#111827",
    "lightColor": "#ffffff"
  }
}
```

**Response**

```json
{
  "image": "data:image/png;base64,...",
  "payload": "WIFI:T:WPA;S:Office-WiFi;P:strongpassword;;"
}
```

## Production Build

```bash
npm run build
npm run start
```

## Notes

- `client/vite.config.js` includes proxying `/api` to the backend.
- Validation is handled on the server for every QR type.
- QR generation uses high error correction and configurable output size.
