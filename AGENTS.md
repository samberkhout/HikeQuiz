

# `AGENTS.md` – Interactieve Hike-app met Checkpoints

## 👤 Doel van de App

Een mobiele app waarmee gebruikers een hike volgen. Bij elk checkpoint (via GPS) krijgen ze een vraag. Alleen bij een goed antwoord krijgen ze de route naar het volgende punt.

---

## 🔧 Technologieën

### Frontend

* React Native (met Expo)
* Context API of Zustand voor state management
* `expo-location` voor GPS
* `react-navigation` voor schermnavigatie
* `axios` voor API-calls

### Backend

* Codex backend met:

    * Endpoints voor: gebruikers, checkpoints, vragen en scores
    * PostgreSQL of SQLite database
    * JWT-authenticatie

---

## 🧠 AGENTS

### 🧭 Agent: `CheckpointAgent`

* **Doel:** Bepalen of gebruiker op een checkpoint is.
* **Trigger:** Verandert als GPS-locatie binnen 30 meter komt van een checkpoint.
* **Acties:**

    * Verifieert locatie met backend
    * Activeert vraag
    * Logt tijdstip van aankomst

---

### ❓ Agent: `QuestionAgent`

* **Doel:** Laat de vraag zien zodra gebruiker bij het juiste checkpoint is.
* **Trigger:** Activatie via `CheckpointAgent`.
* **Acties:**

    * Laadt vraag via API
    * Slaat gebruikersantwoord op
    * Geeft feedback
    * Activeert route naar volgend checkpoint bij goed antwoord

---

### 🗺️ Agent: `RouteAgent`

* **Doel:** Begeleidt gebruiker naar volgende checkpoint.
* **Trigger:** Goed beantwoorde vraag.
* **Acties:**

    * Toont kaart met volgende locatie
    * Eventueel Google Maps deep link
    * Geeft hint (bijv. “Volg het pad langs het water”)

---

### 📈 Agent: `ProgressAgent`

* **Doel:** Houdt bij hoever iemand is met de hike.
* **Trigger:** Elke keer als een checkpoint gehaald wordt.
* **Acties:**

    * Update progress state
    * Synchroniseert met backend
    * Laat voortgangsbalk zien

---

### 👤 Agent: `UserAgent`

* **Doel:** Beheert gebruikersdata.
* **Trigger:** Login, logout, registratie
* **Acties:**

    * Opslaan gebruikersprofiel (via JWT)
    * Ophalen user progress
    * Eventueel meerdere hikes kiezen

---

## 🗂️ Mappenstructuur (Frontend)

```
/hike-app/
├── App.js
├── /screens/
│   ├── HomeScreen.js
│   ├── CheckpointScreen.js
│   ├── QuestionScreen.js
│   └── FinishScreen.js
├── /components/
│   ├── MapViewComponent.js
│   └── QuestionCard.js
├── /api/
│   └── api.js
├── /agents/
│   ├── CheckpointAgent.js
│   ├── QuestionAgent.js
│   ├── RouteAgent.js
│   ├── ProgressAgent.js
│   └── UserAgent.js
├── /context/
│   └── UserContext.js
├── /utils/
│   └── location.js
└── /data/
    └── demoTrail.json (voor dev)
```

---

## 📡 Backend Endpoints (voorbeeld)

| Methode | Pad                            | Beschrijving          |
| ------- | ------------------------------ | --------------------- |
| `POST`  | `/api/login/`                  | Login                 |
| `GET`   | `/api/checkpoints/`            | Alle checkpoints      |
| `POST`  | `/api/checkpoints/:id/answer/` | Controleer antwoord   |
| `GET`   | `/api/checkpoints/:id/`        | Detail van checkpoint |
| `POST`  | `/api/progress/`               | Update voortgang      |

---

## 🧪 Test Flow

1. App start op Home → GPS toestemming
2. Bij aankomst op Checkpoint 1 → `CheckpointAgent` triggert
3. Vraag verschijnt → `QuestionAgent` toont vraag
4. Antwoord correct → `RouteAgent` toont nieuwe locatie
5. Herhalen tot laatste checkpoint → `FinishScreen`

---

## 🪄 MVP Scope

* 1 trail
* 3 checkpoints
* Meerkeuzevragen
* Locatie-gebaseerde triggers
* Simpele JSON backend of Codex REST API

---

## 🚀 Volgende Stappen

1. Backend opzetten (Codex scaffolding of Django API)
2. GPS-functionaliteit testen in app
3. Connectie met backend
4. UI design
5. Traileditor maken (optioneel)

---
