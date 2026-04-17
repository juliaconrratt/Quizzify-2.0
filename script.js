// --- SISTEMA DE ÁUDIO SINTETIZADO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
    } 
    else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
    }
    else if (type === 'tick') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.05);
    }
    else if (type === 'magic') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.2);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
    }
}

document.body.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });


// --- VARIÁVEIS DE ESTADO ---
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let timeLeft = 30;
let timerInterval;
let errorsInCurrent = 0;
let combo = 0;
let currentRoundQuestions = []; 
let currentPlaylistName = "Mix Aleatório"; // Nome da playlist ativa

let powerUp5050Used = false;
let powerUpFreezeUsed = false;
let isTimeFrozen = false;
let freezeTimerOut = null;

let highScore = parseInt(localStorage.getItem('quizzifyHighScore')) || 0;

function getRankString(points) {
    if (points < 2000) return "Roadie de Garagem";
    if (points < 4500) return "Vocalista Promissor";
    return "Lenda do Rock 🎸";
}

function updateMenuHighScoreDisplay() {
    const scoreDisplay = document.getElementById('menu-high-score');
    if (highScore > 0) {
        const rank = getRankString(highScore);
        scoreDisplay.innerText = `Seu Recorde: ${highScore} pts (${rank})`;
        scoreDisplay.classList.remove('hidden');
    } else {
        scoreDisplay.classList.add('hidden');
    }
}
updateMenuHighScoreDisplay();

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerText = `Pts: ${Math.floor(progress * (end - start) + start)}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// --- BANCO DE PERGUNTAS (COM CATEGORIAS) ---
const questions = [
    // 🎸 CLÁSSICOS DO ROCK
    { category: "rock", type: "image", mediaUrl: "img/abbeyroad.jpg", text: "Qual banda icônica britânica gravou o clássico álbum 'Abbey Road' em 1969?", options: ["The Rolling Stones", "The Beatles", "Pink Floyd", "The Who"], correct: 1 },
    { category: "rock", type: "text", mediaUrl: "", text: "Qual banda grunge imortalizou o inesquecível riff de 'Smells Like Teen Spirit' nos anos 90?", options: ["Pearl Jam", "Alice in Chains", "Soundgarden", "Nirvana"], correct: 3 },
    { category: "rock", type: "image", mediaUrl: "img/queenABTD.png", text: "O clássico 'Another One Bites the Dust' do Queen teve sua linha de baixo inspirada em qual música Disco?", options: ["'Good Times' - Chic", "'Stayin' Alive' - Bee Gees", "'Le Freak' - Chic", "'Disco Inferno' - The Trammps"], correct: 0 },
    { category: "rock", type: "image", mediaUrl: "img/pinkfloyd.png", text: "A banda Pink Floyd tem o recorde de mais tempo na Billboard 200 com 'The Dark Side of the Moon'. Quantas semanas?", options: ["350 semanas", "520 semanas", "741 semanas", "900 semanas"], correct: 2 },
    { category: "rock", type: "text", mediaUrl: "", text: "A música 'Bohemian Rhapsody', uma mistura épica de rock e ópera, é a obra-prima de qual banda?", options: ["Aerosmith", "Guns N' Roses", "Queen", "Led Zeppelin"], correct: 2 },
    { category: "rock", type: "text", mediaUrl: "", text: "Mundialmente conhecido como o 'Rei do Rock', quem é este lendário artista?", options: ["Chuck Berry", "Little Richard", "Elvis Presley", "Johnny Cash"], correct: 2 },
    { category: "rock", type: "image", mediaUrl: "img/sitar.jpg", text: "O instrumento 'Sitar', muito utilizado na música clássica indiana, foi introduzido na música pop do ocidente principalmente por qual banda?", options: ["The Rolling Stones", "The Beach Boys", "The Beatles", "The Doors"], correct: 2 },
    { category: "rock", type: "text", mediaUrl: "", text: "Quem é o cantor e compositor por trás do inesquecível hit dos anos 80 'Careless Whisper'?", options: ["Elton John", "David Bowie", "George Michael", "Phil Collins"], correct: 2 },
    { category: "rock", type: "image", mediaUrl: "img/theremin.jpg", text: "Qual instrumento eletrônico se toca sem encostar nele, movendo apenas as mãos no ar?", options: ["Sintetizador Moog", "Mellotron", "Theremin", "Ondas Martenot"], correct: 2 },
    { category: "rock", type: "text", mediaUrl: "", text: "Qual guitarrista era famoso por tocar a guitarra com os dentes e queimar seu instrumento no palco?", options: ["Eric Clapton", "Jimmy Page", "Jimi Hendrix", "Keith Richards"], correct: 2 },
    { category: "rock", type: "image", mediaUrl: "img/acdc.jpg", text: "A lendária banda de hard rock AC/DC foi formada em qual país?", options: ["Estados Unidos", "Inglaterra", "Austrália", "Canadá"], correct: 2 },
    { category: "rock", type: "image", mediaUrl: "img/freddie.png", text: "Qual era o nome verdadeiro do inesquecível vocalista do Queen, Freddie Mercury?", options: ["Brian May", "Farrokh Bulsara", "John Deacon", "Roger Taylor"], correct: 1 },
    { category: "rock", type: "image", mediaUrl: "img/doors.jpg", text: "A banda The Doors, liderada por Jim Morrison, tirou seu nome de um livro de qual autor?", options: ["George Orwell", "Aldous Huxley", "J.R.R. Tolkien", "Edgar Allan Poe"], correct: 1 },
    { category: "rock", type: "image", mediaUrl: "img/who.jpg", text: "Qual baterista da banda The Who era famoso por destruir baterias (e quartos de hotel) em suas turnês?", options: ["John Bonham", "Ringo Starr", "Keith Moon", "Charlie Watts"], correct: 2 },
    { category: "rock", type: "text", mediaUrl: "", text: "O clipe da música 'Jeremy' foi um dos maiores sucessos da era grunge na MTV. De qual banda é essa música?", options: ["Nirvana", "Alice in Chains", "Soundgarden", "Pearl Jam"], correct: 3 },
    { category: "rock", type: "text", mediaUrl: "", text: "Qual banda britânica, liderada pelos irmãos Gallagher, foi a responsável pelo megahit 'Wonderwall' nos anos 90?", options: ["Blur", "Radiohead", "Oasis", "Coldplay"], correct: 2 },


    // 🇧🇷 BRASILIDADES
    { category: "br", type: "text", mediaUrl: "", text: "Qual cantor e compositor é conhecido como o 'Síndico do Brasil', famoso por hits como 'Descobridor dos Sete Mares'?", options: ["Jorge Ben Jor", "Tim Maia", "Roberto Carlos", "Gilberto Gil"], correct: 1 },
    { category: "br", type: "image", mediaUrl: "img/tom-vini.jpg", text: "Qual música composta por Tom Jobim e Vinícius de Moraes é uma das canções mais regravadas de toda a história do mundo?", options: ["Chega de Saudade", "Águas de Março", "Garota de Ipanema", "Aquarela do Brasil"], correct: 2 },
    { category: "br", type: "image", mediaUrl: "img/rr.jpg", text: "Qual famosa banda de rock nacional dos anos 80 e 90 era liderada pelo cantor Renato Russo?", options: ["Barão Vermelho", "Titãs", "Os Paralamas do Sucesso", "Legião Urbana"], correct: 3 },
    { category: "br", type: "text", mediaUrl: "", text: "O movimento 'Tropicália', que revolucionou a música brasileira nos anos 60, teve como alguns dos seus principais expoentes:", options: ["Chico Buarque e Milton Nascimento", "Caetano Veloso e Gilberto Gil", "Elis Regina e Jair Rodrigues", "Raul Seixas e Rita Lee"], correct: 1 },
    { category: "br", type: "text", mediaUrl: "", text: "Quem ficou eternizada pelo Brasil inteiro como a grande 'Rainha da Sofrência' do sertanejo?", options: ["Naiara Azevedo", "Maiara", "Simone", "Marília Mendonça"], correct: 3 },
    { category: "br", type: "image", mediaUrl: "img/manguebeat.jpg", text: "O 'Manguebeat' foi um movimento musical inovador que misturou ritmos regionais com rock e hip hop. De qual estado brasileiro ele se originou?", options: ["Bahia", "Pernambuco", "Rio de Janeiro", "Minas Gerais"], correct: 1 },
    { category: "br", type: "text", mediaUrl: "", text: "Quem é considerada a imortal 'Rainha do Rock Brasileiro', famosa por integrar a banda Os Mutantes?", options: ["Cássia Eller", "Paula Toller", "Rita Lee", "Pitty"], correct: 2 },
    { category: "br", type: "text", mediaUrl: "", text: "Qual pequeno instrumento de cordas é essencial para a base harmônica de uma roda de Samba e Pagode?", options: ["Violão de 7 cordas", "Cavaquinho", "Bandolim", "Viola Caipira"], correct: 1 },
    { category: "br", type: "image", mediaUrl: "img/sepultura.jpg", text: "A banda 'Sepultura' é reconhecida mundialmente. Qual é o gênero musical que a consagrou?", options: ["Heavy Metal", "Punk Rock", "Hardcore", "Grunge"], correct: 0 },
    { category: "br", type: "text", mediaUrl: "", text: "Qual lendário violonista baiano é considerado o criador da 'batida' inconfundível da Bossa Nova?", options: ["João Gilberto", "Toquinho", "Baden Powell", "João Bosco"], correct: 0 },
    { category: "br", type: "text", mediaUrl: "", text: "'Construção' (1971), considerado um dos álbuns mais importantes da história da MPB, é uma obra de quem?", options: ["Caetano Veloso", "Gilberto Gil", "Chico Buarque", "Milton Nascimento"], correct: 2 },
    { category: "br", type: "text", mediaUrl: "", text: "Qual estado brasileiro é o berço do ritmo 'Axé', que revelou artistas gigantes para o Brasil nos anos 90?", options: ["Pernambuco", "Bahia", "Rio de Janeiro", "Ceará"], correct: 1 },
    { category: "br", type: "image", mediaUrl: "img/raul.jpg", text: "Raul Seixas, o eterno 'Maluco Beleza', costumava compor muitas de suas músicas em parceria com qual famoso escritor?", options: ["Jorge Amado", "Paulo Coelho", "Machado de Assis", "Carlos Drummond de Andrade"], correct: 1 },
    { category: "br", type: "image", mediaUrl: "img/cartola.jpg", text: "Cartola, um dos maiores compositores de samba do Brasil, foi um dos fundadores de qual escola de samba do Rio de Janeiro?", options: ["Portela", "Salgueiro", "Estação Primeira de Mangueira", "Mocidade Independente"], correct: 2 },
    { category: "br", type: "text", mediaUrl: "", text: "Qual banda brasileira inovadora misturava rock pesado com maracatu no movimento cultural chamado Manguebeat?", options: ["Os Mutantes", "Secos & Molhados", "Chico Science & Nação Zumbi", "Titãs"], correct: 2 },
    { category: "br", type: "text", mediaUrl: "", text: "Hino dos karaokês, qual dupla sertaneja é dona do hit 'Evidências', que atravessou gerações?", options: ["Leandro & Leonardo", "Zezé Di Camargo & Luciano", "Chitãozinho & Xororó", "João Paulo & Daniel"], correct: 2 },
    { category: "br", type: "image", mediaUrl: "img/esquina.jpg", text: "O 'Clube da Esquina', um dos movimentos musicais mais ricos e influentes do país, surgiu em qual estado brasileiro?", options: ["Bahia", "São Paulo", "Rio Grande do Sul", "Minas Gerais"], correct: 3 },
    { category: "br", type: "text", mediaUrl: "", text: "Qual instrumento musical era tocado inseparavelmente por Luiz Gonzaga, o grandioso 'Rei do Baião'?", options: ["Violão de 7 cordas", "Sanfona (Acordeon)", "Cavaquinho", "Pandeiro"], correct: 1 },
    { category: "br", type: "image", mediaUrl: "img/elis.jpg", text: "A icônica cantora Elis Regina gravou um álbum antológico em 1974 ('Elis & ...') em parceria com qual grande maestro da Bossa Nova?", options: ["Vinícius de Moraes", "João Gilberto", "Tom Jobim", "Toquinho"], correct: 2 },
    { category: "br", type: "text", mediaUrl: "", text: "Lançado em 1992, o álbum 'O Canto da Cidade' foi responsável por consagrar qual artista do axé music no cenário nacional?", options: ["Ivete Sangalo", "Margareth Menezes", "Daniela Mercury", "Claudia Leitte"], correct: 2 },


    // 🎤 DIVAS & POP
    { category: "pop", type: "image", mediaUrl: "img/daftpunk.jpg", text: "Qual foi o último álbum de estúdio lançado pela dupla Daft Punk antes da separação?", options: ["Discovery", "Homework", "Random Access Memories", "Human After All"], correct: 2 },
    { category: "pop", type: "text", mediaUrl: "", text: "Qual artista pop detém o recorde absoluto de mais prêmios Grammy ganhos na história?", options: ["Beyoncé", "Michael Jackson", "Paul McCartney", "Taylor Swift"], correct: 0 },
    { category: "pop", type: "image", mediaUrl: "img/michael.jpg", text: "Qual é o álbum musical mais vendido de todos os tempos, lançado por Michael Jackson em 1982?", options: ["Bad", "Dangerous", "Off the Wall", "Thriller"], correct: 3 },
    { category: "pop", type: "text", mediaUrl: "", text: "Nascida em Barbados, qual cantora se tornou um ícone pop global com hits como 'Umbrella' e 'Diamonds'?", options: ["Rihanna", "Nicki Minaj", "SZA", "Doja Cat"], correct: 0 },
    { category: "pop", type: "image", mediaUrl: "img/bts.jpg", text: "O fenômeno mundial K-Pop, liderado por grupos como BTS e BLACKPINK, originou-se em qual país?", options: ["Coreia do Norte", "Coreia do Sul", "Japão", "China"], correct: 1 },
    { category: "pop", type: "text", mediaUrl: "", text: "Qual cantora colombiana fez o mundo inteiro dançar com os sucessos 'Hips Don't Lie' e 'Waka Waka'?", options: ["Karol G", "Rosalía", "Thalía", "Shakira"], correct: 3 },
    { category: "pop", type: "image", mediaUrl: "img/madonna1.png", text: "Em 1989, Madonna lançou um clipe muito polêmico que misturava religião e queima de cruzes. Qual era a música?", options: ["Like a Virgin", "Material Girl", "Vogue", "Like a Prayer"], correct: 3 },
    { category: "pop", type: "text", mediaUrl: "", text: "Qual rapper norte-americano explodiu nos anos 2000 usando o alter ego 'Slim Shady'?", options: ["Eminem", "Snoop Dogg", "Jay-Z", "50 Cent"], correct: 0 },
    { category: "pop", type: "text", mediaUrl: "", text: "Qual rapper e compositor contemporâneo lançou álbuns aclamados pela crítica como 'To Pimp a Butterfly' e 'DAMN.'?", options: ["Drake", "J. Cole", "Kendrick Lamar", "Kanye West"], correct: 2 },
    { category: "pop", type: "image", mediaUrl: "img/britney.jpg", text: "Britney Spears lançou seu primeiro e estrondoso single '...Baby One More Time' em qual década?", options: ["Anos 80", "Anos 90", "Anos 2000", "Anos 2010"], correct: 1 },
    { category: "pop", type: "text", mediaUrl: "", text: "Qual cantora é conhecida como a 'Rainha do Pop Latino' e é dona de hits como 'La Tortura' e 'Hips Don't Lie'?", options: ["Shakira", "Thalía", "Gloria Estefan", "Paulina Rubio"], correct: 0 },
    { category: "pop", type: "text", mediaUrl: "", text: "O hit 'Single Ladies (Put a Ring on It)', eternizado por sua coreografia em preto e branco, pertence a qual diva?", options: ["Rihanna", "Beyoncé", "Alicia Keys", "Mariah Carey"], correct: 1 },
    { category: "pop", type: "image", mediaUrl: "img/gaga.jpg", text: "Lady Gaga chocou o mundo inteiro ao aparecer na premiação do VMA de 2010 usando um vestido feito exclusivamente de:", options: ["Plástico bolha", "Vidro quebrado", "Carne crua", "Penas de pavão"], correct: 2 },
    { category: "pop", type: "image", mediaUrl: "img/taylor.jpg", text: "Qual álbum de Taylor Swift, nomeado com um ano, marcou sua transição oficial e definitiva do country para o gênero pop?", options: ["Red", "Fearless", "1989", "Reputation"], correct: 2 },
    { category: "pop", type: "image", mediaUrl: "img/adele.png", text: "A cantora britânica Adele tem a tradição de nomear todos os seus álbuns de estúdio baseados em quê?", options: ["Suas cidades favoritas", "Sua idade na época da gravação", "Fases da lua", "Estações do ano"], correct: 1 },
    { category: "pop", type: "image", mediaUrl: "img/whitney.jpg", text: "A inesquecível Whitney Houston protagonizou o filme 'O Guarda-Costas' em 1992 ao lado de qual ator de Hollywood?", options: ["Tom Cruise", "Harrison Ford", "Kevin Costner", "Richard Gere"], correct: 2 },
    { category: "pop", type: "image", mediaUrl: "img/oned.jpg", text: "A boy band One Direction, que lançou Harry Styles ao estrelato, foi formada durante qual reality show de talentos em 2010?", options: ["The X Factor", "American Idol", "The Voice", "Britain's Got Talent"], correct: 0 },
    { category: "pop", type: "text", mediaUrl: "", text: "Com a frase de abertura 'Ladies up in here tonight...', qual cantora lançou o hit global 'Hips Don't Lie'?", options: ["Jennifer Lopez", "Thalia", "Shakira", "Gloria Estefan"], correct: 2 },
    { category: "pop", type: "image", mediaUrl: "img/perry.jpg", text: "Katy Perry estourou nas rádios do mundo todo em 2008 cantando sobre ter beijado quem na sua música de estreia?", options: ["Um alienígena", "Uma garota", "Um cachorro", "Um astro de rock"], correct: 1 }

];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function quitToMenu() {
    clearInterval(timerInterval);
    clearTimeout(freezeTimerOut);
    showScreen('menu-screen');
}

// --- FUNÇÕES DOS POWER-UPS ---
function use5050() {
    if (powerUp5050Used) return;
    
    powerUp5050Used = true;
    document.getElementById('btn-5050').disabled = true;
    playSound('magic');

    const q = currentRoundQuestions[currentQuestionIndex];
    const btns = document.querySelectorAll('.option-btn');

    let incorrectIndexes = [];
    btns.forEach((button, index) => {
        if (index !== q.correct && !button.disabled) {
            incorrectIndexes.push(index);
        }
    });

    shuffleArray(incorrectIndexes);

    const optionsToDisable = Math.min(2, incorrectIndexes.length);
    for(let i=0; i<optionsToDisable; i++) {
        let idx = incorrectIndexes[i];
        btns[idx].disabled = true;
        btns[idx].style.opacity = "0.1";
    }
}

function useFreezeTime() {
    if (powerUpFreezeUsed || isTimeFrozen) return;

    powerUpFreezeUsed = true;
    document.getElementById('btn-freeze').disabled = true;
    playSound('magic');

    isTimeFrozen = true;
    updateTimerUI(); 

    freezeTimerOut = setTimeout(() => {
        isTimeFrozen = false;
        updateTimerUI(); 
    }, 10000);
}

// --- LÓGICA DE INÍCIO COM PLAYLIST ---
function selectPlaylist(category) {
    currentQuestionIndex = 0;
    score = 0;
    lives = 3;
    combo = 0;
    
    powerUp5050Used = false;
    powerUpFreezeUsed = false;
    isTimeFrozen = false;
    clearTimeout(freezeTimerOut);
    
    document.getElementById('btn-5050').disabled = false;
    document.getElementById('btn-freeze').disabled = false;

    // FILTRANDO AS PERGUNTAS PELA CATEGORIA
    let filteredQuestions = questions;
    if (category === 'rock') {
        filteredQuestions = questions.filter(q => q.category === 'rock');
        currentPlaylistName = "Clássicos do Rock";
    } else if (category === 'br') {
        filteredQuestions = questions.filter(q => q.category === 'br');
        currentPlaylistName = "Brasilidades";
    } else if (category === 'pop') {
        filteredQuestions = questions.filter(q => q.category === 'pop');
        currentPlaylistName = "Divas & Pop";
    } else {
        currentPlaylistName = "Mix Aleatório";
    }

    document.getElementById('game-playlist-title').innerText = currentPlaylistName;

    // Copia o array filtrado para não quebrar o original e embaralha
    let questionsToPlay = [...filteredQuestions];
    shuffleArray(questionsToPlay);

    // Puxa até 10 perguntas da playlist escolhida
    let limit = Math.min(10, questionsToPlay.length);
    currentRoundQuestions = questionsToPlay.slice(0, limit);

    updateLivesUI();
    document.getElementById('score-text').innerText = `Pts: ${score}`;
    
    showScreen('game-screen');
    loadQuestion();
}

function loadQuestion() {
    isTimeFrozen = false;
    clearTimeout(freezeTimerOut);

    const q = currentRoundQuestions[currentQuestionIndex];
    document.getElementById('question-text').innerText = q.text;
    
    const mediaArea = document.getElementById('album-cover');
    mediaArea.innerHTML = ''; 

    if (q.type === 'image') {
        mediaArea.innerHTML = `<img src="${q.mediaUrl}" alt="Mídia da Pergunta" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
    } else {
        mediaArea.innerHTML = `<span style="font-size: 80px;">❓</span>`;
    }

    const correctAnswerText = q.options[q.correct];
    shuffleArray(q.options);
    q.correct = q.options.indexOf(correctAnswerText);

    const btns = document.querySelectorAll('.option-btn');
    btns.forEach((btn, index) => {
        btn.innerText = q.options[index];
        btn.className = 'option-btn'; 
        btn.disabled = false;
        btn.style.opacity = "1"; 
    });
    
    errorsInCurrent = 0;
    timeLeft = 30;
    updateTimerUI();
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isTimeFrozen) {
            timeLeft--;
            updateTimerUI();
            
            if (timeLeft <= 5 && timeLeft > 0) {
                playSound('tick');
            }
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                loseLife("O tempo acabou!");
            }
        }
    }, 1000);
}

