const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const speedRange = document.getElementById('speedRange');

const cellSize = 10;  // Tamaño de cada celda en píxeles
const rows = 200;     // Número de filas
const cols = 200;     // Número de columnas
const patternCategory = document.getElementById('patternCategory');
const patternSelect = document.getElementById('patternSelect');
const startPresetButton = document.getElementById('startPresetButton');
const patterns = {
    oscillators: {
        blinker: [
            [1, 1, 1],
        ],
        toad: [
            [0, 1, 1, 1],
            [1, 1, 1, 0],
        ],
    },
    spaceships: {
        glider: [
            [0, 0, 1],
            [1, 0, 1],
            [0, 1, 1],
        ],
        lightweight_spaceship: [
            [0, 1, 1, 1],
            [1, 0, 0, 1],
            [0, 1, 1, 0],
        ],
    },
};

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

// Crea una cuadrícula vacía (2D array)
let grid = createGrid(rows, cols);

// Función para crear una cuadrícula vacía
function createGrid(rows, cols) {
    return new Array(rows).fill(null).map(() => new Array(cols).fill(0));
}

// Dibuja la cuadrícula con bordes, fondo negro y células blancas
function drawGrid(grid) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas antes de dibujar
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.strokeStyle = 'gray'; // Color del borde
            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
            if (grid[row][col] === 1) {
                ctx.fillStyle = 'white'; // Celdas vivas en blanco
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Manejar el clic en el canvas para alternar el estado de las celdas
function handleCellClick(x, y) {
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    // Alternar el estado de la celda (viva/muerta)
    grid[row][col] = grid[row][col] === 1 ? 0 : 1;
    drawGrid(grid);  // Redibujar la cuadrícula después de cambiar el estado
}

// Manejar el arrastre del mouse para crear celdas como un pincel
function handleMouseDrag(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    // Asegurarse de que no se salga de los límites
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
        grid[row][col] = 1; // Crear una celda viva
        drawGrid(grid);  // Redibujar la cuadrícula después de cambiar el estado
    }
}

// Evento de mouse para crear celdas con clic izquierdo
canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Verifica que el clic sea del botón izquierdo
        handleCellClick(event.clientX - canvas.getBoundingClientRect().left, event.clientY - canvas.getBoundingClientRect().top);
        canvas.addEventListener('mousemove', handleMouseDrag); // Comienza a arrastrar
    }
});

// Detener el arrastre al soltar el botón del mouse
canvas.addEventListener('mouseup', () => {
    canvas.removeEventListener('mousemove', handleMouseDrag); // Detener el arrastre
});

// Función para contar vecinos vivos
function countNeighbors(grid, row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;  // No contar la celda actual
            const x = row + i;
            const y = col + j;
            if (x >= 0 && x < rows && y >= 0 && y < cols) {
                count += grid[x][y];
            }
        }
    }
    return count;
}

// Función para actualizar la cuadrícula
function updateGrid(grid) {
    let newGrid = createGrid(rows, cols);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const isAlive = grid[row][col] === 1;
            const neighbors = countNeighbors(grid, row, col);

            // Aplicar reglas de Conway
            if (isAlive) {
                if (neighbors < 2 || neighbors > 3) {
                    newGrid[row][col] = 0;  // Muere
                } else {
                    newGrid[row][col] = 1;  // Sobrevive
                }
            } else {
                if (neighbors === 3) {
                    newGrid[row][col] = 1;  // Nace
                }
            }
        }
    }

    return newGrid;
}

// Variables para controlar el estado de la simulación
let isRunning = false;
let isPaused = false; // Estado de pausa
let intervalId;

// Función para iniciar la simulación
function startSimulation() {
    if (isRunning) return;  // Evitar que se inicie varias veces

    isRunning = true;
    startButton.disabled = true;  // Deshabilitar el botón de inicio
    pauseButton.disabled = false;  // Habilitar el botón de pausa
    stopButton.disabled = false;   // Habilitar el botón de detener

    // Actualizar la cuadrícula en intervalos regulares
    intervalId = setInterval(() => {
        if (!isPaused) { // Solo actualizar si no está en pausa
            grid = updateGrid(grid);
            drawGrid(grid);
        }
    }, parseInt(speedRange.value));  // Usa el valor del control deslizante
}

// Función para pausar la simulación
function pauseSimulation() {
    if (!isRunning || isPaused) return;  // No hacer nada si no está en ejecución o ya está en pausa

    isPaused = true;
    pauseButton.textContent = 'Reanudar'; // Cambia el texto del botón a "Reanudar"
}

// Función para reanudar la simulación
function resumeSimulation() {
    isPaused = false;
    pauseButton.textContent = 'Pausar'; // Cambia el texto del botón a "Pausar"
}

// Función para detener la simulación
function stopSimulation() {
    isRunning = false;
    clearInterval(intervalId);
    grid = createGrid(rows, cols); // Limpiar la cuadrícula
    drawGrid(grid); // Limpiar el canvas
    startButton.disabled = false;  // Habilitar el botón de inicio
    pauseButton.disabled = true;    // Deshabilitar el botón de pausa
    stopButton.disabled = true;     // Deshabilitar el botón de detener
}

// Asignar eventos a los botones
startButton.addEventListener('click', startSimulation);
pauseButton.addEventListener('click', () => {
    if (isPaused) {
        resumeSimulation();
    } else {
        pauseSimulation();
    }
});
stopButton.addEventListener('click', stopSimulation);
speedRange.addEventListener('input', () => {
    if (isRunning) {
        clearInterval(intervalId); // Detener el intervalo actual
        intervalId = setInterval(() => {
            if (!isPaused) {
                grid = updateGrid(grid);
                drawGrid(grid);
            }
        }, parseInt(speedRange.value)); // Reiniciar el intervalo con el nuevo valor
    }
});

// Cargar patrones en el segundo selector
patternCategory.addEventListener('change', () => {
    const selectedCategory = patternCategory.value;
    patternSelect.innerHTML = '<option value="">--Selecciona un patrón--</option>'; // Limpiar opciones

    if (selectedCategory) {
        Object.keys(patterns[selectedCategory]).forEach(pattern => {
            const option = document.createElement('option');
            option.value = pattern;
            option.textContent = pattern.charAt(0).toUpperCase() + pattern.slice(1);
            patternSelect.appendChild(option);
        });
        patternSelect.disabled = false;
    } else {
        patternSelect.disabled = true;
        startPresetButton.disabled = true; // Deshabilitar el botón si no hay categoría seleccionada
    }
});

// Habilitar el botón de iniciar preset si se selecciona un patrón
patternSelect.addEventListener('change', () => {
    startPresetButton.disabled = !patternSelect.value; // Habilitar si hay un patrón seleccionado
});

// Iniciar preset y cargar el patrón seleccionado
startPresetButton.addEventListener('click', () => {
    const selectedPattern = patterns[patternCategory.value][patternSelect.value];

    // Llenar el grid con el patrón seleccionado
    for (let row = 0; row < selectedPattern.length; row++) {
        for (let col = 0; col < selectedPattern[row].length; col++) {
            if (selectedPattern[row][col] === 1) {
                grid[row + 50][col + 50] = 1; // Ajusta la posición para centrar el patrón
            }
        }
    }

    drawGrid(grid); // Redibujar el canvas
    startSimulation(); // Iniciar la simulación
    startPresetButton.disabled = true; // Deshabilitar el botón de iniciar preset
});


drawGrid(grid);  // Dibuja la cuadrícula inicial
