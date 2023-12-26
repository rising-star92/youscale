import React, { useState } from 'react'
import Select from 'react-dropdown-select';
import { FieldError } from 'react-hook-form/dist/types/errors'
import { UseFormSetValue } from 'react-hook-form';
import styles from './form.module.css'

type Inputs = {
    nom: string,
    telephone: string,
    prix: string,
    adresse: string,
    reportedDate: string,
    message: string,
    id_city: string,
    status: string,
    source: string,
    updownsell: string,
    changer: string,
    ouvrir: string
};

interface Props {
    label: string,
    error: FieldError | undefined,
    data: { label: string, value: string | number }[]
    setValue: UseFormSetValue<Inputs>
}
export default function CityDropDown({ label, error, data, setValue }: Props): JSX.Element {

    const [input, setInput] = useState<{ label: string, value: string | number }[]>([{ label: 'none', value: 'none' }])

    const handleChange = (parms: { label: string, value: string | number }[]) => {
        if (parms.length === 0) return
        if (parms[0].value === input[0].value) return

        setInput([{ label: parms[0].label, value: parms[0].value }])

        setValue('id_city', String(parms[0].value))
    }

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <label className={styles.label}>{label}</label>
                <div>
                    <Select
                    className={styles.city_dropdown}
                        labelField="label"
                        valueField="value"
                        values={input}
                        options={data}
                        onChange={handleChange}
                    />
                </div>

            </div>
            {error && <p className={styles.error}>{error.message}</p>}
        </div>
    )
}
