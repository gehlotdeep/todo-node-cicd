FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/ \
 && npm install --force \
 && npm cache clean --force

COPY . .

EXPOSE 8000

CMD ["node", "app.js"]
