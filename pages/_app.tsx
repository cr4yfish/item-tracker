import { createTheme, NextUIProvider } from "@nextui-org/react"
import { ThemeProvider } from "next-themes"
import { ToastContainer } from "react-toastify"

import 'react-toastify/dist/ReactToastify.css'
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
        <ToastContainer
          theme="dark"
          position="top-center"
          pauseOnHover
        />
      </NextUIProvider>
    </ThemeProvider>
  )
}

export default MyApp
