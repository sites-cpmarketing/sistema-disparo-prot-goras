# 📱 WhatsApp Dispatcher para GHL

Sistema de disparo em massa de mensagens WhatsApp integrado nativamente ao GHL (Go High Level).

## 🎯 Features

✅ Integração nativa com API do GHL
✅ Suporte a disparos em massa (1000+ msg/dia)
✅ Fila de mensagens com rate limiting
✅ Interface moderna (React + Tailwind)
✅ Histórico em tempo real
✅ Templates WhatsApp pré-aprovados
✅ Customização de variáveis

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta GHL com API Key
- Location ID do GHL

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend em `http://localhost:3000`

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend em `http://localhost:5173`

## 📋 Fluxo de Uso

1. **Autenticação**: Cole sua API Key e Location ID do GHL
2. **Selecionar Contatos**: Escolha contatos individuais ou uma lista
3. **Escolher Template**: Selecione um template WhatsApp
4. **Customizar**: Preencha variáveis do template
5. **Enviar**: Clique em "Enviar Agora"
6. **Acompanhar**: Veja histórico em tempo real

## 🏗️ Stack Técnico

**Frontend:** React 18 + TypeScript + Tailwind + Vite
**Backend:** Node.js + Express + TypeScript
**Database:** Memória (sem persistência no MVP)
**API:** GHL nativa

## 📞 Credenciais GHL

1. GHL Dashboard → Settings → API Keys → Copiar API Key
2. GHL Dashboard → Settings → Location Details → Copiar Location ID
3. Colar na interface de Login

## 🔒 Segurança

- Validação de API Keys
- CORS restrito
- Rate limiting (80 msg/seg)
- HTTPS obrigatório

---

**Desenvolvido para escolas e coordenações** 📚
