import React, { useState } from 'react'
import { GetRole } from '../../services/storageFunc';
import { useDispatch } from "react-redux";
import { clientForgotPwdThunk } from '../../services/thunks/authThunks';
import { showToastError } from '../../services/toast/showToastError';
import { showToastSucces } from '../../services/toast/showToastSucces';
import { IoIosArrowBack } from 'react-icons/io';

export default function ForgotPasswordPage() {

    const [email, setEmail] = useState<string>()

    const dispatch = useDispatch<any>()

    const sendSMS = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()

        if (!email) {
            showToastError('Veuillez préciser le mail')
            return
        }

        if (GetRole() === 'CLIENT') dispatch(clientForgotPwdThunk({ email }))
        if (GetRole() === 'TEAM') console.error('not implemented')

        showToastSucces('Votre nouveau mot de passe a été envoyé au contact lié a cet email')
    }

    return (
        <div className='ys-login-page'>
            <section className="ys-login-sect-video">
                <div className='ys-login-sect-video-content'>
                    <a href="/" className='sect-video-logo'>Youscale</a>
                    <video playsInline className="video-sec" autoPlay loop muted src="https://cdn.dribbble.com/uploads/48226/original/b8bd4e4273cceae2889d9d259b04f732.mp4?1689028949"></video>
                </div>
            </section>
            <section className="ys-login-sect-content">
                <div onClick={() => window.location.href = '/'} className="back-btn">
                    <IoIosArrowBack size={25} color={'black'} />
                </div>
                <div className="sect-content-auth">
                    <h2>Mot de passe oublié</h2>

                    <div className="content-auth-form">
                        <form>
                            <fieldset className='fields'>
                                <label htmlFor="login-lab">{'veuillez renseigner votre mail'}</label>
                                <input
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    role='presentation'
                                    autoComplete='off'
                                    className="form-control"
                                />
                            </fieldset>

                            <button
                                onClick={sendSMS}
                                type="submit"
                                className={`submit-button`}>
                                envoyer
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    )
}
