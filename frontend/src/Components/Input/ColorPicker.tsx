import React, { useState } from 'react'
import './styles.css'

interface ColorPickerProps{
    color: string
    handleChangeColor: (color: string) => void
}
export default function ColorPicker({ color, handleChangeColor }: ColorPickerProps): JSX.Element {

    const [c, setC] = useState<string>(color || '#ffffff')

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        e.preventDefault();
        const { value } = e.target
        setC(value)
        handleChangeColor(value)
    }

    return (
        <div className='color-cont'>
            <input type="color" className='mg-color' onChange={onChange} value={c} />
        </div>
    )
}
