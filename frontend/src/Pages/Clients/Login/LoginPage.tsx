import React, { useEffect } from 'react'
import { UseFormRegister } from 'react-hook-form/dist/types/form'
import { FieldError } from 'react-hook-form/dist/types/errors'
import { useDispatch, useSelector } from 'react-redux'
import { selectAuth } from '../../../services/slice/authSlice'
import { yupResolver } from '@hookform/resolvers/yup';
import { GetRole, SetRole } from '../../../services/storageFunc'
import { useForm } from 'react-hook-form'
import { clientLoginThunk, clientTeamLoginThunk } from '../../../services/thunks/authThunks'
import { BASE_URL } from '../../../services/url/API_URL'
import * as yup from "yup";
import style from './styles.module.css'


export default function LoginPage(): JSX.Element {

    const handleChangeRole = (role: 'CLIENT' | 'TEAM'): any => {
        SetRole(role)
        window.location.reload()
    }

    return (
        <div className={style.container}>
            <div className={style.imageSection}>
                <img src="/cus_img/login_img.png" alt="login_img" className={style.image} />
            </div>
            <div className={style.loginSection}>
                <img src="/cus_img/login_logo.png" alt="login_logo" className={style.logo} />
                <div className={style.swither}>
                    <a
                        onClick={() => handleChangeRole('CLIENT')}
                        className={`${style.option} ${GetRole() === 'CLIENT' && style.active}`}
                        href="#">Client</a>
                    <a
                        onClick={() => handleChangeRole('TEAM')}
                        className={`${style.option} ${GetRole() === 'TEAM' && style.active}`}
                        href="#">Membre d'équipe</a>
                </div>
                { GetRole() === "TEAM" ? <TeamAuth /> : <ClientAuth /> }
            </div>
        </div>
    )
}

const ClientAuth = (): JSX.Element => {
    const googleAuth = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        window.open(`${BASE_URL}/auth/google/callback`, '_self')
    }

    return (
        <div className={style.main}>
            <p className={style.mainDesc}>Bienvenue sur Youscale.</p>
            <div onClick={googleAuth} className={style.googleBtn}>
                <img src="/cus_img/GIcon.png" alt="GIcon" className={style.GIcon} />
                <div>Se connecter avec google</div>
            </div>
            <p className={style.description}>En me connectant, j'accepte les conditions d'utilisation et la politique de confidentialité de Youscale.</p>
        </div>
    )
}

type Inputs = {
    email: string;
    password: string;
};
const schema = yup.object().shape({
    email: yup.string().email('Format de l\'email invalide').required('Ce champ est obligatoire'),
    password: yup.string().min(8, 'Votre mot de passe doit avoir au moins 8 caractères').required('Ce champ est obligatoire'),
}).required();
const TeamAuth = (): JSX.Element => {

    const dispatch = useDispatch<any>()
    const { message, isAuthenticated, isError, isVerified, step } = useSelector(selectAuth)

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (isAuthenticated) {
            if (GetRole() === 'CLIENT') {
                console.log(step)
                window.location.href = '/'
            }
            if (GetRole() === 'TEAM') window.location.href = '/order'
        }

    }, [isAuthenticated, isVerified])

    const handleSend = (data: Inputs) => {
        if (GetRole() === 'CLIENT') dispatch(clientLoginThunk(data))
        if (GetRole() === 'TEAM') dispatch(clientTeamLoginThunk(data))
    }

    return (
        <div className={style.mainTeam}>
            <p className={style.mainDesc}>Bienvenue sur Youscale.</p>

            {isError && <span className="auth-error">{message}</span>}
            <form className={style.form} onSubmit={handleSubmit(handleSend)}>
                <Field
                    label={'E-mail'}
                    type={'text'}
                    name={'email'}
                    placeholder={'user@gmail.com'}
                    register={register}
                    error={errors.email}
                />

                <Field
                    label={'Mot de passe'}
                    type={'password'}
                    name={'password'}
                    placeholder={'*****'}
                    register={register}
                    error={errors.password}
                />
                <Button />
            </form>
        </div>
    )
}

interface FieldProps {
    label: string
    type: 'text' | 'number' | 'password'
    name: string
    placeholder: string
    register: UseFormRegister<any> | any
    error: FieldError | undefined
}
const Field = ({ label, type, name, placeholder, register, error }: FieldProps): JSX.Element => {
    return (
        <div className={style.field}>
            <p className={style.label}>{label}</p>
            <input
                {...register(name)}
                className={style.input}
                type={type}
                name={name}
                placeholder={placeholder}
            />
            {error && <p className={style.error}>{error.message}</p>}
        </div>
    )
}

const Button = (): JSX.Element => {
    return (
        <button type={'submit'} className={style.button}>
            <p>Se connecter</p>
        </button>
    )
}