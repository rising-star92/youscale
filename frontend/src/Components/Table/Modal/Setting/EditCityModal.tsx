import React, { useEffect, useState } from 'react'
import { CustumInput, CustumSelectForm } from '../../../Forms'
import ModalWrapper from '../ModalWrapper'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { CityModel, ErrorModel, ShippingModel } from '../../../../models';
import { usePatchCityMutation } from '../../../../services/api/ClientApi/ClientCityApi';
import { showToastError } from '../../../../services/toast/showToastError';
import { useGetShippingQuery } from '../../../../services/api/ClientApi/ClientShippingApi';

type Inputs = {
    name: string,
    price: string,
    id_shipping: number
};

type SelectType = {
    label: string,
    value: string | number
}

const GetShippingCompanies = (data: ShippingModel[] | undefined): SelectType[] => {
    if (!data) return []

    var newArr: SelectType[] = [{ label: 'none', value: 0 }]

    for (let i = 0; i < data.length; i++) {
        newArr.push({
            value: data[i].id ?? 0,
            label: data[i].name
        })
    }

    return newArr
}

const schema = yup.object().shape({
    name: yup.string().required('Ce champ est obligatoire'),
    price: yup.string().required('Ce champ est obligatoire')
}).required();

interface Props {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    item: CityModel | undefined,
    refetch: () => any
}
export default function EditCityModal({ showModal, setShowModal, refetch, item }: Props): JSX.Element {

    useEffect(() => {
        var body = document.querySelector<HTMLBodyElement>('body');

        var modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop fade show';

        if (body) {
            body.classList.add('modal-open');
            body.style.overflow = 'hidden';
            body.style.paddingRight = '17px';

            body.appendChild(modalBackdrop);
        }
    }, [])

    const handleCloseModal = () => {
        var body = document.querySelector<HTMLBodyElement>('body');

        if (body) {
            body.classList.remove('modal-open');
            body.style.overflow = '';
            body.style.paddingRight = '';

            var existingBackdrop = document.querySelectorAll('.modal-backdrop.fade.show');

            if (existingBackdrop) existingBackdrop.forEach(it => it.remove());

            setShowModal(false)
        }
    }

    return (
        <ModalWrapper showModal={showModal} title={'Edit city'} setShowModal={setShowModal} id='AddOrderModal'>
            <FormBody refetch={refetch} item={item} handleCloseModal={handleCloseModal} />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    refetch: () => any,
    item: CityModel | undefined,
    handleCloseModal: () => void
}
const FormBody = ({ refetch, handleCloseModal, item }: FormBodyProps) => {
    const { data: shippingData } = useGetShippingQuery()

    const [patchCity] = usePatchCityMutation()

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {
        const data = {
            ...values,
            id: item?.id || 0,
            id_shipping : (String(values.id_shipping) === "") || (String(values.id_shipping) === "0") ? null : values.id_shipping
        }

        patchCity(data).unwrap()
            .then(res => {
                console.log(res)
                refetch()
                handleCloseModal()
            })
            .catch((err: { data: ErrorModel | { message: string }, status: number }) => {
                if (err.data) {
                    if ('errors' in err.data && Array.isArray(err.data.errors) && err.data.errors.length > 0) showToastError(err.data.errors[0].msg);
                    else if ('message' in err.data) showToastError(err.data.message);
                }
            })
    }

    return (
        <div className="card-body">
            <div className="basic-form">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <CustumInput
                            defaultValue={item?.name || ''}
                            register={register}
                            name={'name'}
                            error={errors.name}
                            type={'text'}
                            label={"Name"}
                            placeholder={'Nom'}
                        />

                        <CustumInput
                            defaultValue={item?.price || ''}
                            register={register}
                            name={'price'}
                            error={errors.price}
                            type={'text'}
                            label={"Price"}
                            placeholder={'Prix'}
                        />

                        <CustumSelectForm
                            defaultSelected={item?.id_shipping}
                            data={GetShippingCompanies(shippingData?.data)}
                            register={register}
                            error={errors.id_shipping}
                            label={"Shipping companies"}
                            name={'id_shipping'}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Modifier
                    </button>
                </form>
            </div>
        </div>
    )
}