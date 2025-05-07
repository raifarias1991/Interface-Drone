"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/lib/websocket"
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  Video,
  VideoOff,
  Plane,
  PlaneLanding,
} from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function DroneControls() {
  const { sendCommand, droneState } = useWebSocket()
  const [controlsEnabled, setControlsEnabled] = useState(true)
  const { toast } = useToast()

  // Função para enviar comandos de movimento
  const handleMove = (direction: string, value: number) => {
    if (!controlsEnabled) return

    // Desativar controles temporariamente para evitar spam de comandos
    setControlsEnabled(false)
    setTimeout(() => setControlsEnabled(true), 100)

    const moveCommand = { type: "move" }

    switch (direction) {
      case "up":
        sendCommand({ ...moveCommand, upDown: value })
        break
      case "down":
        sendCommand({ ...moveCommand, upDown: -value })
        break
      case "left":
        sendCommand({ ...moveCommand, leftRight: -value })
        break
      case "right":
        sendCommand({ ...moveCommand, leftRight: value })
        break
      case "forward":
        sendCommand({ ...moveCommand, forwardBackward: value })
        break
      case "backward":
        sendCommand({ ...moveCommand, forwardBackward: -value })
        break
      case "yaw_left":
        sendCommand({ ...moveCommand, yaw: -value })
        break
      case "yaw_right":
        sendCommand({ ...moveCommand, yaw: value })
        break
    }
  }

  // Função para decolagem e pouso
  const handleTakeoffLand = () => {
    if (droneState.isFlying) {
      sendCommand({ type: "land" })
      toast({
        title: "Comando enviado",
        description: "Iniciando pouso do drone",
      })
    } else {
      sendCommand({ type: "takeoff" })
      toast({
        title: "Comando enviado",
        description: "Iniciando decolagem do drone",
      })
    }
  }

  // Função para controle de gravação
  const handleRecording = () => {
    if (droneState.isRecording) {
      sendCommand({ type: "stop_recording" })
      toast({
        title: "Gravação interrompida",
        description: "O drone parou de gravar vídeo",
      })
    } else {
      sendCommand({ type: "start_recording" })
      toast({
        title: "Gravação iniciada",
        description: "O drone começou a gravar vídeo",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <motion.div whileTap={{ scale: 0.95 }} className="col-span-2">
          <Button
            className="w-full h-14 text-lg font-medium"
            variant={droneState.isFlying ? "destructive" : "default"}
            onClick={handleTakeoffLand}
          >
            {droneState.isFlying ? (
              <>
                <PlaneLanding className="h-5 w-5 mr-2" />
                Pousar
              </>
            ) : (
              <>
                <Plane className="h-5 w-5 mr-2" />
                Decolar
              </>
            )}
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            className="w-full"
            variant={droneState.isRecording ? "destructive" : "outline"}
            onClick={handleRecording}
          >
            {droneState.isRecording ? (
              <>
                <VideoOff className="h-4 w-4 mr-2" /> Parar Gravação
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" /> Iniciar Gravação
              </>
            )}
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div></div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            className="w-full h-12"
            onMouseDown={() => handleMove("forward", 50)}
            onTouchStart={() => handleMove("forward", 50)}
            onMouseUp={() => handleMove("forward", 0)}
            onTouchEnd={() => handleMove("forward", 0)}
            disabled={!controlsEnabled}
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
        </motion.div>
        <div></div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            className="w-full h-12"
            onMouseDown={() => handleMove("left", 50)}
            onTouchStart={() => handleMove("left", 50)}
            onMouseUp={() => handleMove("left", 0)}
            onTouchEnd={() => handleMove("left", 0)}
            disabled={!controlsEnabled}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </motion.div>
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary/50"></div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            className="w-full h-12"
            onMouseDown={() => handleMove("right", 50)}
            onTouchStart={() => handleMove("right", 50)}
            onMouseUp={() => handleMove("right", 0)}
            onTouchEnd={() => handleMove("right", 0)}
            disabled={!controlsEnabled}
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </motion.div>

        <div></div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            className="w-full h-12"
            onMouseDown={() => handleMove("backward", 50)}
            onTouchStart={() => handleMove("backward", 50)}
            onMouseUp={() => handleMove("backward", 0)}
            onTouchEnd={() => handleMove("backward", 0)}
            disabled={!controlsEnabled}
          >
            <ArrowDown className="h-6 w-6" />
          </Button>
        </motion.div>
        <div></div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            className="w-full h-12"
            onMouseDown={() => handleMove("yaw_left", 50)}
            onTouchStart={() => handleMove("yaw_left", 50)}
            onMouseUp={() => handleMove("yaw_left", 0)}
            onTouchEnd={() => handleMove("yaw_left", 0)}
            disabled={!controlsEnabled}
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="w-full h-12"
              onMouseDown={() => handleMove("up", 50)}
              onTouchStart={() => handleMove("up", 50)}
              onMouseUp={() => handleMove("up", 0)}
              onTouchEnd={() => handleMove("up", 0)}
              disabled={!controlsEnabled}
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              className="w-full h-12"
              onMouseDown={() => handleMove("down", 50)}
              onTouchStart={() => handleMove("down", 50)}
              onMouseUp={() => handleMove("down", 0)}
              onTouchEnd={() => handleMove("down", 0)}
              disabled={!controlsEnabled}
            >
              <ArrowDown className="h-6 w-6" />
            </Button>
          </motion.div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            className="w-full h-12"
            onMouseDown={() => handleMove("yaw_right", 50)}
            onTouchStart={() => handleMove("yaw_right", 50)}
            onMouseUp={() => handleMove("yaw_right", 0)}
            onTouchEnd={() => handleMove("yaw_right", 0)}
            disabled={!controlsEnabled}
          >
            <RotateCw className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

