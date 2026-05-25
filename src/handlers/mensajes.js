import { manejarComando } from '../comandos/index.js'
import { manejarFlujo, tieneFlujoActivo } from '../flujos/index.js'
import { preguntarIA } from '../servicios/ia.js'
import { extraerTexto, esGrupo } from '../utils/helpers.js'

export async function manejarMensaje(sock, msg) {
  const jid = msg.key.remoteJid
  const texto = extraerTexto(msg)

  if (!texto) return
  if (esGrupo(jid)) return

  const prefix = process.env.PREFIX || '!'
  const esComando = texto.startsWith(prefix)

  try {
    if (esComando) {
      const [cmd, ...args] = texto.slice(prefix.length).trim().split(/\s+/)
      await manejarComando(sock, msg, cmd.toLowerCase(), args)
      return
    }

    if (await tieneFlujoActivo(jid)) {
      await manejarFlujo(sock, msg, texto)
      return
    }

    const respuesta = await preguntarIA(jid, texto)
    await sock.sendMessage(jid, { text: respuesta })

  } catch (error) {
    console.error('Error manejando mensaje:', error)
    await sock.sendMessage(jid, { text: 'Ocurrió un error. Intenta de nuevo.' })
  }
}