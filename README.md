<div align="center">
  <img src="https://raw.githubusercontent.com/sahidahmed/mitra-mind/main/landing-page/public/space-bg.jpg" alt="Mitra-Mind Logo" width="100%" style="border-radius: 12px; margin-bottom: 20px;">
  
  # 🌌 Mitra-Mind
  **Your Empathetic, Context-Aware Student Companion**

  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
</div>

<br/>

## ✨ Overview

**Mitra-Mind** is a comprehensive, AI-driven mental health application designed explicitly for students navigating the stress of campus life. Built to bridge the gap between isolating academic pressure and professional care, Mitra provides a judgment-free, 24/7 ecosystem comprising an empathetic AI chatbot, an anonymous peer support community, and an interactive crisis toolkit.

With an aesthetic inspired by the deep cosmos ("Billion-Dollar UI"), Mitra-Mind offers a calming, premium experience across our React Native mobile app and Next.js web application.

---

## 🧠 Our Custom AI Engine

Instead of relying on generic wrappers, the Mitra team engineered a bespoke, highly contextual intelligence layer designed specifically for therapeutic and empathetic response generation. 

Our proprietary architecture features:
- **`BehaviorPattern` Analysis**: The engine continuously analyzes anonymous community posts and daily wellness logs to detect stress spikes, isolation tendencies, and negative cognitive loops over time.
- **Contextual Memory Bridge**: The AI seamlessly connects user activity across the app. If a student vents about an exam in the anonymous community, Mitra remembers this safely and proactively checks in on their anxiety in private chat.
- **Proactive Nudge Engine**: Operating on a continuous background interval, the engine detects periods of sudden silence or escalating distress patterns, delivering real-time, real-world coping mechanism suggestions via WebSockets.
- **Dynamic Token Optimization**: Custom `HistoryTrimmer` algorithms and round-robin fallback sequences ensure that long conversational contexts are maintained efficiently across our compute nodes.

---

## 🚀 Key Features

*   💬 **Conversational AI Companion**: Deeply empathetic, natural-language psychological first aid.
*   🌍 **Multilingual Support**: Fully localized in English, Hindi, and Assamese.
*   🛡️ **Anonymous Community Board**: A safe space to post, comment, and connect without judgment.
*   🧑‍⚕️ **Volunteer Listener Portal**: Connects students with trained peer-listeners via a dedicated real-time web portal powered by Socket.IO.
*   🧘 **MindSpace Toolkit**: 15 distinct, interactive coping mechanisms including 4-7-8 Breathing exercises, Grounding techniques, and Progressive Muscle Relaxation (PMR).
*   📊 **Smart Dashboard**: Visualizes weekly mood trends, stress levels, and emotional wellness states.

---

## 🛠️ Technology Stack

**Frontend (Mobile App)**
- React Native (Bare Workflow)
- React Navigation V6
- Vanilla CSS (Glassmorphism Deep Space Aesthetic) 
- i18next (Localization)
- Axios

**Frontend (Web & Landing Page)**
- Next.js 14 App Router
- Socket.IO-Client
- CSS Box-Shadow Parallax Animations

**Backend**
- Node.js & Express
- Socket.IO (Real-time Messaging & Nudges)
- MongoDB & Mongoose
- JSON Web Tokens (JWT) Authentication
- Custom Intelligence Engine (`nudgeService`, `behaviorPattern`)

---

## 🏗️ Architecture Setup

To run this project locally, you will need simultaneous terminals running the respective environments.

### 1. Backend
```bash
cd backend
npm install
npm start
```
*(Requires a `.env` file containing `MONGO_URI`, `JWT_SECRET`, and compute node API keys).*

### 2. Mobile App (Frontend)
```bash
cd frontend
npm install
npm run android # Or npm run ios
```
*(Ensure `__DEV__` URLs inside `src/api/client.ts` point to your local machine IP).*

### 3. Cosmic Landing Page
```bash
cd landing-page
npm install
npm run dev
```

---

## 👩‍💻 The Team

Mitra-Mind was envisioned, engineered, and designed by:

*   **Sahid Ahmed**
*   **Moumita Baishya**
*   **Harish Gohain**

---

<div align="center">
  <i>"Navigate campus life, manage stress, and find clarity."</i>
</div>
