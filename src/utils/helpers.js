export function extraerTexto(msg) {
  const m = msg.message

  return (
    m?.conversation ||
    m?.extendedTextMessage?.text ||
    m?.imageMessage?.caption ||
    m?.videoMessage?.caption ||
    ''
  ).trim()
}

export function esGrupo(jid) {
  return jid.endsWith('@g.us')
}

export function limpiarNumero(jid) {
  return jid.replace(/[^0-9]/g, '')
}