import { useState, useEffect } from 'react'
import Select from 'react-dropdown-select';
import { usePatchClientOrderMutation } from '../../../services/api/ClientApi/ClientOrderApi';
import { CityModel } from '../../../models';
import styles from './input.module.css'

interface CustumDropdownProps {
    options: { label: string, value: string | number }[]
    name: string
    data: CityModel[]
    order: { id: number, id_city: number, id_team: number, createdAt: Date } | undefined
    refetch?: () => void
    
}
export default function CustumDropdown({ options, order, refetch, data }: CustumDropdownProps) {
    const [value, setValue] = useState<{ label: string, value: string | number }[]>([{
        label: 'none',
        value: 'none'
    }])

    useEffect(() => {
        order && data.map((it, index) => it.id === order.id_city && setValue([{ label: it.name , value: it.id ?? 0}]))
    }, [order, data])


    const [patchOrder] = usePatchClientOrderMutation()

    const handlePatchMutation = (parms : { label: string, value: string | number }[]) =>{
        if(parms.length === 0) return
        if(parms[0].value === value[0].value) return

        setValue([{ label: parms[0].label, value: parms[0].value }])
        patchOrder({ id: order?.id, id_city: Number(parms[0].value) }).unwrap().then(() => refetch && refetch())
    }

    return (
        <Select
            className={styles.city_dropdown}
            labelField="label"
            valueField="value"
            values={value}
            multi={false}
            options={options}
            onChange={(e)=> handlePatchMutation(e)}
        />
    )
}
