#!/usr/bin/env python3
import asyncio
import json
import logging
import os
import base64
import time
import cv2
import numpy as np
import websockets
from datetime import datetime
from drone_controller import DroneController
from video_processor import VideoProcessor
from ai_controller import AIController

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("drone-backend")

# Configurações do servidor
HOST = os.environ.get("BACKEND_HOST", "0.0.0.0")
PORT = int(os.environ.get("BACKEND_PORT", "8000"))
WS_PATH = os.environ.get("BACKEND_WS_PATH", "")

# Armazenamento de conexões ativas
connected_clients = set()

# Controlador do drone
drone_controller = DroneController()

# Controlador de IA
ai_controller = AIController()

# Processador de vídeo
video_processor = VideoProcessor()

async def send_telemetry_data(websocket):
    """Envia dados de telemetria periodicamente para o cliente."""
    try:
        while True:
            if websocket in connected_clients:
                # Obter dados de telemetria do drone
                telemetry = drone_controller.get_telemetry()
                
                # Obter status da IA
                ai_status = ai_controller.get_ai_status()
                
                # Obter frame de vídeo processado
                frame = video_processor.get_frame()
                
                # Converter frame para base64
                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                
                # Criar mensagem com telemetria e frame
                message = {
                    "type": "frame",
                    "frame": frame_base64,
                    "state": {
                        "bateria": telemetry["battery"],
                        "altura": telemetry["altitude"],
                        "temperatura": telemetry["temperature"],
                        "atitude": {
                            "pitch": telemetry["attitude"]["pitch"],
                            "roll": telemetry["attitude"]["roll"],
                            "yaw": telemetry["attitude"]["yaw"],
                        },
                        "is_flying": telemetry["is_flying"],
                        "is_recording": telemetry["is_recording"],
                    },
                    "ai": {
                        "enabled": ai_status["enabled"],
                        "mode": ai_status["mode"],
                        "detected_objects": ai_status["detected_objects"],
                    },
                    "mode": drone_controller.current_mode,
                    "timestamp": datetime.now().isoformat(),
                }
                
                # Enviar mensagem para o cliente
                await websocket.send(json.dumps(message))
                
                # Aguardar antes de enviar o próximo frame (30 FPS)
                await asyncio.sleep(1/30)
            else:
                # Cliente desconectado, encerrar loop
                break
    except websockets.exceptions.ConnectionClosed:
        logger.info("Conexão fechada durante envio de telemetria")
    except Exception as e:
        logger.error(f"Erro ao enviar telemetria: {str(e)}")

async def handle_command(websocket, command_data):
    """Processa comandos recebidos do cliente."""
    try:
        command = command_data.get("command")
        params = command_data.get("params", {})
        
        logger.info(f"Comando recebido: {command} com parâmetros: {params}")
        
        result = None
        
        if command == "takeoff":
            result = drone_controller.takeoff()
        elif command == "land":
            result = drone_controller.land()
        elif command == "move":
            # Extrair parâmetros de movimento
            left_right = params.get("left_right", 0)
            forward_backward = params.get("forward_backward", 0)
            up_down = params.get("up_down", 0)
            yaw = params.get("yaw", 0)
            
            result = drone_controller.move(left_right, forward_backward, up_down, yaw)
        elif command == "set_mode":
            mode = params.get("mode", "manual")
            result = drone_controller.set_mode(mode)
            
            # Configurar modo de IA correspondente
            if mode == "face_tracking":
                ai_controller.set_ai_mode("face_tracking")
            elif mode == "slam":
                ai_controller.set_ai_mode("exploration")
            elif mode == "path_planning":
                ai_controller.set_ai_mode("autonomous")
            elif mode == "neural":
                ai_controller.set_ai_mode("object_detection")
            else:
                ai_controller.set_ai_mode("idle")
                
        elif command == "recording":
            action = params.get("action")
            if action == "start":
                result = drone_controller.start_recording()
            elif action == "stop":
                result = drone_controller.stop_recording()
        elif command == "get_info":
            result = {
                "drone_info": drone_controller.get_info(),
                "backend_info": {
                    "version": "1.0.0",
                    "uptime": time.time() - drone_controller.start_time,
                    "video_source": video_processor.video_source,
                },
                "ai_info": ai_controller.get_ai_status()
            }
        elif command == "ai_command":
            # Processar comandos específicos de IA
            ai_mode = params.get("mode")
            if ai_mode:
                result = {"success": ai_controller.set_ai_mode(ai_mode)}
            else:
                result = {"success": False, "message": "Modo de IA não especificado"}
        elif command == "voice_command":
            # Processar comandos de voz
            voice_text = params.get("text", "")
            if voice_text:
                command_result = ai_controller.process_voice_command(voice_text)
                result = {"success": True, "command": command_result}
                
                # Executar o comando reconhecido automaticamente
                if command_result["action"] != "unknown" and command_result["confidence"] > 0.7:
                    # Implementar ações baseadas no comando reconhecido
                    action = command_result["action"]
                    if action == "takeoff":
                        drone_controller.takeoff()
                    elif action == "land":
                        drone_controller.land()
                    elif action == "move_up":
                        drone_controller.move(0, 0, 50, 0)
                    elif action == "move_down":
                        drone_controller.move(0, 0, -50, 0)
                    # ... outros comandos
            else:
                result = {"success": False, "message": "Texto do comando de voz não fornecido"}
        elif command == "analyze_scene":
            # Analisar a cena atual
            frame = video_processor.get_frame()
            scene_analysis = ai_controller.analyze_scene(frame)
            result = {"success": True, "analysis": scene_analysis}
        
        # Enviar resposta ao cliente
        response = {
            "type": "command_result",
            "command": command,
            "result": result,
            "timestamp": datetime.now().isoformat(),
        }
        
        await websocket.send(json.dumps(response))
        
    except Exception as e:
        logger.error(f"Erro ao processar comando: {str(e)}")
        # Enviar erro ao cliente
        error_response = {
            "type": "error",
            "error": str(e),
            "command": command_data.get("command", "unknown"),
            "timestamp": datetime.now().isoformat(),
        }
        await websocket.send(json.dumps(error_response))

