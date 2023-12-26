import React from 'react'
import { AdminPaymentMethodModel } from '../../../models'

interface Bank {
    id: number;
    name: string;
    bank: string;
    rib: string
}
interface PaymentMethod{
    data: AdminPaymentMethodModel[] | undefined
    setCurrentBank: React.Dispatch<React.SetStateAction<Bank | undefined>>
}
export const PaymentMethod = ({ data, setCurrentBank }:PaymentMethod): JSX.Element => {
    return (
        <div className='row'>
            { data && data.map((payment, key )=>  <Card key={key} item={payment} setCurrentBank={setCurrentBank} logo={`data:image/jpeg;base64,${payment.image}`} name={payment.name} /> ) }
        </div>
    )
}

interface CardProps{
    logo:string | undefined,
    setCurrentBank: React.Dispatch<React.SetStateAction<Bank | undefined>>,
    item: AdminPaymentMethodModel,
    name:string
}
const Card = ({logo, name, setCurrentBank, item }: CardProps): JSX.Element => {
    return (
        <div onClick={()=> setCurrentBank(item.Bank_Information)} className="col-xl-3 col-lg-6 col-sm-6">
            <div className="card">
                <div className="card-body">
                    <div className="new-arrival-product">
                        <div className="new-arrivals-img-contnent">
                            <img className="img-fluid" src={logo} alt="" />
                        </div>
                        <div className="new-arrival-content text-center mt-3">
                            <h4><a href="#">{name}</a></h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}