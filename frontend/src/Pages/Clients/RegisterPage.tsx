import React, { useEffect, useState } from 'react'
import { GetRole } from '../../services/storageFunc'
import { selectAuth } from '../../services/slice/authSlice'
import { clientOTPVerifyThunk, clientRegisterThunk, resendOTPThunk } from '../../services/thunks/authThunks';
import { useDispatch, useSelector } from "react-redux";
import { CustumAuthInput } from '../../Components/Forms';
import { useForm } from 'react-hook-form';
import { IoIosArrowBack } from 'react-icons/io'
import { yupResolver } from '@hookform/resolvers/yup';
import { RotatingLines } from 'react-loader-spinner'
import { showToastError } from '../../services/toast/showToastError';
import * as yup from "yup";
import './styles.css'
import { BASE_URL } from '../../services/url/API_URL';
import { ConnectGoogleBtn } from '../../Components/Input';

const ParseTel = (contact: string): string => contact.trim()

type Inputs = {
    fullname: string;
    email: string;
    password: string;
    telephone: string;
};

const schema = yup.object().shape({
    fullname: yup.string().required('Ce champ est obligatoire'),
    email: yup.string().email('Format de l\'email invalide').required('Ce champ est obligatoire'),
    password: yup.string().min(8, 'Votre mot de passe doit avoir au moins 8 caractères').required('Ce champ est obligatoire'),
    telephone: yup.string().required('Ce champ est obligatoire').min(7, '7 caractères maximum'),
}).required();

export default function LoginPage() {
    const [showOtpSect, setSowOtpSect] = useState<boolean>(false)

    return (
        <div className='ys-login-page'>
            <section className="ys-login-sect-video">
                <div className='ys-login-sect-video-content'>
                    <a href="/" className='sect-video-logo'>Youscale</a>
                    <video playsInline className="video-sec" autoPlay loop muted src="https://cdn.dribbble.com/uploads/48226/original/b8bd4e4273cceae2889d9d259b04f732.mp4?1689028949"></video>
                </div>
            </section>

            {showOtpSect ? <VerifyNumberSection showOtpSect={showOtpSect} setSowOtpSect={setSowOtpSect} /> : <LoginSection showOtpSect={showOtpSect} setSowOtpSect={setSowOtpSect} />}
        </div>
    )
}

interface LoginProps {
    setSowOtpSect: React.Dispatch<React.SetStateAction<boolean>>
    showOtpSect: boolean
}
const LoginSection = ({ setSowOtpSect }: LoginProps) => {
    const dispatch = useDispatch<any>()
    const { message, isAuthenticated, isError, isVerified, step } = useSelector(selectAuth)

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    function isValidContactNumber(contactNumber: string): boolean {
        if (contactNumber.startsWith("+221") || contactNumber.startsWith("+212")) {
            return true;
        } else {
            return false;
        }
    }

    const handleSend = (data: Inputs) => {
        if (!isValidContactNumber(data.telephone)) {
            showToastError('Votre contact doit commencer par (+221) ou (+212)')
            return
        }

        dispatch(clientRegisterThunk(data))
    }

    useEffect(() => {
        if (isAuthenticated) {
            if (GetRole() === 'CLIENT') {
                if (step === 'completed') window.location.href = '/'
                else if (step === 'question') window.location.href = '/question'
                window.location.href = '/choose_pack'
            }
            if (GetRole() === 'TEAM') window.location.href = '/'
        }

        if (isVerified === false) {
            setSowOtpSect(true)
        }
    }, [isAuthenticated, isVerified])

    const googleAuth = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        window.open(`${BASE_URL}/auth/google/callback`, '_self')
    }

    return (
        <section className="ys-login-sect-content">
            <div className="sect-content-auth register-cont-wel">
                <h2>Bienvenue sur Youscale, Inscrivez vous</h2>

                <div className="content-auth-form">
                    <p className="auth-link">already have an account? <a className="underline" href="/login">Sign in</a></p>
                    <ConnectGoogleBtn onClick={googleAuth} />
                </div>
            </div>
        </section>
    )
}

const VerifyNumberSection = ({ setSowOtpSect }: LoginProps) => {
    const [code, setCode] = useState<string>()

    const dispatch = useDispatch<any>()
    const { message, isAuthenticated, isError, isLoading } = useSelector(selectAuth)

    const telephone = JSON.parse(localStorage.getItem('telephone') || '')

    const handleVerifyOTP = (): void => {
        dispatch(clientOTPVerifyThunk({ telephone: ParseTel(telephone), code: Number(code) }))
    }

    const resendOTP = (): void => {
        dispatch(resendOTPThunk({ telephone: ParseTel(telephone) }))
    }

    const handleChangeCode = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { value } = e.target
        setCode(value)
    }

    useEffect(() => {
        if (isAuthenticated) {
            if (GetRole() === 'CLIENT') window.location.href = '/'
            if (GetRole() === 'TEAM') window.location.href = '/order-client-team'
        }
    }, [isAuthenticated])

    return (
        <section className="ys-login-sect-content">
            <div onClick={() => window.location.reload()} className="back-btn">
                <IoIosArrowBack size={25} color={'black'} />
            </div>
            <div className="sect-content-auth">
                <h2>Vérifier votre contact</h2>

                <div className="content-auth-form">
                    {isError && <span className="auth-error">{message}</span>}
                    <form>
                        <fieldset className='fields'>
                            <label htmlFor="login-lab">{'Code'}</label>
                            <input
                                onChange={handleChangeCode}
                                type={'number'}
                                max={4}
                                role='presentation'
                                autoComplete='off'
                                className="form-control"
                            />
                            <a onClick={() => resendOTP()} className='resend-c-txt' href="#">Renvoyer le code</a>
                        </fieldset>

                        <button
                            onClick={() => handleVerifyOTP()}
                            disabled={isLoading}
                            className={`submit-button ${isLoading && 'hide-submit'}`}>
                            {isLoading ? 'Verification' : 'Véfifier'}
                            <RotatingLines
                                strokeColor="grey"
                                strokeWidth="5"
                                animationDuration="0.75"
                                width="22"
                                visible={isLoading}
                            />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    )
}