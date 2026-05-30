import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import dotenv from 'dotenv'
import express from 'express'
import { manejarMensaje } from './handlers/mensajes.js'

dotenv.config()

let qrActual = null
let botConectado = false // Control extra para el Health Check

const app = express()

// Ruta principal optimizada para pasar los Health Checks de Hugging Face
app.get('/', (req, res) => {
  // Caso 1: El bot ya está enlazado y respondiendo mensajes
  if (botConectado) {
    res.status(200).send(`
      <html>
        <body style="background:#111;color:#00ff88;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:sans-serif">
          <h2 style="margin-bottom:10px;">🚀 WA-Bot está En Línea</h2>
          <p style="color:#aaa;">Conectado exitosamente y procesando mensajes con Groq.</p>
        </body>
      </html>
    `)
    return
  }

  // Caso 2: El QR está listo para ser escaneado
  if (qrActual) {
    res.status(200).send(`
      <html>
        <body style="background:#111;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:sans-serif">
          <h2 style="color:white;margin-bottom:20px;">Escanea este QR con WhatsApp</h2>
          <img src="${qrActual}" style="width:300px;height:300px;border-radius:10px;box-shadow: 0px 4px 20px rgba(255,255,255,0.1);"/>
        </body>
      </html>
    `)
    return
  }

  // Caso 3: Iniciando el contenedor, esperando el primer QR
  res.status(200).send(`
    <html>
      <body style="background:#111;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif">
        <h2>Iniciando el bot, genera el QR en unos segundos... Reintentando automáticamente.</h2>
        <script>setTimeout(() => { location.reload(); }, 3000);</script>
      </body>
    </html>
  `)
})

// Escuchar en el puerto requerido por HF
app.listen(7860, () => console.log('Servidor HTTP corriendo en puerto 7860'))

// Keep-alive optimizado
if (process.env.HF_SPACE === 'true') {
  const SPACE_URL = process.env.SPACE_URL || 'https://papiguerra-wa-bot.hf.space'
  setInterval(async () => {
    try {
      // Usamos un método HEAD para no sobrecargar el servidor web con HTML
      await fetch(SPACE_URL, { method: 'HEAD' })
      console.log('Keep-alive ping enviado con éxito')
    } catch (e) {
      console.log('Keep-alive falló (silencioso):', e.message)
    }
  }, 25 * 1000) 
}

async function iniciarBot() {
  console.log('1. Cargando estado de sesión...')
  const ruta = process.env.HF_SPACE === 'true' ? '/data/sesion' : './data/sesion'
  const { state, saveCreds } = await useMultiFileAuthState(ruta)

  console.log('2. Obteniendo versión de Baileys...')
  const { version } = await fetchLatestBaileysVersion()
  console.log('Versión:', version)

  console.log('3. Creando socket...')
  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['WaBot', 'Chrome', '1.0.0']
  })

  console.log('4. Socket creado, esperando eventos...')

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      botConectado = false
      const QRCode = await import('qrcode')
      qrActual = await QRCode.default.toDataURL(qr)
      console.log('QR listo — abre la URL del Space para escanearlo')
    }

    if (connection === 'close') {
      botConectado = false
      qrActual = null
      const codigo = new Boom(lastDisconnect?.error)?.output?.statusCode
      const debeReconectar = codigo !== DisconnectReason.loggedOut
      console.log('Conexión cerrada. Código:', codigo)

      if (debeReconectar) {
        console.log('Reconectando...')
        iniciarBot()
      } else {
        console.log('Sesión cerrada. Borra data/sesion/ y vuelve a escanear el QR.')
      }
    }

    if (connection === 'open') {
      qrActual = null
      botConectado = true // El health check ahora devolverá el aviso de éxito
      console.log('Bot conectado')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg.message) return
    if (msg.key.fromMe) return
    await manejarMensaje(sock, msg)
  })
}

console.log('Iniciando bot...')
iniciarBot().catch(console.error)