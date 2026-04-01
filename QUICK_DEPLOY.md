# ⚡ Deploy Rápido no Vercel (3 Passos)

Seu código já está no GitHub! Agora vamos fazer deploy no Vercel.

## 📍 Seu Repositório

✅ **GitHub**: https://github.com/sites-cpmarketing/sistema-disparo-prot-goras

## 🚀 Deploy do Frontend (Vercel)

### Passo 1: Importar Projeto no Vercel

1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Cole a URL:
   ```
   https://github.com/sites-cpmarketing/sistema-disparo-prot-goras
   ```
4. Clique em **Import**

### Passo 2: Configurar Project

A página vai preencher automaticamente com:
- **Project Name**: `sistema-disparo-prot-goras`
- **Framework**: Vite
- **Root Directory**: `./frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

👉 **Clique em "Deploy"** (deixe tudo como está)

### Passo 3: Adicionar Variáveis de Ambiente

Enquanto faz build, vá para **Settings** → **Environment Variables**:

Adicione:
```
VITE_API_URL = https://seu-backend-aqui.railway.app
```

(Você vai preencher depois que deployar o backend)

✅ **Frontend estará em**: `https://sistema-disparo-prot-goras.vercel.app`

---

## 🔌 Deploy do Backend (Railway)

### Passo 1: Importar do GitHub

1. Acesse: https://railway.app/new
2. Clique em **"Deploy from GitHub"**
3. Conecte sua conta GitHub
4. Selecione: `sites-cpmarketing/sistema-disparo-prot-goras`
5. Clique em **Deploy**

### Passo 2: Configurar

1. Na dashboard do Railway, clique no seu projeto
2. Vá para **Settings** → **Root Directory**
3. Mude para: `backend`
4. Salve

### Passo 3: Variáveis de Ambiente

Clique em **Variables** e adicione:

```
PORT=3000
NODE_ENV=production
GHL_API_KEY=sua_chave_aqui
GHL_LOCATION_ID=seu_location_id
FRONTEND_URL=https://sistema-disparo-prot-goras.vercel.app
```

Clique em **Deploy**

### Passo 4: Obter URL do Backend

Após o deploy:
1. Vá para **Deployments**
2. Copie a URL (ex: `https://production-xxx.up.railway.app`)

---

## 🔗 Conectar Frontend ao Backend

1. Volte ao Vercel
2. Seu projeto → **Settings** → **Environment Variables**
3. Atualize:
   ```
   VITE_API_URL = https://production-xxx.up.railway.app
   ```
4. Clique em **Redeploy**

✅ Pronto! Seu app está no ar! 🎉

---

## 🧪 Testar

1. Abra: https://sistema-disparo-prot-goras.vercel.app
2. Cole sua **API Key** do GHL
3. Cole seu **Location ID**
4. Clique em **"🔗 Conectar ao GHL"**
5. ✅ Se carregou seus contatos, está funcionando!

---

## 📱 Integrar com GHL (Opcional)

Para adicionar um botão no GHL que abre sua ferramenta:

1. GHL Dashboard → **Settings** → **Custom Buttons**
2. Clique em **"+ Add Custom Button"**
3. Configure:
   - **Name**: "Disparar WhatsApp"
   - **URL**: `https://sistema-disparo-prot-goras.vercel.app`
   - **Target**: Iframe (ou New Tab)
4. Salve

Pronto! Seus usuários podem abrir direto do GHL! 🚀

---

## ⚠️ IMPORTANTE: Revogar Token

**Seu token do GitHub foi usado para fazer upload do código!**

⚠️ **REVOGUE IMEDIATAMENTE**:

1. Acesse: https://github.com/settings/tokens
2. Selecione o token usado
3. Clique em **Delete**
4. Gere um novo token se precisar fazer mais uploads (Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate new token)

**Nunca compartilhe seus tokens!** 🔒

---

## 🎯 URLs Finais

Quando tudo estiver pronto:

| Componente | URL |
|-----------|-----|
| Frontend | `https://sistema-disparo-prot-goras.vercel.app` |
| Backend API | `https://production-xxx.up.railway.app` |
| GitHub Repo | `https://github.com/sites-cpmarketing/sistema-disparo-prot-goras` |

---

## 🆘 Se Algo Não Funcionar

### Erro: "Cannot GET /api/contacts"
```
❌ Frontend não conecta ao backend
✅ Verifique VITE_API_URL no Vercel
✅ Faça redeploy no Vercel
```

### Erro: "CORS error"
```
❌ Backend rejeita requisição do frontend
✅ Verifique FRONTEND_URL no Railway
✅ Faça redeploy no Railway
```

### Contatos não carregam
```
❌ API Key inválida ou expirada
✅ Copie novamente do GHL Dashboard
✅ Verifique variáveis no Railway
```

---

**Qualquer dúvida, verifique os logs:**
- Vercel: Project → Deployments → Logs
- Railway: Deployments → Logs

Boa sorte! 🚀
