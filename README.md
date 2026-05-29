---
title: WA Bot
emoji: 🤖
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# WA-Bot — Agente de Ventas por WhatsApp

Bot de WhatsApp con IA conversacional construido con **Baileys** y **Node.js**. Sin intermediarios, sin mensualidades por API, 100% tuyo.

---

## Características

- Conexión directa a WhatsApp vía Baileys (sin Twilio ni servicios de pago)
- IA conversacional con historial por usuario (Groq + LLaMA 3.1)
- Sistema de comandos con prefijo configurable
- Flujos conversacionales con estados (captación de datos, pedidos)
- Agente de ventas con técnicas de cierre integradas en el prompt
- Catálogo de productos centralizado y fácil de editar
- Sesión persistente (no pide QR en cada reinicio)
- Listo para Docker y deploy en Railway

---

## Estructura del proyecto

```
wa-bot/
├── src/
│   ├── bot.js                  # Arranque principal, conexión Baileys
│   ├── handlers/
│   │   └── mensajes.js         # Router central de mensajes
│   ├── comandos/
│   │   ├── index.js            # Registro de comandos
│   │   ├── menu.js             # !menu
│   │   ├── info.js             # !info
│   │   ├── ayuda.js            # !ayuda
│   │   └── agente.js           # !agente
│   ├── flujos/
│   │   ├── index.js            # Manejador de estados conversacionales
│   │   └── contacto.js         # Flujo de captación de datos
│   ├── servicios/
│   │   └── ia.js               # Integración con Groq (LLaMA 3.1)
│   ├── datos/
│   │   └── catalogo.js         # Productos, marca y FAQs
│   └── utils/
│       └── helpers.js          # Funciones reutilizables
├── data/
│   └── sesion/                 # Credenciales de sesión (no subir a Git)
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```

---

## Instalación local

### Requisitos

- Node.js v18+
- npm

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/andresguerra321/wa-bot.git
cd wa-bot

# 2. Instala dependencias
npm install

# 3. Configura las variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# 4. Crea la carpeta de sesión
mkdir -p data/sesion

# 5. Arranca el bot
npm run dev
```

La primera vez aparece un QR en la terminal. Escanéalo desde **WhatsApp > Dispositivos vinculados > Vincular un dispositivo**.

---

## Instalación con Docker

```bash
# Build y arranque
docker compose up --build

# Correr en segundo plano
docker compose up -d

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz con:

```env
PREFIX=!
NOMBRE_BOT=WaBot
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxx
```

---

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `!menu` | Muestra el menú principal |
| `!info` | Información del bot |
| `!ayuda` | Cómo usar el bot |
| `!agente` | Conectar con un agente humano |

Cualquier mensaje sin comando va directo a la IA.

---

## Personalización

Para adaptar el bot a otra marca edita únicamente `src/datos/catalogo.js`:

```js
export const MARCA = {
  nombre: 'TuMarca',
  descripcion: '...',
  // ...
}

export const PRODUCTOS = [
  {
    nombre: 'Producto 1',
    precio: 50000,
    // ...
  }
]
```

El prompt de la IA se construye automáticamente desde ese archivo.

---

## Deploy en Railway

1. Sube el proyecto a GitHub (sin `.env` ni `data/sesion/`)
2. Crea un nuevo proyecto en [Railway](https://railway.app)
3. Conecta el repositorio
4. Configura las variables de entorno desde el dashboard
5. Agrega un volumen persistente apuntando a `/app/data/sesion`
6. Railway detecta el `Dockerfile` y hace el deploy automático

---

## Stack

- [Baileys](https://github.com/WhiskeySockets/Baileys) — WhatsApp Web API
- [Groq](https://console.groq.com) — Inferencia LLM ultrarrápida
- [LLaMA 3.1 8B](https://ai.meta.com/llama/) — Modelo de lenguaje
- [Node.js](https://nodejs.org) — Runtime
- [Docker](https://www.docker.com) — Containerización

---

## Autor

**Andrés Felipe Guerra Correa (Pipe)**
GitHub: [@andresguerra321](https://github.com/andresguerra321)

---

## Licencia

MIT