function updateTimerUI() {
    document.getElementById('time-text').innerText = `0:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
    
    const progressFill = document.getElementById('timer-progress');
    const percentage = (timeLeft / 30) * 100;
    progressFill.style.width = `${percentage}%`;
    
    if (isTimeFrozen) {
        progressFill.style.backgroundColor = '#00D2FF';
    } else if (timeLeft <= 5 && timeLeft > 0) {
        progressFill.style.backgroundColor = '#E22134';
    } else {
        progressFill.style.backgroundColor = '#1DB954';
    }
}

function checkAnswer(selectedIndex) {
    isTimeFrozen = false;
    clearTimeout(freezeTimerOut);

    const q = currentRoundQuestions[currentQuestionIndex];
    const btns = document.querySelectorAll('.option-btn');

    if (selectedIndex === q.correct) {
        playSound('correct'); 
        
        btns[selectedIndex].classList.add('option-correct');
        combo++;
        
        let oldScore = score;
        score += (100 * combo) + (timeLeft * 2);
        
        animateValue(document.getElementById('score-text'), oldScore, score, 500);
        
        clearInterval(timerInterval);
        btns.forEach(b => b.disabled = true);
        setTimeout(nextQuestion, 1000);
    } else {
        playSound('wrong'); 
        
        btns[selectedIndex].classList.add('option-wrong', 'shake');
        btns[selectedIndex].disabled = true; 
        
        setTimeout(() => btns[selectedIndex].classList.remove('shake'), 400);

        errorsInCurrent++;
        combo = 0; 
        
        if (errorsInCurrent >= 2) {
            clearInterval(timerInterval);
            btns[q.correct].classList.add('option-correct'); 
            btns.forEach(b => b.disabled = true);
            setTimeout(() => loseLife("Você errou duas vezes!"), 1500);
        } else {
            timeLeft -= 10;
            
            let oldScore = score;
            score -= 50; 
            if (score < 0) score = 0; 
            
            animateValue(document.getElementById('score-text'), oldScore, score, 500);
            
            if (timeLeft <= 0) {
                timeLeft = 0;
                updateTimerUI();
                clearInterval(timerInterval);
                loseLife("O tempo acabou devido à penalidade!");
            } else {
                updateTimerUI();
            }
        }
    }
}

function updateLivesUI() {
    const container = document.getElementById('lives-container');
    container.innerHTML = '';
    
    for(let i = 0; i < 3; i++) {
        const heartSpan = document.createElement('span');
        heartSpan.innerText = i < lives ? "💚" : "🖤";
        heartSpan.style.display = "inline-block";
        container.appendChild(heartSpan);
    }
}

function loseLife(reason) {
    lives--;
    
    const container = document.getElementById('lives-container');
    const hearts = container.querySelectorAll('span');
    
    if (hearts[lives]) {
        hearts[lives].innerText = "💔";
        hearts[lives].classList.add('heart-breaking');
    }
    
    setTimeout(() => {
        updateLivesUI();
        if (lives <= 0) {
            showWrappedScreen(false); 
        } else {
            nextQuestion();
        }
    }, 600);
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentRoundQuestions.length) {
        loadQuestion();
    } else {
        showWrappedScreen(true); 
    }
}

function showWrappedScreen(isVictory) {
    showScreen('end-screen');
    animateValue(document.getElementById('final-score-display'), 0, score, 1500);

    const titleEl = document.getElementById('end-title');
    const rankEl = document.getElementById('end-rank');
    const msgEl = document.getElementById('end-message');

    let isNewHighScore = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('quizzifyHighScore', highScore);
        updateMenuHighScoreDisplay(); 
        isNewHighScore = true;
    }

    if (isNewHighScore) {
        titleEl.innerText = "NOVO RECORDE! 🏆";
        titleEl.style.color = "#1DB954";
    } else if (!isVictory) {
        titleEl.innerText = "Game Over";
        titleEl.style.color = "#E22134";
    } else {
        // Mensagem de vitória adaptada para a funcionalidade de Playlist!
        titleEl.innerText = "Playlist Concluída!";
        titleEl.style.color = "#FFFFFF";
    }

    const rankTexto = getRankString(score);
    rankEl.innerText = `Nível: ${rankTexto}`;

    if (score < 2000) {
        msgEl.innerText = "Você desafinou um pouco dessa vez. Que tal ensaiar mais um pouco e dar o play de novo?";
    } else if (score < 4500) {
        msgEl.innerText = "Bom ritmo! Você está quase no tom perfeito, só falta masterizar os combos rápidos.";
    } else {
        msgEl.innerText = "Inacreditável! Você dominou as paradas da Billboard com respostas na velocidade da luz. Uma performance digna de Disco de Platina!";
    }
}

function shareScore() {
    const rankTexto = getRankString(score);
    // Agora o texto de compartilhar mostra a Playlist que a pessoa jogou!
    const textoCompartilhamento = `Eu completei a playlist '${currentPlaylistName}' com o nível ${rankTexto} (${score} pts) no Quizzify! Tente bater meu recorde:`;
    const urlJogo = window.location.href; 

    if (navigator.share) {
        navigator.share({
            title: 'Meu Recorde no Quizzify!',
            text: textoCompartilhamento,
            url: urlJogo
        }).then(() => {
            console.log('Compartilhado com sucesso!');
        }).catch((error) => {
            console.log('Erro ao compartilhar', error);
        });
    } else {
        navigator.clipboard.writeText(`${textoCompartilhamento} ${urlJogo}`);
        alert("O texto foi copiado! Cole no seu WhatsApp, X ou Instagram para desafiar seus amigos.");
    }
} 