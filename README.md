# Quizzify 🎵

O Quizzify é um jogo em HTML interativo de perguntas e respostas focado em conhecimentos gerais sobre música. Com uma estética minimalista e em modo escuro, o design é fortemente inspirado no visual clássico do Spotify dos anos 2010. O foco principal do jogo é a experiência em celulares, possuindo um design responsivo, mas que se adapta perfeitamente a computadores.

## Funcionalidades
* **Mecânica de Tempo e Vidas**: O jogo atribui 30 segundos ao jogador para responder a cada pergunta, oferecendo um total de três vidas que são representadas por corações verdes. Respostas incorretas resultam na perda de uma vida e aplicam simultaneamente uma penalidade de 10 segundos no temporizador.
* **Dificuldade Progressiva**: As perguntas tornam-se progressivamente mais difíceis à medida que o jogo avança e o tempo passa.
* **Power-ups Estratégicos**: O jogador tem acesso a ajudas especiais que só podem ser utilizadas uma vez por partida. Inclui o "50/50" (que elimina duas opções de resposta incorretas) e o "Congelar o Tempo" (que para o relógio durante 10 segundos para o jogador pensar).
* **Seleção de Playlists**: O jogo inclui um ecrã de Seleção de Playlists com um design de grid, permitindo filtrar o banco de perguntas para escolher diferentes categorias e estilos musicais no início da partida.
* **Sistema de Recorde (High Score)**: A pontuação máxima atingida pelo jogador fica guardada localmente utilizando o "Local Storage" do navegador.
* **Tela de Conclusão "Wrapped"**: No final do jogo (em caso de "Vitória" ou "Game Over"), é apresentado um ecrã de resultados com títulos musicais e trocadilhos baseados na pontuação atingida, inspirado no formato "Spotify Wrapped".
* **Compartilhamento**: Inclui um botão nativo de partilha que permite ao jogador enviar a sua pontuação final diretamente para redes sociais como o WhatsApp, Instagram ou Twitter.

## Tecnologias Utilizadas
* **HTML5**: Utilizado para criar a estrutura da página e todos os elementos do jogo.
* **CSS3**: Utilizado para as definições de estilo, modo escuro e para garantir que o design se mantém responsivo.
* **JavaScript Vanilla**: Responsável pela lógica central do jogo, cálculos de pontuação, penalidades, sistema de randomização da ordem das perguntas e gestão das mídias (áudio e imagem).

# English

Quizzify is an interactive HTML trivia game focused on general music knowledge. Featuring a minimalist dark mode aesthetic, its design is heavily inspired by the classic 2010s Spotify look. The game's primary focus is the mobile experience, boasting a responsive design that also adapts perfectly to desktop computers.

## Features
* **Time and Lives Mechanics**: The game gives the player 30 seconds to answer each question, offering a total of three lives represented by green hearts. Incorrect answers result in the loss of a life and simultaneously apply a 10-second penalty to the timer.
* **Progressive Difficulty**: Questions become progressively harder as the game advances and time passes.
* **Strategic Power-ups**: The player has access to special aids that can only be used once per match. These include "50/50" (which removes two incorrect answer options from the screen) and "Freeze Time" (which stops the clock for 10 seconds to let the player think).
* **Playlist Selection**: The game features a Playlist Selection screen with a grid design, allowing players to filter the question bank to choose different categories and musical styles at the start of the match.
* **High Score System**: The maximum score achieved by the player is saved locally using the browser's "Local Storage".
* **"Wrapped" End Screen**: At the end of the game (whether a "Victory" or "Game Over"), a results screen is displayed featuring musical titles and puns based on the score achieved, inspired by the "Spotify Wrapped" format.
* **Social Sharing**: Includes a native share button that allows the player to send their final score directly to social networks like WhatsApp, Instagram, or Twitter.

## Technologies Used
* **HTML5**: Used to create the page structure and all game elements.
* **CSS3**: Used for styling, dark mode, and ensuring the design remains responsive.
* **Vanilla JavaScript**: Responsible for the core game logic, score calculations, penalties, question randomization system, and media management (audio and images).
