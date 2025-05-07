// This file provides integration between the frontend WebSocket implementation
// and your Python backend WebSocket server

import { useWebSocketStore } from "./websocket"

/**
 * Configure the WebSocket connection to use your Python backend
 */
export function configureWebSocketBackend() {
  // Get the WebSocket URL from environment variables or use default
  const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:"
  const wsHost = process.env.NEXT_PUBLIC_BACKEND_HOST || "localhost"
  const wsPort = process.env.NEXT_PUBLIC_BACKEND_PORT || "8000"
  const wsPath = process.env.NEXT_PUBLIC_BACKEND_WS_PATH || ""

  // Construct the WebSocket URL
  let wsUrl = ""

  // Verificar se estamos em um ambiente de preview do Vercel ou produção
  if (typeof window !== "undefined") {
    const isVercelPreview = window.location.hostname.includes("vercel.app")
    const isProduction =
      !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")

    if (isVercelPreview || isProduction) {
      // Em ambientes de produção ou preview, ativar automaticamente o modo de simulação
      // em vez de tentar conectar a um backend que provavelmente não existe
      console.log("Ambiente de produção/preview detectado, ativando modo de simulação automaticamente")
      setTimeout(() => {
        useWebSocketStore.getState().setFallbackMode(true)
      }, 0)

      // Ainda assim, configuramos um URL para o WebSocket (mesmo que não vá ser usado)
      wsUrl = `${wsProtocol}//${window.location.hostname}/api/ws`
    } else {
      // Em ambiente de desenvolvimento local, usar o URL completo
      wsUrl = `${wsProtocol}//${wsHost}:${wsPort}${wsPath}`
    }
  } else {
    // Fallback para quando window não está disponível (SSR)
    wsUrl = `${wsProtocol}//${wsHost}:${wsPort}${wsPath}`
  }

  // Update the WebSocket URL in the store
  if (typeof window !== "undefined") {
    useWebSocketStore.getState().setWsUrl(wsUrl)
  }

  console.log(`WebSocket configurado para conectar em: ${wsUrl}`)
  return wsUrl
}

/**
 * Map frontend commands to backend commands
 * @param command The frontend command
 * @returns The backend command
 */
export function mapCommandToBackend(command: any) {
  // This function maps the frontend command format to your backend format
  // Modify this based on your backend API

  const { type } = command

  switch (type) {
    case "takeoff":
      return {
        command: "takeoff",
        params: {},
      }
    case "land":
      return {
        command: "land",
        params: {},
      }
    case "move":
      return {
        command: "move",
        params: {
          left_right: command.leftRight || 0,
          forward_backward: command.forwardBackward || 0,
          up_down: command.upDown || 0,
          yaw: command.yaw || 0,
        },
      }
    case "set_mode":
      return {
        command: "set_mode",
        params: {
          mode: command.mode,
        },
      }
    case "start_recording":
      return {
        command: "recording",
        params: {
          action: "start",
        },
      }
    case "stop_recording":
      return {
        command: "recording",
        params: {
          action: "stop",
        },
      }
    case "get_info":
      return {
        command: "get_info",
        params: {},
      }
    default:
      return command
  }
}

/**
 * Map backend state to frontend state
 * @param backendState The state from the backend
 * @returns The state for the frontend
 */
export function mapStateFromBackend(backendState: any) {
  // This function maps your backend state format to the frontend format
  // Modify this based on your backend API

  // Example mapping (adjust based on your actual backend data structure)
  return {
    battery: backendState.battery || 0,
    altitude: backendState.altitude || 0,
    temperature: backendState.temperature || 25,
    attitude: {
      pitch: backendState.pitch || 0,
      roll: backendState.roll || 0,
      yaw: backendState.yaw || 0,
    },
    isFlying: backendState.is_flying || false,
    isRecording: backendState.is_recording || false,
  }
}

