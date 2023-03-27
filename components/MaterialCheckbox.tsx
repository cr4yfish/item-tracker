
import styles from "../styles/MaterialCheckbox.module.css"
import { Checkbox } from "@nextui-org/react"
import { CSSProperties } from "react"

export default function MaterialCheckbox({
    label,
    name = "",
    value = false,
    labelRight = true,
    css,
    onChange = () => {}
} : {
    label : string,
    name? : string,
    value? : boolean,
    labelRight? : boolean,
    css? : CSSProperties,
    onChange? : (e: boolean) => void
}) {
    return (
        <div
            className={`${styles.wrapper} ${labelRight && styles.labelRight}`}
            style={css}
        >
            <label 
                htmlFor={name.length > 0 ? name : label}
                className={styles.label}
                >
                {label}
            </label>

            <Checkbox 
                className={styles.input}
                name={name.length > 0 ? name : label}
                onChange={(e) => onChange(e)}
                aria-label={label}
            />

        </div>
    )
}