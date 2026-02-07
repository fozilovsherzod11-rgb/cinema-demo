const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Раздаем наш сайт
app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('Новый зритель:', socket.id);

    // Когда кто-то нажал плей/паузу или перемотал
    socket.on('sync_action', (data) => {
        // Рассылаем всем ОСТАЛЬНЫМ (кроме того, кто нажал)
        socket.broadcast.emit('sync_action', data);
    });

    // Когда кто-то нажал кнопку "Респект"
    socket.on('send_reaction', () => {
        // Показываем огонь ВСЕМ
        io.emit('show_reaction');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
