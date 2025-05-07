"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VideoFeed from "@/components/video-feed"
import DroneControls from "@/components/drone-controls"
import TelemetryDisplay from "@/components/telemetry-display"
import DroneVisualizer from "@/components/drone-visualizer"
import ModeSelector from "@/components/mode-selector"
import VoiceRecognition from "@/components/voice-recognition"
import ObjectDetection from "@/components/object-detection"
import SceneAnalysis from "@/components/scene-analysis"
import RoutePlanner from "@/components/route-planner"
import SimulationInitializer from "@/components/simulation-initializer"
import { useWebSocket } from "@/lib/websocket"
import { configureWebSocketBackend } from "@/lib/websocket-integration"
import { useToast } from "@/hooks/use-toast"
import { Loader2, BrainCircuit } from "lucide-react"

export default function Home() {
  const { connect, connected, useFallbackMode, setFallbackMode, connectionError } = useWebSocket()
  const { toast } = useToast()

  // Configurar e conectar ao WebSocket quando o componente montar
  useEffect(() => {
    try {
      // Configurar WebSocket
      const wsUrl = configureWebSocketBackend()
      console.log("WebSocket URL configurada:", wsUrl)

      // Verificar se estamos em um ambiente de preview/produção
      const isVercelPreview = typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      const isProduction =
        typeof window !== "undefined" &&
        !window.location.hostname.includes("localhost") &&
        !window.location.hostname.includes("127.0.0.1")

      if (isVercelPreview || isProduction) {
        // Em ambientes de produção, ativar imediatamente o modo de simulação
        console.log("Ambiente de produção detectado, ativando modo de simulação imediatamente")
        setFallbackMode(true)
        toast({
          title: "Modo de simulação ativado",
          description: "Executando em modo de simulação em ambiente de produção.",
        })
      } else {
        // Em ambiente de desenvolvimento, tentar conectar primeiro
        connect()
        console.log("Tentativa de conexão iniciada")

        // Se não conseguir conectar em 1.5 segundos, ativar o modo de simulação
        const timeoutId = setTimeout(() => {
          if (!connected && !useFallbackMode) {
            console.log("Ativando modo de simulação automaticamente após timeout")
            setFallbackMode(true)
            toast({
              title: "Modo de simulação ativado",
              description: "Não foi possível conectar ao backend. Usando simulação.",
            })
          }
        }, 1500) // Reduzido para 1.5 segundos para ativar mais rapidamente

        return () => {
          clearTimeout(timeoutId)
        }
      }
    } catch (error) {
      console.error("Erro ao configurar WebSocket:", error)
      // Ativar modo de simulação imediatamente em caso de erro
      setFallbackMode(true)
    }
  }, [])

  // Monitorar erros de conexão e ativar o modo de simulação quando necessário
  useEffect(() => {
    if (connectionError && !useFallbackMode) {
      console.log("Ativando modo de simulação devido a erro de conexão:", connectionError)
      setFallbackMode(true)
      toast({
        title: "Modo de simulação ativado",
        description: "Erro de conexão com o backend. Usando simulação.",
      })
    }
  }, [connectionError, useFallbackMode])

  if (!connected && !useFallbackMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Conectando ao drone...</h2>
        <p className="text-muted-foreground">Tentando estabelecer conexão com o backend</p>
      </div>
    )
  }

  return (
    <>
      {/* Inicializador de simulação (não visível) */}
      <SimulationInitializer />

      <div className="space-y-6 pb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3 space-y-6">
            <Card className="overflow-hidden border-2 border-border/50 shadow-lg">
              <CardHeader className="p-4 bg-muted/30">
                <CardTitle className="flex items-center text-xl">
                  Feed de Vídeo
                  {useFallbackMode && (
                    <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                      Simulação
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[400px] bg-black/50">
                <VideoFeed />
              </CardContent>
            </Card>

            <Tabs defaultValue="telemetry" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="telemetry">Telemetria</TabsTrigger>
                <TabsTrigger value="3d">Visualização 3D</TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center">
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  IA Avançada
                </TabsTrigger>
              </TabsList>
              <TabsContent value="telemetry" className="mt-4">
                <TelemetryDisplay />
              </TabsContent>
              <TabsContent value="3d" className="mt-4">
                <Card className="border-2 border-border/50 shadow-lg">
                  <CardContent className="p-0 h-[300px]">
                    <DroneVisualizer />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="ai" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ObjectDetection />
                  <SceneAnalysis />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="w-full md:w-1/3 space-y-6">
            <Card className="border-2 border-border/50 shadow-lg">
              <CardHeader className="p-4 bg-muted/30">
                <CardTitle className="text-xl">Controles</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <DroneControls />
              </CardContent>
            </Card>

            <Tabs defaultValue="mode" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="mode">Modo</TabsTrigger>
                <TabsTrigger value="voice">Voz</TabsTrigger>
                <TabsTrigger value="route">Rota</TabsTrigger>
              </TabsList>
              <TabsContent value="mode" className="mt-4">
                <Card className="border-2 border-border/50 shadow-lg">
                  <CardHeader className="p-4 bg-muted/30">
                    <CardTitle className="text-xl">Modo de Operação</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ModeSelector />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="voice" className="mt-4">
                <VoiceRecognition />
              </TabsContent>
              <TabsContent value="route" className="mt-4">
                <RoutePlanner />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

