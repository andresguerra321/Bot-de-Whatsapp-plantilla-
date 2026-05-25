export async function info(sock, msg) {
  const jid = msg.key.remoteJid
  const nombre = process.env.NOMBRE_BOT || 'WaBot'

  const texto = `*${nombre}*

Bot construido con Baileys + Node.js
Desarrollado por Pipe — github.com/tu-usuario

Versión: 1.0.0`

  await sock.sendMessage(jid, { text: texto })
}