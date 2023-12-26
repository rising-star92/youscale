import React from 'react'
import { UseFormRegister } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'

interface Props {
    label: string,
    register: UseFormRegister<any>,
    name: string,
    error: FieldError | undefined,
    defaultValue?: string | number
}
export default function CustumTextArea({ label, register, name, error, defaultValue }: Props): JSX.Element {
  return (
    <div>
        <label className="form-label">{label}</label>
        <textarea 
          {...register(name)}
          className="form-control" 
          rows={4} 
          id="comment" 
          defaultValue={defaultValue} 
        />
        { error && <p className='error'>{error.message}</p> }
    </div>
  )
}
