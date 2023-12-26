import { UseFormRegister } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'
import styles from './support.module.css';

interface Props {
    label: string
    placeholder: string
    register: UseFormRegister<any> | any
    name: string
    error: FieldError | undefined
}
export default function CustumInput({ label, placeholder, register, name, error }: Props): JSX.Element {

    return (
        <div className={styles.inputField}>
            <label className={styles.inputLabel}>{label}</label>
            <input
                {...register(name)}
                className={styles.input}
                autoComplete='off'
                type={'text'}
                placeholder={placeholder}
            />
            {error && <p className={styles.error}>{error.message}</p>}
        </div>
    )
}
