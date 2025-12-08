const express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    sanitizer = require('sanitizer'),
    app = express(),
    port = 8000;

// Create HTTP server (required for Socket.IO)
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(bodyParser.urlencoded({ extended: false }));

// Method override for PUT
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method
    }
}));

app.set("view engine", "ejs");

let todolist = [];

/* ---------------------------
   SOCKET.IO REAL-TIME EVENTS
----------------------------*/
io.on("connection", (socket) => {
    console.log("A user connected");

    // Send current list on new connection
    socket.emit("loadList", todolist);

    // Broadcast new message
    socket.on("newTodo", (data) => {
        todolist.push({
            user: sanitizer.escape(data.user),
            text: sanitizer.escape(data.text)
        });

        io.emit("updateList", todolist); // Broadcast to all
    });

    // Edit message
    socket.on("editTodo", (data) => {
        todolist[data.id] = {
            user: sanitizer.escape(data.user),
            text: sanitizer.escape(data.text)
        };
        io.emit("updateList", todolist);
    });

    // Delete message
    socket.on("deleteTodo", (id) => {
        todolist.splice(id, 1);
        io.emit("updateList", todolist);
    });
});

/* ---------------------------
   NORMAL EXPRESS ROUTES
----------------------------*/

// Display list
app.get('/todo', (req, res) => {
    res.render('todo.ejs', {
        todolist,
        clickHandler: "func1();"
    });
});

// Add item
app.post('/todo/add/', (req, res) => {
    let msg = sanitizer.escape(req.body.newtodo);
    let user = sanitizer.escape(req.body.username || "Unknown");

    if (msg != '') {
        todolist.push({ user, text: msg });
        io.emit("updateList", todolist); // real-time
    }
    res.redirect('/todo');
});

// Delete item
app.get('/todo/delete/:id', (req, res) => {
    todolist.splice(req.params.id, 1);
    io.emit("updateList", todolist); // real-time
    res.redirect('/todo');
});

// Single item edit view
app.get('/todo/:id', (req, res) => {
    let todoIdx = req.params.id;
    let todo = todolist[todoIdx];

    if (todo) {
        res.render('todo.ejs', {
            todoIdx,
            todo,
            clickHandler: "func1();"
        });
    } else {
        res.redirect('/todo');
    }
});

// Edit item
app.put('/todo/edit/:id', (req, res) => {
    let todoIdx = req.params.id;
    let msg = sanitizer.escape(req.body.editTodo);
    let user = sanitizer.escape(req.body.username || "Unknown");

    todolist[todoIdx] = { user, text: msg };
    io.emit("updateList", todolist); // real-time
    res.redirect('/todo');
});

// Default redirect
app.use((req, res) => {
    res.redirect('/todo');
});

/* ---------------------------
   START HTTP + SOCKET.IO SERVER
----------------------------*/
http.listen(port, () => {
    console.log(`Todolist running (Real-Time) at http://0.0.0.0:${port}`);
});

module.exports = app;
