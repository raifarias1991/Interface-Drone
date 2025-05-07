# Sistema de Controle e Monitoramento de Drones

🔗 **Demo ao vivo:** [https://interfacedrone.vercel.app/](https://interfacedrone.vercel.app/)

## 📋 Descrição

O Sistema de Drones é uma interface web moderna para controle e monitoramento de drones autônomos em tempo real. O sistema permite visualizar o feed de vídeo do drone, controlar seus movimentos, monitorar telemetria e utilizar recursos avançados de IA para detecção de objetos, rastreamento facial e planejamento de rotas.

O projeto consiste em um frontend web desenvolvido com Next.js e um backend Python que se comunica com o hardware do drone. A comunicação entre frontend e backend é realizada via WebSockets, permitindo atualizações em tempo real.

### Principais Funcionalidades

- 📹 Visualização do feed de vídeo em tempo real
- 📊 Monitoramento de telemetria (bateria, altitude, temperatura, atitude)
- 🎮 Controles intuitivos para pilotagem
- 🧠 Recursos de IA para detecção de objetos e rastreamento
- 🗣️ Controle por comandos de voz
- 🗺️ Planejamento e execução de rotas autônomas
- 📱 Interface responsiva para diferentes dispositivos
- 🔄 Modo de simulação para testes sem hardware

## 🚀 Tecnologias Utilizadas

### Frontend
- [Next.js](https://nextjs.org/) - Framework React com renderização do lado do servidor
- [React](https://reactjs.org/) - Biblioteca JavaScript para construção de interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Shadcn/UI](https://ui.shadcn.com/) - Componentes de UI reutilizáveis
- [Framer Motion](https://www.framer.com/motion/) - Biblioteca para animações
- [Three.js](https://threejs.org/) - Biblioteca para gráficos 3D
- [Lucide React](https://lucide.dev/) - Ícones modernos para React

### Backend
- [Python](https://www.python.org/) - Linguagem de programação principal do backend
- [WebSockets](https://websockets.readthedocs.io/) - Biblioteca para comunicação bidirecional
- [OpenCV](https://opencv.org/) - Biblioteca para processamento de imagens e visão computacional
- [NumPy](https://numpy.org/) - Biblioteca para computação científica

## 💻 Instalação

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/) (v3.8 ou superior)
- [pip](https://pip.pypa.io/en/stable/)

### Frontend

1. Clone o repositório:
   ```bash
   git clone https://github.com/raifarias1991/interface-drone.git
   cd interface-drone
