import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup"
import { useCouponMutation } from '../../../services/api/ClientApi/ClientCouponApi';
import { useGetClientLastPaymentQuery } from '../../../services/api/ClientApi/ClientLastPaymentApi';
import { useClientMakeRefoundMutation } from '../../../services/api/ClientApi/ClientMakeRefoundApi';

interface Bank {
    id: number;
    name: string;
    bank: string;
    rib: string;
}

interface TransactionProps{
    data: Bank | undefined
}
export const Transaction = ({ data }:TransactionProps): JSX.Element => {
    return (
        <div className="row">
            <Bank data={data} />
            <PaymentAction />
        </div>
    )
}

const Bank = ({ data }:TransactionProps): JSX.Element => {
    return (
        <div className="col-xl-6">
            <div className="card">
                <div className="card-body">
                    <BankInformation data={data} />
                </div>
            </div>
        </div>
    )
}

const PaymentAction = (): JSX.Element => {
    return (
        <div className="col-xl-6">
            <div className="card">
                <div className="card-body">
                    <CouponForm />
                    <RechargemetForm />
                </div>
            </div>
        </div>
    )
}

const BankInformation = ({ data }:TransactionProps): JSX.Element => {

    return (
        <div className="basic-list-group">
            <ul className="list-group">
                <li className="list-group-item">Bank: <strong>{data?.bank || 'xxxx'}</strong></li>
                <li className="list-group-item">Name: <strong>{data?.name || 'xxxx'}</strong></li>
                <li className="list-group-item">RIB: <strong>{data?.rib || 'xxxx'}</strong></li>
            </ul>
        </div>
    )
}

type Inputs = {
    code: string
};

const schema = yup.object().shape({
    code: yup.string().required('Veuillez préciser le code SVP')
}).required();

const CouponForm = (): JSX.Element => {

    const [err, setErr] = useState<string>('')
    const [UseCoupon] = useCouponMutation()

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {
        UseCoupon({ code: values.code }).unwrap().then(res => {
            setErr('')
            // show modal for success
        }).catch(err => {
            setErr(err.data.message)
        })
    }

    return (
        <div className="basic-form coupon">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Coupon</label>
                    <div className="col-sm-9">
                        <input
                            {...register('code')}
                            type="text"
                            className="form-control"
                            placeholder="KJKD55D"
                        />
                    </div>
                    {errors && <p className='error'>{errors.code?.message}</p>}
                    {err && <p className='error'>{err}</p>}
                </div>
                <div className="mb-3 row">
                    <div className="col-sm-10">
                        <button type="submit" className="btn btn-primary">
                            Utiliser
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

const RechargemetForm = (): JSX.Element => {
    const { data } = useGetClientLastPaymentQuery()

    const [err, setErr] = useState<string>('')

    const [makeRefound] = useClientMakeRefoundMutation()
    const [montant, setMonant] = useState<number>()
    const [base64image, setBase64image] = useState<string>()

    const getBase64 = (file: any) => new Promise(function (resolve, reject) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result)
    })

    const onSelectFile = (e: any) => {
        if (!e.target.files || e.target.files.length === 0) return

        getBase64(e.target.files[0]).then((data: any) => {
            setBase64image(data)
        })
    }

    const onValid = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()

        if (!montant || !base64image) {
            setErr('Veuillez préciser tout les champs')
            return
        }

        makeRefound({
            amount: montant,
            image: base64image
        }).unwrap()
            .then(res => {
                console.log(res)
                window.location.reload()
            })
    }

    return (
        <div className="basic-form coupon">
            <h5 className="card-title">Rechargement</h5>
            {
                data?.data[0].status === 'pending' ? <p className="text-info">Veuillez patienter avant de faire un prochain rechargement, votre dernier paiement est en attente ...</p> :
                    <form>
                        {err && <p className='error'>{err}</p>}
                        <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">Montant</label>
                            <div className="col-sm-9">
                                <input
                                    onChange={(e) => setMonant(Number(e.target.value))}
                                    type="number"
                                    className="form-control"
                                    placeholder="6500"
                                />
                            </div>
                        </div>
                        <div className="mb-3 row">
                            <div className="input-group">
                                <div className="form-file">
                                    <input
                                        onChange={onSelectFile}
                                        type="file"
                                        className="form-file-input form-control"
                                        accept="image/png, image/jpeg"
                                    />
                                </div>
                            </div>
                        </div>
                        <div onClick={onValid} className="mb-3 row">
                            <div className="col-sm-10">
                                <button type="submit" className="btn btn-primary">
                                    Envoyer le paiement
                                </button>
                            </div>
                        </div>
                    </form>
            }
        </div>
    )
}