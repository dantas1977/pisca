// Função para carregar o CSV e inicializar o jogo
function loadCSV(callback) {
    fetch('perguntas.csv', { headers: { 'Content-Type': 'text/csv; charset=UTF-8' } })
        .then(response => response.text())
        .then(data => {
            const questions = parseCSV(data);
            window.questions = questions; // Armazena as perguntas para usar na filtragem
            callback(questions);
        })
        .catch(error => console.error('Erro ao carregar CSV:', error));
}

// Inicializa o modal após o carregamento do DOM, sem iniciar o jogo
document.addEventListener('DOMContentLoaded', () => {
    loadCSV(criarMenuAssuntos);  // Carrega as questões e gera o menu de seleção de assuntos
    openAssuntoModal();  // Abre o modal de seleção de assuntos ao carregar o app
});

// Função para fechar o modal de seleção de assuntos
function closeAssuntoModal() {
    document.getElementById('assuntoModal').style.display = 'none'; // Fecha o modal
}

// Adiciona o evento de clique ao botão "Confirmar"
document.getElementById('confirmarBtn').addEventListener('click', () => {
    const selectedQuestions = filterQuestionsBySelection(window.questions);

    if (selectedQuestions.length > 0) {
        initGame(selectedQuestions);  // Inicializa o jogo com as questões filtradas
        closeAssuntoModal();  // Fecha o modal após a seleção
    } else {
        alert("Selecione ao menos um assunto ou subassunto.");  // Validação para evitar iniciar sem seleção
    }
});


// Função para filtrar questões por seleção de assuntos/subassuntos
function filterQuestionsBySelection(questions) {
    const selectedAssuntos = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => ({
            assunto: cb.getAttribute('data-assunto'),
            subassunto: cb.getAttribute('data-subassunto')
        }));

    return questions.filter(q => {
        return selectedAssuntos.some(sa => {
            return q.assunto === sa.assunto && (!sa.subassunto || q[`subassunto${sa.subassunto}`]);
        });
    });
}

// Função para parsear o CSV
function parseCSV(data) {
    const rows = data.trim().split('\n');
    return rows.slice(1).map(row => {
        const regex = /("([^"]*)")|([^;]+)(?=;|$)/g;
        const cols = [];
        let match;
        while ((match = regex.exec(row)) !== null) {
            cols.push(match[2] || match[0].trim());
        }
        return {
            id: cols[0],
            descricao: cols[1],
            imagem: cols[2],
            enunciado: cols[3],
            resposta: cols[4], // resposta correta
            resposta_errada1: cols[5], // primeira resposta errada
            resposta_errada2: cols[6], // segunda resposta errada
            resposta_errada3: cols[7], // terceira resposta errada
            tipo_de_resposta: cols[8], // nova coluna "Tipo_de_Resposta" 
            coordenadas: cols[9],
            shape: cols[10],
            assunto: cols[11],
            subassunto1: cols[12],
            subassunto2: cols[13],
            subassunto3: cols[14],
            subassunto4: cols[15],
            subassunto5: cols[16]
        };
    }).filter(q => q.id); // Remove linhas vazias
}

