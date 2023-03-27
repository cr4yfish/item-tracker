import { createTheme, NextUIProvider } from "@nextui-org/react"
import { ThemeProvider } from "next-themes"

import "../styles/globals.css"
import "../styles/theme.css"

const theme = createTheme({
  type: "dark"
})

function MyApp({ Component, pageProps } : { Component : any, pageProps : any }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" value={{dark: theme.className}}>
      <NextUIProvider>
        <Component {...pageProps} />
      </NextUIProvider>
    </ThemeProvider>
  )
}

export default MyApp
