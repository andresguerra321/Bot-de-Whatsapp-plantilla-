export const MARCA = {
  nombre: 'TuMarca',
  descripcion: 'Tu descripción corta de la marca',
  contacto_humano: 'Para hablar con un agente escribe *!agente*',
  horario: 'Lunes a sábado de 9am a 6pm',
  ciudad: 'Tu ciudad, Colombia',
  instagram: '@tumarca',
}

export const PRODUCTOS = [
  {
    id: 1,
    nombre: 'Camiseta Essential',
    descripcion: 'Algodón 100%, corte oversize',
    precio: 65000,
    tallas: ['S', 'M', 'L', 'XL'],
    colores: ['Negro', 'Blanco', 'Gris'],
    disponible: true,
  },
  {
    id: 2,
    nombre: 'Hoodie Classic',
    descripcion: 'Fleece pesado, capucha ajustable',
    precio: 120000,
    tallas: ['S', 'M', 'L', 'XL'],
    colores: ['Negro', 'Verde oliva'],
    disponible: true,
  },
  {
    id: 3,
    nombre: 'Cargo Pants',
    descripcion: 'Corte relaxed, bolsillos laterales',
    precio: 145000,
    tallas: ['28', '30', '32', '34'],
    colores: ['Negro', 'Beige'],
    disponible: true,
  },
]

export const PREGUNTAS_FRECUENTES = [
  {
    pregunta: '¿Cuánto demora el envío?',
    respuesta: 'Envíos nacionales entre 2 a 5 días hábiles según tu ciudad.'
  },
  {
    pregunta: '¿Hacen cambios?',
    respuesta: 'Sí, tienes 15 días desde que recibes el pedido para solicitar un cambio de talla o color.'
  },
  {
    pregunta: '¿Cómo pago?',
    respuesta: 'Aceptamos transferencia, Nequi, Daviplata y contra entrega en algunas ciudades.'
  },
  {
    pregunta: '¿Tienen local físico?',
    respuesta: 'Por ahora solo manejamos ventas online, pero puedes ver todo en nuestro Instagram.'
  },
]