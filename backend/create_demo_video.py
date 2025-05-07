import cv2
import os
import glob
import argparse

def create_video_from_frames(input_dir, output_file, fps=30):
    """Cria um vídeo a partir de uma sequência de frames."""
    # Verificar se o diretório existe
    if not os.path.exists(input_dir):
        print(f"Diretório não encontrado: {input_dir}")
        return False
    
    # Obter lista de frames
    frame_files = sorted(glob.glob(os.path.join(input_dir, "frame_*.jpg")))
    
    if not frame_files:
        print(f"Nenhum frame encontrado em: {input_dir}")
        return False
    
    # Ler o primeiro frame para obter dimensões
    first_frame = cv2.imread(frame_files[0])
    height, width, _ = first_frame.shape
    
    # Criar objeto VideoWriter
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec MP4
    video_writer = cv2.VideoWriter(output_file, fourcc, fps, (width, height))
    
    # Adicionar cada frame ao vídeo
    total_frames = len(frame_files)
    for i, frame_file in enumerate(frame_files):
        frame = cv2.imread(frame_file)
        video_writer.write(frame)
        
        if i % 10 == 0 or i == total_frames - 1:
            print(f"Processando frame {i+1}/{total_frames}")
    
    # Liberar recursos
    video_writer.release()
    
    print(f"Vídeo criado com sucesso: {output_file}")
    return True

def main():
    """Função principal."""
    parser = argparse.ArgumentParser(description="Cria vídeos de demonstração a partir de frames.")
    parser.add_argument("--input", "-i", help="Diretório de entrada com os frames", default="demo_frames")
    parser.add_argument("--output", "-o", help="Arquivo de saída do vídeo", default="demo_video.mp4")
    parser.add_argument("--fps", "-f", help="Frames por segundo", type=int, default=30)
    
    args = parser.parse_args()
    
    # Verificar se é um diretório específico ou todos os diretórios demo_frames_*
    if args.input == "all":
        # Processar todos os diretórios demo_frames_*
        demo_dirs = glob.glob("demo_frames_*")
        
        for demo_dir in demo_dirs:
            scenario = demo_dir.replace("demo_frames_", "")
            output_file = f"demo_video_{scenario}.mp4"
            
            print(f"Criando vídeo para o cenário '{scenario}'...")
            create_video_from_frames(demo_dir, output_file, args.fps)
    else:
        # Processar apenas o diretório especificado
        create_video_from_frames(args.input, args.output, args.fps)

if __name__ == "__main__":
    main()

