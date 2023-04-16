import { useEffect, useState } from 'react'
import { Montserrat } from 'next/font/google'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { HeadComponent as Head } from '../components/Head'
import { Game, GameStatus, Tile, Visibility, createGame, revealTile, toggleFlag } from './_minesweeper'

const montserrat = Montserrat({ subsets: ['latin'] })

const overlayMessage = {
  [GameStatus.Lost]: 'You lost! ☠️',
  [GameStatus.Won]: 'You won! 🥳',
  [GameStatus.Playing]: ''
}

const tileTextColor: {[key: number]: string} = {
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

const tileBgColor : {[key : number]: string} = {
  [Visibility.Flag]: "bg-red-300",
  [Visibility.Revealed]: "bg-gray-100",
  [Visibility.Covered]: "bg-gray-300",
}

const tileHoverBgColor : {[key : number]: string} = {
  [Visibility.Flag]: "hover:bg-red-400",
  [Visibility.Revealed]: "hover:bg-white",
  [Visibility.Covered]: "hover:bg-white",
}

function tileDisplaySymbol(tile: Tile) {
  if(tile.visibility === Visibility.Covered || tile.value === 0) return ''
  if(tile.visibility === Visibility.Flag) return '🚩'
  if(tile.value === -1) return '💣'
  return `${tile.value}`
}

function displayTime(time : Date) {
  const h = time.getUTCHours().toString().padStart(2, '0')
  const m = time.getUTCMinutes().toString().padStart(2, '0')
  const s = time.getUTCSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function Home() {
  const boardWidth = 12
  const boardHeight = 12
  const boardMines = 30

  const [game, setGame] = useState(createGame(boardWidth, boardHeight, boardMines))
  const [time, setTime] = useState(new Date(0))
  
  const startGame = () => {
    setGame(createGame(boardWidth, boardHeight, boardMines))
    setTime(new Date(0))
  }

  useEffect(() => {startGame()}, [])
  useEffect(() => {
    if(game.status === GameStatus.Playing) {
      const timer = setInterval(() => {setTime((prevTime) => new Date(prevTime.getTime() + 1000))}, 1000)
      return () => clearInterval(timer);
    }
  }, [game.status]);

  const generateBoardElement = (game: Game) => {
    return game.board.map((tile, index) => (
      <button 
      key={index} 
      onContextMenu={(event) => {
        event.preventDefault()
        setGame(toggleFlag(game, index))
      }} 
      onClick={() => setGame(revealTile(game, index))} 
      className={`grid-tile ${tileBgColor[tile.visibility]} ${tileHoverBgColor[tile.visibility]} ${tileTextColor[tile.value]}`}>
        {tileDisplaySymbol(tile)}
      </button>
    ))
  }

  return (
    <>
      <Head/>
        <div className='wrapper'>
          <h1 className='heading'> Minesweeper </h1>

          <main className={montserrat.className}>

            <p className='help-text'>Use left click to reveal tiles and right click to flag</p>

            <section 
            className={`game-grid ${game.status !== GameStatus.Playing && 'blur-sm'}`} 
            onContextMenu={(event) => event.preventDefault()}>
              {generateBoardElement(game)}
            </section>
            {game.status !== GameStatus.Playing && <div className="game-overlay">{overlayMessage[game.status]}</div>}
            <section className='buttons-section'>
              <div className='label'>⏰{displayTime(time)}</div>
              <button className='button' onClick={startGame}>New</button>
              <div className='label'>🚩 {game.flags}</div>
            </section>

          </main>

          <footer>
            Copyright &copy; Arnas Vaicekauskas 2023&nbsp;|&nbsp;
            <a href="https://github.com/ArnasVaic/next-minesweeper">
              <FontAwesomeIcon icon={['fab', 'github']} /> Github
            </a>
          </footer>
        </div>
    </>
  )
}