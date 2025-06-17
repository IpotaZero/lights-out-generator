class LightsOutGame {
    constructor(gridElement, buttonElement, setButtonElement, randomButtons) {
        this.grid = gridElement
        this.modeButton = buttonElement
        this.setButton = setButtonElement
        this.randomButtons = randomButtons
        this.mode = 0
        this.gridSize = [5, 5]
        this.cells = []

        this.init()
    }

    init() {
        this.modeButton.onclick = () => this.changeMode()
        this.setButton.onclick = () => this.setGridSize()
        this.randomButtons[0].onclick = () => this.randomMode(0)
        this.randomButtons[1].onclick = () => this.randomMode(1)
        this.randomButtons[2].onclick = () => this.randomToggle()

        this.generateGrid(...this.gridSize)
    }

    changeMode() {
        this.mode = (this.mode + 1) % 3
        this.updateModeLabel()
    }

    setGridSize() {
        const [rowInput, colInput] = document.querySelectorAll(".setting input")
        this.generateGrid(Number(rowInput.value), Number(colInput.value))
    }

    updateModeLabel() {
        this.modeButton.textContent = `mode: ${["square", "cross", "point"][this.mode]}`
    }

    randomMode(mode) {
        this.mode = mode
        this.updateModeLabel()
        this.randomClick()
    }

    randomClick() {
        this.cells.forEach((cell) => cell.classList.remove("on"))
        this.cells.forEach((cell) => {
            if (Math.random() < 0.5) {
                cell.click()
            }
        })
    }

    randomToggle() {
        this.cells.forEach((cell) => {
            cell.classList.toggle("on", Math.random() < 0.5)
        })
    }

    generateGrid(rows, cols) {
        this.gridSize = [rows, cols]
        this.cells = []
        this.grid.innerHTML = "" // Clear grid
        document.getElementById("clicked").innerHTML = "" // Clear click history

        this.grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = this.createCell(row, col)
                this.grid.appendChild(cell)
                this.cells.push(cell)
            }
        }
    }

    createCell(row, col) {
        const cell = document.createElement("div")
        cell.classList.add("cell")
        cell.dataset.row = row
        cell.dataset.col = col
        cell.addEventListener("click", () => this.handleCellClick(row, col))
        return cell
    }

    handleCellClick(row, col) {
        if (this.mode === 0) {
            this.toggleLightsSquare(row, col)
        } else if (this.mode === 1) {
            this.toggleLightsCross(row, col)
        } else if (this.mode === 2) {
            this.toggleCell(row, col)
        }
    }

    toggleLightsSquare(row, col) {
        this.logClickedCell(row, col)

        for (let r = Math.max(row - 1, 0); r < Math.min(row + 2, this.gridSize[0]); r++) {
            for (let c = Math.max(col - 1, 0); c < Math.min(col + 2, this.gridSize[1]); c++) {
                this.toggleCell(r, c)
            }
        }
    }

    toggleLightsCross(row, col) {
        this.logClickedCell(row, col)

        this.toggleCell(row, col)
        this.toggleCell(row - 1, col)
        this.toggleCell(row + 1, col)
        this.toggleCell(row, col - 1)
        this.toggleCell(row, col + 1)
    }

    toggleCell(row, col) {
        if (this.isValidCell(row, col)) {
            const cell = this.getCell(row, col)
            cell?.classList.toggle("on")
        }
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.gridSize[0] && col >= 0 && col < this.gridSize[1]
    }

    getCell(row, col) {
        return this.cells.find((cell) => cell.dataset.row == row && cell.dataset.col == col)
    }

    logClickedCell(row, col) {
        const clicked = document.getElementById("clicked")
        clicked.innerHTML += clicked.innerHTML ? `, [${row}, ${col}]` : `[${row}, ${col}]`
    }
}

// 初期化
const grid = document.getElementById("grid")
const button = document.getElementById("mode")
const setButton = document.getElementById("set")
const randomButtons = [
    document.getElementById("random-0"),
    document.getElementById("random-1"),
    document.getElementById("random-2"),
]

const game = new LightsOutGame(grid, button, setButton, randomButtons)
