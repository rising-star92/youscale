import React, { useState } from 'react'
import { UseFormRegister } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'
import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai'
import './form.style.css'

interface Props {
    label: string,
    placeholder: string,
    type: string,
    register: UseFormRegister<any> | any,
    name: string,
    error: FieldError | undefined,
    showEye?: boolean
    className?: string,
}
export default function CustumAuthInput({ label, placeholder, type, className = '', register, name, error, showEye }: Props): JSX.Element {
    const [showPassword, setShowPassword] = useState<boolean>(false)

    return (
        <fieldset className='fields'>
            <label htmlFor="login-lab">{label}</label>
            <input
                {...register(name)}
                autoComplete='off'
                type={showPassword ? 'text' : type}
                placeholder={placeholder}
            />
            {
                showEye && (
                    showPassword ? <AiOutlineEye onClick={() => setShowPassword(!showPassword)} size={20} className='eyes' /> : <AiOutlineEyeInvisible onClick={() => setShowPassword(!showPassword)} size={20} className='eyes' />
                )
            }
             {error && <p className='error'>{error.message}</p>}
        </fieldset>
    )
}
