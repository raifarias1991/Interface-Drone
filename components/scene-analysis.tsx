"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/lib/websocket"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Search, Loader2, BrainCircuit } from "lucide-react"

export default function SceneAnalysis() {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState("")
  const { sendCommand } = useWebSocket()
  const { toast } = useToast()

  // Função para analisar a cena atual
  const analyzeScene = async () => {
    setAnalyzing(true)
    setAnalysis("")

    try {
      sendCommand({
        command: "analyze_scene",
        params: {},
      })

      // Simular resposta do backend (em um caso real, isso viria do WebSocket)
      setTimeout(() => {
        const scenes = [
          "Objetos detectados: 2 pessoas, 1 carro. Recomendação: modo de seguimento de pessoa.",
          "Objetos detectados: 1 árvore, 3 prédios. Recomendação: modo de exploração.",
          "Objetos detectados: 1 pessoa, 1 bicicleta. Recomendação: modo de seguimento de pessoa.",
          "Nenhum objeto detectado na cena. Recomendação: modo de exploração.",
          "Objetos detectados: 1 carro, 2 pessoas, 1 cachorro. Recomendação: modo de seguimento de pessoa.",
        ]

        const randomAnalysis = scenes[Math.floor(Math.random() * scenes.length)]
        setAnalysis(randomAnalysis)
        setAnalyzing(false)

        toast({
          title: "Análise concluída",
          description: "A cena foi analisada com sucesso",
        })
      }, 2000)
    } catch (error) {
      console.error("Erro ao analisar cena:", error)
      setAnalyzing(false)

      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a cena",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="border-2 border-border/50 shadow-lg">
      <CardHeader className="p-4 bg-muted/30">
        <CardTitle className="flex items-center text-xl">
          <BrainCircuit className="h-5 w-5 mr-2" />
          Análise de Cena
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mb-4 w-full">
            <Button className="w-full" onClick={analyzeScene} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analisar Cena
                </>
              )}
            </Button>
          </motion.div>

          <div className="w-full p-3 bg-muted/30 rounded-md min-h-[100px] text-sm">
            {analysis ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                {analysis}
              </motion.div>
            ) : (
              <span className="text-muted-foreground">
                {analyzing ? "Processando análise..." : "Clique no botão para analisar a cena atual"}
              </span>
            )}
          </div>

          <div className="w-full mt-4 text-xs text-muted-foreground">
            <p>A análise de cena utiliza visão computacional e IA para interpretar o ambiente.</p>
            <p>Com base na análise, o sistema pode recomendar modos de operação otimizados.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

