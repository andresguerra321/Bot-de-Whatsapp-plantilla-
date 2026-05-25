export async function ayuda(sock, msg) {
  const jid = msg.key.remoteJid
  const prefix = process.env.PREFIX || '!'

  const texto = `*Cómo usar el bot*

Puedes escribirme cualquier mensaje y te respondo con IA.

Si quieres usar comandos específicos, empiézalos con *${prefix}*

Ejemplo: ${prefix}menu`

  await sock.sendMessage(jid, { text: texto })
}