import React from 'react'
import { GetClientOrderModel, StatusModel } from '../../../../models'

interface Props {
    statusData?: StatusModel[],
    name: string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => any,
    currentData: GetClientOrderModel,
}
export default function DisplayStatus( { name, onChange, statusData, currentData }: Props): JSX.Element {

    const expedie_item = statusData && statusData.find(stu=> stu.name === 'Expedie livraison')

    return (
        <select
            onChange={onChange}
            className="select-custum"
        >
            { expedie_item && <option selected={expedie_item.name === currentData.Status} style={{ color:expedie_item.color ?? 'black'}} value={expedie_item.name}>{expedie_item.name}</option> }
            {
                statusData && statusData.map(
                    (dt) => {
                        if(dt.name === 'Expedie livraison') return 
                        return <option selected={dt.name === currentData.Status} style={{ color:dt.color ?? 'black'}} value={dt.name}>{dt.name}</option>
                    })
            }
        </select>
    )
}
