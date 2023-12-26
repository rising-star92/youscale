import React from 'react'
import './styles.css'

interface Props{
    onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => any
}
export default function ConnectGoogleBtn({ onClick }:Props) {
    return (
        <a onClick={onClick} href="#">
            <div className="g-sign-in-button">
                <div className="content-wrapper">
                    <div className="logo-wrapper">
                        <img src="https://developers.google.com/identity/images/g-logo.png" />
                    </div>
                    <span className="text-container">
                        <span>Sign in with Google</span>
                    </span>
                </div>
            </div>
        </a>
    )
}
