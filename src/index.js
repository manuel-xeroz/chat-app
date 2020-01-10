const path = require('path');
const http = require('http') 
const socketio = require('socket.io')
const express = require('express');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('../src/utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('../src/utils/users');

const app = express();
const server = http.createServer(app)
const PORT = process.env.PORT || 3000;

const io = socketio(server)
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('new websocket connection')


    socket.on('join', ({ username, room }, callback) => {
        const { error, user} = addUser({id: socket.id, username, room })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.emit('username', user.username)
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })

    socket.on('sendMessage', (word, callback) => {
        const  user = getUser(socket.id)
        const filter = new Filter();
        if (filter.isProfane(word)) {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, word))
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    socket.on('sendLocation', (pos, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locate', generateLocationMessage(user.username, `https://google.com/maps?q=${pos.lat},${pos.long}`))
        callback()
    })
})

server.listen(PORT, () => {
    console.log('server is up on port ' + PORT);
});