function criarMenuAssuntos(questions) {
    const assuntoListDiv = document.getElementById('assunto-list');
    assuntoListDiv.innerHTML = ''; // Limpa o conteúdo anterior

    const assuntosMap = {};

    // Popula o mapa de assuntos e subassuntos
    questions.forEach(q => {
        const assunto = q.assunto;
        const subassunto1 = q.subassunto1;
        const subassunto2 = q.subassunto2;
        const subassunto3 = q.subassunto3;
        const subassunto4 = q.subassunto4;
        const subassunto5 = q.subassunto5;

        if (!assuntosMap[assunto]) {
            assuntosMap[assunto] = {};
        }
        if (subassunto1) {
            if (!assuntosMap[assunto][subassunto1]) {
                assuntosMap[assunto][subassunto1] = {};
            }
            if (subassunto2) {
                if (!assuntosMap[assunto][subassunto1][subassunto2]) {
                    assuntosMap[assunto][subassunto1][subassunto2] = {};
                }
                if (subassunto3) {
                    if (!assuntosMap[assunto][subassunto1][subassunto2][subassunto3]) {
                        assuntosMap[assunto][subassunto1][subassunto2][subassunto3] = {};
                    }
                    if (subassunto4) {
                        if (!assuntosMap[assunto][subassunto1][subassunto2][subassunto3][subassunto4]) {
                            assuntosMap[assunto][subassunto1][subassunto2][subassunto3][subassunto4] = {};
                        }
                        if (subassunto5) {
                            assuntosMap[assunto][subassunto1][subassunto2][subassunto3][subassunto4][subassunto5] = {};
                        }
                    }
                }
            }
        }
    });

    // Cria checkboxes e estrutura aninhada para assuntos e subassuntos
    Object.keys(assuntosMap).forEach(assunto => {
        const assuntoDiv = document.createElement('div');
        assuntoDiv.innerHTML = `
            <input type="checkbox" id="assunto-${assunto}" data-assunto="${assunto}">
            <label for="assunto-${assunto}">${assunto}</label>
            <button onclick="toggleSub('${assunto}')">⯆</button>
        `;

        const subListDiv = document.createElement('div');
        subListDiv.id = `sublist-${assunto}`;
        subListDiv.style.display = 'none'; // Inicialmente oculto

        // Adiciona subassuntos aninhados
        Object.keys(assuntosMap[assunto]).forEach(subassunto1 => {
            const subDiv1 = document.createElement('div');
            subDiv1.innerHTML = `
                <input type="checkbox" id="subassunto-${assunto}-${subassunto1}" data-assunto="${assunto}" data-subassunto="1">
                <label for="subassunto-${assunto}-${subassunto1}">${subassunto1}</label>
            `;

            const subListDiv1 = document.createElement('div');
            subListDiv1.style.marginLeft = '20px'; // Recuo para subassunto

            Object.keys(assuntosMap[assunto][subassunto1]).forEach(subassunto2 => {
                const subDiv2 = document.createElement('div');
                subDiv2.innerHTML = `
                    <input type="checkbox" id="subassunto-${assunto}-${subassunto2}" data-assunto="${assunto}" data-subassunto="2">
                    <label for="subassunto-${assunto}-${subassunto2}">${subassunto2}</label>
                `;
                subListDiv1.appendChild(subDiv2);
            });

            subDiv1.appendChild(subListDiv1);
            subListDiv.appendChild(subDiv1);
        });

        assuntoDiv.appendChild(subListDiv);
        assuntoListDiv.appendChild(assuntoDiv);
    });
}


// Função para exibir/ocultar subassuntos
function toggleSub(assunto) {
    const subList = document.getElementById(`sublist-${assunto}`);
    subList.style.display = subList.style.display === 'none' ? 'block' : 'none';
}

// Função para abrir o modal de seleção de assuntos
function openAssuntoModal() {
    document.getElementById('assuntoModal').style.display = 'flex';
}

// Botão de sair do app
document.getElementById('sairBtn').addEventListener('click', () => {
    window.close();
});

// Funções para iniciar e gerenciar o jogo, após a seleção de assuntos
let score = 0;
let currentQuestionIndex = 0;
let selectedQuestions = [];

// Função para iniciar o jogo após o usuário confirmar a seleção
function initGame(questions) {
    // Limita o número de questões a 4
    const maxQuestions = 4;

    // Embaralha as perguntas e seleciona no máximo 4
    selectedQuestions = shuffle(questions).slice(0, maxQuestions);

    currentQuestionIndex = 0;
    score = 0; // Reinicia a pontuação
    showQuestion(); // Exibe a primeira pergunta
}



