"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff } from "lucide-react"
import { useWebSocket } from "@/lib/websocket"
import { useToast } from "@/hooks/use-toast"

export default function VoiceRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)
  const { sendCommand } = useWebSocket()
  const { toast } = useToast()

  // Inicializar reconhecimento de voz
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Verificar se o navegador suporta reconhecimento de voz
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        const recognition = recognitionRef.current

        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = "pt-BR"

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onresult = (event: any) => {
          const current = event.resultIndex
          const transcript = event.results[current][0].transcript
          setTranscript(transcript)
        }

        recognition.onerror = (event: any) => {
          console.error("Erro de reconhecimento de voz:", event.error)
          setIsListening(false)
          toast({
            title: "Erro de reconhecimento",
            description: `Erro: ${event.error}`,
            variant: "destructive",
          })
        }
      } else {
        setIsSupported(false)
        console.warn("Reconhecimento de voz não suportado neste navegador")
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Função para iniciar/parar o reconhecimento de voz
  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      setTranscript("")
      recognitionRef.current.start()

      toast({
        title: "Reconhecimento de voz ativado",
        description: "Diga um comando para o drone",
      })
    }
  }

  // Função para enviar o comando de voz para o backend
  const sendVoiceCommand = () => {
    if (!transcript) return

    sendCommand({
      command: "voice_command",
      params: {
        text: transcript,
      },
    })

    toast({
      title: "Comando enviado",
      description: `"${transcript}"`,
    })

    setTranscript("")
  }

  // Efeito para enviar o comando quando o reconhecimento terminar
  useEffect(() => {
    if (!isListening && transcript) {
      sendVoiceCommand()
    }
  }, [isListening, transcript])

  if (!isSupported) {
    return (
      <Card className="border-2 border-border/50 shadow-lg">
        <CardHeader className="p-4 bg-muted/30">
          <CardTitle className="text-xl">Comandos de Voz</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-muted-foreground">Reconhecimento de voz não suportado neste navegador.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-border/50 shadow-lg">
      <CardHeader className="p-4 bg-muted/30">
        <CardTitle className="text-xl">Comandos de Voz</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <Button
            size="lg"
            className={`h-16 w-16 rounded-full mb-4 ${isListening ? "bg-red-500 hover:bg-red-600" : ""}`}
            onClick={toggleListening}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          <div className="w-full p-3 bg-muted/30 rounded-md min-h-[60px] text-center">
            {transcript ? (
              transcript
            ) : (
              <span className="text-muted-foreground">
                {isListening ? "Ouvindo..." : "Clique no microfone para falar"}
              </span>
            )}
          </div>

          <div className="w-full mt-4">
            <h3 className="font-medium mb-2">Comandos disponíveis:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>"Decolar" - Inicia voo</li>
              <li>"Pousar" - Finaliza voo</li>
              <li>"Subir/Descer" - Controle de altitude</li>
              <li>"Esquerda/Direita" - Movimento lateral</li>
              <li>"Frente/Trás" - Movimento frontal</li>
              <li>"Modo seguir" - Ativa seguimento</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

