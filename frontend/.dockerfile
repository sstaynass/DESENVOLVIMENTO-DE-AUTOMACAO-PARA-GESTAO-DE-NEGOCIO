# Dockerfile (dentro da pasta frontend)
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# Use um servidor estático simples para servir os assets, tipo serve
RUN npm install -g serve
CMD ["serve", "-s", "build"]
