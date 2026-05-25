FROM node:20-alpine

# directorio de trabajo dentro del contenedor
WORKDIR /app

# copia primero los archivos de dependencias
COPY package*.json ./

# instala dependencias
RUN npm install --production

# copia el resto del código
COPY . .

# crea la carpeta de sesión si no existe
RUN mkdir -p data/sesion

# arranca el bot
CMD ["node", "src/bot.js"]