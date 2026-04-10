let boxes = document.querySelectorAll(".box");
let resetbtn = document.querySelector("#rst-btn");
let newGamebtn = document.querySelector("#new-btn"); // fixed selector from user's original
let msgContainer = document.querySelector("#msg-container");
let msg = document.querySelector("#msg");
let difficultySelect = document.querySelector("#difficulty");

let turn0 = true; // playerX, player0
let gameActive = true;

const winpatterns = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8],
];

const resetGame = () => {
    turn0 = true;
    gameActive = true;
    enableboxes();
    msgContainer.classList.add("hide");
};

const disableBoxes = () => {
    for (let box of boxes) {
        box.disabled = true;
    }
};

const enableboxes = () => {
    for (let box of boxes) {
        box.disabled = false;
        box.innerText = "";
    }
};

const showWinner = (winner) => {
    if (winner === "Draw") {
        msg.innerText = "It's a Draw!";
    } else {
        msg.innerText = `congratulations , Winner is ${winner}`;  // as per the user's requirement
    }
    msgContainer.classList.remove("hide");
    disableBoxes();
    gameActive = false;
};

const checkWinner = () => {
    for (let pattern of winpatterns) {
        let pos1val = boxes[pattern[0]].innerText;
        let pos2val = boxes[pattern[1]].innerText;
        let pos3val = boxes[pattern[2]].innerText;

        if (pos1val != "" && pos2val != "" && pos3val != "") {
            if (pos1val === pos2val && pos2val === pos3val) {
                console.log("winner", pos1val);
                showWinner(pos1val);
                return pos1val;
            }
        }
    }
    
    // Check for draw
    let isDraw = true;
    for (let box of boxes) {
        if (box.innerText === "") {
            isDraw = false;
        }
    }
    if (isDraw) {
        showWinner("Draw");
        return "Draw";
    }
    return null;
};

boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
        if (box.innerText !== "" || !gameActive) return;

        console.log("box was clicked");

        if (turn0) {
            box.innerText = "O";
            turn0 = false;
        } else {
            box.innerText = "X";
            turn0 = true;
        }
        box.disabled = true;

        let result = checkWinner();
        
        // AI Turn
        let mode = difficultySelect.value;
        if (result === null && mode !== 'pvp' && !turn0) { // If it's Computer's turn (X)
            gameActive = false;
            setTimeout(() => {
                makeAiMove(mode);
                if (msgContainer.classList.contains("hide")) {
                    gameActive = true;
                }
            }, 500);
        }
    });
});

newGamebtn.addEventListener("click", resetGame);
resetbtn.addEventListener("click", resetGame);

difficultySelect.addEventListener("change", resetGame);

// --- AI LOGIC ---

function makeAiMove(difficulty) {
    let boardState = Array.from(boxes).map(box => box.innerText);
    let availableMoves = [];
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === "") availableMoves.push(i);
    }
    if (availableMoves.length === 0) return;

    let moveIndex;

    if (difficulty === 'easy') {
        moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (difficulty === 'medium') {
        if (Math.random() < 0.5) {
            moveIndex = getBestMove(boardState, "X");
        } else {
            moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    } else if (difficulty === 'hard') {
        if (Math.random() < 0.8) {
            moveIndex = getBestMove(boardState, "X");
        } else {
            moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    } else { // expert
        moveIndex = getBestMove(boardState, "X");
    }

    // Apply the chosen move
    if (moveIndex !== undefined && moveIndex !== -1) {
        boxes[moveIndex].innerText = "X";
        boxes[moveIndex].disabled = true;
        turn0 = true; // Switch back to 'O'
        checkWinner();
    }
}

function getBestMove(board, player) {
    let bestScore = -Infinity;
    let move = -1;

    // Fast heuristic
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = player;
            if (checkSimulatedWinner(board) === player) return i;
            board[i] = "";
        }
    }
    
    let opponent = player === "X" ? "O" : "X";
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = opponent;
            if (checkSimulatedWinner(board) === opponent) return i;
            board[i] = "";
        }
    }

    // Minimax
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = player;
            let score = minimax(board, 0, false, player);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    if (move === -1) {
       for (let i = 0; i < board.length; i++) {
           if (board[i] === "") return i;
       }
    }
    return move;
}

function checkSimulatedWinner(board) {
    for (let pattern of winpatterns) {
        let [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (!board.includes("")) return "Draw";
    return null;
}

function minimax(currBoard, depth, isMaximizing, aiPlayer) {
    let result = checkSimulatedWinner(currBoard);
    if (result !== null) {
        if(result === aiPlayer) return 10 - depth;
        if(result === "Draw") return 0;
        return -10 + depth;
    }

    let humanPlayer = aiPlayer === "X" ? "O" : "X";

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < currBoard.length; i++) {
            if (currBoard[i] === "") {
                currBoard[i] = aiPlayer;
                let score = minimax(currBoard, depth + 1, false, aiPlayer);
                currBoard[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < currBoard.length; i++) {
            if (currBoard[i] === "") {
                currBoard[i] = humanPlayer;
                let score = minimax(currBoard, depth + 1, true, aiPlayer);
                currBoard[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}