"use client"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/lib/websocket"
import { User, Video, Map, Navigation, Brain } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function ModeSelector() {
  const { sendCommand, mode } = useWebSocket()
  const { toast } = useToast()

  const modes = [
    { id: "manual", name: "Manual", icon: User, color: "bg-blue-500" },
    { id: "face_tracking", name: "Rastreamento", icon: Video, color: "bg-green-500" },
    { id: "slam", name: "SLAM", icon: Map, color: "bg-yellow-500" },
    { id: "path_planning", name: "Planejamento", icon: Navigation, color: "bg-purple-500" },
    { id: "neural", name: "Neural", icon: Brain, color: "bg-red-500" },
  ]

  const handleModeChange = (modeId: string) => {
    sendCommand({
      type: "set_mode",
      mode: modeId,
    })

    toast({
      title: "Modo alterado",
      description: `Modo de operação alterado para ${modeId}`,
    })
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {modes.map((modeOption) => {
        const Icon = modeOption.icon
        const isActive = mode === modeOption.id

        return (
          <motion.div key={modeOption.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isActive ? "default" : "outline"}
              size="lg"
              onClick={() => handleModeChange(modeOption.id)}
              className={`w-full h-16 flex flex-col items-center justify-center ${isActive ? "border-2" : ""}`}
            >
              <div
                className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isActive ? modeOption.color : "bg-transparent"}`}
              ></div>
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{modeOption.name}</span>
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
}

