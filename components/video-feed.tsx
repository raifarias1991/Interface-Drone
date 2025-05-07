"use client"

import { useState, useEffect } from "react"
import { useWebSocket } from "@/lib/websocket"
import { motion, AnimatePresence } from "framer-motion"
import { Video, VideoOff, Wifi, WifiOff } from "lucide-react"

export default function VideoFeed() {
  const { currentFrame, connected, useFallbackMode, droneState } = useWebSocket()
  const [imageError, setImageError] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)

  // Esconder overlay após alguns segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOverlay(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Mostrar overlay quando passar o mouse
  const handleMouseMove = () => {
    setShowOverlay(true)
    const timer = setTimeout(() => {
      setShowOverlay(false)
    }, 3000)

    return () => clearTimeout(timer)
  }

  // Renderizar o feed de vídeo
  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden" onMouseMove={handleMouseMove}>
      {connected || useFallbackMode ? (
        currentFrame ? (
          <motion.img
            src={`data:image/jpeg;base64,${currentFrame}`}
            alt="Video feed"
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
            style={{ display: imageError ? "none" : "block" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-gray-400">Aguardando frames de vídeo...</p>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <WifiOff className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-400">Não conectado ao backend</p>
        </div>
      )}

      {/* Indicador de gravação */}
      {droneState.isRecording && (
        <div className="absolute top-4 right-4 flex items-center bg-black/50 px-2 py-1 rounded-full">
          <motion.div
            className="w-3 h-3 bg-red-500 rounded-full mr-2"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
          <span className="text-xs text-white">REC</span>
        </div>
      )}

      {/* Overlay de informações */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {connected ? (
                  <Wifi className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500 mr-2" />
                )}
                <span className="text-xs text-white">{connected ? "Conectado" : "Desconectado"}</span>
              </div>

              <div className="flex items-center">
                {droneState.isRecording ? (
                  <Video className="h-4 w-4 text-red-500 mr-2" />
                ) : (
                  <VideoOff className="h-4 w-4 text-gray-400 mr-2" />
                )}
                <span className="text-xs text-white">{droneState.isRecording ? "Gravando" : "Sem gravação"}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

