const express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    sanitizer = require('sanitizer'),
    expressLayouts = require('express-ejs-layouts'),
    app = express(),
    port = 8000;

// Create HTTP server (required for Socket.IO)
const http = require("http").createServer(app);
const io = require("socket.io")(http); const mysql = require("mysql2");

// db connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",    // your phpmyadmin password
    database: "chatapp"
});

db.connect((err) => {
    if (err) throw err;
    console.log("MySQL Connected!");
});

/* ---------------------------
    MIDDLEWARE
----------------------------*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// EJS + Layouts
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layout");   // layout.ejs
/*app.post("/todo/add/", (req, res) => {
    let user = req.body.username;
    let message = req.body.newtodo;

    let sql = "INSERT INTO messages (user, text) VALUES (?, ?)";
    db.query(sql, [user, message], (err) => {
        if (err) throw err;
        console.log("Message saved to DB");
    });

    // Send update to all sockets
    todolist.push({ user, text: message });
    io.emit("updateList", todolist);

    res.redirect("/");
});*/
app.get("/", (req, res) => {
    res.render("app", {
        todolist,
        myUser: req.query.u || ""   // your username from browser
    });
});

/* ---------------------------
    SOCKET.IO
----------------------------*/
let todolist = [];

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.emit("loadList", todolist);

    socket.on("updateList", (todolist) => {
        list.innerHTML = "";
        let currentUser = localStorage.getItem("chatUser") || "Unknown";

        todolist.forEach((item) => {
            let row = document.createElement("div");
            let isMe = item.user === currentUser;

            row.className = "msg-row " + (isMe ? "right" : "left");

            row.innerHTML = `
      <div class="bubble ${isMe ? "bubble-right" : "bubble-left"}">
        <span class="user">${item.user}</span>
        ${item.text}
      </div>
    `;

            list.appendChild(row);
        });

        // Auto-scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
    });

});

/* ---------------------------
    ROUTES
----------------------------*/
app.get('/todo', (req, res) => {
    res.render('todo', {
        todolist
    });
});

app.post('/todo/add/', (req, res) => {
    let msg = sanitizer.escape(req.body.newtodo);
    let user = sanitizer.escape(req.body.username || "Unknown");

    if (msg !== '') {
        todolist.push({ user, text: msg });
        io.emit("updateList", todolist);
    }
    res.redirect('/todo');
});

app.get('/todo/delete/:id', (req, res) => {
    todolist.splice(req.params.id, 1);
    io.emit("updateList", todolist);
    res.redirect('/todo');
});

app.put('/todo/edit/:id', (req, res) => {
    let todoIdx = req.params.id;
    let msg = sanitizer.escape(req.body.editTodo);
    let user = sanitizer.escape(req.body.username || "Unknown");

    todolist[todoIdx] = { user, text: msg };
    io.emit("updateList", todolist);
    res.redirect('/todo');
});

// Default redirect
app.use((req, res) => res.redirect("/todo"));

/* ---------------------------
    START SERVER
----------------------------*/
http.listen(port, () => {
    console.log(`Todolist running (Real-Time) at http://0.0.0.0:${port}`);
});

module.exports = app;
