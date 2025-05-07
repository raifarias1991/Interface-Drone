"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment, Grid, Text, Html } from "@react-three/drei"
import { useWebSocket } from "@/lib/websocket"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, CameraOff, Camera, Maximize2, Minimize2 } from "lucide-react"
import * as THREE from "three"
import { motion } from "framer-motion"

// Componente para o modelo 3D do drone
function DroneModel({ rotation, position, isFlying }) {
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

  // Animação das hélices e flutuação
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

// Componente para o ambiente da simulação
function SimulationEnvironment({ droneState }) {
  const { camera } = useThree()

  // Ajustar a câmera para seguir o drone
  useEffect(() => {
    camera.lookAt(0, 1, 0)
  }, [camera])

  return (
    <>
      {/* Céu e iluminação */}
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

      {/* Grade de referência */}
      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#6f6f6f"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#9d4b4b"
        position={[0, 0, 0]}
        infiniteGrid
      />

      {/* Indicadores de direção */}
      <group position={[0, 0.01, 0]}>
        <Text position={[5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} color="red" fontSize={0.5} anchorX="center">
          X+
        </Text>
        <Text position={[0, 0, 5]} rotation={[-Math.PI / 2, 0, 0]} color="blue" fontSize={0.5} anchorX="center">
          Z+
        </Text>
      </group>

      {/* Marcador de origem */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>

      {/* Informações de telemetria em 3D */}
      <Html position={[0, 3, 0]} center>
        <div className="bg-black/70 text-white px-3 py-1 rounded text-xs whitespace-nowrap">
          Altitude: {droneState.altitude.toFixed(2)}m
        </div>
      </Html>
    </>
  )
}

// Componente para trajetória do drone
function DroneTrajectory({ positions }) {
  const points = positions.map((p) => new THREE.Vector3(p.x, p.y, p.z))

  if (points.length < 2) return null

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#00ff00" linewidth={2} />
    </line>
  )
}

// Componente principal de visualização 3D
export default function DroneVisualizer() {
  const { droneState } = useWebSocket()
  const [showControls, setShowControls] = useState(true)
  const [showTrajectory, setShowTrajectory] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [trajectoryPoints, setTrajectoryPoints] = useState([])
  const containerRef = useRef(null)

  // Posição do drone baseada na telemetria
  const dronePosition = {
    x: 0,
    y: droneState.altitude,
    z: 0,
  }

  // Atualizar trajetória do drone
  useEffect(() => {
    if (droneState.isFlying) {
      setTrajectoryPoints((prev) => {
        // Limitar o número de pontos para evitar problemas de desempenho
        const newPoints = [
          ...prev,
          { x: dronePosition.x, y: dronePosition.y, z: dronePosition.z, timestamp: Date.now() },
        ]
        if (newPoints.length > 100) {
          return newPoints.slice(-100)
        }
        return newPoints
      })
    }
  }, [droneState.altitude, droneState.isFlying])

  // Alternar modo de tela cheia
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Erro ao entrar em tela cheia: ${err.message}`)
      })
      setFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setFullscreen(false)
      }
    }
  }

  // Verificar quando sair do modo de tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <div ref={containerRef} className={`relative w-full h-full ${fullscreen ? "fixed inset-0 z-50 bg-black" : ""}`}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />

        {/* Ambiente da simulação */}
        <SimulationEnvironment droneState={droneState} />

        {/* Modelo 3D do drone */}
        <DroneModel rotation={droneState.attitude} position={dronePosition} isFlying={droneState.isFlying} />

        {/* Trajetória do drone */}
        {showTrajectory && <DroneTrajectory positions={trajectoryPoints} />}

        {/* Controles de órbita para permitir que o usuário gire a visualização */}
        {showControls && <OrbitControls enableZoom={true} enablePan={true} minDistance={2} maxDistance={20} />}
      </Canvas>

      {/* Controles de interface */}
      <div className="absolute top-2 right-2 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-background/80"
          onClick={() => setShowControls(!showControls)}
          title={showControls ? "Desativar controles de câmera" : "Ativar controles de câmera"}
        >
          {showControls ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="bg-background/80"
          onClick={() => setShowTrajectory(!showTrajectory)}
          title={showTrajectory ? "Ocultar trajetória" : "Mostrar trajetória"}
        >
          {showTrajectory ? <Camera size={16} /> : <CameraOff size={16} />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="bg-background/80"
          onClick={toggleFullscreen}
          title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
        >
          {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </Button>
      </div>

      {/* Informações de telemetria */}
      <motion.div
        className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/50 px-2 py-1 rounded"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>Pitch: {droneState.attitude.pitch.toFixed(1)}°</div>
        <div>Roll: {droneState.attitude.roll.toFixed(1)}°</div>
        <div>Yaw: {droneState.attitude.yaw.toFixed(1)}°</div>
        <div>Altitude: {droneState.altitude.toFixed(2)}m</div>
        <div>Status: {droneState.isFlying ? "Voando" : "No chão"}</div>
      </motion.div>
    </div>
  )
}

