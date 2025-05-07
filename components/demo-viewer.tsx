"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCw, Video } from "lucide-react"

// URLs dos vídeos de demonstração (em um caso real, viriam do backend)
const DEMO_VIDEOS = [
  {
    id: "urban",
    title: "Cenário Urbano",
    description: "Demonstração de detecção de objetos em ambiente urbano",
    url: "/demo_videos/demo_video_urban.mp4",
  },
  {
    id: "follow_person",
    title: "Seguimento de Pessoa",
    description: "Demonstração do modo de seguimento de pessoa",
    url: "/demo_videos/demo_video_follow_person.mp4",
  },
  {
    id: "face_tracking",
    title: "Rastreamento Facial",
    description: "Demonstração do modo de rastreamento facial",
    url: "/demo_videos/demo_video_face_tracking.mp4",
  },
]

export default function DemoViewer() {
  const [activeTab, setActiveTab] = useState(DEMO_VIDEOS[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)

  // Função para alternar reprodução
  const togglePlayback = () => {
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause()
      } else {
        videoElement.play().catch((error) => {
          console.error("Erro ao reproduzir vídeo:", error)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Função para reiniciar o vídeo
  const restartVideo = () => {
    if (videoElement) {
      videoElement.currentTime = 0
      videoElement.play().catch((error) => {
        console.error("Erro ao reproduzir vídeo:", error)
      })
      setIsPlaying(true)
    }
  }

  return (
    <Card className="border-2 border-border/50 shadow-lg">
      <CardHeader className="p-4 bg-muted/30">
        <CardTitle className="flex items-center text-xl">
          <Video className="h-5 w-5 mr-2" />
          Demonstrações de IA
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="urban">Urbano</TabsTrigger>
            <TabsTrigger value="follow_person">Seguimento</TabsTrigger>
            <TabsTrigger value="face_tracking">Facial</TabsTrigger>
          </TabsList>

          {DEMO_VIDEOS.map((video) => (
            <TabsContent key={video.id} value={video.id} className="mt-0">
              <div className="aspect-video bg-black rounded-md overflow-hidden mb-4">
                <video
                  ref={(el) => (video.id === activeTab ? setVideoElement(el) : null)}
                  src={video.url}
                  className="w-full h-full object-contain"
                  loop
                  playsInline
                  onClick={togglePlayback}
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                </div>

                <div className="flex space-x-2">
                  <Button size="icon" variant="outline" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  <Button size="icon" variant="outline" onClick={restartVideo}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

