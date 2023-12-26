import React, { useState } from 'react'
import { UseFormRegister } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'
import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai'
import './form.style.css'

interface Props {
    label: string,
    placeholder: string,
    type: string,
    className?: string,
    defaultValue?: string | number,
    register: UseFormRegister<any> | any,
    name: string,
    error: FieldError | undefined,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => any,
    min?: string,
    showEye?: boolean
}
export default function CustumInput({ label, placeholder, type, className = '', defaultValue = '', register, name, error, onChange, min, showEye }: Props): JSX.Element {
    const [showPassword, setShowPassword] = useState<boolean>(false)

    return (
        <div className={`mb-3 col-md-6 ${className}`}>
            <label className="form-label">{label}</label>
            <div className="cust-input-content">
                <input
                    min={min || 0}
                    {...register(name)}
                    defaultValue={defaultValue}
                    role='presentation'
                    autoComplete='off'
                    onChange={onChange}
                    type={showPassword ? 'text' : type}
                    className="form-control"
                    placeholder={placeholder}
                />
                {
                    showEye && (
                        showPassword ? <AiOutlineEye onClick={() => setShowPassword(!showPassword)} size={20} className='eyes' /> : <AiOutlineEyeInvisible onClick={() => setShowPassword(!showPassword)} size={20} className='eyes' />
                    )
                }
            </div>
            {error && <p className='error'>{error.message}</p>}
        </div>
    )
}