// Função para mostrar a questão atual
function showQuestion() {
    // Função para limpar mapeamentos anteriores e remover efeitos visuais anteriores
    function clearPreviousMapping() {
        // Limpa áreas de mapeamento anteriores (se existirem)
        const mapAreas = document.querySelectorAll('area');
        mapAreas.forEach(area => area.remove());  // Remove todas as áreas do mapa

        // Remove quaisquer efeitos visuais anteriores (como pisca-pisca)
        const blinkingAreas = document.querySelectorAll('.blinking-area');
        blinkingAreas.forEach(area => area.remove());  // Remove todas as áreas que piscam


	// Remove quaisquer áreas com a classe rect-blink
	const rectAreas = document.querySelectorAll('.rect-blink');
	rectAreas.forEach(area => {
  	  area.parentNode.removeChild(area);  // Remove o elemento do DOM
	});



        // Adicionalmente, remova qualquer SVG ou highlight que esteja presente
        document.querySelectorAll('svg').forEach(svg => svg.remove());
        document.querySelectorAll('.highlight').forEach(highlight => highlight.remove());

        // Limpa o conteúdo das áreas de resposta ou outras partes, se necessário
        document.querySelector('.container-3').textContent = '';  // Limpa o enunciado
        document.querySelector('.container-4').innerHTML = '';    // Limpa a imagem
        document.querySelector('.container-5').textContent = '';  // Limpa a descrição
    }

    if (currentQuestionIndex >= selectedQuestions.length) {
        showFinalScore();
        return;
    }

    const question = selectedQuestions[currentQuestionIndex];

    // Preenche o container-3 com a descrição da imagem
    document.querySelector('.container-3').textContent = question.descricao;

    // Carrega a imagem no container-4
    const container4 = document.querySelector('.container-4');
    container4.innerHTML = ''; // Limpa o container antes de adicionar a nova imagem
    const img = document.createElement('img');
    img.src = `${question.imagem}`;
    img.alt = question.descricao;
    img.id = 'mainImage';

    // Cria o elemento <map> dinamicamente antes de associar o useMap
    const map = document.createElement('map');
    map.name = 'image-map';
    map.id = 'image-map'; // Adiciona um id para referência futura
    container4.appendChild(map);

    img.useMap = "#image-map"; // Associando o useMap ao mapa que foi criado
    container4.appendChild(img);



// Após carregar a imagem e criar as áreas de mapeamento
img.onload = function() {
    if (img.complete && img.naturalHeight !== 0) {
        adjustImageSize(img, container4); // Ajusta o tamanho da imagem primeiro
        createMapAreas(question.coordenadas, question.shape, map, img); // Depois cria o mapeamento
    }
};

// Função para ajustar a imagem ao container sem distorção
function adjustImageSize(img, container) {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imgAspectRatio = img.naturalWidth / img.naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    if (imgAspectRatio > containerAspectRatio) {
        img.style.width = '100%';  // Largura total do container
        img.style.height = 'auto'; // Ajusta a altura proporcionalmente
    } else {
        img.style.height = '100%';  // Altura total do container
        img.style.width = 'auto';   // Ajusta a largura proporcionalmente
    }
}






    // **Resetando os botões antes de atribuir novas respostas**
    const answerButtons = document.querySelectorAll('.answer-button');
    answerButtons.forEach(button => {
        button.disabled = false; // Reativa os botões
        button.style.backgroundColor = ''; // Remove a cor de fundo (reset)
        button.style.color = ''; // Remove qualquer cor de texto personalizada
    });

    // Função para pegar as respostas erradas, incluindo sorteios
function getWrongAnswers() {
    const wrongAnswers = [];
    const allPossibleAnswers = new Set(); // Usaremos um Set para armazenar todas as respostas possíveis sem repetição
    const maxAttempts = 100; // Limite de tentativas para evitar loops infinitos
    let attempts = 0;

    // Adiciona a resposta correta ao Set para garantir que ela não seja escolhida como errada
    allPossibleAnswers.add(question.resposta);

    // Verifica cada resposta errada
    [question.resposta_errada1, question.resposta_errada2, question.resposta_errada3].forEach(wrongAnswer => {
        if (wrongAnswer === 'Sorteio') {
            let sortedAnswer;

            // Sorteia uma resposta do mesmo tipo, mas garante que não seja a correta nem repetida
            do {
                attempts++;
                const sameTypeAnswers = window.questions.filter(q => 
                    q.tipo_de_resposta === question.tipo_de_resposta && 
                    q.resposta !== question.resposta && 
                    !allPossibleAnswers.has(q.resposta)
                );
                
                if (sameTypeAnswers.length > 0) {
                    const randomIndex = Math.floor(Math.random() * sameTypeAnswers.length);
                    sortedAnswer = sameTypeAnswers[randomIndex].resposta;
                } else {
                    // Se não houver respostas suficientes do mesmo tipo, sorteia de todas as respostas disponíveis
                    const allAnswers = window.questions.filter(q => 
                        q.resposta !== question.resposta && 
                        !allPossibleAnswers.has(q.resposta)
                    );
                    const randomIndex = Math.floor(Math.random() * allAnswers.length);
                    sortedAnswer = allAnswers[randomIndex].resposta;
                }
            } while ((wrongAnswers.includes(sortedAnswer) || allPossibleAnswers.has(sortedAnswer)) && attempts < maxAttempts);

            wrongAnswers.push(sortedAnswer);
            allPossibleAnswers.add(sortedAnswer); // Adiciona a resposta sorteada ao Set para evitar repetições
        } else {
            // Adiciona diretamente a resposta errada manualmente escrita, se ainda não foi usada
            if (!allPossibleAnswers.has(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
                allPossibleAnswers.add(wrongAnswer); // Garante que essa resposta não seja usada novamente
            }
        }
    });

    return wrongAnswers;
}




    // Preenche os botões de resposta
    const respostas = [question.resposta, ...getWrongAnswers()];
    
    // Embaralha as respostas para que não fiquem sempre na mesma ordem
    const shuffledRespostas = shuffle(respostas);

    // Atribui as respostas embaralhadas aos botões
    answerButtons.forEach((button, index) => {
        button.textContent = shuffledRespostas[index];
        button.onclick = () => handleAnswer(shuffledRespostas[index] === question.resposta, button);
    });

    // Remove todos os elementos com a classe de efeito de pisca-pisca
    const blinkingAreas = document.querySelectorAll('.blinking-area');
    blinkingAreas.forEach(area => area.remove());

    // Preenche o container-5 com o enunciado da pergunta
    document.querySelector('.container-5').textContent = question.enunciado;

    // Adicional: também limpar referências a elementos do pisca-pisca, se necessário
    document.querySelectorAll('svg').forEach(svg => svg.remove());
}




// Função para criar áreas de mapeamento (incluindo suporte para 'poly')
function createMapAreas(coordenadas, shape, map, img) {
    const coords = coordenadas.split(',').map(Number);

    // Remove qualquer highlight existente antes de criar um novo
    const existingHighlights = document.querySelectorAll('.rect-blink, .blinking-area');
    existingHighlights.forEach(area => area.remove());

    // Cria o elemento <area> para formas retangulares ou circulares
    const area = document.createElement('area');
    area.shape = shape;
    area.coords = coords.join(',');
    area.href = "#"; // Deixe o href para ser clicável
    map.appendChild(area);

    // Se a forma for 'poly', usamos SVG para desenhar a área poligonal
    if (shape === 'poly') {
        const svgNamespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNamespace, 'svg');
        const polygon = document.createElementNS(svgNamespace, 'polygon');

        svg.style.position = 'absolute';
        svg.style.top = img.offsetTop + 'px';
        svg.style.left = img.offsetLeft + 'px';
        svg.style.width = img.offsetWidth + 'px';
        svg.style.height = img.offsetHeight + 'px';
        svg.style.pointerEvents = 'none';
        svg.style.overflow = 'visible';

        // Adiciona o polígono ao SVG e o SVG ao mesmo container da imagem
        const container = img.parentElement;
        container.style.position = 'relative';
        container.appendChild(svg);
        svg.appendChild(polygon);

        // Função para redimensionar e reposicionar a área poly
        function resizePolyArea() {
            const rect = img.getBoundingClientRect();
            const scaleX = rect.width / img.naturalWidth;
            const scaleY = rect.height / img.naturalHeight;

            svg.style.width = `${rect.width}px`;
            svg.style.height = `${rect.height}px`;

            const containerRect = container.getBoundingClientRect();
            svg.style.top = `${rect.top - containerRect.top}px`;
            svg.style.left = `${rect.left - containerRect.left}px`;

            const scaledCoords = coords.map((coord, index) =>
                index % 2 === 0 ? coord * scaleX : coord * scaleY
            );

            // Define as coordenadas no formato esperado pelo SVG polygon
            const points = scaledCoords.join(',');
            polygon.setAttribute('points', points);

            // Definir a aparência do polígono pisca-pisca
            polygon.style.fill = 'rgba(255, 255, 0, 0.5)'; // Cor amarela semi-transparente
            polygon.style.stroke = 'yellow'; // Cor da borda
            polygon.style.strokeWidth = '2';
            polygon.classList.add('blinking-area'); // Adiciona a classe de pisca-pisca
        }

        // Redimensiona o polígono dinamicamente ao redimensionar a tela
        window.addEventListener('resize', resizePolyArea);
        resizePolyArea(); // Chama a função uma vez no início
    } else {
// Para outros formatos: 'rect', 'circle'
const highlightDiv = document.createElement('div');
document.body.appendChild(highlightDiv);

function resizeHighlightArea() {
    // Remova a classe 'rect-blink' de qualquer elemento existente antes de adicionar a nova
    const existingRectBlink = document.querySelectorAll('.rect-blink');
    existingRectBlink.forEach(area => {
        area.classList.remove('rect-blink');
        area.remove();  // Remova o elemento completamente
    });

    const rect = img.getBoundingClientRect();
    const scaleX = rect.width / img.naturalWidth;
    const scaleY = rect.height / img.naturalHeight;

    const scaledCoords = coords.map((coord, index) =>
        index % 2 === 0 ? coord * scaleX : coord * scaleY
    );

    if (shape === 'rect') {
        highlightDiv.classList.remove('blinking-area');
        highlightDiv.classList.add('rect-blink');  // Classe para piscar sem transparência

        highlightDiv.style.left = rect.left + window.scrollX + scaledCoords[0] + 'px';
        highlightDiv.style.top = rect.top + window.scrollY + scaledCoords[1] + 'px';
        highlightDiv.style.width = scaledCoords[2] - scaledCoords[0] + 'px';
        highlightDiv.style.height = scaledCoords[3] - scaledCoords[1] + 'px';
        highlightDiv.style.backgroundColor = 'yellow'; // Cor inicial
        highlightDiv.style.position = 'absolute'; // Certifique-se de que o retângulo seja posicionado corretamente
        highlightDiv.style.zIndex = '1000'; // Garante que o retângulo fique acima de outros elementos
    } else if (shape === 'circle') {
        const radius = scaledCoords[2];
        highlightDiv.classList.add('blinking-area');
        highlightDiv.style.left = rect.left + window.scrollX + scaledCoords[0] - radius + 'px';
        highlightDiv.style.top = rect.top + window.scrollY + scaledCoords[1] - radius + 'px';
        highlightDiv.style.width = radius * 2 + 'px';
        highlightDiv.style.height = radius * 2 + 'px';
        highlightDiv.style.borderRadius = '50%';
        highlightDiv.style.position = 'absolute';
        highlightDiv.style.zIndex = '1000'; // Para garantir que o círculo também fique visível acima de outros elementos
    }
}

resizeHighlightArea();
window.addEventListener('resize', resizeHighlightArea);

    }
}





