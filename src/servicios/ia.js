import dotenv from 'dotenv'
import { MARCA, PRODUCTOS, PREGUNTAS_FRECUENTES } from '../datos/catalogo.js'
dotenv.config()

const historiales = new Map()
const MAX_HISTORIAL = 10

function construirSystemPrompt() {
  const catalogo = PRODUCTOS
    .filter(p => p.disponible)
    .map(p =>
      `- ${p.nombre}: $${p.precio.toLocaleString('es-CO')} COP | Tallas: ${p.tallas.join(', ')} | Colores: ${p.colores.join(', ')} | ${p.descripcion}`
    ).join('\n')

  const faq = PREGUNTAS_FRECUENTES
    .map(f => `P: ${f.pregunta}\nR: ${f.respuesta}`)
    .join('\n\n')

  return `Eres el asistente virtual de ${MARCA.nombre}, una tienda de ropa urbana.
Tu nombre es Boru Bot y atiendes por WhatsApp.
Hablas de forma casual, urbana y cercana — tuteas al cliente siempre.
Eres servicial, rápido y resuelves todo lo que puedas sin pasar al humano a menos que sea necesario.
Nunca inventas información — si no sabes algo, lo dices y ofreces conectar con un agente.

=== INFORMACIÓN DE LA MARCA ===
Nombre: ${MARCA.nombre}
Descripción: ${MARCA.descripcion}
Ciudad: ${MARCA.ciudad}
Horario de atención: ${MARCA.horario}
Instagram: ${MARCA.instagram}

=== CATÁLOGO DISPONIBLE ===
${catalogo}

=== PREGUNTAS FRECUENTES ===
${faq}

=== CÓMO ATENDER PEDIDOS ===
Cuando el cliente quiera comprar algo:
1. Confirma qué producto, talla y color quiere
2. Pide nombre completo, dirección de envío y ciudad
3. Indica el total con envío y los métodos de pago disponibles
4. Confirma que un agente va a contactarlo para cerrar el pedido

=== CÓMO MANEJAR PROBLEMAS ===
Si el cliente tiene un problema con su pedido (llegó dañado, talla incorrecta, no ha llegado):
1. Pide el número de pedido si lo tiene
2. Muestra empatía y dile que lo vas a escalar
3. Indícale que un agente lo contacta en máximo 24 horas hábiles

=== LÍMITES ===
- No confirmes pagos ni proceses transacciones directamente
- No inventes precios ni productos que no estén en el catálogo
- Si el cliente pide hablar con una persona real, dile: ${MARCA.contacto_humano}
- Respuestas cortas, máximo 3 párrafos, sin markdown complejo`
}

const SYSTEM_PROMPT = construirSystemPrompt()

export async function preguntarIA(jid, mensajeUsuario) {
  if (!historiales.has(jid)) {
    historiales.set(jid, [])
  }

  const historial = historiales.get(jid)
  historial.push({ role: 'user', content: mensajeUsuario })

  const mensajesRecientes = historial.slice(-MAX_HISTORIAL)

  console.log('Llamando a Groq con:', mensajeUsuario)
  console.log('API Key existe:', !!process.env.GROQ_API_KEY)

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 400,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...mensajesRecientes
        ]
      })
    })

    if (!res.ok) {
      const error = await res.json()
      console.error('Error API Groq:', error)
      return 'No pude procesar tu mensaje. Intenta de nuevo.'
    }

    const data = await res.json()
    const respuesta = data.choices[0].message.content

    historial.push({ role: 'assistant', content: respuesta })

    if (historial.length > MAX_HISTORIAL * 2) {
      historial.splice(0, 2)
    }

    return respuesta

  } catch (error) {
    console.error('Error llamando a Groq:', error)
    return 'Hubo un problema de conexión. Intenta en un momento.'
  }
}

export function limpiarHistorial(jid) {
  historiales.delete(jid)
}