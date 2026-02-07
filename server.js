const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

// Храним состояние комнаты
let users = {}; // Активные пользователи
let messageHistory = {}; // История сообщений для каждого имени (упрощенно)

io.on('connection', (socket) => {
    
    // 1. Вход в комнату
    socket.on('join_game', (name) => {
        const userName = name || "Гость " + Math.floor(Math.random()*100);
        
        users[socket.id] = {
            id: socket.id,
            name: userName,
            color: getRandomColor()
        };

        // Отправляем всем обновленную сетку
        io.emit('update_grid', Object.values(users));
        
        // Если для этого имени есть история - можно было бы восстановить (тут пока просто сетка)
    });

    // 2. Чат (Пузыри в плитках)
    socket.on('chat_message', (msg) => {
        if (users[socket.id]) {
            // Отправляем всем: "В плитке этого юзера покажи сообщение"
            io.emit('chat_bubble', {
                userId: socket.id,
                text: msg
            });
        }
    });

    // 3. Видео и Синхрон
    socket.on('change_video', (id) => io.emit('update_video', id));
    socket.on('sync_action', (data) => socket.broadcast.emit('sync_action', data));
    socket.on('send_reaction', () => io.emit('show_reaction'));

    // Выход
    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('update_grid', Object.values(users));
    });
});

function getRandomColor() {
    const colors = ['#e50914', '#007bff', '#28a745', '#ffc107', '#6f42c1'];
    return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
