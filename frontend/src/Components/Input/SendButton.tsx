import React from 'react'

interface SendButtonProps{
    onClick: () => any,
    value: string
}
export default function SendButton({ onClick, value }:SendButtonProps) : JSX.Element {
    return (
        <button 
            onClick={onClick}
            type="button" 
            className="btn btn-rounded btn-secondary"
        >
            {value}
        </button>
    )
}
