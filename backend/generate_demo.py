#!/usr/bin/env python3
import os
import argparse
import subprocess
import time
from demo_frames_generator import generate_demo_frames
from create_demo_video import create_video_from_frames

def main():
    """Função principal para gerar demonstrações de IA do drone."""
    parser = argparse.ArgumentParser(description="Gera demonstrações de IA do drone.")
    parser.add_argument("--frames", "-f", help="Número de frames por cenário", type=int, default=60)
    parser.add_argument("--output", "-o", help="Diretório de saída para os vídeos", default="demo_videos")
    parser.add_argument("--scenario", "-s", help="Cenário específico (ou 'all' para todos)", default="all")
    
    args = parser.parse_args()
    
    # Criar diretório de saída se não existir
    if not os.path.exists(args.output):
        os.makedirs(args.output)
    
    # Importar gerador de frames
    from demo_frames_generator import DemoFramesGenerator
    
    # Obter lista de cenários
    generator = DemoFramesGenerator()
    scenarios = generator.scenarios
    
    if args.scenario != "all" and args.scenario not in scenarios:
        print(f"Cenário '{args.scenario}' não reconhecido. Cenários disponíveis: {scenarios}")
        return
    
    # Determinar quais cenários processar
    scenarios_to_process = scenarios if args.scenario == "all" else [args.scenario]
    
    # Processar cada cenário
    for scenario in scenarios_to_process:
        print(f"\n=== Processando cenário: {scenario} ===")
        
        # Definir diretórios e arquivos
        frames_dir = f"demo_frames_{scenario}"
        video_file = os.path.join(args.output, f"demo_video_{scenario}.mp4")
        
        # Gerar frames
        print(f"Gerando {args.frames} frames para o cenário '{scenario}'...")
        generator = DemoFramesGenerator(output_dir=frames_dir)
        generator.generate_demo_sequence(num_frames=args.frames, scenario=scenario)
        
        # Criar vídeo
        print(f"Criando vídeo para o cenário '{scenario}'...")
        create_video_from_frames(frames_dir, video_file)
        
        print(f"Demonstração para o cenário '{scenario}' concluída!")
    
    print("\nTodas as demonstrações foram geradas com sucesso!")
    print(f"Os vídeos estão disponíveis no diretório: {args.output}")

if __name__ == "__main__":
    start_time = time.time()
    main()
    elapsed_time = time.time() - start_time
    print(f"\nTempo total de execução: {elapsed_time:.2f} segundos")

