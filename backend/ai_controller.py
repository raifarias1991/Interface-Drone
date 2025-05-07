import logging
import numpy as np
import cv2
import time
import random
from collections import deque

logger = logging.getLogger("ai-controller")

class AIController:
    """Controlador de IA para o drone, fornecendo recursos de inteligência artificial."""
    
    def __init__(self):
        """Inicializa o controlador de IA."""
        self.is_initialized = False
        self.ai_enabled = True
        self.current_mode = "idle"
        
        # Configurações de IA
        self.confidence_threshold = 0.5
        self.max_objects = 10
        
        # Estado atual
        self.detected_objects = []
        self.last_processed_time = 0
        self.processing_fps = 0
        
        # Simulação de IA
        self.simulated_objects = [
            {"class": "person", "confidence": 0.95},
            {"class": "car", "confidence": 0.87},
            {"class": "tree", "confidence": 0.76},
            {"class": "building", "confidence": 0.92},
            {"class": "dog", "confidence": 0.81},
            {"class": "bicycle", "confidence": 0.73},
        ]
        
        # Comandos de voz reconhecidos
        self.voice_commands = {
            "decolar": "takeoff",
            "pousar": "land",
            "subir": "move_up",
            "descer": "move_down",
            "esquerda": "move_left",
            "direita": "move_right",
            "frente": "move_forward",
            "trás": "move_backward",
            "girar": "rotate",
            "seguir": "follow_me",
            "parar": "stop",
            "foto": "take_photo",
            "gravar": "start_recording",
            "parar gravação": "stop_recording",
            "modo manual": "set_mode_manual",
            "modo seguir": "set_mode_follow",
            "modo explorar": "set_mode_explore",
        }
    
    def initialize(self):
        """Inicializa o controlador de IA."""
        logger.info("Inicializando controlador de IA")
        self.is_initialized = True
        logger.info("Controlador de IA inicializado com sucesso")
        return True
    
    def process_frame(self, frame):
        """Processa um frame com IA e retorna o frame anotado."""
        start_time = time.time()
        
        # Simular detecção de objetos
        self.detected_objects = self._simulate_object_detection(frame)
        
        # Calcular FPS
        processing_time = time.time() - start_time
        self.processing_fps = 1.0 / processing_time if processing_time > 0 else 0
        self.last_processed_time = time.time()
        
        # Anotar o frame com os resultados
        annotated_frame = frame.copy()
        
        # Desenhar caixas delimitadoras
        for obj in self.detected_objects:
            label = f"{obj['class']} {obj['confidence']:.2f}"
            bbox = obj["bbox"]
            
            # Desenhar retângulo
            cv2.rectangle(annotated_frame, 
                         (int(bbox[0]), int(bbox[1])), 
                         (int(bbox[2]), int(bbox[3])), 
                         (0, 255, 0), 2)
            
            # Desenhar texto
            cv2.putText(annotated_frame, label, 
                       (int(bbox[0]), int(bbox[1]) - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Adicionar informações de IA
        cv2.putText(annotated_frame, f"IA: {self.current_mode}", 
                   (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        cv2.putText(annotated_frame, f"IA FPS: {self.processing_fps:.1f}", 
                   (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        return annotated_frame
    
    def _simulate_object_detection(self, frame):
        """Simula a detecção de objetos quando não há modelo real disponível."""
        # Simular detecção de objetos com posições aleatórias
        height, width = frame.shape[:2]
        num_objects = random.randint(1, 5)
        detected_objects = []
        
        for _ in range(num_objects):
            obj = random.choice(self.simulated_objects)
            confidence = obj["confidence"] * random.uniform(0.8, 1.0)  # Variar um pouco a confiança
            
            # Gerar uma caixa delimitadora aleatória
            x1 = random.randint(0, width - 100)
            y1 = random.randint(0, height - 100)
            w = random.randint(50, 200)
            h = random.randint(50, 200)
            x2 = min(x1 + w, width)
            y2 = min(y1 + h, height)
            
            detected_objects.append({
                "class": obj["class"],
                "confidence": confidence,
                "bbox": [x1, y1, x2, y2]
            })
        
        return detected_objects
    
    def process_voice_command(self, command_text):
        """Processa um comando de voz e retorna a ação correspondente."""
        command_text = command_text.lower().strip()
        
        # Verificar comandos exatos
        if command_text in self.voice_commands:
            return {
                "action": self.voice_commands[command_text],
                "confidence": 1.0,
                "original": command_text
            }
        
        # Verificar comandos parciais
        for key, action in self.voice_commands.items():
            if key in command_text:
                return {
                    "action": action,
                    "confidence": 0.8,
                    "original": command_text
                }
        
        # Comando não reconhecido
        return {
            "action": "unknown",
            "confidence": 0.0,
            "original": command_text
        }
    
    def set_ai_mode(self, mode):
        """Define o modo de operação da IA."""
        valid_modes = ["idle", "object_detection", "face_tracking", 
                      "exploration", "follow_me", "autonomous"]
        
        if mode not in valid_modes:
            logger.warning(f"Modo de IA inválido: {mode}")
            return False
        
        self.current_mode = mode
        logger.info(f"Modo de IA alterado para: {mode}")
        return True
    
    def get_ai_status(self):
        """Retorna o status atual da IA."""
        return {
            "enabled": self.ai_enabled,
            "mode": self.current_mode,
            "detected_objects": len(self.detected_objects),
            "processing_fps": self.processing_fps,
            "last_processed": self.last_processed_time,
        }
    
    def analyze_scene(self, frame):
        """Analisa a cena e retorna uma descrição textual."""
        # Processar o frame para obter objetos
        self.process_frame(frame)
        
        # Gerar descrição baseada nos objetos detectados
        if not self.detected_objects:
            return "Nenhum objeto detectado na cena."
        
        # Contar objetos por classe
        class_counts = {}
        for obj in self.detected_objects:
            class_name = obj["class"]
            if class_name in class_counts:
                class_counts[class_name] += 1
            else:
                class_counts[class_name] = 1
        
        # Gerar descrição
        description = "Objetos detectados: "
        descriptions = []
        for class_name, count in class_counts.items():
            descriptions.append(f"{count} {class_name}{'s' if count > 1 else ''}")
        
        description += ", ".join(descriptions)
        
        # Adicionar recomendação
        if "person" in class_counts:
            description += ". Recomendação: modo de seguimento de pessoa."
        elif "car" in class_counts or "bicycle" in class_counts:
            description += ". Recomendação: modo de seguimento de veículo."
        elif len(self.detected_objects) == 0:
            description += ". Recomendação: modo de exploração."
        
        return description

