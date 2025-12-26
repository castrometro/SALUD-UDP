# Dockerfile para Frontend (Node/Vite)
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto de Vite
EXPOSE 5173

# El comando se define en docker-compose
CMD ["npm", "run", "dev", "--", "--host"]
