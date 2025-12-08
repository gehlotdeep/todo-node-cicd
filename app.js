const express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    sanitizer = require('sanitizer'),
    expressLayouts = require('express-ejs-layouts'),
    app = express(),
    port = 8000;

// Create HTTP server (required for Socket.IO)
const http = require("http").createServer(app);
const io = require("socket.io")(http);

/* ---------------------------
    MIDDLEWARE
----------------------------*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// EJS + Layouts
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layout");   // layout.ejs

/* ---------------------------
    SOCKET.IO
----------------------------*/
let todolist = [];

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.emit("loadList", todolist);

    socket.on("newTodo", (data) => {
        todolist.push({
            user: sanitizer.escape(data.user),
            text: sanitizer.escape(data.text)
        });
        io.emit("updateList", todolist);
    });

    socket.on("editTodo", (data) => {
        todolist[data.id] = {
            user: sanitizer.escape(data.user),
            text: sanitizer.escape(data.text)
        };
        io.emit("updateList", todolist);
    });

    socket.on("deleteTodo", (id) => {
        todolist.splice(id, 1);
        io.emit("updateList", todolist);
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
