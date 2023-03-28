import { Button } from "@nextui-org/react"
import Link from "next/link"
import "material-icons/iconfont/material-icons.css"

import styles from "../styles/PageHeader.module.css"

export default function PageHeader({ link = "/", text = ""} : { link: string, text: string}) {


    return (
        <>
            <header className={styles.header}>
                <Link href={link}><Button auto ghost ><span className='material-icons'>chevron_left</span></Button></Link>
                <h1>{text}</h1>
            </header>
        </>
    )
}