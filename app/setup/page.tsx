"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Loader2, Settings } from "lucide-react"
import { useWebSocket } from "@/lib/websocket"
import { configureWebSocketBackend } from "@/lib/websocket-integration"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function SetupPage() {
  const [backendHost, setBackendHost] = useState(process.env.NEXT_PUBLIC_BACKEND_HOST || "localhost")
  const [backendPort, setBackendPort] = useState(process.env.NEXT_PUBLIC_BACKEND_PORT || "8000")
  const [backendWsPath, setBackendWsPath] = useState(process.env.NEXT_PUBLIC_BACKEND_WS_PATH || "")
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState<string>("")

  const { connect, disconnect, connected, connectionError, useFallbackMode, setFallbackMode } = useWebSocket()
  const { toast } = useToast()

  // Função para adicionar informações de depuração
  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => `${prev}\n[${new Date().toLocaleTimeString()}] ${info}`)
  }

  // Configure WebSocket backend when component mounts
  const configureBackend = () => {
    try {
      const wsUrl = configureWebSocketBackend()
      addDebugInfo(`WebSocket configurado: ${wsUrl}`)
      return wsUrl
    } catch (error) {
      addDebugInfo(`Erro ao configurar WebSocket: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  // Test connection to backend
  const testConnection = async () => {
    setTestStatus("testing")
    setErrorMessage("")
    setDebugInfo("")

    try {
      addDebugInfo("Iniciando teste de conexão")

      // Update environment variables in memory
      if (typeof window !== "undefined") {
        window.process = window.process || {}
        window.process.env = window.process.env || {}
        window.process.env.NEXT_PUBLIC_BACKEND_HOST = backendHost
        window.process.env.NEXT_PUBLIC_BACKEND_PORT = backendPort
        window.process.env.NEXT_PUBLIC_BACKEND_WS_PATH = backendWsPath
      }

      // Configure WebSocket with new settings
      const wsUrl = configureBackend()
      addDebugInfo(`URL do WebSocket: ${wsUrl}`)

      // Try to connect
      disconnect()
      setFallbackMode(false)
      addDebugInfo("Desconectado e modo de simulação desativado")

      // Wait a bit before connecting
      addDebugInfo("Aguardando 500ms antes de conectar")
      await new Promise((resolve) => setTimeout(resolve, 500))

      addDebugInfo("Tentando conectar")
      connect()

      // Wait for connection attempt
      addDebugInfo("Aguardando 5 segundos pela tentativa de conexão")
      await new Promise((resolve) => setTimeout(resolve, 5000))

      if (connected) {
        addDebugInfo("Conexão bem-sucedida")
        setTestStatus("success")
        toast({
          title: "Conexão estabelecida",
          description: "Conectado com sucesso ao backend do drone",
        })
      } else {
        const error = connectionError || "Não foi possível conectar ao backend"
        addDebugInfo(`Falha na conexão: ${error}`)
        throw new Error(error)
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      setTestStatus("error")
      setErrorMessage(error instanceof Error ? error.message : String(error))

      toast({
        title: "Falha na conexão",
        description: "Não foi possível conectar ao backend. Verifique as configurações.",
        variant: "destructive",
      })
    }
  }

  const activateSimulationMode = () => {
    setFallbackMode(true)
    toast({
      title: "Modo de simulação ativado",
      description: "O sistema agora está operando em modo de simulação",
    })
  }

  return (
    <div className="space-y-8 pb-8">
      <h1 className="text-3xl font-bold">Configuração do Sistema</h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center text-xl">
              <Settings className="h-5 w-5 mr-2" />
              Configuração de Conexão
            </CardTitle>
            <CardDescription>Configure a conexão com o backend Python do drone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backend-host">Host do Backend</Label>
                <Input
                  id="backend-host"
                  value={backendHost}
                  onChange={(e) => setBackendHost(e.target.value)}
                  placeholder="localhost"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backend-port">Porta do Backend</Label>
                <Input
                  id="backend-port"
                  value={backendPort}
                  onChange={(e) => setBackendPort(e.target.value)}
                  placeholder="8000"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backend-ws-path">Caminho WebSocket</Label>
                <Input
                  id="backend-ws-path"
                  value={backendWsPath}
                  onChange={(e) => setBackendWsPath(e.target.value)}
                  placeholder=""
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">Deixe em branco se o WebSocket estiver na raiz</p>
              </div>
            </div>

            {testStatus === "testing" && (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <p>Testando conexão...</p>
              </div>
            )}

            {testStatus === "success" && (
              <Alert className="bg-green-500/10 border-green-500">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle>Conexão Bem-sucedida</AlertTitle>
                <AlertDescription>
                  Conectado com sucesso ao backend em {backendHost}:{backendPort}
                </AlertDescription>
              </Alert>
            )}

            {testStatus === "error" && (
              <Alert className="bg-red-500/10 border-red-500">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertTitle>Falha na Conexão</AlertTitle>
                <AlertDescription>
                  {errorMessage || "Não foi possível conectar ao backend. Modo de simulação ativado."}
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-muted/30 rounded-md text-xs font-mono overflow-auto max-h-32">
              <p className="text-muted-foreground mb-1">Informações de Depuração:</p>
              <pre className="whitespace-pre-wrap">{debugInfo || "Nenhuma informação disponível"}</pre>
              <p className="text-muted-foreground mt-2">Status da Conexão:</p>
              <p>{connected ? "Conectado" : "Desconectado"}</p>
              {connectionError && (
                <>
                  <p className="text-muted-foreground mt-2">Erro de Conexão:</p>
                  <p className="text-red-400">{connectionError}</p>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between bg-muted/10">
            <Button variant="outline" onClick={activateSimulationMode}>
              Usar Modo de Simulação
            </Button>
            <Button onClick={testConnection} disabled={testStatus === "testing"}>
              {testStatus === "testing" ? "Testando..." : "Testar Conexão"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="bg-muted/30">
            <CardTitle>Sobre o Sistema</CardTitle>
            <CardDescription>Informações sobre o sistema de controle de drone</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p>
                Este sistema permite controlar e monitorar drones através de uma interface web moderna. O frontend é
                construído com Next.js e se comunica com um backend Python via WebSockets.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-md">
                  <h3 className="font-medium mb-2">Frontend</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Next.js com App Router</li>
                    <li>Tailwind CSS para estilização</li>
                    <li>Visualização 3D com Three.js</li>
                    <li>Animações com Framer Motion</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted/30 rounded-md">
                  <h3 className="font-medium mb-2">Backend</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Servidor Python com WebSockets</li>
                    <li>Processamento de vídeo em tempo real</li>
                    <li>Telemetria e controle de drone</li>
                    <li>Modo de simulação para testes</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

