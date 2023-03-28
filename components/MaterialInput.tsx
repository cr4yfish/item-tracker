import React, { useEffect, useState } from "react"

import styles from "../styles/MaterialInput.module.css"

/**
 * Material Input Element
 * @param label The Label for the input
 * @param type The type of input, defaults to "text"
 * @param ariaLabel The aria-label for the input
 * @param variant The variant of the input, defaults to "primary"
 * @param onChange The onChange event handler
 */
export default function MaterialInput(
  { 
    label,
    name="",
    type="text",
    ariaLabel="",
    variant="primary",
    value,
    css,
    onChange
  } : { 
    label: string,
    name?: string,
    type?: string,
    value?: string | number,
    ariaLabel?: string,
    css?: React.CSSProperties,
    variant?: "primary" | "secondary" | "tertiary"
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  }) {

  const [isActive, setIsActive] = useState(type == "date" ? true : false)

  // Set input inactive when onBlur && no text
  const handleBlur = (e : React.ChangeEvent<HTMLInputElement>) => {
    if(e.currentTarget?.value.length === 0) { setIsActive(false) };
  }

  useEffect(() => {
    if(value) {
      setIsActive(true);
    }
  }, [value])

  return (
    <div
      style={{ display: "flex", flexDirection: "column", width: "100%", ...css }}>
      <label 
        className={`${styles.label} ${styles[variant]} ${isActive ? styles.labelActive : ""}`} 
        htmlFor={ariaLabel.toLocaleLowerCase()}>{label}</label>
      <input 
        onChange={onChange} 
        id={ariaLabel.toLocaleLowerCase()}
        onBlur={(e) => handleBlur(e)} 
        onFocus={() =>  type == "date" ? null : setIsActive(true)}
        onClick={() => type == "date" ? null : setIsActive(true)} 
        className={`${styles.input} ${styles[variant]}`} 
        name={name.length > 0 ? name : label.toLocaleLowerCase()} 
        type={type} 
        autoComplete="off"
        defaultValue={value}
      />
    </div>
  )
}