"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Terminal } from "lucide-react"
import { motion } from "framer-motion"

export default function ConnectionDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<{ [key: string]: any }>({})
  const [running, setRunning] = useState(false)

  const runDiagnostics = async () => {
    setRunning(true)
    const results: { [key: string]: any } = {}

    // Verificar suporte a WebSocket
    results.webSocketSupport = typeof WebSocket !== "undefined"

    // Verificar informações do navegador
    if (typeof window !== "undefined") {
      results.userAgent = navigator.userAgent
      results.protocol = window.location.protocol
      results.host = window.location.host
    }

    // Verificar variáveis de ambiente
    results.envVars = {
      NEXT_PUBLIC_BACKEND_HOST: process.env.NEXT_PUBLIC_BACKEND_HOST || "não definido",
      NEXT_PUBLIC_BACKEND_PORT: process.env.NEXT_PUBLIC_BACKEND_PORT || "não definido",
      NEXT_PUBLIC_BACKEND_WS_PATH: process.env.NEXT_PUBLIC_BACKEND_WS_PATH || "não definido",
    }

    // Verificar conectividade com o backend via fetch (não WebSocket)
    try {
      const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST || "localhost"
      const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || "8000"

      // Tentar fazer uma requisição HTTP para o backend
      // Isso pode falhar devido a CORS, mas nos dá informações sobre a conectividade
      results.httpFetch = { status: "pending" }

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const response = await fetch(`http://${backendHost}:${backendPort}/`, {
          mode: "no-cors",
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        results.httpFetch = {
          status: "success",
          info: "Requisição HTTP bem-sucedida (no-cors)",
        }
      } catch (error) {
        results.httpFetch = {
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        }
      }

      // Tentar criar um WebSocket diretamente (pode falhar, mas nos dá informações)
      results.webSocketTest = { status: "pending" }

      try {
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
        const wsUrl = `${wsProtocol}//${backendHost}:${backendPort}`

        const ws = new WebSocket(wsUrl)

        // Configurar um timeout
        const timeoutId = setTimeout(() => {
          results.webSocketTest = {
            status: "timeout",
            info: "Timeout ao tentar conectar WebSocket",
          }
          ws.close()
          setDiagnostics({ ...results })
        }, 3000)

        ws.onopen = () => {
          clearTimeout(timeoutId)
          results.webSocketTest = {
            status: "success",
            info: "WebSocket conectado com sucesso",
          }
          ws.close()
          setDiagnostics({ ...results })
        }

        ws.onerror = (error) => {
          clearTimeout(timeoutId)
          results.webSocketTest = {
            status: "error",
            error: "Erro ao conectar WebSocket",
          }
          setDiagnostics({ ...results })
        }
      } catch (error) {
        results.webSocketTest = {
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        }
      }
    } catch (error) {
      results.connectivityTest = {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      }
    }

    setDiagnostics(results)
    setRunning(false)
  }

  return (
    <Card className="border-2 border-border/50 shadow-lg">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center text-xl">
          <Terminal className="h-5 w-5 mr-2" />
          Diagnóstico de Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Button onClick={runDiagnostics} disabled={running} className="mb-4">
          {running ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executando diagnóstico...
            </>
          ) : (
            "Executar Diagnóstico"
          )}
        </Button>

        {Object.keys(diagnostics).length > 0 && (
          <motion.div
            className="p-4 bg-muted/30 rounded-md overflow-auto max-h-80"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-medium mb-2">Resultados do Diagnóstico:</h3>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(diagnostics, null, 2)}</pre>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

