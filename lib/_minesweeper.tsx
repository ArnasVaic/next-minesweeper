import { shuffle } from 'lodash';

export enum Visibility {
	Covered,
	Flag,
	Revealed
}

export enum GameStatus {
	Playing,
	Won,
	Lost
}

export interface Tile {
	value: number,
	visibility: Visibility
}

export interface Game {
	board: Tile[],
	status: GameStatus,
	flags: number
	width: number,
	height: number,
	mines: number
}

const returnAdjacentCoords = (x : number, y: number) =>
[
	[x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
	[x - 1, y], [x + 1, y],
	[x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
]

function countAdjacent(board : number[], index : number, width : number, height : number) : number {
	let [count, x, y] = [0, index % width, Math.floor(index / width)]
	returnAdjacentCoords(x, y).forEach(([x, y]) => {
		if (x >= 0 && x < width && y >= 0 && y < height)
			if (board[x + y * width] === -1)
				count++
	})

	return count
}

export function createGame(width : number, height : number, mines : number): Game {
	let board : number[] = Array(width * height).fill(0)
	board.fill(-1, 0, mines)
	board = shuffle(board)
	board.forEach((value, index) => (value !== -1) && (board[index] = countAdjacent(board, index, width, height)))
	const b = board.map((tile, _) => {return {value: tile, visibility: Visibility.Covered}})
	return {board: b, status: GameStatus.Playing, flags: mines, width, height, mines}
}

const revealUnflaggedMines = (board: Tile[]) =>
	board.forEach(tile => { 
	if(tile.value === -1 && tile.visibility !== Visibility.Flag)
			tile.visibility = Visibility.Revealed
	})

export function revealTile(oldGame: Game, index: number): Game {
	let game = {...oldGame}

	const tile = game.board[index]

	if (tile.visibility !== Visibility.Covered || game.status !== GameStatus.Playing) 
		return game

	if (tile.value === -1) {
		revealUnflaggedMines(game.board)
		game.status = GameStatus.Lost
		return game
	}

	tile.visibility = Visibility.Revealed

	if (tile.value === 0) {
		let [x, y] = [index % game.width, Math.floor(index / game.width)]
		returnAdjacentCoords(x, y).forEach(([x, y]) => {
		if (x >= 0 && x < game.width && y >= 0 && y < game.height)
			if(game.board[x + y * game.width].visibility !== Visibility.Revealed)
				revealTile(game, x + y * game.width)
		})
	}

	if(game.board.filter(tile => tile.visibility !== Visibility.Revealed).length === game.mines) 
		game.status = GameStatus.Won

	return game
}

export function toggleFlag(oldGame:Game, index: number): Game {

	let game = {...oldGame}

	const tile = game.board[index]

	if (tile.visibility === Visibility.Revealed || game.status !== GameStatus.Playing) 
		return game

	if(tile.visibility === Visibility.Flag) {
		tile.visibility = Visibility.Covered
		game.flags++
	}

	else if(tile.visibility === Visibility.Covered) {
		if(game.flags === 0) 
			return game
		tile.visibility = Visibility.Flag
		game.flags--
	}

	return game
}