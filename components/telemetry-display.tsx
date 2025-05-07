"use client"

import { useWebSocket } from "@/lib/websocket"
import { Battery, Thermometer, Compass, ArrowUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

export default function TelemetryDisplay() {
  const { droneState } = useWebSocket()

  // Função para formatar a altitude
  const formatAltitude = (altitude: number) => {
    return altitude.toFixed(2)
  }

  // Função para determinar a cor da bateria
  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-500"
    if (level > 20) return "text-yellow-500"
    return "text-red-500"
  }

  // Função para determinar a cor do progresso da bateria
  const getBatteryProgressColor = (level: number) => {
    if (level > 50) return "bg-green-500"
    if (level > 20) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="border-2 border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <Battery className={`h-5 w-5 mr-2 ${getBatteryColor(droneState.battery)}`} />
              <h3 className="font-medium">Bateria</h3>
            </div>
            <div className={`text-2xl font-bold mb-1 ${getBatteryColor(droneState.battery)}`}>
              {droneState.battery}%
            </div>
            <Progress
              value={droneState.battery}
              className="h-2 mt-1"
              indicatorClassName={getBatteryProgressColor(droneState.battery)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <ArrowUp className="h-5 w-5 mr-2 text-blue-500" />
              <h3 className="font-medium">Altitude</h3>
            </div>
            <motion.div
              className="text-2xl font-bold text-blue-500"
              key={droneState.altitude}
              initial={{ opacity: 0.5, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {formatAltitude(droneState.altitude)} m
            </motion.div>
            <Progress
              value={Math.min(droneState.altitude * 10, 100)}
              className="h-2 mt-3"
              indicatorClassName="bg-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <Thermometer className="h-5 w-5 mr-2 text-orange-500" />
              <h3 className="font-medium">Temperatura</h3>
            </div>
            <div className="text-2xl font-bold text-orange-500">{droneState.temperature}°C</div>
            <Progress
              value={Math.min((droneState.temperature / 50) * 100, 100)}
              className="h-2 mt-3"
              indicatorClassName="bg-orange-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-border/50 shadow-lg overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <Compass className="h-5 w-5 mr-2 text-purple-500" />
              <h3 className="font-medium">Direção</h3>
            </div>
            <div className="text-2xl font-bold text-purple-500">{Math.round(droneState.attitude.yaw)}°</div>
            <div className="relative h-8 mt-1">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-muted rounded-full"></div>
              </div>
              <motion.div
                className="absolute top-0 left-1/2 w-2 h-8 flex items-center justify-center"
                style={{
                  transformOrigin: "bottom center",
                  rotate: droneState.attitude.yaw,
                }}
              >
                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full absolute top-0"></div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

