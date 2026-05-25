export async function agente(sock, msg) {
  const jid = msg.key.remoteJid

  await sock.sendMessage(jid, {
    text: `Claro, te conecto con un agente.\n\nEscríbenos directo a nuestro WhatsApp de soporte o espera que alguien del equipo te contacte en las próximas horas.\n\n_Horario de atención: lunes a sábado 9am - 6pm_`
  })
}