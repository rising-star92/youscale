import React, { useState } from 'react'
import './styles.css'

interface ColorPickerProps{
    color: string
    handleChangeColor: (color: string) => void
}
export default function ColorPicker({ color, handleChangeColor }: ColorPickerProps): JSX.Element {

    const [c, setC] = useState<string>(color || '#ffffff')

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        const { value } = e.target
        setC(value)
    }

    const onSave = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) =>{
        e.preventDefault()
        handleChangeColor(c)
    }

    return (
        <div className='color-cont'>
            <input type="color" className='mg-color' onChange={onChange} value={c} />
            <a onClick={onSave} className='badge badge-circle badge-outline-dark' href="#">save color</a>
        </div>
    )
}
