const express = require('express')

const app = express()
app.use(express.static("public"))

const http = require('http').Server(app)

const serverSocket = require('socket.io')(http)

const PORTA = process.env.PORT || 8001

const host = process.env.HEROKU_APP_NAME ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : "http://localhost"

http.listen(PORTA, () => {
    const portaStr = PORTA === 80 ? '' :  ':' + PORTA
    if (process.env.HEROKU_APP_NAME)
        console.log('Servidor iniciado. Abra o navegador em ' + host)
    else console.log('Servidor iniciado. Abra o navegador em ' + host + portaStr)
})

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

serverSocket.on('connect', recebeConexaoUsuario)

function recebeConexaoUsuario(socket) {
    socket.on('login', (nickname) => registraLoginUsuario(socket, nickname))
    socket.on('disconnect', () => console.log('Cliente desconectado: ' + socket.nickname))
    socket.on('chat msg', (msg) => encaminhaMsgsUsuarios(socket, msg))
    socket.on('chat msg log', (msg) => encaminhaMsgsUsuarios(socket, msg))
    socket.on('status', (msg) => encaminhaMsgStatus(socket, msg))
}

function encaminhaMsgStatus(socket, msg) {
    console.log(msg)
    socket.broadcast.emit('status', msg)
}

function encaminhaMsgsUsuarios(socket, msg) {
    if(msg ===''){
        return
    }
    serverSocket.emit('chat msg', `${socket.nickname} diz: ${msg}`)
}

function registraLoginUsuario(socket, nickname) {
    if(nickname ===''){
        return
    }
    socket.nickname = nickname
    const msg = nickname + ' conectou'
    console.log(msg)
    serverSocket.emit('chat msg log', msg)
    
}