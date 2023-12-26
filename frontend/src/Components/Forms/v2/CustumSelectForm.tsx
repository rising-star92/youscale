import React from 'react'
import { UseFormRegister } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'
import styles from './form.module.css'
import './form.style.css'

interface Props {
    label: string,
    name: string,
    register: UseFormRegister<any>,
    className?: string,
    error: FieldError | undefined,
    data: { label: string, value: string | number }[],
    defaultSelected?: string | number | null,
    Onchange?: (e: React.ChangeEvent<HTMLSelectElement>) => any
}
export default function CustumSelectForm({ label, name, register, error, data, Onchange, defaultSelected = '', className }: Props): JSX.Element {
    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <label className={styles.label}>{label}</label>
                <select
                    {...register(name)}
                    onChange={Onchange}
                    name={name}
                    className={styles.select}
                >
                    {data.map((dt, index) => <option key={index} value={dt.value}>{dt.label}</option>)}
                </select>
            </div>
            {error && <p className='error'>{error.message}</p>}
        </div>
    )
}
