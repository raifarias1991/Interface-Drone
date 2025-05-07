"use client"

import { create } from "zustand"
import { mapCommandToBackend } from "./websocket-integration"

// Define the store for WebSocket state
interface WebSocketState {
  wsUrl: string | null
  ws: WebSocket | null
  connected: boolean
  connecting: boolean
  connectionError: string | null
  useFallbackMode: boolean
  currentFrame: string | null
  droneState: any
  mode: string
  simulationData: {
    targetAltitude: number
    targetYaw: number
    movementVector: { x: number; y: number; z: number }
    lastUpdateTime: number
  }
  simulationInterval: number | null
  connect: () => void
  disconnect: () => void
  sendCommand: (command: any) => void
  setWsUrl: (url: string) => void
  setFallbackMode: (fallback: boolean) => void
  updateSimulation: () => void
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  wsUrl: null,
  ws: null,
  connected: false,
  connecting: false,
  connectionError: null,
  useFallbackMode: false,
  currentFrame: null,
  droneState: {
    battery: 100,
    altitude: 0,
    temperature: 25,
    attitude: {
      pitch: 0,
      roll: 0,
      yaw: 0,
    },
    isFlying: false,
    isRecording: false,
  },
  mode: "manual",
  simulationData: {
    targetAltitude: 0,
    targetYaw: 0,
    movementVector: { x: 0, y: 0, z: 0 },
    lastUpdateTime: Date.now(),
  },
  simulationInterval: null,
  connect: () => {
    const wsUrl = get().wsUrl
    if (!wsUrl) {
      console.error("WebSocket URL is not defined")
      set({ connectionError: "WebSocket URL is not defined" })
      // Automatically enable fallback mode if URL is not defined
      set({ useFallbackMode: true, connected: true })
      return
    }

    if (get().connecting || get().connected) {
      return
    }

    set({ connecting: true, connectionError: null })

    try {
      console.log(`Connecting to WebSocket at ${wsUrl}`)

      // Verificar se o WebSocket é suportado
      if (typeof WebSocket === "undefined") {
        throw new Error("WebSocket não é suportado neste navegador")
      }

      // Create a new WebSocket connection with error handling
      let ws: WebSocket

      try {
        ws = new WebSocket(wsUrl)
      } catch (error) {
        console.error("Error creating WebSocket:", error)
        throw new Error(`Erro ao criar WebSocket: ${error instanceof Error ? error.message : String(error)}`)
      }

      // Configurar handlers com tratamento de erros
      ws.onopen = () => {
        console.log("WebSocket connected")
        set({ ws, connected: true, connecting: false, connectionError: null })

        try {
          // Send initial connect command
          ws.send(JSON.stringify({ type: "connect", useTello: false }))
        } catch (error) {
          console.error("Error sending initial connect command:", error)
        }
      }

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} ${event.reason}`)
        set({
          ws: null,
          connected: false,
          connecting: false,
          connectionError: `Connection closed: ${event.code} ${event.reason || "No reason provided"}`,
        })

        // Automatically enable fallback mode on disconnect
        if (!get().useFallbackMode) {
          console.log("Automatically enabling fallback mode due to disconnect")
          set({ useFallbackMode: true, connected: true })
        }
      }

      ws.onerror = (event) => {
        // O evento de erro do WebSocket não fornece muitas informações úteis
        // Vamos registrar o que temos e fornecer uma mensagem mais útil
        console.error("WebSocket error event:", event)

        // Verificar se o erro pode ser devido a CORS ou problemas de segurança
        let errorMessage = "Connection error: "

        if (wsUrl.startsWith("ws://") && window.location.protocol === "https:") {
          errorMessage += "Mixed Content - Cannot connect to insecure WebSocket from HTTPS page. "
        } else {
          errorMessage += "Check if the server is running and accessible. "
        }

        errorMessage += "Try using the simulation mode if the backend is not available."

        console.error(errorMessage)

        set({
          ws: null,
          connected: false,
          connecting: false,
          connectionError: errorMessage,
        })

        // Automatically enable fallback mode on error
        if (!get().useFallbackMode) {
          console.log("Automatically enabling fallback mode due to connection error")
          set({ useFallbackMode: true, connected: true })
        }
      }

      // Set a timeout to handle connection failures
      const timeoutId = setTimeout(() => {
        if (get().connecting && !get().connected) {
          console.error("WebSocket connection timeout")
          if (ws && ws.readyState !== WebSocket.OPEN) {
            try {
              ws.close()
            } catch (error) {
              console.error("Error closing WebSocket after timeout:", error)
            }

            set({
              ws: null,
              connected: false,
              connecting: false,
              connectionError: "Connection timeout. Please check if the server is running and accessible.",
            })

            // Automatically enable fallback mode on timeout
            if (!get().useFallbackMode) {
              console.log("Automatically enabling fallback mode due to connection timeout")
              set({ useFallbackMode: true, connected: true })
            }
          }
        }
      }, 5000) // 5 second timeout

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("WebSocket message received:", data.type)

          if (data.type === "frame") {
            set({
              currentFrame: data.frame,
              droneState: {
                ...get().droneState,
                battery: data.state.bateria,
                altitude: data.state.altura,
                temperature: data.state.temperatura,
                attitude: {
                  pitch: data.state.atitude.pitch,
                  roll: data.state.atitude.roll,
                  yaw: data.state.atitude.yaw,
                },
                isFlying: data.state.altura > 0.1, // Assume flying if altitude > 10cm
              },
              mode: data.mode,
            })
          }

          if (data.type === "command_result") {
            console.log("Command result:", data.result)
          }

          if (data.type === "connected") {
            console.log("Connection confirmed by server")
          }

          if (data.type === "state") {
            console.log("Received state update from server")
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }
    } catch (error) {
      console.error("Error creating WebSocket:", error)
      set({
        ws: null,
        connected: false,
        connecting: false,
        connectionError: `Error creating WebSocket: ${error instanceof Error ? error.message : String(error)}`,
      })

      // Automatically enable fallback mode on error
      if (!get().useFallbackMode) {
        console.log("Automatically enabling fallback mode due to WebSocket creation error")
        set({ useFallbackMode: true, connected: true })
      }
    }
  },
  disconnect: () => {
    const ws = get().ws
    if (ws) {
      try {
        // Send disconnect command
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "disconnect" }))
        }
        ws.close(1000, "User initiated disconnect")
      } catch (error) {
        console.error("Error during disconnect:", error)
      }
      set({ ws: null, connected: false })
    }
  },
  sendCommand: (command: any) => {
    const { ws, connected, useFallbackMode } = get()

    // If in fallback mode, simulate command handling
    if (useFallbackMode) {
      console.log("Fallback mode: simulating command", command)

      // Atualizar dados de simulação com base nos comandos
      const simData = { ...get().simulationData }

      // Simulate state changes based on commands
      if (command.type === "takeoff") {
        simData.targetAltitude = 1.0
        set({
          droneState: {
            ...get().droneState,
            isFlying: true,
          },
          simulationData: simData,
        })
      } else if (command.type === "land") {
        simData.targetAltitude = 0
        set({
          droneState: {
            ...get().droneState,
            isFlying: false,
          },
          simulationData: simData,
        })
      } else if (command.type === "set_mode") {
        set({ mode: command.mode })
      } else if (command.type === "start_recording") {
        set({
          droneState: {
            ...get().droneState,
            isRecording: true,
          },
        })
      } else if (command.type === "stop_recording") {
        set({
          droneState: {
            ...get().droneState,
            isRecording: false,
          },
        })
      } else if (command.type === "move") {
        // Atualizar vetor de movimento com base nos comandos
        if (command.upDown) {
          simData.targetAltitude += command.upDown / 100
          simData.targetAltitude = Math.max(0, simData.targetAltitude)
        }

        // Atualizar rotação do drone
        if (command.yaw) {
          simData.targetYaw = (get().droneState.attitude.yaw + command.yaw / 5) % 360
        }

        // Atualizar vetor de movimento
        simData.movementVector = {
          x: command.leftRight ? command.leftRight / 100 : 0,
          y: 0,
          z: command.forwardBackward ? command.forwardBackward / 100 : 0,
        }

        set({ simulationData: simData })

        // Simular mudanças de atitude com base no movimento
        set({
          droneState: {
            ...get().droneState,
            attitude: {
              ...get().droneState.attitude,
              pitch: command.forwardBackward ? command.forwardBackward / 10 : 0,
              roll: command.leftRight ? command.leftRight / 10 : 0,
            },
          },
        })
      }

      // Iniciar atualização contínua da simulação se não estiver rodando
      if (!get().simulationInterval) {
        const intervalId = setInterval(() => {
          get().updateSimulation()
        }, 50) // Atualizar a cada 50ms para uma simulação suave
        set({ simulationInterval: intervalId })
      }

      return
    }

    // Normal WebSocket command sending
    if (ws && connected) {
      try {
        // Map the command to the backend format
        const backendCommand = mapCommandToBackend(command)
        ws.send(JSON.stringify(backendCommand))
      } catch (error) {
        console.error("Error sending command:", error)
        set({ connectionError: `Error sending command: ${error instanceof Error ? error.message : String(error)}` })
      }
    } else {
      console.error("Cannot send command: WebSocket not connected")
      set({ connectionError: "Cannot send command: WebSocket not connected" })

      // Automatically enable fallback mode if trying to send commands without connection
      if (!get().useFallbackMode) {
        console.log("Automatically enabling fallback mode due to command send failure")
        set({ useFallbackMode: true, connected: true })

        // Try to send the command again in fallback mode
        get().sendCommand(command)
      }
    }
  },
  setWsUrl: (url: string) => {
    set({ wsUrl: url })
  },
  setFallbackMode: (fallback: boolean) => {
    const { ws, simulationInterval } = get()

    // If turning on fallback mode, disconnect any existing socket
    if (fallback && ws) {
      try {
        ws.close(1000, "Switching to fallback mode")
      } catch (error) {
        console.error("Error closing socket:", error)
      }
    }

    // Se estiver ativando o modo de simulação, iniciar o intervalo de atualização
    if (fallback && !simulationInterval) {
      const intervalId = setInterval(() => {
        get().updateSimulation()
      }, 50)
      set({ simulationInterval: intervalId })
    } else if (!fallback && simulationInterval) {
      // Se estiver desativando o modo de simulação, parar o intervalo
      clearInterval(simulationInterval)
      set({ simulationInterval: null })
    }

    set({
      useFallbackMode: fallback,
      connected: fallback, // When fallback is on, we're "connected"
      ws: fallback ? null : get().ws,
      connectionError: null,
    })

    console.log(`Fallback mode ${fallback ? "enabled" : "disabled"}`)
  },
  updateSimulation: () => {
    const { droneState, simulationData } = get()
    const now = Date.now()
    const deltaTime = (now - simulationData.lastUpdateTime) / 1000 // em segundos

    // Atualizar apenas se o tempo delta for razoável (evitar saltos grandes)
    if (deltaTime > 0 && deltaTime < 0.5) {
      // Interpolação suave da altitude
      const currentAltitude = droneState.altitude
      const targetAltitude = simulationData.targetAltitude
      const newAltitude = currentAltitude + (targetAltitude - currentAltitude) * Math.min(deltaTime * 2, 1)

      // Interpolação suave do yaw
      const currentYaw = droneState.attitude.yaw
      const targetYaw = simulationData.targetYaw

      // Calcular a diferença de ângulo mais curta
      let yawDiff = targetYaw - currentYaw
      if (yawDiff > 180) yawDiff -= 360
      if (yawDiff < -180) yawDiff += 360

      const newYaw = currentYaw + yawDiff * Math.min(deltaTime * 3, 1)

      // Atualizar o estado do drone
      set({
        droneState: {
          ...droneState,
          altitude: newAltitude,
          attitude: {
            ...droneState.attitude,
            yaw: newYaw,
            // Reduzir gradualmente pitch e roll para simular estabilização
            pitch: droneState.attitude.pitch * 0.95,
            roll: droneState.attitude.roll * 0.95,
          },
          isFlying: newAltitude > 0.05,
        },
        simulationData: {
          ...simulationData,
          lastUpdateTime: now,
        },
      })
    } else {
      // Apenas atualizar o timestamp se o delta for muito grande
      set({
        simulationData: {
          ...simulationData,
          lastUpdateTime: now,
        },
      })
    }
  },
}))

// React hook for using the WebSocket
export function useWebSocket() {
  const store = useWebSocketStore()
  return store
}

