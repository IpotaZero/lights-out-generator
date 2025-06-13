// 盤面情報をURLに載せて共有するコード

const copyButton = document.getElementById("copy-url")

copyButton.onclick = () => {
    const board = {
        row: gridSize[0],
        col: gridSize[1],
        cells: cells.map((cell) => +cell.classList.contains("on")),
    }

    const url = encodeBoardToURL(board)

    navigator.clipboard.writeText(url)
}

// ページが読み込まれたときにクエリから盤面を生成する関数
document.addEventListener("DOMContentLoaded", () => {
    const board = decodeBoardFromURL(window.location.href)

    if (board === null) return

    grid.innerHTML = ""

    gridSize = [board.row, board.col]

    generateGrid(...gridSize)

    board.cells.forEach((cell, i) => {
        if (cell === 1) {
            cells[i].classList.toggle("on", true)
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
