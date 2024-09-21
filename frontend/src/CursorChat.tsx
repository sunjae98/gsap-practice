import React, { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import './CursorChat.css' // 스타일 분리

const socket = io('http://localhost:4000') // 서버와 연결

interface CursorAndChatData {
  userId: string
  username: string
  x: number
  y: number
  chatText: string
}

const generateRandomUsername = () => {
  const names = [
    'Eagle',
    'Tiger',
    'Lion',
    'Panda',
    'Fox',
    'Wolf',
    'Falcon',
    'Hawk',
    'Bear',
    'Shark',
  ]
  const randomIndex = Math.floor(Math.random() * names.length)
  return `User-${names[randomIndex]}`
}

const CursorChat: React.FC = () => {
  const [isChatActive, setIsChatActive] = useState(false) // 채팅 활성화 상태
  const [chatText, setChatText] = useState('') // 입력된 채팅 텍스트
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 }) // 마우스 좌표
  const [usersData, setUsersData] = useState<CursorAndChatData[]>([]) // 다른 사용자 데이터
  const [username, setUsername] = useState('') // 랜덤 유저 이름
  const spanRef = useRef<HTMLSpanElement>(null) // 숨겨진 span의 레퍼런스
  const defaultWidth = 240 // 기본 너비 값 설정

  // 컴포넌트가 처음 로드될 때 랜덤 유저 이름 설정
  useEffect(() => {
    const randomUsername = generateRandomUsername()
    setUsername(randomUsername)
  }, [])

  // 마우스 이동 시 커서 위치를 추적
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setCursorPosition({
        x: event.clientX,
        y: event.clientY,
      })

      // 서버로 커서와 채팅 데이터를 전송
      socket.emit('cursorAndChatData', {
        userId: socket.id,
        username,
        x: event.clientX,
        y: event.clientY,
        chatText,
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [chatText, username])

  // 서버로부터 다른 사용자 데이터 수신
  useEffect(() => {
    socket.on('receiveCursorAndChatData', (data: CursorAndChatData) => {
      setUsersData((prev) => {
        // 새로운 사용자 데이터를 추가 또는 업데이트
        const updatedData = prev.filter((user) => user.userId !== data.userId)
        return [...updatedData, data]
      })
    })

    return () => {
      socket.off('receiveCursorAndChatData')
    }
  }, [])

  // 키보드 입력 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault() // '/' 입력을 막음
        setIsChatActive(true) // '/' 키로 채팅 모드 활성화
      } else if (event.key === 'Escape') {
        setIsChatActive(false) // ESC 키로 채팅 모드 비활성화
        setChatText('') // 채팅 내용 초기화
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value
    setChatText(newText)

    // 텍스트가 변경될 때마다 서버로 커서와 채팅 데이터를 전송
    socket.emit('cursorAndChatData', {
      userId: socket.id,
      username,
      x: cursorPosition.x,
      y: cursorPosition.y,
      chatText: newText,
    })
  }

  // 현재 텍스트의 길이에 맞춰 input 너비를 설정하는 함수
  useEffect(() => {
    const span = spanRef.current
    if (span) {
      span.textContent = chatText || ' ' // 빈 텍스트일 때 기본 값을 넣음
    }
  }, [chatText])

  const getWidth = () => {
    if (!chatText) {
      return defaultWidth // chatText가 없으면 기본 너비로 설정
    }
    return spanRef.current?.offsetWidth || defaultWidth // span의 너비에 맞추거나 기본 너비
  }

  return (
    <div>
      {/* 자신의 채팅 및 커서 */}
      {isChatActive && (
        <div>
          <div
            className="chat-bubble"
            style={{
              top: cursorPosition.y,
              left: cursorPosition.x,
            }}>
            <span ref={spanRef} className="hidden-span" />
            <input
              type="text"
              value={chatText}
              onChange={handleChange}
              className="chat-input"
              placeholder="Type your message..."
              autoFocus
              style={{
                width: `${getWidth()}px`, // span의 너비 또는 기본 너비에 맞춤
              }}
            />
          </div>
          <div
            className="username"
            style={{
              position: 'absolute',
              top: cursorPosition.y - 30, // 커서 위에 유저 이름을 배치
              left: cursorPosition.x + 20, // 커서 오른쪽에 유저 이름을 배치
            }}>
            {username}
          </div>
        </div>
      )}

      {/* 다른 사용자들의 커서 및 채팅 표시 */}
      {usersData.map((user) => (
        <div key={user.userId}>
          <div
            className="chat-bubble other-user"
            style={{
              top: user.y,
              left: user.x,
            }}>
            <span>{user.chatText}</span>
          </div>
          <div
            className="username"
            style={{
              position: 'absolute',
              top: user.y - 30, // 커서 위에 유저 이름을 배치
              left: user.x + 20, // 커서 오른쪽에 유저 이름을 배치
            }}>
            {user.username}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CursorChat
