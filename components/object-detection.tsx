"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWebSocket } from "@/lib/websocket"
import { Eye, Cpu } from "lucide-react"

export default function ObjectDetection() {
  const { droneState } = useWebSocket()
  const [detectedObjects, setDetectedObjects] = useState<any[]>([])
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiMode, setAiMode] = useState("idle")

  // Atualizar estado com base nos dados do WebSocket
  useEffect(() => {
    if (droneState && droneState.ai) {
      setAiEnabled(droneState.ai.enabled)
      setAiMode(droneState.ai.mode)

      // Simular objetos detectados para demonstração
      const objectTypes = ["person", "car", "tree", "building", "dog", "bicycle"]
      const numObjects = Math.floor(Math.random() * 5) + 1

      const objects = Array.from({ length: numObjects }, (_, i) => {
        const type = objectTypes[Math.floor(Math.random() * objectTypes.length)]
        const confidence = Math.random() * 0.5 + 0.5 // 0.5 a 1.0

        return {
          id: i,
          type,
          confidence: confidence.toFixed(2),
          timestamp: Date.now(),
        }
      })

      setDetectedObjects(objects)
    }
  }, [droneState])

  // Função para obter cor baseada no tipo de objeto
  const getObjectColor = (type: string) => {
    switch (type) {
      case "person":
        return "bg-blue-500"
      case "car":
        return "bg-red-500"
      case "tree":
        return "bg-green-500"
      case "building":
        return "bg-purple-500"
      case "dog":
        return "bg-yellow-500"
      case "bicycle":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="border-2 border-border/50 shadow-lg">
      <CardHeader className="p-4 bg-muted/30">
        <CardTitle className="flex items-center text-xl">
          <Eye className="h-5 w-5 mr-2" />
          Detecção de Objetos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Cpu className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm font-medium">Status da IA:</span>
          </div>
          <Badge variant={aiEnabled ? "default" : "outline"}>{aiEnabled ? "Ativo" : "Inativo"}</Badge>
        </div>

        <div className="border rounded-md p-2 min-h-[200px]">
          <h3 className="text-sm font-medium mb-2">Objetos Detectados:</h3>

          {detectedObjects.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Nenhum objeto detectado
            </div>
          ) : (
            <div className="space-y-2">
              {detectedObjects.map((object) => (
                <div key={object.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${getObjectColor(object.type)}`} />
                    <span className="font-medium">{object.type}</span>
                  </div>
                  <Badge variant="outline">{object.confidence}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

