import cv2
import numpy as np
import os
import time
import random
import math
from datetime import datetime

class DemoFramesGenerator:
    """Gerador de frames de demonstração para visualização do sistema de IA."""
    
    def __init__(self, output_dir="demo_frames"):
        """Inicializa o gerador de frames de demonstração."""
        self.output_dir = output_dir
        self.width = 640
        self.height = 480
        self.frame_count = 0
        
        # Criar diretório de saída se não existir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Objetos para detecção simulada
        self.objects = [
            {"class": "person", "color": (0, 255, 0)},
            {"class": "car", "color": (0, 0, 255)},
            {"class": "bicycle", "color": (255, 165, 0)},
            {"class": "tree", "color": (0, 128, 0)},
            {"class": "building", "color": (128, 0, 128)},
        ]
        
        # Cenários de demonstração
        self.scenarios = [
            "urban",
            "follow_person",
            "face_tracking"
        ]
        
        # Objetos detectados no frame atual
        self.detected_objects = []
        
        # Estado simulado do drone
        self.altitude = 10.0
        self.battery = 85
        self.is_recording = False
        self.ai_mode = "object_detection"
    
    def _create_base_frame(self, scenario):
        """Cria um frame base para o cenário especificado."""
        frame = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        
        # Cor de fundo baseada no cenário
        if scenario == "urban":
            # Cenário urbano - tons de cinza
            frame[:] = (80, 80, 80)
        elif scenario == "follow_person":
            # Cenário de seguimento - tons neutros
            frame[:] = (100, 100, 100)
        elif scenario == "face_tracking":
            # Cenário de rastreamento facial - tons neutros
            frame[:] = (100, 100, 100)
        
        # Adicionar horizonte
        horizon_y = self.height // 3
        cv2.line(frame, (0, horizon_y), (self.width, horizon_y), (0, 120, 255), 2)
        
        # Adicionar "céu"
        frame[:horizon_y, :] = cv2.addWeighted(
            frame[:horizon_y, :], 0.5, 
            np.ones_like(frame[:horizon_y, :]) * np.array([135, 206, 235]), 0.5, 0
        )
        
        # Adicionar grade para simular perspectiva
        grid_size = 50
        grid_color = (50, 50, 50)
        
        # Linhas horizontais (eixo Z)
        for i in range(horizon_y, self.height, grid_size):
            scale = (i - horizon_y) / (self.height - horizon_y)
            thickness = max(1, int(scale * 3))
            cv2.line(frame, (0, i), (self.width, i), grid_color, thickness)
        
        # Linhas verticais (eixo X)
        for i in range(0, self.width, grid_size):
            cv2.line(frame, (i, horizon_y), (i, self.height), grid_color, 1)
        
        return frame
    
    def _add_objects(self, frame, scenario):
        """Adiciona objetos ao frame com base no cenário."""
        self.detected_objects = []
        
        if scenario == "urban":
            # Adicionar carros
            for i in range(2):
                x = random.randint(50, self.width - 100)
                y = random.randint(self.height // 2, self.height - 100)
                w = 60
                h = 30
                
                # Desenhar carro
                car_color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
                cv2.rectangle(frame, (x, y), (x + w, y + h), car_color, -1)
                
                # Adicionar à lista de objetos detectados
                self.detected_objects.append({
                    "class": "car",
                    "confidence": random.uniform(0.85, 0.98),
                    "bbox": [x, y, x + w, y + h],
                    "color": (0, 0, 255)
                })
            
            # Adicionar pessoas
            for i in range(3):
                x = random.randint(50, self.width - 50)
                y = random.randint(self.height // 2, self.height - 100)
                w = 30
                h = 70
                
                # Desenhar pessoa (simplificada)
                cv2.rectangle(frame, (x, y), (x + w, y + h), (200, 150, 150), -1)
                cv2.circle(frame, (x + w // 2, y - 10), 15, (200, 150, 150), -1)
                
                # Adicionar à lista de objetos detectados
                self.detected_objects.append({
                    "class": "person",
                    "confidence": random.uniform(0.80, 0.95),
                    "bbox": [x, y - 25, x + w, y + h],
                    "color": (0, 255, 0)
                })
        
        elif scenario == "follow_person":
            # Adicionar pessoa principal para seguir
            x = self.width // 2 - 20 + int(10 * math.sin(self.frame_count / 10))
            y = self.height // 2 + 50
            w = 40
            h = 90
            
            # Desenhar pessoa (mais detalhada)
            # Corpo
            cv2.rectangle(frame, (x, y), (x + w, y + h), (200, 150, 150), -1)
            # Cabeça
            cv2.circle(frame, (x + w // 2, y - 15), 20, (200, 150, 150), -1)
            
            # Adicionar à lista de objetos detectados com alta confiança
            self.detected_objects.append({
                "class": "person",
                "confidence": 0.98,
                "bbox": [x - 10, y - 35, x + w + 10, y + h],
                "color": (0, 255, 0),
                "tracking": True
            })
        
        elif scenario == "face_tracking":
            # Adicionar faces
            for i in range(3):
                x = random.randint(50, self.width - 100)
                y = random.randint(self.height // 3, self.height - 100)
                size = random.randint(50, 80)
                
                # Desenhar rosto (simplificado)
                cv2.circle(frame, (x + size//2, y + size//2), size//2, (200, 180, 180), -1)
                
                # Desenhar olhos
                eye_size = size // 10
                left_eye_x = x + size//3
                right_eye_x = x + 2*size//3
                eyes_y = y + size//3
                
                cv2.circle(frame, (left_eye_x, eyes_y), eye_size, (255, 255, 255), -1)
                cv2.circle(frame, (right_eye_x, eyes_y), eye_size, (255, 255, 255), -1)
                cv2.circle(frame, (left_eye_x, eyes_y), eye_size//2, (0, 0, 0), -1)
                cv2.circle(frame, (right_eye_x, eyes_y), eye_size//2, (0, 0, 0), -1)
                
                # Adicionar à lista de objetos detectados
                confidence = 0.98 if i == 0 else random.uniform(0.80, 0.90)
                color = (0, 0, 255) if i == 0 else (0, 165, 255)
                
                self.detected_objects.append({
                    "class": "face",
                    "confidence": confidence,
                    "bbox": [x, y, x + size, y + size],
                    "color": color,
                    "tracking": i == 0
                })
    
    def _add_ai_annotations(self, frame):
        """Adiciona anotações de IA ao frame."""
        # Desenhar caixas delimitadoras para objetos detectados
        for obj in self.detected_objects:
            label = f"{obj['class']} {obj['confidence']:.2f}"
            bbox = obj["bbox"]
            color = obj.get("color", (0, 255, 0))
            
            # Desenhar retângulo com espessura maior para objetos rastreados
            thickness = 3 if obj.get("tracking", False) else 2
            cv2.rectangle(frame, 
                         (int(bbox[0]), int(bbox[1])), 
                         (int(bbox[2]), int(bbox[3])), 
                         color, thickness)
            
            # Adicionar fundo para o texto
            text_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
            cv2.rectangle(frame, 
                         (int(bbox[0]), int(bbox[1]) - text_size[1] - 5), 
                         (int(bbox[0]) + text_size[0], int(bbox[1])), 
                         color, -1)
            
            # Desenhar texto
            cv2.putText(frame, label, 
                       (int(bbox[0]), int(bbox[1]) - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
        
        # Adicionar informações de IA
        cv2.putText(frame, f"IA: {self.ai_mode}", 
                   (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        cv2.putText(frame, f"Objetos: {len(self.detected_objects)}", 
                   (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        # Adicionar FPS simulado
        fps = 30 + random.randint(-5, 5)
        cv2.putText(frame, f"IA FPS: {fps}", 
                   (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
    
    def _add_telemetry(self, frame):
        """Adiciona informações de telemetria ao frame."""
        # Adicionar contador de frames
        cv2.putText(frame, f"Frame: {self.frame_count}", 
                   (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        # Adicionar altitude
        cv2.putText(frame, f"Alt: {self.altitude:.1f}m", 
                   (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        # Adicionar bateria
        cv2.putText(frame, f"Bat: {self.battery}%", 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        # Adicionar data e hora
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, timestamp, 
                   (self.width - 200, self.height - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    def _add_scenario_info(self, frame, scenario):  0.5, (255, 255, 255), 1)
    
    def _add_scenario_info(self, frame, scenario):
        """Adiciona informações específicas do cenário."""
        # Adicionar título do cenário
        title = scenario.replace("_", " ").title()
        cv2.putText(frame, title, 
                   (self.width // 2 - 80, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)
        
        # Adicionar informações específicas do cenário
        if scenario == "follow_person":
            cv2.putText(frame, "Modo: Seguimento de Pessoa", 
                       (self.width - 250, 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
            
            # Adicionar alvo no centro da pessoa principal
            for obj in self.detected_objects:
                if obj.get("tracking", False) and obj["class"] == "person":
                    bbox = obj["bbox"]
                    center_x = int((bbox[0] + bbox[2]) / 2)
                    center_y = int((bbox[1] + bbox[3]) / 2)
                    
                    # Desenhar alvo
                    cv2.circle(frame, (center_x, center_y), 20, (0, 255, 0), 1)
                    cv2.circle(frame, (center_x, center_y), 5, (0, 255, 0), -1)
                    break
        
        elif scenario == "face_tracking":
            cv2.putText(frame, "Modo: Rastreamento Facial", 
                       (self.width - 250, 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
            
            # Adicionar alvo no centro da face principal
            for obj in self.detected_objects:
                if obj.get("tracking", False) and obj["class"] == "face":
                    bbox = obj["bbox"]
                    center_x = int((bbox[0] + bbox[2]) / 2)
                    center_y = int((bbox[1] + bbox[3]) / 2)
                    
                    # Desenhar alvo
                    cv2.circle(frame, (center_x, center_y), 20, (0, 0, 255), 1)
                    cv2.circle(frame, (center_x, center_y), 5, (0, 0, 255), -1)
                    break
    
    def generate_frame(self, scenario=None):
        """Gera um frame de demonstração para o cenário específico."""
        # Selecionar cenário aleatório se não for especificado
        if scenario is None:
            scenario = random.choice(self.scenarios)
        
        # Atualizar modo de IA com base no cenário
        if scenario == "urban":
            self.ai_mode = "object_detection"
        elif scenario == "follow_person":
            self.ai_mode = "follow_me"
        elif scenario == "face_tracking":
            self.ai_mode = "face_tracking"
        
        # Criar frame base
        frame = self._create_base_frame(scenario)
        
        # Adicionar objetos ao frame
        self._add_objects(frame, scenario)
        
        # Adicionar anotações de IA
        self._add_ai_annotations(frame)
        
        # Adicionar telemetria
        self._add_telemetry(frame)
        
        # Adicionar informações específicas do cenário
        self._add_scenario_info(frame, scenario)
        
        # Incrementar contador de frames
        self.frame_count += 1
        
        # Atualizar estado simulado do drone
        self.altitude += random.uniform(-0.1, 0.1)
        self.battery = max(0, min(100, self.battery - random.uniform(0, 0.05)))
        self.is_recording = (self.frame_count // 150) % 2 == 0  # Alternar a cada 5 segundos
        
        return frame
    
    def generate_demo_sequence(self, num_frames=60, scenario=None):
        """Gera uma sequência de frames de demonstração."""
        print(f"Gerando sequência de {num_frames} frames para o cenário '{scenario or 'aleatório'}'...")
        
        for i in range(num_frames):
            # Gerar frame
            frame = self.generate_frame(scenario)
            
            # Salvar frame
            filename = os.path.join(self.output_dir, f"frame_{i:04d}.jpg")
            cv2.imwrite(filename, frame)
            
            if i % 10 == 0:
                print(f"Gerado frame {i}/{num_frames}")
        
        print(f"Sequência de demonstração gerada com sucesso em '{self.output_dir}'")
        
        # Retornar caminho do diretório de saída
        return self.output_dir

# Função para executar a geração de frames de demonstração
def generate_demo_frames():
    """Função principal para gerar frames de demonstração."""
    generator = DemoFramesGenerator(output_dir="demo_frames")
    
    # Gerar sequências para cada cenário
    for scenario in generator.scenarios:
        output_dir = f"demo_frames_{scenario}"
        generator = DemoFramesGenerator(output_dir=output_dir)
        generator.generate_demo_sequence(num_frames=60, scenario=scenario)
    
    print("Todas as sequências de demonstração foram geradas com sucesso!")

if __name__ == "__main__":
    generate_demo_frames()

