import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
import React, { useEffect, useRef, useState } from 'react'
import './App.css'

const App: React.FC = () => {
  gsap.registerPlugin(Draggable)

  const dropAreasRef = useRef<(HTMLDivElement | null)[]>([]) // 여러 드랍 영역 참조
  const cubesRef = useRef<(HTMLDivElement | null)[]>([]) // 여러 큐브 참조
  const initialAreaRef = useRef<HTMLDivElement | null>(null) // 초기 큐브 영역 참조
  const [isDropped, setIsDropped] = useState<boolean[]>(Array(5).fill(false)) // 큐브 드랍 여부 상태 관리

  // 큐브와 드랍 영역 간의 매핑 설정 (큐브 1 => 드랍 영역 1, 큐브 2 => 드랍 영역 2 ...)
  const cubeDropMapping = [0, 1, 2, 3, 4] // 각 큐브는 인덱스와 동일한 드랍 영역에 매핑

  useEffect(() => {
    // 큐브 초기 위치 설정
    cubesRef.current.forEach((cube, index) => {
      if (cube) {
        // 초기 위치를 초기 영역에서 배치
        gsap.set(cube, {
          x: index, // 각 큐브가 150px 간격으로 배치
          y: 0,
        })

        Draggable.create(cube, {
          type: 'x,y',
          bounds: 'body',
          inertia: true,
          onDrag: function () {
            const rotationAmount = this.x / 10 // 드래그한 x 좌표에 따라 회전
            gsap.to(cube, {
              rotationY: rotationAmount, // Y축 회전
              rotationX: rotationAmount, // X축 회전 (조금 덜 회전)
              duration: 0.1,
            })
          },
          onDragEnd: function () {
            let isHit = false

            // 각 드랍 영역과 충돌 검사
            dropAreasRef.current.forEach((dropArea, dropIndex) => {
              if (dropArea && Draggable.hitTest(cube, dropArea)) {
                // 큐브가 매핑된 드랍 영역에 드랍된 경우 색상 변경
                if (cubeDropMapping[index] === dropIndex) {
                  console.log(`큐브 ${index + 1}이(가) 올바른 드랍 영역에 놓였습니다.`)
                  setIsDropped((prevState) => {
                    const newState = [...prevState]
                    newState[index] = true // 색상 변경을 위한 상태 true
                    return newState
                  })
                } else {
                  console.log(`큐브 ${index + 1}이(가) 잘못된 드랍 영역에 놓였습니다.`)
                  setIsDropped((prevState) => {
                    const newState = [...prevState]
                    newState[index] = false // 잘못된 드랍 영역에 있으면 색상 변경 안함
                    return newState
                  })
                }

                const dropAreaBounds = dropArea.getBoundingClientRect()
                const cubeBounds = cube.getBoundingClientRect()

                const centerX =
                  dropAreaBounds.left + dropAreaBounds.width / 2 - cubeBounds.width / 2
                const centerY =
                  dropAreaBounds.top + dropAreaBounds.height / 2 - cubeBounds.height / 2

                // 큐브를 드랍 영역의 중심으로 이동
                gsap.to(cube, {
                  x: centerX - cubeBounds.left + Number(gsap.getProperty(cube, 'x')),
                  y: centerY - cubeBounds.top + Number(gsap.getProperty(cube, 'y')),
                  rotationX: 5, // 드랍 시 회전 초기화
                  rotationY: -5, // 드랍 시 회전 초기화
                  duration: 0.5,
                  ease: 'power3.out',
                })

                isHit = true
              }
            })

            if (!isHit) {
              console.log(`큐브 ${index + 1}이(가) 드랍 영역에 놓이지 않았습니다.`)
              setIsDropped((prevState) => {
                const newState = [...prevState]
                newState[index] = false // 드랍되지 않으면 색상 변경 안함
                return newState
              })
            }
          },
        })
      }
    })
  }, [])

  return (
    <div className="container">
      <div className="drop-areas">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="drop-area" ref={(el) => (dropAreasRef.current[index] = el)}>
              Drop Area {index + 1}
            </div>
          ))}
      </div>

      <div className="initial-area" ref={initialAreaRef}>
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className={`cube ${isDropped[index] ? 'dropped' : ''}`}
              ref={(el) => (cubesRef.current[index] = el)}>
              <div className="face front">Cube {index + 1}</div>
              <div className="face back">Back</div>
              <div className="face left">Left</div>
              <div className="face right">Right</div>
              <div className="face top">Top</div>
              <div className="face bottom">Bottom</div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default App
