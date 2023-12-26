import { UseFormRegister } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'
import styles from './support.module.css';

interface Props {
    label: string
    placeholder: string
    register: UseFormRegister<any> | any,
    name: string,
    error: FieldError | undefined,
}
export default function CustumTextArea({ label, placeholder, register, name, error }: Props): JSX.Element {

    return (
        <div className={styles.inputField}>
            <label className={styles.inputLabel}>{label}</label>

            <textarea
                {...register(name)}
                className={styles.textArea}
                placeholder={placeholder}
                cols={30}
                rows={20}
            >
            </textarea>
            {error && <p className={styles.error}>{error.message}</p>}
        </div>
    )
}
