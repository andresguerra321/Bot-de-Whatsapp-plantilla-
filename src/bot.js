import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import dotenv from 'dotenv'
import { manejarMensaje } from './handlers/mensajes.js'

dotenv.config()

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
    printQRInTerminal: true,
    browser: ['WaBot', 'Chrome', '1.0.0']
  })

  console.log('4. Socket creado, esperando eventos...')

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      const QRCode = await import('qrcode')
      qrActual = await QRCode.default.toDataURL(qr)
      console.log('QR listo en la URL del Space')
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