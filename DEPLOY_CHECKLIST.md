# ✅ Checklist de Deploy - Sistema Disparo WhatsApp

## 🔐 Segurança Primeiro

- [ ] **Revogue o token do GitHub** que foi usado
  - Acesse: https://github.com/settings/tokens
  - Delete o token usado
  - Gere um novo se precisar fazer mais uploads

## 📤 Deploy do Frontend (Vercel)

### Preparação
- [ ] Acesse https://vercel.com
- [ ] Faça login com sua conta GitHub
- [ ] Clique em "New Project"
- [ ] Clique em "Import Git Repository"

### Configuração
- [ ] Cole a URL do repositório:
  ```
  https://github.com/sites-cpmarketing/sistema-disparo-prot-goras
  ```
- [ ] Clique "Import"
- [ ] Verifique os settings:
  - ✅ Framework: Vite
  - ✅ Root Directory: `./frontend`
  - ✅ Build Command: `npm run build`
  - ✅ Output Directory: `dist`
- [ ] Clique "Deploy"

### Pós-Deploy
- [ ] Aguarde o deploy terminar (2-5 min)
- [ ] Copie a URL do projeto: `https://xxx.vercel.app`
- [ ] ⭐ **Salve essa URL!** Você vai precisar para o backend

## 🔌 Deploy do Backend (Railway)

### Preparação
- [ ] Acesse https://railway.app
- [ ] Faça login com GitHub
- [ ] Clique "New Project"
- [ ] Selecione "Deploy from GitHub"

### Configuração
- [ ] Selecione seu repositório: `sistema-disparo-prot-goras`
- [ ] Clique "Deploy"
- [ ] Aguarde o servidor criar
- [ ] Vá para **Settings**
- [ ] Mude **Root Directory** para: `backend`

### Variáveis de Ambiente
- [ ] Clique na aba "Variables"
- [ ] Adicione as seguintes variáveis:

| Variável | Valor |
|----------|-------|
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `GHL_API_KEY` | Sua API Key do GHL |
| `GHL_LOCATION_ID` | Seu Location ID do GHL |
| `FRONTEND_URL` | `https://seu-app.vercel.app` (copie de cima) |

- [ ] Clique "Deploy" novamente

### Pós-Deploy
- [ ] Aguarde o deploy terminar (3-7 min)
- [ ] Vá para **Deployments**
- [ ] Copie a URL do deployment (algo como: `https://production-xxx.up.railway.app`)
- [ ] ⭐ **Salve essa URL!** Você vai precisar para o frontend

## 🔗 Conectar Frontend ao Backend

### Vercel Settings
- [ ] Volte ao seu projeto no Vercel
- [ ] Clique em **Settings**
- [ ] Vá para **Environment Variables**
- [ ] Clique "+ Add New"
- [ ] Adicione:
  - **Name**: `VITE_API_URL`
  - **Value**: `https://seu-backend-railway.app` (copie de cima)
- [ ] Clique "Save"

### Redeploy Frontend
- [ ] Vá para **Deployments**
- [ ] Clique no deploy atual
- [ ] Clique em **Redeploy** (ou **Redeploy to production**)
- [ ] Aguarde o redeploy (1-2 min)

## 🧪 Testes

### 1. Verificar Frontend
- [ ] Abra: `https://seu-app.vercel.app`
- [ ] Página deve carregar normalmente
- [ ] Veja o formulário de Login

### 2. Conectar ao GHL
- [ ] Cole sua **API Key** do GHL
- [ ] Cole seu **Location ID**
- [ ] Clique em "🔗 Conectar ao GHL"
- [ ] Aguarde conectar (deve mostrar "Conectado com sucesso! ✅")

### 3. Verificar Dados
- [ ] Vá para **"Novo Disparo"**
- [ ] Seus contatos devem aparecer
- [ ] Templates devem carregar
- [ ] Seletor de lista deve mostrar suas listas

### 4. Testar Disparo (Opcional)
- [ ] Selecione um contato
- [ ] Selecione um template
- [ ] Clique "Enviar Agora"
- [ ] Vá para **"Histórico"**
- [ ] O disparo deve aparecer na lista

## 📱 Integração com GHL (Opcional)

Se quiser adicionar um botão no GHL:

### Criar Custom Button
- [ ] Acesse seu GHL Dashboard
- [ ] Vá para **Settings** → **Custom Buttons**
- [ ] Clique "+ Add Custom Button"
- [ ] Configure:
  - **Name**: `Disparar WhatsApp`
  - **URL**: `https://seu-app.vercel.app`
  - **Target**: `Iframe` (recomendado) ou `New Tab`
- [ ] Salve

### Testar no GHL
- [ ] Abra um contato no GHL
- [ ] Clique no botão "Disparar WhatsApp"
- [ ] Seu app deve aparecer em um iframe
- [ ] Teste enviar um disparo

## 🎯 Após Tudo Pronto

### Documentação
- [ ] Leia `README.md` para entender o projeto
- [ ] Consulte `QUICK_DEPLOY.md` se tiver dúvidas
- [ ] Consulte `DEPLOY.md` para troubleshooting

### URLs Finais
- [ ] Frontend: `https://sistema-disparo-prot-goras.vercel.app`
- [ ] Backend: `https://production-xxx.up.railway.app`
- [ ] GitHub: `https://github.com/sites-cpmarketing/sistema-disparo-prot-goras`

### Próximas Melhorias (Opcional)
- [ ] Adicionar banco de dados (PostgreSQL)
- [ ] Histórico persistente
- [ ] Autenticação avançada
- [ ] Webhooks do WhatsApp

## ⚠️ Troubleshooting

Se algo não funcionar:

1. **Frontend não carrega** → Verifique em Vercel Deployments (aba Build Logs)
2. **Contatos não aparecem** → Verifique VITE_API_URL e redeploy
3. **Erro CORS** → Verifique FRONTEND_URL no Railway
4. **API Key inválida** → Copie novamente do GHL Dashboard

## 📞 Precisa de Ajuda?

- Leia `DEPLOY.md` na raiz do projeto
- Verifique logs no Vercel e Railway dashboards
- Consulte a documentação do GHL

---

✅ **Quando terminar, seu sistema estará 100% funcional!** 🚀

**Tempo estimado:** 30-40 minutos

Boa sorte! 🎉
