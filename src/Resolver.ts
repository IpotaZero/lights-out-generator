class Resolver {
    // static testResolveUx() {
    //     this.#test0()
    //     this.#test1()
    //     this.#test2()
    // }

    // static #test0() {
    //     const u = [
    //         [1, 1, 0, 0],
    //         [0, 1, 1, 1],
    //         [0, 0, 1, 0],
    //         [0, 0, 0, 1],
    //     ]

    //     const x = [1, 1, 0, 0]
    //     const y = math.multiply(u, x)

    //     console.log(this.#resolveUx(u, y), x)
    //     console.log(this.#getKernel(u))
    // }

    // static #test1() {
    //     const u = [
    //         [1, 1, 0, 0, 0],
    //         [0, 1, 1, 1, 0],
    //         [0, 0, 1, 0, 0],
    //         [0, 0, 0, 1, 0],
    //         [0, 0, 0, 0, 0],
    //     ]

    //     const x = [1, 1, 0, 1, 0]
    //     const y = math.multiply(u, x)

    //     console.log(this.#resolveUx(u, y), x)
    //     console.log(this.#getKernel(u))
    // }

    // static #test2() {
    //     const u = [
    //         [1, 1, 0, 0, 0],
    //         [0, 1, 1, 1, 0],
    //         [0, 0, 0, 1, 0],
    //         [0, 0, 0, 1, 0],
    //         [0, 0, 0, 0, 0],
    //     ]

    //     const x = [1, 1, 0, 1, 1]
    //     const y = math.multiply(u, x)

    //     console.log(u)
    //     console.log(y.map((cell) => cell % 2))
    //     console.log(this.#resolveUx(u, y), x)
    //     console.log(this.#getKernel(u))
    // }

    static resolve(b: number[], gridSize: [number, number], mode: number) {
        const M = this.createPreset(...gridSize, mode)

        // PM = LU
        const lu = this.LU(M)

        const invL = this.inv(lu.L)

        const Pb = lu.P.map((i) => b[i])

        // console.log(
        //     "LLinv\n" +
        //         math
        //             .multiply(invL, lu.L)
        //             .map((row) => row.join("\t"))
        //             .join("\n"),
        // )

        // console.log(
        //     "LU\n" +
        //         math
        //             .multiply(lu.L, lu.U)
        //             .map((row) => row.join("\t"))
        //             .join("\n"),
        // )

        // P,L,U は正しそう
        // invL は正しそう

        const y = math.multiply(invL, Pb).map((num) => (num + 100) % 2)

        // console.log("P\n" + P.map((row) => row.join("\t")).join("\n"))
        // console.log("U\n" + lu.U.map((row) => row.join("\t")).join("\n"))
        // console.log("L\n" + lu.L.map((row) => row.join("\t")).join("\n"))
        // console.log("invL\n" + invL.map((row) => row.join("\t")).join("\n"))
        // console.log("A\n" + M.map((row) => row.join("\t")).join("\n"))
        // console.log("b\n" + b.join("\n"))
        // console.log("y\n" + y.join("\n"))

        const answer = this.resolveUx(lu.U, y)

        // console.log(answer)

        return { answer, ker: this.getKernel(lu.U) }
    }

    static getKernel(U: number[][]) {
        // console.log(U.map((row) => row.join("\t")).join("\n"))

        // rank = 16のはずなのに何かおかしい LU 分解の時点でおかしい
        const rank = U.filter((row: any[]) => row.some((value: number) => value !== 0)).length

        // console.log(rank)

        const n = U.length
        const m = U[0].length
        const pivotCols: number[] = []
        const isPivot = Array(m).fill(false)

        // ステップ1: ピボット列を探す
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (U[i][j] === 1 && !isPivot[j]) {
                    pivotCols.push(j)
                    isPivot[j] = true
                    break
                }
            }
        }

        // console.log(pivotCols)

        // ステップ2: 自由変数の列インデックスを取得
        const freeCols: number[] = []
        for (let j = 0; j < m; j++) {
            if (!isPivot[j]) freeCols.push(j)
        }

        // ステップ3: 各自由変数に対して基底ベクトルを構成
        const basis: number[][] = []

        for (const freeCol of freeCols) {
            const x = Array(m).fill(0)
            x[freeCol] = 1

            // 後退代入
            for (let i = n - 1; i >= 0; i--) {
                let sum = 0
                let pivot = -1
                for (let j = 0; j < m; j++) {
                    if (U[i][j] === 1) {
                        if (pivot === -1) pivot = j
                        else sum ^= U[i][j] & x[j]
                    }
                }
                if (pivot !== -1 && !freeCols.includes(pivot)) {
                    x[pivot] = sum // mod 2 なのでそのまま代入
                }
            }
            basis.push(x)
        }

        console.assert(n - basis.length === rank, "次元定理に矛盾するにゃ！")

        return basis
    }

    static createPreset(rows: number, cols: number, mode: number) {
        const matrix: number[][] = []

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const pattern = this.#createZeroMatrix(rows, cols)

                // Toggle the surrounding cells based on the current mode
                if (mode === 0) {
                    // Point mode
                    pattern[row][col] = 1
                } else if (mode === 1) {
                    // Square mode
                    for (let r = Math.max(row - 1, 0); r < Math.min(row + 2, rows); r++) {
                        for (let c = Math.max(col - 1, 0); c < Math.min(col + 2, cols); c++) {
                            pattern[r][c] = 1
                        }
                    }
                } else if (mode === 2) {
                    // Cross mode
                    pattern[row][col] = 1
                    if (row > 0) pattern[row - 1][col] = 1
                    if (row < rows - 1) pattern[row + 1][col] = 1
                    if (col > 0) pattern[row][col - 1] = 1
                    if (col < cols - 1) pattern[row][col + 1] = 1
                } else if (mode === 3) {
                    // X mode
                    pattern[row][col] = 1
                    if (row > 0 && col > 0) pattern[row - 1][col - 1] = 1
                    if (row < rows - 1 && col > 0) pattern[row + 1][col - 1] = 1
                    if (row > 0 && col < cols - 1) pattern[row - 1][col + 1] = 1
                    if (row < rows - 1 && col < cols - 1) pattern[row + 1][col + 1] = 1
                }

                matrix.push(pattern.flat(1))
            }
        }

        return matrix
    }

    static resolveUx(u: number[][], y: string | any[]) {
        const l = y.length
        const x = Array(l).fill(0)

        // console.log("U:\n" + u.map((row) => row.join("\t")).join("\n"))
        // console.log("次元:", l)

        for (let i = 0; i < l; i++) {
            const m = l - i - 1

            // console.log(`${m}行目開始`)

            const allZero = u[m].every((num: number) => num === 0)

            if (allZero) {
                // console.log(`全て0なのでスキップ`)

                if (y[m] !== 0) {
                    return new Error("解けない!")
                }

                continue
            }

            let g = 0
            while (u[m][m + g] === 0) {
                g++
            }

            // console.log(`${m + g}列目にpivot発見`)

            x[m + g] = (y[m] - this.dot(u[m].slice(m + g + 1), x.slice(m + g + 1))) / u[m][m + g]
            // console.log(`x[${m + g}]=${x[m + g]}`)
        }

        return x
    }

    static inv(L: string | any[]) {
        const n = L.length
        const invL = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))

        for (let j = 0; j < n; j++) {
            for (let i = j + 1; i < n; i++) {
                if (L[i][j] === 1) {
                    for (let k = 0; k < n; k++) {
                        invL[i][k] ^= invL[j][k] // GF(2): 足し算は XOR
                    }
                }
            }
        }

        return invL
    }

    static LU(A: number[][]) {
        const n = A.length
        const L = this.#createZeroMatrix(n, n)
        const U = A.map((row) => row.slice())
        const P = [...Array(n).keys()] // Pivot tracking

        let g = 0

        // console.log(A.map((row) => row.join("\t")).join("\n"))

        for (let k = 0; k < n; k++) {
            // console.log(
            //     "\t" +
            //         [...Array(n).keys()].join("\t") +
            //         "\n" +
            //         U.map((row, i) => `${i}:\t` + row.join("\t")).join("\n"),
            // )

            // console.log(`${k}列目開始`)

            // Find pivot
            // k-g行以降で主成分がある行を探す
            const pivot = U.slice(k - g).findIndex((row: number[]) => row[k] === 1) + k - g

            // 見つからなかったら
            if (pivot === -1 + k - g) {
                // console.log(`${k - g}行目以降にpivotを発見できなかったにゃ。。。`)

                g++

                continue
            }

            // console.log(`${pivot}行目${k}列目にpivotを発見`)

            // Swap rows if needed
            if (pivot !== k - g) {
                // console.log(`${k - g}行と${pivot}行を入れ替え`)
                ;[U[k - g], U[pivot]] = [U[pivot], U[k - g]]
                ;[L[k - g], L[pivot]] = [L[pivot], L[k - g]]
                ;[P[k - g], P[pivot]] = [P[pivot], P[k - g]]
            }

            // 簡約化していく
            for (let i = k - g + 1; i < n; i++) {
                if (U[i][k] === 1) {
                    // console.log(`${i}行目に${k - g}行目を加える`)

                    L[i][k - g] = 1

                    // i行目にk-g行目を加える
                    for (let j = k; j < n; j++) {
                        U[i][j] ^= U[k - g][j]
                    }

                    // console.log(`U[${i}]:\t` + U[i].join("\t"))
                }
            }
        }

        L.forEach((row, i) => {
            row[i] = 1
        })

        console.assert(this.#checkUpperTri(U), "上三角じゃあないにゃ！")
        console.assert(this.#checkUnitLowerTri(L), "単位下三角じゃあないにゃ！")

        // console.log(U.map((row) => row.join("\t")).join("\n"))
        // console.log(L.map((row) => row.join("\t")).join("\n"))
        // console.log(P.join("\t"))

        return { L, U, P }
    }

    static #checkUpperTri(U: number[][]): boolean {
        const rows = U.length

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < i; j++) {
                if (U[i][j] !== 0) {
                    return false // Not an upper triangular matrix
                }
            }
        }
        return true // It is an upper triangular matrix
    }

    static #checkUnitLowerTri(L: number[][]): boolean {
        const cols = L.length

        for (let i = 0; i < cols; i++) {
            if (L[i][i] !== 1) return false

            for (let j = i + 1; j < cols; j++) {
                if (L[i][j] !== 0) {
                    return false // Not an lower triangular matrix
                }
            }
        }
        return true // It is an lower triangular matrix
    }

    static dot(x: number[], y: number[]): number {
        if (x.length !== y.length) {
            throw new Error("Vectors must be of the same length")
        }
        return x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    }

    static #createZeroMatrix(rows: number, cols: number): number[][] {
        return Array.from({ length: rows }, () => Array(cols).fill(0))
    }
}
