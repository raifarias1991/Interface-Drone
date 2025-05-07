"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWebSocket } from "@/lib/websocket"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { MapPin, Navigation, RotateCw, Loader2 } from "lucide-react"

export default function RoutePlanner() {
  const [planning, setPlanning] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [waypoints, setWaypoints] = useState<any[]>([])
  const [startPoint, setStartPoint] = useState({ x: "0", y: "0", z: "1" })
  const [endPoint, setEndPoint] = useState({ x: "10", y: "10", z: "1" })

  const { sendCommand } = useWebSocket()
  const { toast } = useToast()

  // Função para planejar rota
  const planRoute = () => {
    setPlanning(true)
    setWaypoints([])

    // Simular planejamento de rota
    setTimeout(() => {
      // Gerar waypoints simulados
      const numWaypoints = Math.floor(Math.random() * 5) + 3
      const start = {
        x: Number.parseFloat(startPoint.x),
        y: Number.parseFloat(startPoint.y),
        z: Number.parseFloat(startPoint.z),
      }
      const end = {
        x: Number.parseFloat(endPoint.x),
        y: Number.parseFloat(endPoint.y),
        z: Number.parseFloat(endPoint.z),
      }

      const generatedWaypoints = []

      // Adicionar ponto inicial
      generatedWaypoints.push({
        id: 0,
        x: start.x,
        y: start.y,
        z: start.z,
        type: "start",
      })

      // Gerar pontos intermediários
      for (let i = 0; i < numWaypoints; i++) {
        const progress = (i + 1) / (numWaypoints + 1)
        const x = start.x + (end.x - start.x) * progress
        const y = start.y + (end.y - start.y) * progress
        const z = start.z + (end.z - start.z) * progress

        // Adicionar alguma variação
        const jitterX = Math.random() * 2 - 1
        const jitterY = Math.random() * 2 - 1

        generatedWaypoints.push({
          id: i + 1,
          x: x + jitterX,
          y: y + jitterY,
          z: z,
          type: "waypoint",
        })
      }

      // Adicionar ponto final
      generatedWaypoints.push({
        id: numWaypoints + 1,
        x: end.x,
        y: end.y,
        z: end.z,
        type: "end",
      })

      setWaypoints(generatedWaypoints)
      setPlanning(false)

      toast({
        title: "Rota planejada",
        description: `Rota com ${numWaypoints + 2} pontos gerada com sucesso`,
      })
    }, 2000)
  }

  // Função para executar rota
  const executeRoute = () => {
    if (waypoints.length === 0) {
      toast({
        title: "Erro",
        description: "Planeje uma rota primeiro",
        variant: "destructive",
      })
      return
    }

    setExecuting(true)

    // Simular execução da rota
    toast({
      title: "Executando rota",
      description: "O drone começará a seguir a rota planejada",
    })

    // Em um caso real, enviaríamos os waypoints para o backend
    sendCommand({
      command: "set_mode",
      params: {
        mode: "path_planning",
      },
    })

    // Simular conclusão após alguns segundos
    setTimeout(() => {
      setExecuting(false)

      toast({
        title: "Rota concluída",
        description: "O drone completou a rota com sucesso",
      })
    }, 5000)
  }

  // Manipuladores para os campos de entrada
  const handleStartPointChange = (field: string, value: string) => {
    setStartPoint((prev) => ({ ...prev, [field]: value }))
  }

  const handleEndPointChange = (field: string, value: string) => {
    setEndPoint((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="border-2 border-border/50 shadow-lg">
      <CardHeader className="p-4 bg-muted/30">
        <CardTitle className="flex items-center text-xl">
          <Navigation className="h-5 w-5 mr-2" />
          Planejamento de Rota
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="start-x">Ponto Inicial</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <Input
                  id="start-x"
                  value={startPoint.x}
                  onChange={(e) => handleStartPointChange("x", e.target.value)}
                  placeholder="X"
                  className="bg-background"
                />
              </div>
              <div>
                <Input
                  value={startPoint.y}
                  onChange={(e) => handleStartPointChange("y", e.target.value)}
                  placeholder="Y"
                  className="bg-background"
                />
              </div>
              <div>
                <Input
                  value={startPoint.z}
                  onChange={(e) => handleStartPointChange("z", e.target.value)}
                  placeholder="Z"
                  className="bg-background"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="end-x">Ponto Final</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <Input
                  id="end-x"
                  value={endPoint.x}
                  onChange={(e) => handleEndPointChange("x", e.target.value)}
                  placeholder="X"
                  className="bg-background"
                />
              </div>
              <div>
                <Input
                  value={endPoint.y}
                  onChange={(e) => handleEndPointChange("y", e.target.value)}
                  placeholder="Y"
                  className="bg-background"
                />
              </div>
              <div>
                <Input
                  value={endPoint.z}
                  onChange={(e) => handleEndPointChange("z", e.target.value)}
                  placeholder="Z"
                  className="bg-background"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button className="w-full" variant="outline" onClick={planRoute} disabled={planning || executing}>
              {planning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Planejando...
                </>
              ) : (
                <>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Planejar Rota
                </>
              )}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              className="w-full"
              onClick={executeRoute}
              disabled={planning || executing || waypoints.length === 0}
            >
              {executing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Executar Rota
                </>
              )}
            </Button>
          </motion.div>
        </div>

        <div className="border rounded-md p-2 min-h-[150px]">
          <h3 className="text-sm font-medium mb-2">Waypoints:</h3>

          {waypoints.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
              {planning ? "Planejando rota..." : "Nenhuma rota planejada"}
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {waypoints.map((point) => (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
                >
                  <div className="flex items-center">
                    <MapPin
                      className={`h-4 w-4 mr-2 ${
                        point.type === "start"
                          ? "text-green-500"
                          : point.type === "end"
                            ? "text-red-500"
                            : "text-blue-500"
                      }`}
                    />
                    <span className="font-medium">
                      {point.type === "start" ? "Início" : point.type === "end" ? "Fim" : `Ponto ${point.id}`}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({point.x.toFixed(1)}, {point.y.toFixed(1)}, {point.z.toFixed(1)})
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

