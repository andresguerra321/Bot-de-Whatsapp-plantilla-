const pasos = [
  {
    pregunta: 'Perfecto, empecemos. ¿Cuál es tu nombre?',
    campo: 'nombre',
    validar: (texto) => texto.length >= 2 || 'El nombre debe tener al menos 2 caracteres.'
  },
  {
    pregunta: '¿Cuál es tu correo electrónico?',
    campo: 'email',
    validar: (texto) => {
      const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)
      return valido || 'Ese correo no parece válido. Intenta de nuevo.'
    }
  },
  {
    pregunta: '¿En qué te podemos ayudar?',
    campo: 'motivo',
    validar: (texto) => texto.length >= 5 || 'Cuéntanos un poco más.'
  }
]

export async function flujoContacto(sock, msg, texto, sesion) {
  const jid = msg.key.remoteJid
  const { paso, datos } = sesion

  // paso 0 — solo muestra la primera pregunta
  if (paso === 0 && texto === '') {
    await sock.sendMessage(jid, { text: pasos[0].pregunta })
    sesion.paso = 1
    return true  // true = flujo continúa
  }

  const pasoActual = pasos[paso - 1]

  // valida la respuesta del paso actual
  const resultado = pasoActual.validar(texto)
  if (resultado !== true) {
    await sock.sendMessage(jid, { text: resultado })
    return true  // repite el mismo paso
  }

  // guarda el dato
  datos[pasoActual.campo] = texto

  // si hay más pasos, pregunta el siguiente
  if (paso < pasos.length) {
    await sock.sendMessage(jid, { text: pasos[paso].pregunta })
    sesion.paso++
    return true
  }

  // flujo terminado — todos los datos capturados
  const resumen = `Listo, recibimos tu información:

*Nombre:* ${datos.nombre}
*Email:* ${datos.email}
*Motivo:* ${datos.motivo}

Te contactamos pronto.`

  await sock.sendMessage(jid, { text: resumen })

  console.log('Nuevo contacto recibido:', datos)
  // aquí podrías guardar en db.json o enviar a una API

  return false  // false = flujo termina, se borra la sesión
}