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

const app = express()
app.get('/', (req, res) => {
  if (!qrActual) {
    res.send('<html><body style="background:#111;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif"><h2>QR no disponible aún, recarga en unos segundos...</h2></body></html>')
    return
  }
  res.send(`
    <html>
      <body style="background:#111;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh">
        <h2 style="color:white;font-family:sans-serif">Escanea este QR con WhatsApp</h2>
        <img src="${qrActual}" style="width:300px;height:300px"/>
      </body>
    </html>
  `)
})
app.listen(7860, () => console.log('Servidor QR corriendo en puerto 7860'))

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
      const QRCode = await import('qrcode')
      qrActual = await QRCode.default.toDataURL(qr)
      console.log('QR listo — abre la URL del Space para escanearlo')
    }

    if (connection === 'close') {
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