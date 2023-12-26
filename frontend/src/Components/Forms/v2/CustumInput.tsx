import React from 'react'
import { UseFormRegister } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'
import styles from './form.module.css'
import './form.style.css'

interface Props {
    label: string
    placeholder: string
    type: string
    defaultValue?: string | number
    register: UseFormRegister<any> | any
    name: string
    error: FieldError | undefined
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => any
    min?: string
    children?: JSX.Element | JSX.Element[]
}
export default function CustumInput({ label, placeholder, type, defaultValue = '', register, name, error, onChange, min, children }: Props): JSX.Element {

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <label className={styles.label}>{label}</label>
                <div style={{width:"50%"}}>
                    <input
                    style={{width: "100%"}}
                        min={min || 0}
                        {...register(name)}
                        defaultValue={defaultValue}
                        role='presentation'
                        autoComplete='off'
                        onChange={onChange}
                        className={styles.input}
                        type={type}
                        placeholder={placeholder}
                    />
                </div>
                
            </div>
            {children}
            {error && <p className={styles.error}>{error.message}</p>}
        </div>
    )
}
