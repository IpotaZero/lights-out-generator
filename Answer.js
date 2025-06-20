document.getElementById("left").onclick = () => {
    Answer.previous()
}

document.getElementById("right").onclick = () => {
    Answer.next()
}

document.getElementById("reverse").onclick = () => {
    Answer.reset()

    game.cells.forEach((cell) => {
        cell.classList.toggle("on")
    })
}

document.getElementById("resolve").onclick = () => {
    Answer.resolve()
}

document.getElementById("resolvable").onclick = () => {
    if (Answer.isResolvable()) {
        alert("解けるにゃ！")
    } else {
        alert("解けないにゃ。。。")
    }
}

const Answer = {
    isReady: false,

    xp: null,
    ker: null,
    kerNum: 0,

    lu: null,

    solutionNo: document.getElementById("solution-no"),

    ready() {
        const M = Resolver.createPreset(...game.gridSize, game.mode)
        this.lu = Resolver.LU(M)
        this.lu.invL = Resolver.inv(this.lu.L)

        this.ker = Resolver.getKernel(this.lu.U)
        this.kerNum = 0

        this.isReady = true
    },

    isResolvable() {
        if (!this.isReady) {
            this.ready()
        }

        const b = game.getBoardVector()

        // bがKerの直交補空間に入っている
        const bIsInKerPerp = this.ker.every((base) => Resolver.dot(base, b) % 2 === 0)

        return bIsInKerPerp
    },

    resolve() {
        this.resetBoardClass()

        const b = game.getBoardVector()

        if (!this.isReady) {
            this.ready()
        }

        const Pb = this.lu.P.map((i) => b[i])

        const y = math.multiply(this.lu.invL, Pb).map((num) => (num + 100) % 2)

        const xp = Resolver.resolveUx(this.lu.U, y)

        if (xp instanceof Error) {
            alert("解なしにゃ。。。")
            throw xp
        }

        this.xp = xp

        this.set()
    },

    set() {
        this.resetBoardClass()

        const cells = [...grid.children]

        const p = this.kerNum.toString(2).padStart(this.ker.length, "0")

        // console.log(p)

        const x = this.ker
            .filter((_, i) => p[i] === "1")
            .reduce((y, base) => y.map((x, i) => (x + base[i]) % 2), this.xp)

        x.forEach((value, i) => {
            if (value !== 0) {
                cells[i].classList.add("answer")
            }
        })

        this.solutionNo.innerHTML = "Solution No." + (this.kerNum + 1) + "/" + 2 + `<sup>${this.ker.length}</sup>`
    },

    resetBoardClass() {
        const cells = [...grid.children]
        cells.forEach((cell) => {
            cell.classList.remove("answer")
        })
    },

    reset() {
        this.isReady = false
        this.kerNum = 0
        this.resetBoardClass()
        this.solutionNo.innerText = "Solution No.0/0"
    },

    next() {
        if (!this.xp) {
            this.resolve()
        }

        this.kerNum = (this.kerNum + 1) % 2 ** this.ker.length
        this.set()
    },

    previous() {
        if (!this.xp) {
            this.resolve()
        }

        this.kerNum = (this.kerNum + 2 ** this.ker.length - 1) % 2 ** this.ker.length
        this.set()
    },
}

function test() {
    Array(100)
        .keys()
        .forEach((i) => {
            if (i === 0) return

            const M = Resolver.createPreset(i, i, 3)

            const { U } = Resolver.LU(M)

            if (!U[U.length - 1].every((cell) => cell == 0)) {
                console.log(i)
            }
        })
}
