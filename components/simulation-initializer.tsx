"use client"

import { useEffect } from "react"
import { useWebSocket } from "@/lib/websocket"

// Componente para inicializar a simulação 3D
export default function SimulationInitializer() {
  const { useFallbackMode, updateSimulation } = useWebSocket()

  // Iniciar o loop de atualização da simulação quando o componente montar
  useEffect(() => {
    if (useFallbackMode) {
      // Iniciar um intervalo para atualizar a simulação regularmente
      const intervalId = setInterval(() => {
        updateSimulation()
      }, 50) // Atualizar a cada 50ms para uma simulação suave

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [useFallbackMode, updateSimulation])

  // Este componente não renderiza nada visualmente
  return null
}

