FROM node:20

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json primero (aprovecha la cache de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto (esto es útil aunque opcional)
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "src/index.js"]
