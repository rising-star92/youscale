import React, { useState } from 'react'
import Select from 'react-dropdown-select';
import { FieldError } from 'react-hook-form/dist/types/errors'
import { UseFormSetValue } from 'react-hook-form';
import { string } from 'yup';

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
        <div className="mb-3 col-md-4 lg-input-cus">
            <label className="form-label">{label}</label>
            <Select
                labelField="label"
                valueField="value"
                values={input}
                options={data}
                onChange={handleChange}
            />
            {error && <p className='error'>{error.message}</p>}
        </div>
    )
}
