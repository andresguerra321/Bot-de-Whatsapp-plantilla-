import { flujoContacto } from './contacto.js'

const sesiones = new Map()

const flujos = new Map([
  ['contacto', flujoContacto],
])

export async function tieneFlujoActivo(jid) {
  return sesiones.has(jid)
}

export async function iniciarFlujo(sock, msg, nombre) {
  const jid = msg.key.remoteJid

  if (!flujos.has(nombre)) {
    console.error(`Flujo "${nombre}" no existe`)
    return
  }

  sesiones.set(jid, { nombre, paso: 0, datos: {} })
  await manejarFlujo(sock, msg, '')
}

export async function manejarFlujo(sock, msg, texto) {
  const jid = msg.key.remoteJid
  const sesion = sesiones.get(jid)

  if (!sesion) return

  const ejecutar = flujos.get(sesion.nombre)
  const continuar = await ejecutar(sock, msg, texto, sesion)

  if (!continuar) {
    sesiones.delete(jid)
  }
}