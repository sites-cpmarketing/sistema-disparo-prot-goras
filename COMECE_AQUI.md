# 🚀 COMECE AQUI - Deploy em 4 Passos

Seu código **já está no GitHub** pronto para ir ao ar!

Follow este guia para fazer deploy em **~30 minutos**.

---

## ⚠️ Primeiro: Revogue o Token (IMPORTANTE!)

**Seu token do GitHub foi exposto!** Revogue AGORA:

1. Acesse: https://github.com/settings/tokens
2. Procure pelo token usado
3. Clique **Delete**
4. ✅ Pronto!

---

## 📍 Seu Repositório GitHub

```
https://github.com/sites-cpmarketing/sistema-disparo-prot-goras
```

Abra este link para ver seu código no GitHub.

---

## 🎯 PASSO 1: Deploy do Frontend (Vercel)

### 1.1 Abra o Vercel

Acesse: **https://vercel.com/new**

### 1.2 Importe seu GitHub

```
1. Clique em "Import Git Repository"
2. Cole: https://github.com/sites-cpmarketing/sistema-disparo-prot-goras
3. Clique "Import"
```

### 1.3 Configure

A página preencherá automaticamente com:
- **Project Name**: `sistema-disparo-prot-goras`
- **Framework**: Vite ✅
- **Root Directory**: `./frontend` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅

**Clique "Deploy"** e aguarde (2-5 min)

### 1.4 Copie a URL

Quando terminar, você verá algo como:
```
https://sistema-disparo-prot-goras.vercel.app
```

✅ **Salve essa URL!** Você vai precisar.

---

## 🔌 PASSO 2: Deploy do Backend (Railway)

### 2.1 Abra o Railway

Acesse: **https://railway.app/new**

### 2.2 Deploy from GitHub

```
1. Clique "Deploy from GitHub"
2. Conecte sua conta GitHub
3. Selecione: sistema-disparo-prot-goras
4. Clique "Deploy"
```

### 2.3 Configure Root Directory

```
1. Clique no projeto criado
2. Vá para "Settings"
3. Mude "Root Directory" para: backend
4. Salve
```

### 2.4 Adicione Variáveis de Ambiente

```
1. Clique em "Variables"
2. Adicione cada uma:
```

| Nome | Valor |
|------|-------|
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `GHL_API_KEY` | Sua chave do GHL |
| `GHL_LOCATION_ID` | Seu Location ID do GHL |
| `FRONTEND_URL` | A URL do Vercel que você copiou |

### 2.5 Deploy

```
1. Volte para "Deployments"
2. Clique "Redeploy"
3. Aguarde terminar (3-7 min)
```

### 2.6 Copie a URL do Backend

Quando terminar, copie a URL (exemplo: `https://production-xxx.up.railway.app`)

✅ **Salve essa URL!** Você vai precisar.

---

## 🔗 PASSO 3: Conectar Frontend ao Backend

### 3.1 Volte ao Vercel

Acesse seu projeto: **https://vercel.com**

### 3.2 Adicione Variável de Ambiente

```
1. Clique no seu projeto
2. Vá para "Settings"
3. Clique "Environment Variables"
4. Clique "+ Add New"
5. Adicione:
   Name: VITE_API_URL
   Value: A URL do Railway que você copiou
```

### 3.3 Redeploy

```
1. Vá para "Deployments"
2. Clique em "Redeploy"
3. Aguarde terminar (1-2 min)
```

✅ **Seu app agora está conectado!**

---

## 🧪 PASSO 4: Testar Tudo

### 4.1 Abra seu App

```
https://sua-url.vercel.app
```

(Use a URL do passo 1)

### 4.2 Conecte ao GHL

```
1. Cole sua API Key do GHL
   (Encontre em: GHL Dashboard → Settings → API Keys)

2. Cole seu Location ID
   (Encontre em: GHL Dashboard → Settings → Location Details)

3. Clique "🔗 Conectar ao GHL"
```

### 4.3 Verifique

Se tudo correu bem, você deve ver:
- ✅ Seus contatos carregando
- ✅ Seus templates WhatsApp
- ✅ Opções de envio disponíveis

🎉 **Parabéns! Tudo funcionando!**

---

## 📱 Usar o Sistema

Depois que tudo está pronto:

1. **Abra seu app**: `https://sua-url.vercel.app`
2. **Selecione contatos** ou uma lista
3. **Escolha um template** WhatsApp
4. **Preencha variáveis** (nome, etc)
5. **Clique "Enviar Agora"**
6. **Veja histórico** em tempo real

---

## 🆘 Se Algo Não Funcionar

### ❌ "Cannot GET /api/contacts"

```
→ Frontend não está falando com backend
→ Verificar VITE_API_URL em Vercel
→ Fazer redeploy do frontend
```

### ❌ "CORS error"

```
→ Backend rejeitou a requisição
→ Verificar FRONTEND_URL no Railway
→ Fazer redeploy do backend
```

### ❌ "API Key inválida"

```
→ Copie novamente do GHL Dashboard
→ Coloque no Railway (Variables)
→ Fazer redeploy do backend
```

### ❌ Frontend não carrega

```
→ Verificar logs em Vercel (Deployments → Logs)
→ Procurar por erros de build
```

---

## 📚 Documentação Completa

Se precisar de mais detalhes, leia:

- **`QUICK_DEPLOY.md`** - Guia visual passo-a-passo
- **`DEPLOY_CHECKLIST.md`** - Checklist completo
- **`README.md`** - Visão geral do projeto
- **`DEPLOY.md`** - Troubleshooting avançado

---

## 🎯 Próximos Passos (Depois)

Depois que tudo estiver no ar:

1. **Integrar com GHL** (adicionar iframe com botão)
2. **Adicionar banco de dados** (PostgreSQL)
3. **Melhorar segurança** (autenticação avançada)
4. **Adicionar webhooks** (status de entrega)

---

## 💡 Dicas Importantes

✅ Templates devem estar **pré-aprovados no WhatsApp**
✅ Rate limit do WhatsApp: **80 mensagens/segundo**
✅ Histórico é em **memória** (não persiste)
✅ Para persistência, adicione **PostgreSQL** depois

---

## 🔐 Segurança

- ✅ HTTPS automático no Vercel
- ✅ CORS protegido
- ✅ Validação de API Keys
- ✅ Variáveis de ambiente seguras

Nunca compartilhe seus tokens! 🔒

---

## ⏱️ Tempo Estimado

```
Deploy Frontend:     5 min
Deploy Backend:     10 min
Conectar Frontend:   5 min
Testar:             10 min
─────────────────────────────
TOTAL:          ~30 minutos
```

---

## 📞 Pronto para Deploy?

### Checklist Final

- [ ] Revogou o token do GitHub?
- [ ] Acessou Vercel?
- [ ] Deployou o frontend?
- [ ] Deployou o backend?
- [ ] Conectou frontend ao backend?
- [ ] Testou a conexão?

Se tudo ✅, você está pronto!

---

## 🎉 Você consegue!

Seu sistema é profissional, está bem documentado e
pronto para ir ao ar.

**Tempo para seu app estar 100% funcional: ~30 minutos**

Boa sorte! 🚀

```
Se tiver dúvidas, abra a documentação:
QUICK_DEPLOY.md ← Comece por aqui!
```

---

**Desenvolvido com ❤️ para escolas e coordenações**

*Um clique em cada botão e seu app estará no ar!* 🚀
