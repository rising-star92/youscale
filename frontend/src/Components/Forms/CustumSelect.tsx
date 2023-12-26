import React from 'react'

type dataType ={
    label: string;
    value: string;
}[]

const DEFAULT_VALUE: dataType = [
    {label: 'One', value: '1'},
    {label: 'Two', value: '2'},
    {label: 'Three', value: '3'}
]

interface Props {
    name: string,
    data?: dataType,
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}
export default function CustumSelect({ name, onChange, data = DEFAULT_VALUE }: Props): JSX.Element {
    return (
        <div className="col-auto my-1">
            <select
                className="me-sm-2 form-control wide"
                id="inlineFormCustomSelect"
                onChange={onChange}
            >
                <option value={'all'} selected={true}>{name}</option>
                { data.map((dt,index)=> <option key={index} value={dt.value}>{dt.label}</option> ) }
            </select>
        </div>
    )
}
