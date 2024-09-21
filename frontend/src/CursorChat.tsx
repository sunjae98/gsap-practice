import React, { useEffect, useRef, useState } from "react";
import "./CursorChat.css"; // 스타일 분리

const CursorChat: React.FC = () => {
  const [isChatActive, setIsChatActive] = useState(false); // 채팅 활성화 상태
  const [chatText, setChatText] = useState(""); // 입력된 채팅 텍스트
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 }); // 마우스 좌표
  const spanRef = useRef<HTMLSpanElement>(null); // 숨겨진 span의 레퍼런스
  const defaultWidth = 240; // 기본 너비 값 설정

  // 마우스 이동 시 커서 위치를 추적
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setCursorPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 키보드 입력 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault(); // '/' 입력을 막음
        setIsChatActive(true); // '/' 키로 채팅 모드 활성화
      } else if (event.key === "Escape") {
        setIsChatActive(false); // ESC 키로 채팅 모드 비활성화
        setChatText(""); // 채팅 내용 초기화
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChatText(event.target.value);
  };

  // 현재 텍스트의 길이에 맞춰 input 너비를 설정하는 함수
  useEffect(() => {
    const span = spanRef.current;
    if (span) {
      span.textContent = chatText || " "; // 빈 텍스트일 때 기본 값을 넣음
    }
  }, [chatText]);

  const getWidth = () => {
    if (!chatText) {
      return defaultWidth; // chatText가 없으면 기본 너비로 설정
    }
    return spanRef.current?.offsetWidth || defaultWidth; // span의 너비에 맞추거나 기본 너비
  };

  return (
    <div>
      {isChatActive && (
        <div
          className="chat-bubble"
          style={{
            top: cursorPosition.y,
            left: cursorPosition.x,
          }}
        >
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
      )}
    </div>
  );
};

export default CursorChat;
