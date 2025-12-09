FROM node:12.2.0-alpine
WORKDIR app
COPY . .
RUN npm install
CMD npm install socket.io
CMD npm install express-ejs-layouts
RUN npm install mysql2
EXPOSE 8000
CMD ["node","app.js"]
