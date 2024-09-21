const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)

// CORS 설정 추가 (Vite의 5173 포트에서 오는 요청 허용)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // 5173 포트에서의 요청 허용
    methods: ['GET', 'POST'],
  },
})

// 정적 파일 제공
app.use(express.static('public'))

// CORS 미들웨어 설정
app.use(
  cors({
    origin: 'http://localhost:5173', // 5173 포트에서 오는 요청 허용
  }),
)

io.on('connection', (socket: any) => {
  console.log('A user connected')

  // 클라이언트가 커서 위치 및 채팅 데이터를 전송
  socket.on('cursorAndChatData', (data: any) => {
    // 모든 클라이언트에게 전송
    socket.broadcast.emit('receiveCursorAndChatData', data)
  })

  // 사용자 연결 해제 처리
  socket.on('disconnect', () => {
    console.log('A user disconnected')
  })
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
