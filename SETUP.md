# 🚀 Setup Rápido - WhatsApp Dispatcher GHL

## Estrutura do Projeto

```
SISTEMA DE DISPARO PROTÁGORAS/
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── server.ts          # Express server
│   │   ├── ghl-client.ts      # Cliente GHL
│   │   ├── queue.ts           # Fila de disparos
│   │   └── types.ts           # Tipos TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts             # Cliente HTTP
│   │   ├── store.ts           # Zustand store
│   │   ├── types.ts
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── NewDispatch.tsx
│   │   │   ├── History.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── ...
│   │   ├── index.css          # Tailwind
│   │   └── main.tsx
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── README.md
└── .env.example
```

## ⚡ Instalação (5 minutos)

### 1️⃣ Backend

```bash
cd backend
npm install
cp .env.example .env
```

**Preencha `.env` com:**
```env
PORT=3000
GHL_API_KEY=sua_chave_aqui
GHL_LOCATION_ID=seu_location_id_aqui
FRONTEND_URL=http://localhost:5173
```

**Inicie:**
```bash
npm run dev
```

✅ Backend rodando em `http://localhost:3000`

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend rodando em `http://localhost:5173`

## 🔐 Obter Credenciais GHL

### 1. API Key

1. Acesse **GHL Dashboard**
2. Vá para **Settings** (⚙️) → **API Keys**
3. Clique em **Create API Key**
4. Copie a chave (começa com `Yz...`)

### 2. Location ID

1. Em **Settings** → **Location Details**
2. Copie o **Location ID** (começa com `Lz...`)

## 🧪 Testar a Conexão

1. Abra `http://localhost:5173`
2. Cola sua **API Key** e **Location ID**
3. Clique em **"🔗 Conectar ao GHL"**
4. ✅ Se conectou, você verá seus contatos e templates!

## 📱 Usar o Sistema

1. **Novo Disparo** → Seleciona contatos ou lista
2. **Escolhe template** → Preenche variáveis
3. **Clica enviar** → Vê histórico em tempo real

## 🌐 Integrar com GHL (Iframe)

Para adicionar um botão no GHL que abre sua ferramenta:

### 1. Criar Custom Button no GHL

- GHL Dashboard → **Settings** → **Custom Fields**
- Clique em **+ Add Custom Button**
- Nome: "Disparar WhatsApp"
- URL: `https://seu-dominio.com` (seu frontend)

### 2. O iframe irá detectar automaticamente

O frontend verificará `?location=ghl` na URL e se adaptará.

## 📦 Deploy

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Upload pasta 'dist' para Vercel
```

### Backend (Railway/Render)

```bash
# Push seu git
# Configure as env vars no painel
# Deploy automático
```

**URLs para usar:**
- Frontend: `https://seu-app.vercel.app`
- Backend: `https://seu-api.railway.app`

## ✅ Checklist de Setup

- [ ] Node.js 18+ instalado
- [ ] Backend clonado e dependências instaladas
- [ ] Frontend clonado e dependências instaladas
- [ ] Credenciais GHL obtidas
- [ ] `.env` preenchido no backend
- [ ] Backend rodando em `localhost:3000`
- [ ] Frontend rodando em `localhost:5173`
- [ ] Conectou ao GHL com sucesso
- [ ] Contatos carregaram
- [ ] Templates aparecem

## 🆘 Troubleshooting

**Backend não conecta ao GHL**
```
❌ "API key inválida"
✅ Copie direto da GHL Dashboard (Settings → API Keys)
```

**CORS error no frontend**
```
❌ "Access-Control-Allow-Origin"
✅ Verifique FRONTEND_URL no .env do backend
```

**Contatos não carregam**
```
❌ "Failed to fetch contacts"
✅ Valide a API Key primeiro na tela de Login
✅ Certifique-se que há contatos no GHL
```

**Templates não aparecem**
```
❌ "Failed to fetch templates"
✅ Templates devem estar aprovados no WhatsApp
✅ Verifique integração WhatsApp no GHL
```

## 📞 Próximas Etapas

1. **Testar localmente** ← Você está aqui
2. Fazer deploy do frontend (Vercel)
3. Fazer deploy do backend (Railway/Render)
4. Integrar iframe no GHL
5. Usar em produção!

---

**Dúvidas?** Verifique o `README.md` ou logs do console.

Boa sorte! 🚀
