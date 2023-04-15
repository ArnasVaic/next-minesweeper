import type { AppProps } from 'next/app'
import "../styles/globals.css"

import '@fortawesome/fontawesome-svg-core/styles.css'
import { config, library } from '@fortawesome/fontawesome-svg-core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

library.add(faGithub)

config.autoAddCss = false

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}