const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

// База данных участников в памяти
let users = {};

io.on('connection', (socket) => {
    // При входе создаем "пустого" пользователя
    users[socket.id] = {
        id: socket.id,
        name: "Гость " + Math.floor(Math.random() * 100),
        color: getRandomColor()
    };
    
    // Отправляем всем новый список плиток
    io.emit('update_grid', Object.values(users));

    // 1. Смена имени
    socket.on('set_username', (name) => {
        if (users[socket.id]) {
            users[socket.id].name = name;
            io.emit('update_grid', Object.values(users)); // Обновляем сетку всем
        }
    });

    // 2. Чат (теперь летит в конкретную плитку)
    socket.on('chat_message', (msg) => {
        if (users[socket.id]) {
            io.emit('chat_bubble', {
                userId: socket.id,
                text: msg
            });
        }
    });

    // 3. Синхронизация и Видео
    socket.on('sync_action', (data) => socket.broadcast.emit('sync_action', data));
    socket.on('change_video', (id) => io.emit('update_video', id));
    socket.on('send_reaction', () => io.emit('show_reaction'));

    // Выход
    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('update_grid', Object.values(users));
    });
});

// Генератор случайных цветов для аватарок
function getRandomColor() {
    const colors = ['#e50914', '#FFA500', '#008000', '#0000FF', '#800080', '#00CED1'];
    return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
