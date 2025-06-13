const grid = document.getElementById("grid")
const button = document.getElementById("mode")
const setButton = document.getElementById("set")

const random = document.getElementById("random")
const random2 = document.getElementById("random-2")

let mode = "reverse"
let gridSize = [5, 5]
let cells = []

// モード切り替え
button.onclick = () => {
    mode = mode === "reverse" ? "write" : "reverse"
    button.textContent = `mode: ${mode}`
}

// グリッドサイズ設定
setButton.onclick = () => {
    const [rowInput, colInput] = document.querySelectorAll(".setting input")
    generateGrid(Number(rowInput.value), Number(colInput.value))
}

random.onclick = () => {
    cells.forEach((cell) => {
        cell.classList.remove("on")
    })

    cells.forEach((cell) => {
        if (Math.random() < 0.5) {
            cell.click()
        }
    })
}

random2.onclick = () => {
    cells.forEach((cell) => {
        cell.classList.toggle("on", Math.random() < 0.5)
    })
}

// 初期化
generateGrid(...gridSize)

// グリッド生成
function generateGrid(rows, cols) {
    gridSize = [rows, cols]
    cells = []
    grid.innerHTML = "" // グリッドをクリア
    document.getElementById("clicked").innerHTML = "" // クリック履歴をクリア

    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = createCell(row, col)
            grid.appendChild(cell)
            cells.push(cell)
        }
    }
}

// セル生成
function createCell(row, col) {
    const cell = document.createElement("div")
    cell.classList.add("cell")
    cell.dataset.row = row
    cell.dataset.col = col
    cell.addEventListener("click", () => handleCellClick(row, col))
    return cell
}

// セルクリック時の処理
function handleCellClick(row, col) {
    if (mode === "reverse") {
        toggleLights(row, col)
    } else if (mode === "write") {
        toggleCell(row, col)
    }
}

// ライトの切り替え
function toggleLights(row, col) {
    logClickedCell(row, col)

    for (let r = Math.max(row - 1, 0); r < Math.min(row + 2, gridSize[0]); r++) {
        for (let c = Math.max(col - 1, 0); c < Math.min(col + 2, gridSize[1]); c++) {
            toggleCell(r, c)
        }
    }
}

// セルの状態を切り替え
function toggleCell(row, col) {
    if (isValidCell(row, col)) {
        const cell = getCell(row, col)
        cell?.classList.toggle("on")
    }
}

// セルが有効か確認
function isValidCell(row, col) {
    return row >= 0 && row < gridSize[0] && col >= 0 && col < gridSize[1]
}

// セルを取得
function getCell(row, col) {
    return cells.find((cell) => cell.dataset.row == row && cell.dataset.col == col)
}

// クリックされたセルを記録
function logClickedCell(row, col) {
    const clicked = document.getElementById("clicked")
    clicked.innerHTML += clicked.innerHTML ? `, [${row}, ${col}]` : `[${row}, ${col}]`
}
