# StudySpace

StudySpace ist ein klickbarer Proof‑of‑Concept (PoC) mit zwei Teilen:

- `studyspace-mobile` – Expo React Native App (Mobile PoC)
- `studyspace-website` – Lokale Website (Web PoC)

Beide Teile nutzen Dummy‑Daten; es gibt kein Backend oder echten Login.

## Voraussetzungen

- Node.js und npm installiert
- Für die Mobile‑App: Expo (oder Expo Go auf dem Smartphone)

## Starten

Mobile (Expo)

1. In das Mobile‑Verzeichnis wechseln:

```bash
cd studyspace-mobile
```

2. App starten:

```bash
npx expo start -c
```

3. Öffne die App mit Expo Go auf dem Smartphone oder einem Emulator (siehe Terminalausgabe).

Website (lokale Entwicklung)

1. In das Website‑Verzeichnis wechseln:

```bash
cd studyspace-website
```

2. Abhängigkeiten installieren (falls noch nicht geschehen) und Entwicklung starten:

```bash
npm install
npm run dev
```

3. Folge der Terminalausgabe für die lokale URL (in der Regel `http://localhost:5173` oder eine andere angezeigte Adresse).

