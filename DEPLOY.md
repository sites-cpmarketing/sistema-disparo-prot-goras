# 🚀 Deploy no Vercel

Guia passo-a-passo para fazer deploy no Vercel (Frontend + Backend separados).

## Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Conta no [GitHub](https://github.com)
- Código já em um repositório GitHub

## 📋 Passo 1: Criar Repositório no GitHub

### Via GitHub Web

1. Acesse [github.com/new](https://github.com/new)
2. Nome: `sistema-disparo-protágoras`
3. Descrição: "Ferramenta de disparo WhatsApp integrada ao GHL"
4. Selecione **Public**
5. Clique em **Create repository**

### Via Terminal (Git CLI)

```bash
# Vá ao diretório do projeto
cd C:\Users\CP\ MARKETING\Downloads\SISTEMA\ DE\ DISPARO\ PROTÁGORAS

# Adicione o remote (substitua sites-cpmarketing pelo seu username)
git remote add origin https://github.com/sites-cpmarketing/sistema-disparo-protágoras.git

# Faça o push
git branch -M main
git push -u origin main
```

## 🎯 Passo 2: Deploy do Backend (Railway/Render)

### Opção A: Railway (Recomendado)

1. Acesse [railway.app](https://railway.app)
2. Clique em **New Project** → **Deploy from GitHub**
3. Selecione seu repositório `sistema-disparo-protágoras`
4. Escolha a pasta `backend` como root
5. Configure variáveis de ambiente:
   ```
   PORT=3000
   NODE_ENV=production
   GHL_API_KEY=sua_chave_aqui
   GHL_LOCATION_ID=seu_location_id
   FRONTEND_URL=https://seu-frontend.vercel.app
   ```
6. Clique em **Deploy**
7. Copie a URL do backend (algo como `https://sua-api.railway.app`)

### Opção B: Render

1. Acesse [render.com](https://render.com)
2. Clique em **New** → **Web Service**
3. Conecte seu GitHub
4. Selecione `sistema-disparo-protágoras`
5. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Adicione variáveis de ambiente (mesmas acima)
7. Clique em **Deploy**

## 🎨 Passo 3: Deploy do Frontend (Vercel)

### Via Vercel Dashboard

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New** → **Project**
3. Clique em **Import Git Repository**
4. Cole: `https://github.com/sites-cpmarketing/sistema-disparo-protágoras`
5. Clique em **Import**
6. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
7. Clique em **Environment Variables** e adicione:
   ```
   VITE_API_URL=https://sua-api-railway.app
   ```
8. Clique em **Deploy**

**✅ Seu frontend estará disponível em:** `https://seu-app.vercel.app`

## 🔗 Passo 4: Conectar Frontend ao Backend

Após fazer deploy do backend, você terá uma URL como:
- Railway: `https://sua-api-railway.app`
- Render: `https://sua-api.onrender.com`

### Atualizar Frontend

1. Vá ao seu projeto no Vercel
2. Vá para **Settings** → **Environment Variables**
3. Adicione/atualize:
   ```
   VITE_API_URL=https://sua-api-railway.app
   ```
4. Clique em **Redeploy**

## 📱 Passo 5: Integrar com GHL (Iframe)

Depois que o frontend está em produção:

1. No GHL Dashboard → **Settings** → **Custom Buttons**
2. Clique em **+ Add Custom Button**
3. Configure:
   - **Name**: "Disparar WhatsApp"
   - **URL**: `https://seu-app.vercel.app`
   - **Target**: New Tab ou Iframe
4. Salve

## ✅ Checklist de Deploy

- [ ] Repositório criado no GitHub
- [ ] Código fez push para `main` branch
- [ ] Backend deployado (Railway/Render)
- [ ] Backend URL obtida
- [ ] Frontend deployado (Vercel)
- [ ] Frontend URL obtida
- [ ] VITE_API_URL atualizada no Vercel
- [ ] Frontend redeploy feito
- [ ] Testou a conexão no Vercel
- [ ] Integrou iframe no GHL

## 🧪 Testar após Deploy

1. Abra `https://seu-app.vercel.app`
2. Cole sua **API Key** e **Location ID**
3. Clique em **"🔗 Conectar ao GHL"**
4. Verifique se contatos carregam
5. ✅ Se funcionou, está tudo pronto!

## 🆘 Troubleshooting

**Erro: "Cannot GET /api/contacts"**
```
❌ Frontend não consegue falar com backend
✅ Verifique VITE_API_URL em Vercel (Settings → Environment)
✅ Redeploy o frontend
```

**Erro: "CORS error"**
```
❌ Backend não aceita requisição do frontend
✅ Verifique FRONTEND_URL no backend (Settings → Environment)
✅ Redeploy o backend
```

**Template não carrega**
```
❌ GHL key inválida em produção
✅ Copie exatamente do GHL Dashboard
✅ Redeploy o backend
```

## 🔄 Atualizar Código

Toda vez que fizer push para GitHub:

```bash
git add .
git commit -m "descrição das mudanças"
git push origin main
```

**Vercel** e **Railway/Render** vão fazer redeploy automaticamente! 🚀

---

**Dúvidas?** Verifique os logs no painel do Vercel/Railway/Render.

Boa sorte com seu deploy! 🎉
