import React from 'react'
import { useGetClientPackQuery } from '../../../services/api/ClientApi/ClientPackApi'
import { ChangePackModal } from '../../Table/Modal/Pack'
import { ClientGetPackModel } from '../../../models';

interface TarifProps {
    data: {
        code: Number;
        data: ClientGetPackModel;
    } | undefined

    isLoading: boolean

    refetch: () => any
}
export const Tarif = ({ data, isLoading, refetch }: TarifProps): JSX.Element => {

    return (
        <div className="row">
            {
                isLoading ? <div>Loading...</div> :
                    data?.data.Pack.map((pack, index) =>
                        pack.isShow &&
                        <TarifItems
                            key={index}
                            refetch={refetch}
                            id_pack={pack.id}
                            id_subscription={data.data.Subscription.id}
                            name={pack.name}
                            price={pack.price_per_month}
                            currently={pack.id === data.data.Subscription.id_pack}
                            items={pack.item_inclued}
                            date_expiration={data.data.Subscription.date_expiration}
                        />
                    )
            }
        </div>
    )
}

interface TarifItemsProps {
    name: string,
    id_pack: number,
    id_subscription: number,
    refetch: () => void,
    price: number,
    currently: boolean,
    items: string[],
    date_expiration?: Date
}
const TarifItems = ({ name, price, currently, items, date_expiration, id_subscription, refetch, id_pack }: TarifItemsProps): JSX.Element => {

    const [showModal, setShowModal] = React.useState<boolean>(false)
    const title: string[] = ['Commande livre', 'Commande total', 'Nombre team member', 'Nombre de commande permis']

    return (
        <div className="col-xl-4">
            <div className="card">
                <div className="card-header">
                    <h4 className="card-title">{name}</h4>
                </div>
                <span className="pack-price">{price}dh/monthly</span>
                <div className="card-body cust-pack-card">
                    <div className="basic-list-group">
                        <ul className="list-group">
                            {items.map((item, index) => <li key={index} style={{opacity: item ? 1 : 0.2}} className="list-group-item">{`${title[index]}: ${item}`}</li>)}
                        </ul>
                    </div>

                    {
                        currently ?
                            <>
                                <button type="button" className="btn btn-secondary btn-xs pack-btn">
                                    Currently using
                                </button>
                                {/* <p className='mb-0 subtitle expire-txt'>Plan expires: {String(date_expiration)}</p> */}
                            </>
                            :
                            <>
                                <button
                                    onClick={() => setShowModal(true)}
                                    type="button"
                                    className="btn btn-outline-primary btn-xs pack-btn">
                                    Upgrade
                                </button>
                            </>
                    }


                </div>
            </div>
            {showModal && <ChangePackModal setShowModal={setShowModal} showModal={showModal} id_subscription={id_subscription} id_pack={id_pack} refetch={refetch} />}
        </div>
    )
}