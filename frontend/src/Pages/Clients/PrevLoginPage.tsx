import React, { useEffect, useState } from 'react'
import { SetRole, GetRole } from '../../services/storageFunc'
import { selectAuth } from '../../services/slice/authSlice'
import { clientLoginThunk, clientTeamLoginThunk } from '../../services/thunks/authThunks';
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import './styles.css'

type Inputs = {
    email: string;
    password: string;
};

const schema = yup.object().shape({
    email: yup.string().email('Format de l\'email invalide').required('Ce champ est obligatoire'),
    password: yup.string().min(8, 'Votre mot de passe doit avoir au moins 8 caractères').required('Ce champ est obligatoire'),
}).required();

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const dispatch = useDispatch<any>()
    const { message, isAuthenticated, isError, isVerified } = useSelector(selectAuth)

    const handleChangeRole = (role: 'CLIENT' | 'TEAM'): any => {
        SetRole(role)
        window.location.reload()
    }

    const activeBtn = (button: 'CLIENT' | 'TEAM'): string => {

        if (button === 'CLIENT') {
            if (GetRole() === 'TEAM') return 'btn-outline-dark'
            else if (GetRole() === 'CLIENT') return 'btn-dark'
        }

        if (GetRole() === 'TEAM') return 'btn-dark'

        return ''
    }

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (isAuthenticated) {
            if (GetRole() === 'CLIENT') window.location.href = '/'
            if (GetRole() === 'TEAM') window.location.href = '/'
        }

        if (isVerified === false) {
            const telephone = JSON.parse(localStorage.getItem('telephone') || '')
            window.location.href = `/opt-verification?telephone=${telephone}`
        }
    }, [isAuthenticated, isVerified])

    const handleSend = (data: Inputs) => {
        if (GetRole() === 'CLIENT') dispatch(clientLoginThunk(data))
        if (GetRole() === 'TEAM') dispatch(clientTeamLoginThunk(data))
    }

    return (
        <div className="authincation h-100">
            <div className="container h-100">
                <div className="row justify-content-center h-100 align-items-center">
                    <div className="col-md-6">
                        <div className="authincation-content">
                            <div className="row no-gutters">
                                <div className="col-xl-12">
                                    <div className="auth-form">
                                        <div className="text-center mb-3">
                                            <a href="index.html">
                                                <img src="/cus_img/Group15.png" width={200} alt="" />
                                            </a>
                                        </div>
                                        <h4 className="text-center mb-4">Se connecter</h4>

                                        <div className="btn-group btn-login-switch">
                                            <button
                                                onClick={() => handleChangeRole('CLIENT')}
                                                type="button"
                                                className={`btn ${activeBtn('CLIENT')}`}
                                            >
                                                Client
                                            </button>
                                            <button
                                                onClick={() => handleChangeRole('TEAM')}
                                                type="button"
                                                className={`btn ${activeBtn('TEAM')}`}
                                            >
                                                Team
                                            </button>
                                        </div>

                                        {isError && <span className="auth-error">{message}</span>}
                                        <form onSubmit={handleSubmit(handleSend)}>
                                            <div className="mb-3">
                                                <label className="mb-1">
                                                    <strong>Email</strong>
                                                </label>
                                                <input
                                                    {...register("email")}
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="hello@example.com"
                                                />
                                                {errors.email && <p className='error'>{errors.email.message}</p>}
                                            </div>

                                            <div className="mb-3">
                                                <label className="mb-1">
                                                    <strong>Password</strong>
                                                </label>
                                                <div className="cust-input-content">
                                                    <input
                                                        {...register("password")}
                                                        type={showPassword ? 'text' : "password"}
                                                        className="form-control"
                                                        placeholder="******"
                                                    />
                                                    {
                                                        (
                                                            showPassword ? <AiOutlineEye onClick={() => setShowPassword(!showPassword)} size={20} className='eyes' /> : <AiOutlineEyeInvisible onClick={() => setShowPassword(!showPassword)} size={20} className='eyes' />
                                                        )
                                                    }
                                                </div>
                                                {errors.password && <p className='error'>{errors.password.message}</p>}
                                            </div>

                                            <div className="row d-flex justify-content-between mt-4 mb-2">
                                                <div className="mb-3">
                                                    <div className="form-check custom-checkbox ms-1">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="basic_checkbox_1"
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor="basic_checkbox_1"
                                                        >
                                                            Remember my preference
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <a href="/forgotpwd">Password oublié ?</a>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <button type="submit" className="btn btn-primary btn-block">
                                                    Se connecter
                                                </button>
                                            </div>
                                        </form>
                                        <div className="new-account mt-3">
                                            <p>
                                                Vous n'avez pas de compte?{" "}
                                                <a className="text-primary" href="/register">
                                                    S'inscrire
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
