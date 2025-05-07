import logging
import cv2
import numpy as np
import time
import os
from threading import Thread

logger = logging.getLogger("video-processor")

class VideoProcessor:
    """Processa o vídeo do drone e aplica efeitos visuais."""
    
    def __init__(self):
        """Inicializa o processador de vídeo."""
        self.is_initialized = False
        self.video_source = "simulation"
        self.cap = None
        self.current_frame = None
        self.processing_enabled = True
        self.last_frame_time = 0
        self.frame_count = 0
        
        # Configurações de simulação
        self.width = 640
        self.height = 480
        self.overlay_info = True
        
        # Referência ao controlador de IA
        self.ai_controller = None
        self.ai_enabled = False
    
    def initialize(self):
        """Inicializa o processador de vídeo."""
        logger.info("Inicializando processador de vídeo")
        
        # Tentar abrir uma câmera real
        try:
            self.cap = cv2.VideoCapture(0)
            if self.cap.isOpened():
                self.video_source = "camera"
                self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                logger.info(f"Câmera conectada: {self.width}x{self.height}")
            else:
                logger.warning("Não foi possível abrir a câmera, usando simulação")
                self.cap = None
        except Exception as e:
            logger.error(f"Erro ao abrir câmera: {str(e)}")
            self.cap = None
        
        # Iniciar thread de processamento
        self.is_initialized = True
        Thread(target=self._processing_loop, daemon=True).start()
        
        return True
    
    def set_ai_controller(self, ai_controller):
        """Define o controlador de IA para processamento avançado."""
        self.ai_controller = ai_controller
        self.ai_enabled = ai_controller is not None
        logger.info(f"Controlador de IA {'conectado' if self.ai_enabled else 'desconectado'}")
    
    def _processing_loop(self):
        """Loop de processamento de vídeo em thread separada."""
        logger.info("Iniciando loop de processamento de vídeo")
        
        while self.processing_enabled:
            try:
                # Capturar frame da câmera ou gerar simulação
                if self.cap and self.cap.isOpened():
                    ret, frame = self.cap.read()
                    if not ret:
                        logger.warning("Falha ao capturar frame da câmera")
                        # Criar frame simulado como fallback
                        frame = self._generate_simulated_frame()
                else:
                    # Gerar frame simulado
                    frame = self._generate_simulated_frame()
                
                # Processar o frame com IA se disponível
                if self.ai_enabled and self.ai_controller:
                    frame = self.ai_controller.process_frame(frame)
                
                # Adicionar overlay de informações
                if self.overlay_info:
                    self._add_overlay(frame)
                
                # Atualizar frame atual
                self.current_frame = frame
                self.frame_count += 1
                self.last_frame_time = time.time()
                
                # Controlar taxa de frames (30 FPS)
                time.sleep(1/30)
                
            except Exception as e:
                logger.error(f"Erro no loop de processamento: {str(e)}")
                time.sleep(1)  # Evitar loop infinito em caso de erro
    
    def _generate_simulated_frame(self):
        """Gera um frame simulado para quando não há câmera disponível."""
        # Criar frame base
        frame = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        
        # Adicionar grade para simular perspectiva
        grid_size = 50
        for i in range(0, self.width, grid_size):
            cv2.line(frame, (i, 0), (i, self.height), (30, 30, 30), 1)
        for i in range(0, self.height, grid_size):
            cv2.line(frame, (0, i), (self.width, i), (30, 30, 30), 1)
        
        # Adicionar horizonte
        horizon_y = self.height // 2
        cv2.line(frame, (0, horizon_y), (self.width, horizon_y), (0, 120, 255), 2)
        
        # Adicionar "céu"
        frame[:horizon_y, :] = cv2.addWeighted(frame[:horizon_y, :], 0.7, np.ones_like(frame[:horizon_y, :]) * np.array([100, 150, 200]), 0.3, 0)
        
        # Adicionar movimento simulado (deslocamento da grade)
        offset_x = int((time.time() * 10) % grid_size)
        offset_y = int((time.time() * 5) % grid_size)
        
        # Deslocar a grade
        M = np.float32([[1, 0, offset_x], [0, 1, offset_y]])
        frame = cv2.warpAffine(frame, M, (self.width, self.height))
        
        # Adicionar texto simulado
        cv2.putText(frame, "SIMULAÇÃO", (self.width//2 - 80, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 165, 255), 2)
        
        # Adicionar data e hora
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, timestamp, (10, self.height - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        return frame
    
    def _add_overlay(self, frame):
        """Adiciona overlay de informações ao frame."""
        # Adicionar contador de frames
        fps = 0
        if self.last_frame_time > 0:
            elapsed = time.time() - self.last_frame_time
            if elapsed > 0:
                fps = 1 / elapsed
        
        cv2.putText(frame, f"FPS: {fps:.1f}", (10, 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        # Adicionar contador de frames
        cv2.putText(frame, f"Frame: {self.frame_count}", (10, 40), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        # Adicionar fonte de vídeo
        cv2.putText(frame, f"Fonte: {self.video_source}", (10, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        return frame
    
    def get_frame(self):
        """Retorna o frame atual processado."""
        if self.current_frame is None:
            # Se ainda não temos um frame, criar um frame de espera
            frame = np.zeros((self.height, self.width, 3), dtype=np.uint8)
            cv2.putText(frame, "Inicializando câmera...", (self.width//2 - 100, self.height//2), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2)
            return frame
        
        return self.current_frame.copy()

