# 🚀 QR Forge

**QR Forge** is a production-ready full-stack QR Code platform that allows users to generate, manage, and organize QR codes with authentication, cloud storage, and a modern SaaS-style UI.

It supports multiple QR types, user accounts (Email + Google), personal QR libraries, favorites, and real-time generation — all wrapped in a polished React + Tailwind interface with an Express backend.

🌐 **Live App:** https://qr-forge-three.vercel.app

---

## ✨ Key Highlights

- Full-stack SaaS architecture
- Firebase Authentication (Email/Password + Google Sign-In)
- Personal QR library per user
- Favorites, search, and filters
- Modern responsive UI
- Cloud-hosted backend + frontend
- Real production deployment (Vercel + Render)

This is not just a QR generator — it’s a complete QR management platform.

---

## 🔥 Features

### 🔐 Authentication
- Email & Password login
- Google Sign-In
- Automatic user registration
- Protected dashboard routes
- Persistent sessions

---

### 📦 QR Generation

Generate QR codes for:

- 🌐 Website URLs  
- 📝 Plain text / notes  
- 📞 Phone numbers  
- 📧 Email (with subject/body)  
- 📶 Wi-Fi credentials (SSID, password, security)  
- 📍 Google Maps links or location queries  

Includes:

- Live QR preview
- QR size selector (256 / 512 / 768)
- Color picker
- High error correction
- Download as PNG
- Copy QR image
- Share support (with clipboard fallback)

---

### 📁 Personal QR Library

Each user gets their own dashboard:

- Saved QR history
- Favorites ⭐
- Search by title or content
- Filter by QR type
- Delete QRs
- Copy original data
- Share QRs

---

### 👤 User Profile

- Profile sidebar
- Display name
- Google avatar (if signed in with Google)
- Account stats
- Theme persistence (Light / Dark)

---

### 🎨 UI / UX

- Glassmorphism design
- Tailwind CSS styling
- Responsive layout (mobile + desktop)
- Dark / Light mode
- Toast notifications
- Loading states
- Smooth animations

---

## 🧠 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Lucide Icons
- React Hot Toast

### Backend
- Node.js
- Express
- QRCode
- CORS
- Dotenv

### Cloud / Services
- Firebase Authentication
- Firestore Database
- Vercel (Frontend Hosting)
- Render (Backend Hosting)
