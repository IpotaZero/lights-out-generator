// 盤面情報をURLに載せて共有するコード

const copyButton = document.getElementById("copy-url")

copyButton.onclick = () => {
    const board = {
        row: game.gridSize[0],
        col: game.gridSize[1],
        cells: game.cells.map((cell) => +cell.classList.contains("on")).join(""),
    }

    const url = encodeBoardToURL(board)

    navigator.clipboard.writeText(url)

    const copied = document.querySelector(".copied")
    copied.classList.remove("display")
    requestAnimationFrame(() => {
        copied.classList.add("display")
        copied.ontransitionend = () => {
            copied.classList.remove("display")
        }
    })
}

// ページが読み込まれたときにクエリから盤面を生成する関数
document.addEventListener("DOMContentLoaded", () => {
    const board = decodeBoardFromURL(window.location.href)

    if (board === null) return

    grid.innerHTML = ""

    game.gridSize = [board.row, board.col]

    generateGrid(...gridSize)
    ;[...board.cells].forEach((cell, i) => {
        if (cell === "1") {
            game.cells[i].classList.toggle("on", true)
        }
    })
})

// 盤面情報をURLにエンコードする関数
function encodeBoardToURL(board) {
    const jsonString = JSON.stringify(board) // JSON文字列に変換
    const base64String = btoa(jsonString) // Base64エンコード
    return `https://ipotazero.github.io/lights-out-generator/?board=${encodeURIComponent(base64String)}`
}

// URLから盤面情報をデコードする関数
function decodeBoardFromURL(url) {
    const params = new URL(url).searchParams
    const base64String = params.get("board")
    if (!base64String) {
        return null
    }
    const jsonString = atob(base64String) // Base64デコード
    return JSON.parse(jsonString) // JSONオブジェクトに変換
}
