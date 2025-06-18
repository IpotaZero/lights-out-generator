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

    getAnswer() {
        this.cells.forEach((cell) => {
            cell.classList.remove("answer")
        })

        const b = this.cells.map((cell) => (cell.classList.contains("on") ? 1 : 0))

        const M = this.createPreset(...this.gridSize)

        // console.log(math.det(M))

        const lu = this.LU(M)

        // console.log(lu)

        // const trueLP = math.lup(M)

        // console.log(trueLP)

        // lu.L.forEach((row, i) => {
        //     if (row.join() !== trueLP.L[i].join()) console.log(i)
        // })

        try {
            const p = Array.from({ length: lu.P.length }, (_, i) => {
                const row = Array(lu.P.length).fill(0)
                row[lu.P[i]] = 1
                return row
            })

            // console.log(math.multiply(math.inv(p), math.multiply(lu.L, lu.U)))

            const Pb = math.multiply(p, b)

            const invL = math.inv(lu.L)

            const y = math.multiply(invL, Pb).map((num) => (num + 100) % 2)

            // console.log(lu.L)
            // console.log(invL)
            // console.log(lu.U, y)

            const answer = this.resolve(lu.U, y)

            if (answer instanceof Error) {
                throw answer
            }

            // console.log(answer)

            answer.forEach((value, i) => {
                if (Math.abs(Math.round(value) % 2) !== 0) {
                    this.cells[i].classList.add("answer")
                }
            })
        } catch (error) {
            alert("分かんないっピ。。。")
            console.error(error)
        }
    }

    resolve(u, y) {
        const l = y.length
        const x = Array(l).fill(0)

        for (let i = 0; i < l; i++) {
            const m = l - i - 1

            const allZero = u[m].every((num) => num === 0)
            if (allZero) {
                if (y[m] !== 0) {
                    return new Error("解けない!")
                }

                continue
            }

            if (u[m][m] === 0) continue

            x[m] = (y[m] - this.dot(u[m].slice(m + 1), x.slice(m + 1))) / u[m][m]
        }

        return x
    }

    dot(x, y) {
        if (x.length !== y.length) {
            throw new Error("Vectors must be of the same length")
        }
        return x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    }

    LU(A) {
        const n = A.length
        const L = Array.from({ length: n }, (_, i) => Array(n).fill(0))
        const U = A.map((row) => row.slice())
        const P = [...Array(n).keys()] // Pivot tracking

        // console.log(A)

        for (let k = 0; k < n; k++) {
            // Find pivot
            const pivot = U.slice(k).findIndex((row) => row[k] === 1) + k

            if (pivot === -1 + k) {
                // console.log(k)
                // throw new Error("Matrix is singular in GF(2)")
                L[k][k] = 1

                continue
            }

            // Swap rows if needed
            if (pivot !== k) {
                // console.log(`${k}行と${pivot}行を入れ替え`)
                ;[U[k], U[pivot]] = [U[pivot], U[k]]
                ;[L[k], L[pivot]] = [L[pivot], L[k]]
                ;[P[k], P[pivot]] = [P[pivot], P[k]]
            }

            L[k][k] = 1

            // 簡約化していく
            for (let i = k + 1; i < n; i++) {
                if (U[i][k] === 1) {
                    // console.log(`${i}行目に${k}行と同じく1の奴を発見`)

                    L[i][k] = 1

                    // i行目にk行目を加える
                    for (let j = k; j < n; j++) {
                        U[i][j] ^= U[k][j]
                    }
                }
            }

            // console.log(JSON.stringify(U))
        }

        return { L, U, P }
    }

    createPreset(rows, cols) {
        const matrix = []

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const pattern = Array(rows * cols).fill(0)

                // Toggle the clicked cell
                // pattern[row * cols + col] = 1

                // Toggle the surrounding cells based on the current mode
                if (this.mode === 0) {
                    // Square mode
                    for (let r = Math.max(row - 1, 0); r < Math.min(row + 2, rows); r++) {
                        for (let c = Math.max(col - 1, 0); c < Math.min(col + 2, cols); c++) {
                            pattern[r * cols + c] = 1
                        }
                    }
                } else if (this.mode === 1) {
                    // Cross mode
                    pattern[row * cols + col] = 1
                    if (row > 0) pattern[(row - 1) * cols + col] = 1
                    if (row < rows - 1) pattern[(row + 1) * cols + col] = 1
                    if (col > 0) pattern[row * cols + (col - 1)] = 1
                    if (col < cols - 1) pattern[row * cols + (col + 1)] = 1
                } else if (this.mode === 2) {
                    pattern[row * cols + col] = 1
                }

                matrix.push(pattern)
            }
        }

        return matrix
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
        this.cells.forEach((cell) => {
            cell.classList.remove("answer")
            cell.classList.remove("on")
        })
        this.cells.forEach((cell) => {
            if (Math.random() < 0.5) {
                cell.click()
            }
        })
    }

    randomToggle() {
        this.cells.forEach((cell) => {
            cell.classList.remove("answer")
        })
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

document.getElementById("resolve").onclick = () => {
    game.getAnswer()
}
