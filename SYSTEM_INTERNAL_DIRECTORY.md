# SYSTEM INTERNAL DIRECTORY: PROJECT PROTOCOL V3

## Project Overview
**The System V3** is a high-fidelity, gamified life-management interface designed to bridge the gap between productivity tracking and RPG-style progression. It serves as a "Neural Link" for users (Players) to quantify their daily actions, manage complex task hierarchies (Quests), and visualize their personal evolution through a structured stat and skill system.

The project is intended for high-performance individuals who require a "Mission Control" aesthetic for their personal and professional development, utilizing a "System-first" philosophy where every action contributes to a larger character build.

---

## Core Capabilities / Features

### 1. Neural Status Monitoring
*   **Dynamic Stat Tracking**: Real-time monitoring of 10 core attributes including **Strength**, **Intelligence**, **Willpower**, and **Luck**.
*   **Class & Title Management**: Evolution-based job classes and unlockable titles that provide passive or active **Effects**.
*   **Belief System**: A core philosophical framework that influences player behavior and provides unique system-wide modifiers.

### 2. Quest Protocol
*   **Recurring & One-off Quests**: Support for daily habits and major milestones with automated reset logic.
*   **Sub-Quest Hierarchies**: Breaking down complex objectives into manageable sub-tasks.
*   **Reward/Penalty Logic**: Automated stat adjustments based on quest outcomes, reinforcing the "High-Stakes" nature of the protocol.

### 3. Temporal Log (Timelog)
*   **Hourly Activity Mapping**: A 24-hour grid for precise activity tracking using custom-defined **Tags**.
*   **Tag Configuration**: User-defined activity categories with associated color-coding and descriptions.

### 4. Interface Customization
*   **Neural Interface Themes**: On-the-fly accent color optimization (Cyan, Emerald, Amber, Rose, Violet, Blue).
*   **Reactive Background**: A particle-based "Atmosphere" that synchronizes with the selected theme hue.

---

## Tech Stack

### Frontend
*   **React 19**: Core UI library for component-based architecture.
*   **TypeScript**: Strict typing for all data structures and system logic.
*   **Tailwind CSS 4**: Utility-first styling with a custom "System" design system.
*   **Motion (Framer Motion)**: High-performance layout animations and transitions.
*   **Lucide React**: Standardized SVG icon set.
*   **Recharts**: Data visualization for player progress and temporal analysis.

### Backend & Infrastructure
*   **Express 5**: Lightweight server for API routing and asset serving.
*   **Supabase**: Backend-as-a-Service (BaaS) for authentication and real-time data persistence.
*   **Vite 6**: Next-generation build tool and development server.

---

## Database / Data Schema

### PlayerData Structure
The central state object representing the user's current system status.
```typescript
interface PlayerData {
  level: number;
  jobClass: string;
  title: string;
  belief: string;
  stats: PlayerStats; // 10 core attributes
  effects: Effect[]; // Active/Passive modifiers
  themeColor?: string; // Current UI accent
}
```

### Quest Protocol Schema
Defines the structure for tasks and their associated logic.
```typescript
interface Quest {
  id: string;
  type: 'recurring' | 'one-off';
  status: 'in-progress' | 'completed' | 'failed';
  streakCount: number;
  rewardStat?: StatKey;
  penaltyStat?: StatKey;
  subQuests: SubQuest[];
}
```

### Temporal Log Schema
A date-indexed map for hourly activity tracking.
```typescript
interface TimelogData {
  [dateKey: string]: {
    [hour: number]: TimelogTag; 
  };
}
```

---

## Developer Instructions

### Coding Conventions
*   **Strict Typing**: All new components must have defined `interface` props. Avoid `any` at all costs.
*   **Component Isolation**: Reusable UI elements (Buttons, Modals, Cards) should reside in `/src/components/`.
*   **System Accents**: Use the `text-system-accent`, `bg-system-accent`, and `border-system-accent` utility classes to ensure theme compatibility.

### Theme Implementation
The system uses a custom Tailwind theme extension. When adding new components, ensure they utilize the `var(--system-accent)` and `var(--system-accent-glow)` CSS variables for dynamic color support.

---

## Setup & Environment Variables

### Local Development
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file with the following parameters:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
4. Start the dev server: `npm run dev`.

### Production Build
1. Run `npm run build` to generate the `dist/` directory.
2. The server can be started using `npm start`.

---

## Recent Refinements / Updates

### [2026-03-05] Interface Optimization
*   **Centralized Theme Control**: Moved the Neural Interface Theme panel to the Dashboard for immediate access.
*   **Background Synchronization**: Refactored the `Background.tsx` particle system to reactively update its hue based on the `themeColor` state without requiring a component remount.
*   **WebSocket Resilience**: Implemented documentation and UI warnings regarding benign WebSocket protocol deviations in secure sandboxed environments.
*   **Icon Library Expansion**: Integrated `Settings` and `AlertTriangle` icons into the core `ICONS` constant.
