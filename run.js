const grid = document.getElementById("grid")
const button = document.getElementById("mode")

const set = document.getElementById("set")

button.onclick = () => {
    if (mode === "reverse") {
        mode = "write"
        button.textContent = "mode:" + mode
    } else if (mode === "write") {
        mode = "reverse"
        button.textContent = "mode:" + mode
    }
}

set.onclick = () => {
    const [row, col] = document.querySelectorAll(".setting input")

    console.log(row, col)
    generateCells(row.value, col.value)
}

let mode = "reverse"
let gridSize = [5, 5]

// Create the grid
let cells = []

function generateCells(ROW, COL) {
    gridSize = [ROW, COL]

    document.getElementById("clicked").innerHTML = ""

    cells = []
    grid.innerHTML = "" // Clear the grid

    grid.style.gridTemplateColumns = `repeat(${COL}, 1fr)`

    for (let row = 0; row < ROW; row++) {
        for (let col = 0; col < COL; col++) {
            const cell = document.createElement("div")
            cell.classList.add("cell")
            cell.dataset.row = row
            cell.dataset.col = col
            cell.addEventListener("click", () => {
                if (mode === "reverse") {
                    toggleLights(row, col)
                } else if (mode === "write") {
                    toggleCell(row, col)
                }
            })
            grid.appendChild(cell)
            cells.push(cell)
        }
    }
}

// Initialize the grid
generateCells(...gridSize)

// Toggle lights
function toggleLights(row, col) {
    const clicked = document.getElementById("clicked")
    if (clicked.innerHTML !== "") clicked.innerHTML += ", "
    clicked.innerHTML += `[${row}, ${col}]`

    for (let r = Math.max(row - 1, 0); r < Math.min(row + 2, gridSize[0]); r++) {
        for (let c = Math.max(col - 1, 0); c < Math.min(col + 2, gridSize[1]); c++) {
            toggleCell(r, c)
        }
    }
}

function toggleCell(row, col) {
    if (row < 0 || row >= gridSize[0] || col < 0 || col >= gridSize[1]) return
    const cell = cells.find((cell) => cell.dataset["row"] == row && cell.dataset["col"] == col)
    cell?.classList.toggle("on")
}
