import React, { useState, useEffect } from 'react'
import { CityModel } from '../../../../models';
import './style.css'
import { usePatchClientOrderMutation } from '../../../../services/api/ClientApi/ClientOrderApi';

interface CustumSelectCityProps {
    name: string,
    data: CityModel[],
    order: { id: number, id_city: number, id_team: number, createdAt: Date } | undefined,
    refetch?: () => void
}
export default function DisplayCity({ name, data, order, refetch }: CustumSelectCityProps) {
    const [value, setValue] = useState<string>('')
    const [dropdown, setDropdown] = useState(false)
    const [item, setItem] = useState<CityModel[]>([])

    // patch order
    const [patchOrder] = usePatchClientOrderMutation()

    useEffect(() => {
        setItem(data)
        order && data.map((it, index) => it.id === order.id_city && setValue(it.name))
    }, [data, order])

    // search item by name
    const searchItem = (e: React.ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value
        const searchItem = item.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
        setItem(searchItem)

        if (search === '') setItem(data)
    }

    return (
        <div className="custum-select-area">
            <div className="custum-select" onClick={() => setDropdown(!dropdown)}>
                <div className="title-custum-select">{value || 'Aucun'}</div>
                <div className="icon-custum-select">&gt;</div>
            </div>
            <div className={dropdown ? `custum-select-dropdown dropdown-display` : `custum-select-dropdown`}>
                <input
                    name={name}
                    onChange={searchItem}
                    placeholder="rechercher une ville"
                    type="text"
                    className="search-dropdown"
                />
                {
                    item.map((it, index) => (
                        <p
                            onClick={() => {
                                setValue(it.name)
                                setDropdown(!dropdown)
                                name === 'id_city' && patchOrder({ id: order?.id, id_city: it.id }).unwrap().then(() => refetch && refetch())
                            }}
                            key={index}>
                            {it.name}
                        </p>
                    ))
                }
            </div>
        </div>

    )
}