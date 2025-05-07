"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"

// Componente que cria um modelo 3D simples de drone quando não há modelo GLB disponível
export function DroneModelFallback({ rotation, position, isFlying }) {
  const group = useRef()
  const propellers = useRef([])

  // Aplicar rotação com base nos dados de telemetria
  useEffect(() => {
    if (group.current) {
      group.current.rotation.x = (rotation.pitch * Math.PI) / 180
      group.current.rotation.z = (rotation.roll * Math.PI) / 180
      group.current.rotation.y = (rotation.yaw * Math.PI) / 180
    }
  }, [rotation])

  // Animação das hélices
  useFrame((state) => {
    if (group.current && isFlying) {
      // Animação de flutuação
      group.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.05

      // Rotação das hélices
      propellers.current.forEach((propeller, i) => {
        if (propeller) {
          propeller.rotation.y += 0.5 * (i % 2 === 0 ? 1 : -1) // Direções alternadas
        }
      })
    } else if (group.current) {
      group.current.position.y = position.y
    }
  })

  return (
    <group ref={group} position={[position.x, position.y, position.z]}>
      {/* Corpo do drone */}
      <mesh>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Braços do drone */}
      {[
        [0.4, 0, 0.4],
        [0.4, 0, -0.4],
        [-0.4, 0, 0.4],
        [-0.4, 0, -0.4],
      ].map((pos, i) => (
        <group key={i} position={pos}>
          {/* Braço */}
          <mesh>
            <boxGeometry args={[0.1, 0.05, 0.1]} />
            <meshStandardMaterial color="#555555" />
          </mesh>

          {/* Motor */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
            <meshStandardMaterial color="#222222" />
          </mesh>

          {/* Hélice */}
          <mesh position={[0, 0.1, 0]} ref={(el) => (propellers.current[i] = el)}>
            <boxGeometry args={[0.4, 0.01, 0.05]} />
            <meshStandardMaterial color="#999999" />
          </mesh>
        </group>
      ))}

      {/* Câmera frontal */}
      <mesh position={[0.3, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Luzes indicadoras */}
      <pointLight position={[0.4, 0.1, 0.4]} color="red" intensity={0.5} distance={1} />
      <pointLight position={[-0.4, 0.1, -0.4]} color="green" intensity={0.5} distance={1} />
    </group>
  )
}

