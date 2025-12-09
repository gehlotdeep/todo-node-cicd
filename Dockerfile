FROM node:12.2.0-alpine
WORKDIR app
COPY . .
RUN npm install mysql2
RUN npm install
RUN npm install socket.io
RUN npm install express-ejs-layouts
EXPOSE 8000
CMD ["node","app.js"]
