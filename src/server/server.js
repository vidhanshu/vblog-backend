const express = require("express")
require('dotenv').config()
require("../db/mongoose")
const createServer = require("http").createServer;
const PORT = process.env.PORT || 4000
const app = express();
const server = createServer(app);
const socketio = require("socket.io");
const morgan = require("morgan")

const io = socketio(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST", "PATCH"]
    }
});

//routes
const authRoutes = require("../routes/auth");
const userRoutes = require("../routes/user")
const blogRoutes = require("../routes/blog")

//middle wares
app.use(morgan('dev'))
app.use(express.json());

//useRoutes
app.use(authRoutes);
app.use(userRoutes);
app.use(blogRoutes)

app.get("/", (req, res) => {
    res.send("vblog server is running")
})

//socket
io.on('connection', socket => {
    console.log("Connected!");
})


server.listen(PORT, () => {
    console.log(`server is up on port ${PORT}`);
})
