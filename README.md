# Desk Sign

CapMetro BikeShare desk name sign — built for Raspberry Pi at 800×480.

## Stack
- React 18 + Vite
- No external UI libraries

## Features
- Split layout: STOP M badge (left) / name + status (right)
- Click the badge to open status selector
- Statuses: On Route · Delay · Detour · Time Point (30-min timer) · Out of Service
- Time Point auto-returns to On Route after 30 minutes
- Full-width scrolling ticker with live 24hr clock
- CapMetro BikeShare color theme

## Run locally

```bash
npm install
npm run dev
```

## Build for Pi

```bash
npm run build
# serve the dist/ folder or load dist/index.html in Electron
```

## Pi kiosk (Chromium)

```bash
chromium-browser --kiosk --window-size=800,480 --app=http://localhost:4173
npm run preview
```

## Keyboard shortcuts
| Key | Status |
|-----|--------|
| 1 | On Route |
| 2 | Delay |
| 3 | Detour |
| 4 | Time Point |
| 5 | Out of Service |
| Esc | Close selector |
