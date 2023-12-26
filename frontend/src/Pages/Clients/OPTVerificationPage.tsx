import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth } from '../../services/slice/authSlice'
import { GetRole } from '../../services/storageFunc';
import { clientOTPVerifyThunk } from '../../services/thunks/authThunks';
import { RotatingLines } from 'react-loader-spinner'

const ParseTel = (contact: string): string => '+' + contact.trim()

export default function OPTVerificationPage(): JSX.Element {

    const [code, setCode] = useState<string>()

    const dispatch = useDispatch<any>()
    const { message, isAuthenticated, isError, isLoading } = useSelector(selectAuth)

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const telephone = searchParams.get('telephone') || '';

    const handleVerifyOTP = (): void => {
        dispatch(clientOTPVerifyThunk({ telephone: ParseTel(telephone), code: Number(code) }))
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
        <div className="authincation h-100">
            <div className="container h-100">
                <div className="row justify-content-center h-100 align-items-center">
                    <div className="col-md-6">
                        <div className="authincation-content">
                            <div className="row no-gutters">
                                <div className="col-xl-12">
                                    <div className="auth-form">
                                        <h4 className="text-center mb-4">OTP Verification</h4>

                                        {isError && <span className="auth-error">{message}</span>}
                                        <form>
                                            <div className="mb-3">
                                                <label>
                                                    <strong>Code</strong>
                                                </label>
                                                <input
                                                    onChange={handleChangeCode}
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="472854"
                                                />
                                            </div>
                                            {
                                                isLoading ?
                                                    <RotatingLines
                                                        strokeColor="grey"
                                                        strokeWidth="3"
                                                        animationDuration="0.75"
                                                        width="20"
                                                        visible={true}
                                                    /> :
                                                    <div className="text-center">
                                                        <button
                                                            onClick={() => handleVerifyOTP()}
                                                            type="submit"
                                                            className="btn btn-primary btn-block"
                                                        >
                                                            Vérifier
                                                        </button>
                                                    </div>
                                            }
                                        </form>
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
