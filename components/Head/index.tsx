import Head from 'next/head'

export const HeadComponent = () => {
	return (
		<Head>
			<title>Minesweeper | Built by Arnas Vaicekauskas</title>
			<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			<meta name="author" content="Arnas Vaicekauskas" />
			<meta
			name="description"
			content="Minimal Minesweeper browser game built, using Next.js"
			/>
			<meta
			name="keywords"
			content="minesweeper, minesweeper game, browser game, nextjs, react"
			/>
		</Head>
	);
}