import { shuffle } from 'lodash';
import { useEffect, useState } from 'react'
import { Montserrat } from 'next/font/google'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { HeadComponent as Head } from '../components/Head'

const montserrat = Montserrat({ subsets: ['latin'] })

export default function Home() {

  enum Visibility {
    Covered,
    Flag,
    Revealed
  }

  enum GameStatus {
    Playing,
    Won,
    Lost
  }

  interface Tile {
    value: number,
    visibility: Visibility
  }

  function countAdjacent(board : number[], index : number, width : number, height : number) : number {
    
    let count = 0
    let x = index % width
    let y = Math.floor(index / width)

    let adjacent = [
      [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
      [x - 1, y], [x + 1, y],
      [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
    ]

    adjacent.forEach(([x, y]) => {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        if (board[x + y * width] === -1) {
          count++
        }
      }
    })

    return count
  }

  function generateBoard(width : number, height : number, mines : number): Tile[] {
    let board : number[] = Array(width * height).fill(0)
    board.fill(-1, 0, mines)
    board = shuffle(board)
    board.forEach((value, index) => (value !== -1) && (board[index] = countAdjacent(board, index, width, height)))
    return board.map((tile, _) => {return {value: tile, visibility: Visibility.Covered}})
  }

  const textColorLookup : {[key: number]: string} = {
    "-1": "text-white",
    "0": "text-white",
    "1": "text-blue-500",
    "2": "text-green-500",
    "3": "text-red-500",
    "4": "text-purple-500",
    "5": "text-yellow-500",
    "6": "text-pink-500",
    "7": "text-gray-500",
    "8": "text-black",
  }

  const bgColorLookup : {[key : number]: string} = {
    [Visibility.Flag]: "bg-red-300",
    [Visibility.Revealed]: "bg-slate-100",
    [Visibility.Covered]: "bg-slate-200",
  }

  const hoverBgColorLookup : {[key : number]: string} = {
    [Visibility.Flag]: "bg-red-300",
    [Visibility.Revealed]: "bg-slate-100",
    [Visibility.Covered]: "bg-slate-100",
  }

  const displayTile = (tile: Tile) => {
    switch(tile.visibility) {
      case Visibility.Covered:
        return ''
      case Visibility.Flag:
        return "🚩"
      case Visibility.Revealed:
        return tile.value === -1 ? "💣" : (tile.value === 0 ? "" : tile.value)
    }
  }

  const revealUnflaggedMines = (board: Tile[]) => {

    let newBoard = [...board]

    newBoard.forEach((tile, _) => { 
      if(tile.value === -1 && tile.visibility !== Visibility.Flag)
        tile.visibility = Visibility.Revealed
    })

    setBoard(newBoard)
  }

  const revealTile = (board: Tile[], index: number) => {
    if (isWon || isLost) return

    const tile = board[index]
    const value = tile.value
    const visibility = tile.visibility

    if (visibility !== Visibility.Covered) return

    let newBoard = [...board]
    newBoard[index].visibility = Visibility.Revealed
    setBoard(newBoard)

    if (!isLost && !isWon && value === -1) 
    {
      revealUnflaggedMines(board)
      setIsLost(true)
      console.log("You lose!")
      return
    }
    else if (value === 0) 
    {
      let [x, y] = [index % boardWidth, Math.floor(index / boardWidth)]

      let adjacent = [
        [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
        [x - 1, y], [x + 1, y],
        [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
      ]

      adjacent.forEach(([x, y]) => {
        let inBounds = x >= 0 && x < boardWidth && y >= 0 && y < boardHeight;
        if (inBounds)
        {
          let revealed = board[x + y * boardWidth].visibility === Visibility.Revealed
          if(!revealed)
            revealTile(board, x + y * boardWidth)
        }
      })
    }

    console.log(board.filter((tile) => tile.visibility === Visibility.Covered).length)
    if(!isLost && !isWon && board.filter((tile) => tile.visibility !== Visibility.Revealed).length === boardMines)
    {
      console.log("You win!")
      setIsWon(true)
    } 
  }

  function toggleFlag(event: React.MouseEvent, tile: Tile, index: number) {
    if (isWon || isLost) return

    event.preventDefault()

    if(tile.visibility === Visibility.Revealed || isWon || isLost) return;

    let newBoard = [...board]

    if(newBoard[index].visibility === Visibility.Flag) {
      newBoard[index].visibility = Visibility.Covered;
      setFlags(flags + 1)
    }

    else if(newBoard[index].visibility === Visibility.Covered) {
      if(flags === 0) return
      newBoard[index].visibility = Visibility.Flag;
      setFlags(flags - 1)
    }

    setBoard(newBoard)
  }

  function displayTime(time : Date) {
    const h = time.getUTCHours().toString().padStart(2, '0')
    const m = time.getUTCMinutes().toString().padStart(2, '0')
    const s = time.getUTCSeconds().toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const boardWidth = 10
  const boardHeight = 10
  const boardMines = 2

  const [board, setBoard] = useState<Tile[]>(Array(boardWidth * boardHeight).fill({value: 0, visibility: Visibility.Covered}))
  const [flags, setFlags] = useState<number>(boardMines)
  const [time, setTime] = useState(new Date(0))
  const [isLost, setIsLost] = useState(false)
  const [isWon, setIsWon] = useState(false)

  const startGame = () => {
    setBoard(generateBoard(boardWidth, boardHeight, boardMines))
    setFlags(boardMines)
    setIsWon(false)
    setIsLost(false)
    setTime(new Date(0))
  }

  useEffect(() => {startGame()}, [])
  useEffect(() => {
    if(!isWon && !isLost) {
      const timer = setInterval(() => {setTime((prevTime) => new Date(prevTime.getTime() + 1000))}, 1000)
      return () => clearInterval(timer);
    }
  }, [isWon, isLost]);

  return (
    <>
      <Head/>
      <div className="flex flex-col justify-between h-screen">
        <div className="flex bg-gradient-to-b from-gray-300 to-gray-200 justify-center self-start w-screen">
          <h1 className=
            {
              `font-bold py-4 text-4xl 
              bg-gradient-to-r from-yellow-500 to-orange-500
              bg-clip-text text-transparent`
            }
          >
            Minesweeper
          </h1>
        </div>
        <main className={`${montserrat.className} bg-gray-200 flex justify-center items-center flex-col flex-grow`}>
          <section 
          className={`grid grid-cols-10 gap-0 bg-gray-200 rounded-xl shadow-lg opacity-90 ${(isWon || isLost) && 'blur-sm'}`} 
          onContextMenu={(event) => event.preventDefault()}>
            {
              board.map((tile, index) => (
                <button key={index} 
                  onContextMenu={(event) => toggleFlag(event, tile, index)} 
                  onClick={() => revealTile(board, index)} 
                  className=
                  {
                    `w-12 h-12 
                    ${bgColorLookup[tile.visibility]} 
                    hover:${hoverBgColorLookup[tile.visibility]} 
                    text-4xl font-bold rounded-md 
                    ${textColorLookup[tile.value]} z-10`
                  }
                >
                  {displayTile(tile)}
                </button>))
            }
          </section>
          <div className="font-bold pointer-events-none absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center text-4xl">
            {(isWon && 'You won!') || (isLost && 'You lost!')}
          </div>
          <section className={`flex-row justify-between items-center relative w-96`}>
            <div className="flex flex-col absolute left-0">
              <div className="text-xl my-2"> ⏰ {displayTime(time)} </div>
              <div className="text-xl my-2"> 🚩 {flags} </div>
            </div>
            <button onClick={startGame} className="text-white bg-orange-500 rounded-md px-4 py-2 my-4 absolute right-0">
              New game
            </button>
          </section>
        </main>
        <footer className="text-neutral-500 py-4 bg-gradient-to-t from-gray-300 to-gray-200 flex justify-center">
          Copyright &copy; Arnas Vaicekauskas 2023&nbsp;|&nbsp;
          <a href="https://www.github.com/ArnasVaic">
            <FontAwesomeIcon icon={['fab', 'github']} /> Github
          </a>
        </footer>
      </div>
    </>
  )
}