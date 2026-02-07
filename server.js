const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 1. Синхрон
    socket.on('sync_action', (data) => {
        socket.broadcast.emit('sync_action', data);
    });

    // 2. Реакция
    socket.on('send_reaction', () => {
        io.emit('show_reaction');
    });

    // 3. Смена видео
    socket.on('change_video', (videoId) => {
        io.emit('update_video', videoId);
    });

    // 4. Чат
    socket.on('chat_message', (msg) => {
        io.emit('chat_message', msg);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
