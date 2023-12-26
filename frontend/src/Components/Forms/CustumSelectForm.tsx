import React from 'react'
import { UseFormRegister } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'
import './form.style.css'

interface Props {
    label: string,
    name: string,
    register: UseFormRegister<any>,
    className?: string,
    error: FieldError | undefined,
    data: {label: string, value: string | number}[],
    defaultSelected? : string | number | null,
    Onchange?: (e: React.ChangeEvent<HTMLSelectElement>)=> any
}
export default function CustumSelectForm({ label, name, register, error, data, Onchange, defaultSelected='', className }: Props): JSX.Element {
    return (
        <div className={`mb-3 col-md-6 ${className}`}>
            <label className="form-label">{label}</label>
            <select
                {...register(name)}
                onChange={Onchange}
                name={name}
                className="me-sm-2 default-select form-control wide"
                id="inlineFormCustomSelect"
            >
                { data.map((dt) => <option selected={String(defaultSelected) === String(dt.value)} value={dt.value}>{dt.label}</option> )}
            </select>
            { error && <p className='error'>{error.message}</p> }
        </div>
    )
}
