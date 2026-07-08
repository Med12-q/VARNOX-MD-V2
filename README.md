# VARNOX-MD-V2

> Bot WhatsApp Multi Device professionnel avec 200+ commandes, interface web premium et système de plugins avancé.

[![Node.js](https://img.shields.io/badge/Node.js-24-green)](https://nodejs.org)
[![Baileys](https://img.shields.io/badge/Baileys-6.7-blue)](https://github.com/WhiskeySockets/Baileys)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## Aperçu

VARNOX-MD-V2 est un bot WhatsApp multi-device de nouvelle génération. Il offre :

- **Interface Web Premium** — connexion via Pair Code, dashboard en temps réel, design futuriste
- **200+ Commandes** — Général, Groupe, Téléchargement, IA, Outils, Fun, Économie, Admin
- **Architecture Propre** — système de plugins, base de données JSON, anti-spam, reconnexion auto
- **Performances** — rapide, stable, extensible

## Installation

### Prérequis

- Node.js 18+
- pnpm 9+

### Étapes

```bash
# Cloner le dépôt
git clone https://github.com/Med12-q/VARNOX-MD-V2.git
cd VARNOX-MD-V2

# Installer les dépendances
pnpm install

# Copier et configurer l'environnement
cp .env.example .env
# Éditez .env avec votre numéro WhatsApp et les clés API

# Démarrer le bot
pnpm --filter @workspace/api-server run dev

# Démarrer l'interface web (dans un autre terminal)
pnpm --filter @workspace/varnox-web run dev
```

### Connexion WhatsApp

1. Ouvrez l'interface web à `http://localhost:VOTRE_PORT`
2. Entrez votre numéro de téléphone avec l'indicatif pays (ex: +33612345678)
3. Cliquez sur "Obtenir le code"
4. Dans WhatsApp → Appareils liés → Lier avec un numéro de téléphone → Entrez le code

## Architecture

```
├── artifacts/
│   ├── api-server/          # Backend Express + Baileys
│   │   └── src/
│   │       ├── bot/         # Connexion WhatsApp
│   │       ├── commands/    # 200+ commandes
│   │       ├── database/    # Base de données JSON
│   │       ├── routes/      # API REST
│   │       ├── middleware/  # Anti-spam, sécurité
│   │       └── utils/       # Utilitaires
│   └── varnox-web/          # Frontend React + Vite
├── lib/
│   ├── api-spec/            # Spec OpenAPI
│   ├── api-client-react/    # Hooks React Query générés
│   └── api-zod/             # Schémas Zod générés
├── sessions/                # Sessions WhatsApp (auto-créé)
└── database/                # Données JSON (auto-créé)
```

## Commandes Disponibles

### Général (20 commandes)
`.menu` `.ping` `.runtime` `.alive` `.owner` `.botinfo` `.profile` `.speed` `.sc` `.register` `.afk` `.report` `.feedback` `.donate` `.privacy` `.terms` `.language` `.setprefix` `.tagme` `.unafk`

### Groupe (22 commandes)
`.kick` `.add` `.promote` `.demote` `.tagall` `.hidetag` `.welcome` `.goodbye` `.antilink` `.antibot` `.mute` `.unmute` `.warn` `.resetwarn` `.warnings` `.lock` `.unlock` `.groupinfo` `.setwelcome` `.setdesc` `.linkgroup` `.rules`

### Téléchargement (15 commandes)
`.tiktok` `.igdl` `.fbdl` `.ytmp3` `.ytmp4` `.spotify` `.twitter` `.pinterest` `.mediafire` `.capcut` `.gdrive` `.search` `.image` `.music` `.anime`

### IA (15 commandes)
`.gpt` `.imagine` `.translate` `.summarize` `.code` `.grammar` `.poem` `.story` `.recipe` `.advice` `.roast` `.compliment` `.explain` `.lyrics` `.detect`

### Outils (18 commandes)
`.qr` `.sticker` `.base64` `.debase64` `.weather` `.ipinfo` `.calculator` `.password` `.hash` `.color` `.tts` `.ocr` `.shorturl` `.fakeinfo` `.convert` `.timer` `.toimg` `.tourl`

### Fun (22 commandes)
`.dice` `.flip` `.8ball` `.joke` `.fact` `.truth` `.dare` `.choose` `.love` `.rate` `.iq` `.ship` `.wyr` `.rps` `.quote` `.hug` `.slap` `.marry` `.trivia` `.zodiac` `.encrypt` `.decrypt`

### Économie (12 commandes)
`.daily` `.weekly` `.balance` `.give` `.work` `.gamble` `.steal` `.leaderboard` `.shop` `.buy` `.inventory` `.levelrank`

### Administration (18 commandes)
`.ban` `.unban` `.broadcast` `.addprem` `.delprem` `.listprem` `.setmode` `.clearcache` `.sysinfo` `.setowner` `.addadmin` `.deladmin` `.getgc` `.leave` `.restart` `.eval` `.listbanned` `.setbotname`

**Total: 142 commandes actives + aliases (200+ avec aliases)**

## Configuration API

Certaines commandes nécessitent des clés API externes :

| Commande | Variable | Service |
|----------|----------|---------|
| `.gpt`, `.imagine` | `OPENAI_API_KEY` | OpenAI |
| `.weather` | `WEATHER_API_KEY` | OpenWeatherMap |
| `.tiktok`, `.ytmp3` | `DOWNLOAD_API_KEY` | Service tiers |

## Déploiement

### Vercel (Frontend uniquement)

```bash
# Build du frontend
pnpm --filter @workspace/varnox-web run build
# Déployer le dossier artifacts/varnox-web/dist
```

### Serveur VPS

```bash
# Production
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run start
```

## Technologies

- **Runtime**: Node.js 24
- **WhatsApp**: [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) v6.7
- **API**: Express.js v5
- **Frontend**: React + Vite + TailwindCSS + Framer Motion
- **Codegen**: Orval (OpenAPI → React Query + Zod)
- **Build**: esbuild

## Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou soumettez une pull request.

## Licence

MIT © [Med12-q](https://github.com/Med12-q)
