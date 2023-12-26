import React from 'react'
import { UseFormRegister } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'
import styles from './form.module.css'

interface Props {
  label: string,
  register: UseFormRegister<any>,
  name: string,
  error: FieldError | undefined,
  defaultValue?: string | number
}
export default function CustumTextArea({ label, register, name, error, defaultValue }: Props): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <label className={styles.label}>{label}</label>
        <textarea
          {...register(name)}
          className={styles.input}
          rows={4}
          id="comment"
          defaultValue={defaultValue}
        />
      </div>
      {error && <p className='error'>{error.message}</p>}
    </div>
  )
}
