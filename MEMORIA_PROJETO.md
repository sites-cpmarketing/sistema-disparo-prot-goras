# MEMÓRIA DO PROJETO — Sistema de Disparo WhatsApp GHL

## 📌 O QUE É O PROJETO
Ferramenta de disparo de mensagens WhatsApp integrada ao GHL (Go High Level).
- Embutida via iframe no GHL
- Acessa contatos, listas e templates do GHL via API nativa
- Envia mensagens em bulk com fila em memória
- Interface React profissional

---

## 🔗 URLs IMPORTANTES

| Serviço | URL |
|---|---|
| **Frontend (Vercel)** | https://sistema-disparo-prot-goras.vercel.app |
| **Backend (Easy Panel)** | https://sistemas-disparo-facilitado-ghl.8szsdx.easypanel.host |
| **GitHub** | https://github.com/sites-cpmarketing/sistema-disparo-prot-goras |

---

## 📂 ESTRUTURA DO PROJETO

```
SISTEMA DE DISPARO PROTÁGORAS/
├── frontend/                  → React + TypeScript + Tailwind (Vercel)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx            → Roteamento (Settings ou Dashboard)
│   │   ├── api.ts             → Cliente HTTP (usa VITE_API_URL)
│   │   ├── store.ts           → Estado global (Zustand)
│   │   ├── types.ts           → Interfaces TypeScript
│   │   ├── vite-env.d.ts      → Tipos do Vite (import.meta.env)
│   │   ├── index.css
│   │   └── components/
│   │       ├── Dashboard.tsx
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── NewDispatch.tsx
│   │       ├── History.tsx
│   │       ├── Settings.tsx   → Tela de login (API Key + Location ID)
│   │       └── SettingsTab.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
└── backend/                   → Node.js + Express + TypeScript (Easy Panel)
    ├── src/
    │   ├── server.ts          → Express server (porta 80)
    │   ├── ghl-client.ts      → Integração com API do GHL
    │   ├── queue.ts           → Fila de disparos em memória
    │   └── types.ts           → Interfaces TypeScript
    ├── dist/                  → Código compilado (commitado no git)
    │   ├── server.js
    │   ├── ghl-client.js
    │   ├── queue.js
    │   └── types.js
    ├── Dockerfile             → Build via Docker (não Heroku buildpack)
    ├── Procfile               → web: node dist/server.js
    ├── package.json
    ├── tsconfig.json
    └── .npmrc
```

---

## ⚙️ VARIÁVEIS DE AMBIENTE

### Backend (Easy Panel)
```
PORT=80
NODE_ENV=production
FRONTEND_URL=https://sistema-disparo-prot-goras.vercel.app/
```

### Frontend (Vercel)
```
VITE_API_URL=https://sistemas-disparo-facilitado-ghl.8szsdx.easypanel.host
```

---

## 🐳 CONFIGURAÇÃO EASY PANEL (Backend)

- **Build Method:** Dockerfile
- **Dockerfile Path:** `Dockerfile` (apenas isso, sem prefixo "backend/")
- **Port:** 80
- **Source Directory:** backend (ou raiz com path apontando para /backend)

---

## 🔵 CONFIGURAÇÃO VERCEL (Frontend)

- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Env:** VITE_API_URL = https://sistemas-disparo-facilitado-ghl.8szsdx.easypanel.host

---

## 🔑 ENDPOINTS DO BACKEND

```
GET  /health                          → Health check
POST /api/auth/validate-ghl-key       → Validar API Key do GHL
GET  /api/contacts                    → Listar contatos
GET  /api/lists                       → Listar listas
GET  /api/lists/:listId/contacts      → Contatos de uma lista
GET  /api/whatsapp/templates          → Templates WhatsApp
POST /api/dispatch/preview            → Preview do disparo
POST /api/dispatch/send               → Enviar disparos
GET  /api/dispatch/status/:jobId      → Status de um job
GET  /api/dispatch/history            → Histórico de disparos
```

---

## 📦 STACK TÉCNICO

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind + Vite |
| Backend | Node.js + Express + TypeScript |
| State | Zustand |
| HTTP Client | Axios |
| Fila | Em memória (Array) |
| Deploy Frontend | Vercel |
| Deploy Backend | Easy Panel (VPS própria) via Docker |
| Git | GitHub (sites-cpmarketing/sistema-disparo-prot-goras) |

---

## ✅ STATUS ATUAL (último commit: ATT12)

| Item | Status |
|---|---|
| Backend rodando | ✅ Funcionando (responde "Cannot GET /" na raiz, normal) |
| Backend /health | ✅ Deve retornar {"status":"ok"} |
| Frontend build | ✅ Build passou localmente após ATT12 |
| Frontend deploy | ⏳ Aguardando resultado do deploy ATT12 na Vercel |
| Frontend → Backend | ⏳ A testar após deploy |
| Login GHL | ⏳ A testar |

---

## 🔧 PROBLEMAS JÁ RESOLVIDOS

1. **CORS no Express** → Configurado com FRONTEND_URL
2. **Módulo ES vs CommonJS** → Mudado para CommonJS no tsconfig
3. **tsc: not found no Easy Panel** → dist/ pré-compilado commitado no git
4. **SIGTERM no backend** → Resolvido com Dockerfile (sem Heroku buildpack)
5. **Frontend tela branca** → Vercel não rodava Vite (Root Directory não configurado)
6. **import.meta.env TypeScript error** → Criado vite-env.d.ts (ATT12)
7. **Dockerfile path duplicado** → Corrigido para apenas "Dockerfile"

---

## 📋 PRÓXIMOS PASSOS

1. Confirmar que frontend está funcionando após ATT12
2. Testar login com API Key real do GHL
3. Verificar se contatos carregam
4. Verificar se templates WhatsApp carregam
5. Testar envio de mensagem
6. (Futuro) Configurar embed via iframe no GHL

---

## 🔐 CREDENCIAIS DE DESENVOLVIMENTO

- **GitHub Token:** (gere um novo em github.com → Settings → Developer Settings → Personal Access Tokens)
- **Vercel Team:** sites-cp (team_EoSeVDG6iMpMvlHo5L6mbycO)
- **Vercel Project ID:** prj_DkSrGmeJmjiwXs7oi4hnGCyuI8Fc

---

## 💻 COMO RODAR LOCALMENTE

### Backend
```bash
cd backend
npm install
npm run dev   # porta 3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # porta 5173
```

### .env local do backend
```
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### .env local do frontend
```
VITE_API_URL=http://localhost:3000
```