async def handle_client(websocket, path):
    """Gerencia a conexão com um cliente."""
    client_id = id(websocket)
    logger.info(f"Nova conexão: {client_id}")
    
    try:
        # Adicionar cliente à lista de conexões
        connected_clients.add(websocket)
        
        # Enviar confirmação de conexão
        await websocket.send(json.dumps({
            "type": "connected",
            "message": "Conectado ao servidor de controle do drone",
            "timestamp": datetime.now().isoformat(),
        }))
        
        # Iniciar envio de telemetria em uma tarefa separada
        telemetry_task = asyncio.create_task(send_telemetry_data(websocket))
        
        # Processar mensagens recebidas
        async for message in websocket:
            try:
                data = json.loads(message)
                
                if data.get("type") == "connect":
                    # Mensagem de conexão inicial
                    use_tello = data.get("useTello", False)
                    if use_tello:
                        drone_controller.use_real_drone()
                    logger.info(f"Cliente {client_id} conectado. Usando drone real: {use_tello}")
                
                elif data.get("type") == "disconnect":
                    # Mensagem de desconexão
                    logger.info(f"Cliente {client_id} solicitou desconexão")
                    break
                
                else:
                    # Processar comando
                    await handle_command(websocket, data)
                    
            except json.JSONDecodeError:
                logger.error(f"Mensagem inválida recebida: {message}")
                await websocket.send(json.dumps({
                    "type": "error",
                    "error": "Formato de mensagem inválido",
                    "timestamp": datetime.now().isoformat(),
                }))
        
        # Cancelar tarefa de telemetria
        telemetry_task.cancel()
        
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Conexão fechada: {client_id}")
    except Exception as e:
        logger.error(f"Erro na conexão {client_id}: {str(e)}")
    finally:
        # Remover cliente da lista de conexões
        if websocket in connected_clients:
            connected_clients.remove(websocket)
        logger.info(f"Cliente desconectado: {client_id}")

async def main():
    """Função principal do servidor."""
    # Inicializar controlador do drone
    drone_controller.initialize()
    
    # Inicializar controlador de IA
    ai_controller.initialize()
    
    # Inicializar processador de vídeo
    video_processor.initialize()
    
    # Conectar processador de vídeo ao controlador de IA
    video_processor.set_ai_controller(ai_controller)
    
    # Iniciar servidor WebSocket
    ws_url = f"ws://{HOST}:{PORT}{WS_PATH}"
    async with websockets.serve(handle_client, HOST, PORT):
        logger.info(f"Servidor iniciado em {ws_url}")
        await asyncio.Future()  # Executar indefinidamente

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Servidor encerrado pelo usuário")
    except Exception as e:
        logger.error(f"Erro ao iniciar servidor: {str(e)}")