// Função para lidar com respostas do usuário
function handleAnswer(isCorrect, button) {
    // Desabilita todos os botões de resposta para evitar múltiplos cliques
    const answerButtons = document.querySelectorAll('.answer-button');
    answerButtons.forEach(button => {
        button.disabled = true;  // Desativa os botões
    });

    if (isCorrect) {
        button.style.backgroundColor = 'green'; // Marca a opção correta como verde
    } else {
        button.style.backgroundColor = 'red'; // Marca a opção errada como vermelha

        // Encontra e marca a opção correta como verde
        answerButtons.forEach(btn => {
            if (btn.textContent === selectedQuestions[currentQuestionIndex].resposta) {
                btn.style.backgroundColor = 'green'; // Marca a resposta correta como verde
            }
        });
    }


    // Aguarda 2 segundos antes de ir para a próxima pergunta
    setTimeout(() => {
        currentQuestionIndex++;
        
        if (currentQuestionIndex >= selectedQuestions.length) {
            showFinalScore(); // Exibe a pontuação final
        } else {
            // Reativa os botões para a próxima pergunta
            answerButtons.forEach(button => {
                button.disabled = false;  // Reativa os botões
            });
            showQuestion(); // Exibe a próxima pergunta
        }
    }, 2000);
}

// Pega os elementos do modal e botões
const modal = document.getElementById("modal");
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");

