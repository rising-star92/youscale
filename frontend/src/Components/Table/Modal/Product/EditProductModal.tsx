import React, { useEffect, useState } from 'react'
import { CustumInput } from '../../../Forms'
import { MultiSelectElement } from '../../../Input'
import ModalWrapper from '../ModalWrapper'
import { ErrorModel, GetProductModel, VariantModel } from '../../../../models'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import './product.style.css'
import { useGetVariantQuery } from '../../../../services/api/ClientApi/ClientVariantApi'
import { usePatchProductMutation } from '../../../../services/api/ClientApi/ClientProductApi'
import { showToastError } from '../../../../services/toast/showToastError'

type Inputs = {
    name: string,
    price_selling: string
};

const schema = yup.object().shape({
    name: yup.string().max(14, 'Maximum 14 caractères').notRequired(),
    price_selling: yup.string().notRequired()
}).required();

const clearVariant = (variants: { label: string, value: string }[]) => {
    const filterVariants = variants.map(vr => vr.value)
    return filterVariants
}

const FormatVariantArray = (variants: string[]) => {
    const formatVariants = variants.map(vr => ({ label: vr, value: vr }))
    return formatVariants
}

const FormatVariant = (variants: VariantModel[] | undefined) => {
    if (!variants) return []

    const formatVariants = variants.map(vr => ({ label: vr.name, value: vr.name }))
    return formatVariants
}

interface Props {
    showModal: boolean,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    refetch: ()=> any,
    item: GetProductModel | undefined
}
export default function EditProductModal({ showModal, setShowModal, refetch, item }: Props): JSX.Element {

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
        <ModalWrapper title={'Edit product'} showModal={showModal} setShowModal={setShowModal} id='AddProductModal'>
            <FormBody item={item} handleCloseModal={handleCloseModal} refetch={refetch}  />
        </ModalWrapper>
    )
}

interface FormBodyProps {
    item: GetProductModel | undefined,
    refetch: ()=> any,
    handleCloseModal: () => void
}
const FormBody = ({ item, refetch, handleCloseModal }: FormBodyProps) => {
    const [patchProd] = usePatchProductMutation()

    const [selected, setSelected] = useState<{ label: string, value: string }[]>(
        item ? FormatVariantArray(item.variant) : []
    );

    const { data: variantData } = useGetVariantQuery()

    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (values: Inputs) => {

        const data = {
            id: item ? item.id : 0,
            variant: clearVariant(selected),
            ...values
        }

        patchProd(data).unwrap()
            .then(res => {
                console.log(res)
                refetch()
                handleCloseModal()
            })
            .catch((err: {data: ErrorModel | {message : string}, status: number}) => {
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
                            defaultValue={item?.name}
                            register={register}
                            name={'name'}
                            error={errors.name}
                            type={'text'}
                            label={"Nom"}
                            placeholder={'Nivea'}
                        />

                        <CustumInput
                            defaultValue={item?.price_selling}
                            register={register}
                            name={'price_selling'}
                            error={errors.price_selling}
                            type={'text'}
                            label={"prix d'achat"}
                            placeholder={'12.55'}
                        />
                    </div>

                    <div className="row">
                        <MultiSelectElement
                            options={FormatVariant(variantData?.data)}
                            selected={selected}
                            onChange={setSelected}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary add-btn">
                        Modifier
                    </button>
                </form>
            </div>
        </div>
    )
}