"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DemoViewer from "@/components/demo-viewer"
import { BrainCircuit, Video, Cpu, Layers } from "lucide-react"

export default function DemosPage() {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Demonstrações de IA</h1>
        <p className="text-muted-foreground">
          Visualize exemplos de como o sistema de IA do drone funciona em diferentes cenários.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DemoViewer />
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-border/50 shadow-lg">
            <CardHeader className="p-4 bg-muted/30">
              <CardTitle className="flex items-center text-xl">
                <BrainCircuit className="h-5 w-5 mr-2" />
                Recursos de IA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-primary/20 p-1 rounded mr-2 mt-0.5">
                    <Cpu className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Detecção de Objetos</span>
                    <p className="text-sm text-muted-foreground">
                      Identifica pessoas, veículos, e outros objetos em tempo real.
                    </p>
                  </div>
                </li>

                <li className="flex items-start">
                  <div className="bg-primary/20 p-1 rounded mr-2 mt-0.5">
                    <Video className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Rastreamento Facial</span>
                    <p className="text-sm text-muted-foreground">Detecta e acompanha rostos automaticamente.</p>
                  </div>
                </li>

                <li className="flex items-start">
                  <div className="bg-primary/20 p-1 rounded mr-2 mt-0.5">
                    <Layers className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Navegação Autônoma</span>
                    <p className="text-sm text-muted-foreground">Planeja e executa rotas evitando obstáculos.</p>
                  </div>
                </li>
              </ul>

              <div className="mt-4 text-sm">
                <p className="font-medium">Como usar:</p>
                <ol className="list-decimal ml-5 text-muted-foreground space-y-1 mt-2">
                  <li>Selecione um cenário de demonstração nas abas acima</li>
                  <li>Use os controles de reprodução para visualizar a demonstração</li>
                  <li>Observe como a IA detecta e rastreia objetos em tempo real</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/50 shadow-lg">
            <CardHeader className="p-4 bg-muted/30">
              <CardTitle className="text-xl">Informações Técnicas</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Resolução:</span>
                  <p className="text-muted-foreground">640x480 pixels</p>
                </div>

                <div>
                  <span className="font-medium">Taxa de Frames:</span>
                  <p className="text-muted-foreground">30 FPS (frames por segundo)</p>
                </div>

                <div>
                  <span className="font-medium">Modelos de IA:</span>
                  <p className="text-muted-foreground">
                    Detecção de objetos, rastreamento facial, planejamento de rotas
                  </p>
                </div>

                <div>
                  <span className="font-medium">Precisão:</span>
                  <p className="text-muted-foreground">85-98% dependendo das condições e objetos</p>
                </div>

                <div>
                  <span className="font-medium">Latência:</span>
                  <p className="text-muted-foreground">50-150ms para processamento de IA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

