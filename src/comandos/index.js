import { menu } from './menu.js'
import { info } from './info.js'
import { ayuda } from './ayuda.js'
import { agente } from './agente.js'

const comandos = new Map([
  ['menu', menu],
  ['start', menu],  // alias
  ['info', info],
  ['agente', agente],
  ['ayuda', ayuda],
  ['help', ayuda],  // alias
])

export async function manejarComando(sock, msg, cmd, args) {
  const jid = msg.key.remoteJid

  if (!comandos.has(cmd)) {
    await sock.sendMessage(jid, {
      text: `Comando no reconocido. Escribe ${process.env.PREFIX || '!'}menu para ver las opciones.`
    })
    return
  }

  const ejecutar = comandos.get(cmd)
  await ejecutar(sock, msg, args)
}