// Função para exibir o modal com a pontuação final
function showFinalScore() {

    // Remove todos os elementos piscantes (rect-blink, blinking-area)
    const blinkingAreas = document.querySelectorAll('.rect-blink, .blinking-area');
    blinkingAreas.forEach(area => area.remove());  // Remove todos os elementos piscantes

    // Mostra o modal com a pontuação final
    document.getElementById('modal-message').textContent = `Sua pontuação foi ${score}/${selectedQuestions.length}`;
    modal.style.display = "flex";  // Mostra o modal com flexbox

    // Reativa todos os botões de resposta ao reiniciar o jogo
    reativarBotoesResposta(); // Função para reativar os botões

       // Botão de reiniciar reabre o modal de seleção de assuntos
    restartBtn.onclick = () => {
        modal.style.display = 'none'; // Oculta o modal de pontuação final
        openAssuntoModal(); // Reabre o menu de seleção de assuntos
    };

    // Botão de sair fecha a janela do app
    exitBtn.onclick = () => {
        window.close();
    };
}

// Função para reiniciar o jogo após o usuário confirmar a seleção
document.getElementById('confirmarBtn').addEventListener('click', () => {
    const selectedQuestions = filterQuestionsBySelection(window.questions);

    if (selectedQuestions.length > 0) {
        initGame(selectedQuestions);  // Inicializa o jogo com as questões filtradas
        closeAssuntoModal();  // Fecha o modal após a seleção
    } else {
        alert("Selecione ao menos um assunto ou subassunto.");  // Validação para evitar iniciar sem seleção
    }
});
// Função para reativar os botões de resposta
function reativarBotoesResposta() {
    const answerButtons = document.querySelectorAll('.answer-button');
    answerButtons.forEach(button => {
        button.disabled = false;  // Reativa os botões
        button.style.backgroundColor = ''; // Reseta qualquer cor dos botões
    });
}


// Função auxiliar para embaralhar array (utilizada para embaralhar respostas)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

