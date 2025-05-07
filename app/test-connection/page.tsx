"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Loader2, Info } from "lucide-react"
import { useWebSocket } from "@/lib/websocket"
import { configureWebSocketBackend } from "@/lib/websocket-integration"
import { useToast } from "@/hooks/use-toast"

export default function TestConnectionPage() {
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [backendInfo, setBackendInfo] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const { connect, disconnect, connected, connectionError, useFallbackMode, setFallbackMode, sendCommand } =
    useWebSocket()
  const { toast } = useToast()

  // Função para adicionar informações de depuração
  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${info}`])
  }

  // Configure WebSocket backend when component mounts
  useEffect(() => {
    try {
      const wsUrl = configureWebSocketBackend()
      addDebugInfo(`WebSocket configurado: ${wsUrl}`)
    } catch (error) {
      addDebugInfo(`Erro ao configurar WebSocket: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Limpar o estado quando o componente é montado
    disconnect()
    setFallbackMode(false)

    return () => {
      // Limpar quando o componente é desmontado
      disconnect()
    }
  }, [])

  // Monitorar mudanças no estado de conexão
  useEffect(() => {
    if (connected) {
      addDebugInfo("WebSocket conectado")
    }

    if (connectionError) {
      addDebugInfo(`Erro de conexão: ${connectionError}`)
    }

    if (useFallbackMode) {
      addDebugInfo("Modo de simulação ativado")
    }
  }, [connected, connectionError, useFallbackMode])

  // Test connection to backend
  const testConnection = async () => {
    setTestStatus("testing")
    setErrorMessage("")
    setBackendInfo(null)
    setDebugInfo([])

    try {
      addDebugInfo("Iniciando teste de conexão")

      // Configure WebSocket with settings
      const wsUrl = configureWebSocketBackend()
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
        // Try to get backend info
        addDebugInfo("Enviando comando get_info")
        sendCommand({ type: "get_info" })
        setTestStatus("success")

        toast({
          title: "Conexão estabelecida",
          description: "Conectado com sucesso ao backend",
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

      // Ativar modo de simulação automaticamente
      if (!useFallbackMode) {
        addDebugInfo("Ativando modo de simulação automaticamente")
        setFallbackMode(true)

        toast({
          title: "Modo de simulação ativado",
          description: "Não foi possível conectar ao backend. Usando simulação.",
        })
      }
    }
  }

  // Função para ativar manualmente o modo de simulação
  const activateSimulationMode = () => {
    setFallbackMode(true)
    addDebugInfo("Modo de simulação ativado manualmente")

    toast({
      title: "Modo de simulação ativado",
      description: "O sistema agora está operando em modo de simulação",
    })
  }

  // Função para verificar o status do navegador
  const getBrowserInfo = () => {
    if (typeof window === "undefined") return "Executando no servidor"

    return {
      userAgent: navigator.userAgent,
      webSocket: "WebSocket" in window ? "Suportado" : "Não suportado",
      secure: window.location.protocol === "https:" ? "Sim (HTTPS)" : "Não (HTTP)",
      url: window.location.href,
    }
  }

  return (
    <div className="space-y-8 pb-8">
      <h1 className="text-3xl font-bold">Teste de Conexão com Backend</h1>

      <Card className="border-2 border-border/50 shadow-lg">
        <CardHeader className="bg-muted/30">
          <CardTitle>Testar Conexão com Backend</CardTitle>
          <CardDescription>Verifique a conexão com o backend Python do drone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="p-4 bg-muted/30 rounded-md">
            <h3 className="font-medium mb-2">Configuração do Backend:</h3>
            <p>Host: {process.env.NEXT_PUBLIC_BACKEND_HOST || "localhost"}</p>
            <p>Porta: {process.env.NEXT_PUBLIC_BACKEND_PORT || "8000"}</p>
            <p>Caminho WebSocket: {process.env.NEXT_PUBLIC_BACKEND_WS_PATH || "/"}</p>
          </div>

          {testStatus === "testing" && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p>Testando conexão com o backend...</p>
            </div>
          )}

          {testStatus === "success" && (
            <Alert className="bg-green-500/10 border-green-500">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Conexão Bem-sucedida</AlertTitle>
              <AlertDescription>Conectado com sucesso ao backend</AlertDescription>
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

          {backendInfo && (
            <div className="p-4 bg-muted/30 rounded-md">
              <h3 className="font-medium mb-2">Informações do Backend:</h3>
              <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(backendInfo, null, 2)}</pre>
            </div>
          )}

          <div className="p-4 bg-muted/30 rounded-md">
            <h3 className="font-medium mb-2">Informações de Depuração:</h3>
            <div className="max-h-40 overflow-y-auto text-xs font-mono">
              {debugInfo.length > 0 ? (
                debugInfo.map((info, index) => (
                  <p key={index} className="whitespace-pre-wrap">
                    {info}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">Nenhuma informação de depuração disponível</p>
              )}
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-md">
            <h3 className="font-medium mb-2">Estado da Conexão:</h3>
            <p>Conectado: {connected ? "Sim" : "Não"}</p>
            <p>Modo de Simulação: {useFallbackMode ? "Ativo" : "Inativo"}</p>
            {connectionError && <p className="text-red-400 mt-2">Erro: {connectionError}</p>}
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

      <Card className="border-2 border-border/50 shadow-lg">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center text-xl">
            <Info className="h-5 w-5 mr-2" />
            Informações do Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="p-4 bg-muted/30 rounded-md">
            <h3 className="font-medium mb-2">Navegador:</h3>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(getBrowserInfo(), null, 2)}</pre>
          </div>

          <div className="p-4 bg-muted/30 rounded-md mt-4">
            <h3 className="font-medium mb-2">Variáveis de Ambiente:</h3>
            <p>NEXT_PUBLIC_BACKEND_HOST: {process.env.NEXT_PUBLIC_BACKEND_HOST || "não definido"}</p>
            <p>NEXT_PUBLIC_BACKEND_PORT: {process.env.NEXT_PUBLIC_BACKEND_PORT || "não definido"}</p>
            <p>NEXT_PUBLIC_BACKEND_WS_PATH: {process.env.NEXT_PUBLIC_BACKEND_WS_PATH || "não definido"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

