// ========================================
// TETRIS
// ========================================

console.log("TETRIS JS CARGADO");

// ========================================
// CANVAS
// ========================================

const canvas = document.getElementById("tetris");

const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const SIZE = 30;

ctx.scale(SIZE, SIZE);

// ========================================
// COLORES
// ========================================

const COLORS = [
    null,

    "#00f0f0",

    "#0000ff",

    "#ff8800",

    "#ffff00",

    "#00ff00",

    "#da0000",

    "#ff0000"
];

// ========================================
// PIEZAS
// ========================================

const PIECES = [

    // I
    [
        [1, 1, 1, 1]
    ],

    // J
    [
        [2, 0, 0],
        [2, 2, 2]
    ],

    // L
    [
        [0, 0, 3],
        [3, 3, 3]
    ],

    // O
    [
        [4, 4],
        [4, 4]
    ],

    // S
    [
        [0, 5, 5],
        [5, 5, 0]
    ],

    // T
    [
        [0, 6, 0],
        [6, 6, 6]
    ],

    // Z
    [
        [7, 7, 0],
        [0, 7, 7]
    ]
];

// ========================================
// TABLERO
// ========================================

function createBoard() {

    return Array.from(
        {
            length: ROWS
        },

        () =>
            Array(COLS).fill(0)
    );
}

let board = createBoard();

// ========================================
// JUGADOR
// ========================================

const player = {

    matrix: null,

    x: 0,

    y: 0,

    score: 0,

    lines: 0,

    level: 1
};

// ========================================
// VARIABLES
// ========================================

let running = false;

let paused = false;

let dropCounter = 0;

let lastTime = 0;

let dropInterval = 800;

// ========================================
// CREAR PIEZA
// ========================================

function createPiece() {

    const random =
        Math.floor(
            Math.random() *
            PIECES.length
        );

    return PIECES[random].map(
        row => [...row]
    );
}

// ========================================
// DIBUJAR
// ========================================

function drawBlock(x, y, color) {

    ctx.fillStyle = COLORS[color];

    ctx.fillRect(
        x,
        y,
        1,
        1
    );

    ctx.strokeStyle =
        "rgba(0,0,0,0.4)";

    ctx.lineWidth = 0.05;

    ctx.strokeRect(
        x,
        y,
        1,
        1
    );
}

// ========================================
// DIBUJAR MATRIZ
// ========================================

function drawMatrix(matrix, x, y) {

    matrix.forEach(
        (row, rowY) => {

            row.forEach(
                (value, colX) => {

                    if (value !== 0) {

                        drawBlock(
                            colX + x,
                            rowY + y,
                            value
                        );
                    }

                }
            );

        }
    );
}

// ========================================
// DIBUJAR TABLERO
// ========================================

function draw() {

    ctx.fillStyle = "#050509";

    ctx.fillRect(
        0,
        0,
        COLS,
        ROWS
    );

    drawMatrix(
        board,
        0,
        0
    );

    if (player.matrix) {

        drawMatrix(
            player.matrix,
            player.x,
            player.y
        );
    }
}

// ========================================
// COLISIÓN
// ========================================

function collision() {

    const matrix =
        player.matrix;

    for (
        let y = 0;
        y < matrix.length;
        y++
    ) {

        for (
            let x = 0;
            x < matrix[y].length;
            x++
        ) {

            if (
                matrix[y][x] === 0
            ) {

                continue;
            }

            const newX =
                player.x + x;

            const newY =
                player.y + y;

            // Pared izquierda
            if (newX < 0) {

                return true;
            }

            // Pared derecha
            if (newX >= COLS) {

                return true;
            }

            // Piso
            if (newY >= ROWS) {

                return true;
            }

            // Bloques
            if (
                newY >= 0 &&
                board[newY][newX] !== 0
            ) {

                return true;
            }
        }
    }

    return false;
}

// ========================================
// UNIR PIEZA
// ========================================

function merge() {

    player.matrix.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (value !== 0) {

                        board[
                            player.y + y
                        ][
                            player.x + x
                        ] = value;
                    }

                }
            );

        }
    );
}

// ========================================
// LIMPIAR LÍNEAS
// ========================================

function clearLines() {

    let cleared = 0;

    for (
        let y = ROWS - 1;
        y >= 0;
        y--
    ) {

        let complete = true;

        for (
            let x = 0;
            x < COLS;
            x++
        ) {

            if (
                board[y][x] === 0
            ) {

                complete = false;

                break;
            }
        }

        if (complete) {

            board.splice(y, 1);

            board.unshift(
                Array(COLS).fill(0)
            );

            cleared++;

            y++;
        }
    }

    if (cleared > 0) {

        const points = [
            0,
            100,
            300,
            500,
            800
        ];

        player.score +=
            points[cleared] *
            player.level;

        player.lines +=
            cleared;

        player.level =
            Math.floor(
                player.lines / 10
            ) + 1;

        dropInterval =
            Math.max(
                100,
                800 -
                (
                    player.level - 1
                ) * 60
            );

        updateStats();
    }
}

