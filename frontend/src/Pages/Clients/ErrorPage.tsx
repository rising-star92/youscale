import React from 'react'
import './styles.css'

export default function ErrorPage() {
    return (
        <div className="box">
            <div className="error alert">
                <div className="alert-body">
                    Error !
                </div>
                <a className='come-back' href="/">Revenir sur youscale</a>
            </div>
        </div>
    )
}
