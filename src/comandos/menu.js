export async function menu(sock, msg) {
  const jid = msg.key.remoteJid
  const prefix = process.env.PREFIX || '!'

  const texto = `*Menu principal*

${prefix}menu — ver este menú
${prefix}info — información del bot
${prefix}ayuda — cómo usar el bot

O simplemente escríbeme y te respondo.`

  await sock.sendMessage(jid, { text: texto })
}