// ========================================
// MOVER
// ========================================

function move(direction) {

    if (
        !running ||
        paused
    ) {

        return;
    }

    player.x += direction;

    if (collision()) {

        player.x -= direction;
    }
}

// ========================================
// BAJAR
// ========================================

function drop() {

    if (
        !running ||
        paused
    ) {

        return;
    }

    player.y++;

    if (collision()) {

        player.y--;

        merge();

        clearLines();

        resetPlayer();
    }

    dropCounter = 0;
}

// ========================================
// CAÍDA RÁPIDA
// ========================================

function hardDrop() {

    if (
        !running ||
        paused
    ) {

        return;
    }

    let distance = 0;

    while (!collision()) {

        player.y++;

        distance++;
    }

    player.y--;

    player.score +=
        distance * 2;

    merge();

    clearLines();

    resetPlayer();

    updateStats();

    dropCounter = 0;
}

// ========================================
// ROTAR
// ========================================

function rotateMatrix(matrix) {

    const result = [];

    for (
        let x = 0;
        x < matrix[0].length;
        x++
    ) {

        result[x] = [];

        for (
            let y = matrix.length - 1;
            y >= 0;
            y--
        ) {

            result[x].push(
                matrix[y][x]
            );
        }
    }

    return result;
}

// ========================================
// ROTAR JUGADOR
// ========================================

function rotatePlayer() {

    if (
        !running ||
        paused
    ) {

        return;
    }

    const oldMatrix =
        player.matrix;

    const oldX =
        player.x;

    player.matrix =
        rotateMatrix(
            player.matrix
        );

    if (!collision()) {

        return;
    }

    player.x--;

    if (!collision()) {

        return;
    }

    player.x += 2;

    if (!collision()) {

        return;
    }

    player.x = oldX;

    player.matrix =
        oldMatrix;
}

// ========================================
// NUEVA PIEZA
// ========================================

function resetPlayer() {

    player.matrix =
        createPiece();

    player.x =
        Math.floor(
            COLS / 2
        ) -
        Math.floor(
            player.matrix[0].length / 2
        );

    player.y = 0;

    if (collision()) {

        gameOver();
    }
}

// ========================================
// ESTADÍSTICAS
// ========================================

function updateStats() {

    document.getElementById(
        "score"
    ).textContent =
        player.score;

    document.getElementById(
        "level"
    ).textContent =
        player.level;

    document.getElementById(
        "lines"
    ).textContent =
        player.lines;
}

// ========================================
// GAME OVER
// ========================================

function gameOver() {

    running = false;

    paused = false;

    setTimeout(
        () => {

            alert(
                "GAME OVER\n\n" +
                "Puntaje: " +
                player.score
            );

        },
        100
    );
}

// ========================================
// INICIAR
// ========================================

function startGame() {

    board =
        createBoard();

    player.score = 0;

    player.lines = 0;

    player.level = 1;

    dropInterval = 800;

    dropCounter = 0;

    running = true;

    paused = false;

    document.getElementById(
        "pause"
    ).textContent =
        "⏸ PAUSAR";

    resetPlayer();

    updateStats();
}

// ========================================
// PAUSA
// ========================================

function pauseGame() {

    if (!running) {

        return;
    }

    paused = !paused;

    document.getElementById(
        "pause"
    ).textContent =
        paused
            ? "▶ CONTINUAR"
            : "⏸ PAUSAR";
}

// ========================================
// BOTONES
// ========================================

document.getElementById(
    "start"
).addEventListener(
    "click",
    startGame
);

document.getElementById(
    "pause"
).addEventListener(
    "click",
    pauseGame
);

document.getElementById(
    "restart"
).addEventListener(
    "click",
    startGame
);

// ========================================
// TECLADO
// ========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "ArrowLeft"
        ) {

            event.preventDefault();

            move(-1);
        }

        else if (
            event.key === "ArrowRight"
        ) {

            event.preventDefault();

            move(1);
        }

        else if (
            event.key === "ArrowDown"
        ) {

            event.preventDefault();

            drop();
        }

        else if (
            event.key === "ArrowUp"
        ) {

            event.preventDefault();

            rotatePlayer();
        }

        else if (
            event.code === "Space"
        ) {

            event.preventDefault();

            hardDrop();
        }

        else if (
            event.key === "p" ||
            event.key === "P"
        ) {

            pauseGame();
        }
    }
);

// ========================================
// LOOP
// ========================================

function update(time = 0) {

    const delta =
        time - lastTime;

    lastTime = time;

    if (
        running &&
        !paused
    ) {

        dropCounter += delta;

        if (
            dropCounter >=
            dropInterval
        ) {

            drop();

        }
    }

    draw();

    requestAnimationFrame(
        update
    );
}

// ========================================
// INICIAR LOOP
// ========================================

update();