FROM node:12.2.0-alpine
WORKDIR app
COPY . .
RUN npm install
RUN npm install socket.io
RUN npm install express-ejs-layouts
CMD npm install mysql2
EXPOSE 8000
CMD ["node","app.js"]
